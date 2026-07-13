/**
 * 👻 GHOST XMD 👻 — Multi-Session Manager
 * Handles one isolated Baileys socket per paired WhatsApp number,
 * each with its own prefix / bot name / settings, all in-memory.
 */

const fs   = require('fs');
const path = require('path');
const pino = require('pino');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay,
} = require('@whiskeysockets/baileys');

const { handleMessages } = require('./main');
const settings = require('./settings');
const groupState = require('./groupState');

const SESSIONS_DIR = path.join(__dirname, 'sessions');
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });

// id -> { id, sock, config, status, pairingCode, error }
const sessions = new Map();

function sanitizeId(number) {
    return String(number || '').replace(/[^0-9]/g, '');
}

function listSessions() {
    return Array.from(sessions.values()).map(s => ({
        id: s.id,
        status: s.status,
        botName: s.config.botName,
        prefix: s.config.prefix,
        mode: s.config.mode,
    }));
}

function getSession(id) {
    return sessions.get(sanitizeId(id));
}

function updateConfig(id, updates = {}) {
    const entry = sessions.get(sanitizeId(id));
    if (!entry) throw new Error('Session not found');

    if (updates.botName !== undefined) entry.config.botName = String(updates.botName).slice(0, 40) || entry.config.botName;
    if (updates.prefix  !== undefined) entry.config.prefix  = String(updates.prefix).slice(0, 3) || entry.config.prefix;
    if (updates.mode    !== undefined) entry.config.mode    = updates.mode === 'self' ? 'self' : 'public';

    if (entry.sock) entry.sock.config = entry.config;
    return entry.config;
}

async function createSession(number) {
    const id = sanitizeId(number);
    if (!id || id.length < 7) throw new Error('Invalid WhatsApp number');

    const existing = sessions.get(id);
    if (existing && (existing.status === 'connected' || existing.status === 'pairing' || existing.status === 'code_ready')) {
        return existing;
    }

    const sessionDir = path.join(SESSIONS_DIR, id);
    fs.mkdirSync(sessionDir, { recursive: true });

    const config = {
        id,
        botName:     settings.botName,
        prefix:      settings.prefix,
        ownerNumber: id,
        mode:        'public', // 'public' = anyone in chat can use it, 'self' = owner only
    };

    const entry = { id, sock: null, config, status: 'pairing', pairingCode: null, error: null };
    sessions.set(id, entry);

    await startSocket(entry, sessionDir);
    return entry;
}

async function startSocket(entry, sessionDir) {
    try {
        const { version }          = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            browser: ['Ubuntu', 'Chrome', '20.0.04'],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
        });

        sock.config = entry.config;
        sock.updateSessionConfig = (updates) => updateConfig(entry.id, updates);
        entry.sock  = sock;

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('group-participants.update', async (upd) => {
            try {
                if (upd.action !== 'add' || !groupState.isWelcomeOn(upd.id)) return;
                for (const jid of upd.participants) {
                    await sock.sendMessage(upd.id, {
                        text: `👋 Welcome @${jid.split('@')[0]} to the group!`,
                        mentions: [jid],
                    });
                }
            } catch {}
        });

        // ── Request a pairing code once the socket starts connecting ──────────
        if (!sock.authState.creds.registered) {
            let requested = false;

            const requestCode = async (attempt = 1) => {
                try {
                    let code = await sock.requestPairingCode(entry.id);
                    code = code?.match(/.{1,4}/g)?.join('-') || code;
                    entry.pairingCode = code;
                    entry.status = 'code_ready';
                    entry.error = null;
                } catch (err) {
                    if (attempt < 3) {
                        await delay(4000);
                        return requestCode(attempt + 1);
                    }
                    entry.status = 'error';
                    entry.error = err.message || 'Failed to get pairing code';
                }
            };

            const onUpdate = ({ connection }) => {
                if (!requested && connection === 'connecting') {
                    requested = true;
                    sock.ev.off('connection.update', onUpdate);
                    requestCode();
                }
            };
            sock.ev.on('connection.update', onUpdate);

            setTimeout(() => {
                if (!requested) {
                    requested = true;
                    sock.ev.off('connection.update', onUpdate);
                    requestCode();
                }
            }, 5000);
        }

        sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
            if (connection === 'open') {
                entry.status = 'connected';
                entry.pairingCode = null;
                entry.error = null;
                console.log(`[✅] Session ${entry.id} connected — "${entry.config.botName}"`);
            }

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const loggedOut  = statusCode === DisconnectReason.loggedOut || statusCode === 401;

                if (loggedOut) {
                    entry.status = 'logged_out';
                    try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {}
                    sessions.delete(entry.id);
                    console.log(`[❌] Session ${entry.id} logged out — removed`);
                } else {
                    entry.status = 'reconnecting';
                    await delay(5000);
                    startSocket(entry, sessionDir);
                }
            }
        });

        sock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                if (chatUpdate.type !== 'notify') return;
                const mek = chatUpdate.messages[0];
                if (!mek?.message) return;
                await handleMessages(sock, chatUpdate);
            } catch (err) {
                console.error(`[ERR][${entry.id}] messages.upsert:`, err.message);
            }
        });

    } catch (err) {
        entry.status = 'error';
        entry.error = err.message;
        console.error(`[ERR] startSocket(${entry.id}):`, err.message);
    }
}

function destroySession(id) {
    const key = sanitizeId(id);
    const entry = sessions.get(key);
    if (!entry) return false;
    try { entry.sock?.logout?.(); } catch {}
    try { entry.sock?.end?.(undefined); } catch {}
    try { fs.rmSync(path.join(SESSIONS_DIR, key), { recursive: true, force: true }); } catch {}
    sessions.delete(key);
    return true;
}

// ── Restore any sessions already linked on disk when the server boots ─────────
async function restoreSessions() {
    if (!fs.existsSync(SESSIONS_DIR)) return;
    const ids = fs.readdirSync(SESSIONS_DIR).filter(d => /^[0-9]+$/.test(d));
    for (const id of ids) {
        const credsPath = path.join(SESSIONS_DIR, id, 'creds.json');
        if (!fs.existsSync(credsPath)) continue;
        try {
            const config = { id, botName: settings.botName, prefix: settings.prefix, ownerNumber: id, mode: 'public' };
            const entry = { id, sock: null, config, status: 'pairing', pairingCode: null, error: null };
            sessions.set(id, entry);
            await startSocket(entry, path.join(SESSIONS_DIR, id));
            console.log(`[🔄] Restored session ${id}`);
        } catch (err) {
            console.error(`[ERR] restoring session ${id}:`, err.message);
        }
    }
}

module.exports = {
    createSession,
    getSession,
    listSessions,
    updateConfig,
    destroySession,
    restoreSessions,
};
