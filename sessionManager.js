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

// How long a session is allowed to sit in 'pairing' before we consider it
// stuck (hung network call, dead promise, etc.) and force a fresh attempt.
const STUCK_PAIRING_MS = 25000;

// WhatsApp pairing codes expire after ~60s. If a session is still sitting on
// an old code past this, it's dead — a retry must generate a new one instead
// of handing back the same expired code forever.
const CODE_TTL_MS = 55000;

// Wrap a promise so it rejects instead of hanging forever — Baileys' version
// check and requestPairingCode() have no built-in timeout, and on some
// hosts (Render included) a stalled network call just hangs indefinitely,
// which is what was leaving sessions stuck on "Requesting pairing code…".
function withTimeout(promise, ms, label) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
        ),
    ]);
}

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
    if (existing) {
        if (existing.status === 'connected') {
            return existing;
        }
        if (existing.status === 'code_ready') {
            const codeStale = (Date.now() - (existing.codeIssuedAt || 0)) > CODE_TTL_MS;
            if (!codeStale) return existing;
            // Code has expired — fall through and issue a new one.
        } else if (existing.status === 'pairing') {
            const stuck = (Date.now() - existing.createdAt) > STUCK_PAIRING_MS;
            if (!stuck) {
                // still within its normal window — let it finish instead of
                // spawning a second socket for the same number.
                return existing;
            }
        }
        // Stale code, stuck in 'pairing' past the timeout, or previously
        // errored/logged out — tear it down and start clean.
        destroySession(id);
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

    const entry = { id, sock: null, config, status: 'pairing', pairingCode: null, error: null, createdAt: Date.now() };
    sessions.set(id, entry);

    await startSocket(entry, sessionDir);
    return entry;
}

async function startSocket(entry, sessionDir) {
    try {
        const { version }          = await withTimeout(fetchLatestBaileysVersion(), 15000, 'fetchLatestBaileysVersion');
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
        // entry.pairingRequested (not a local var) so this survives the
        // reconnect that WhatsApp triggers right after issuing a code —
        // otherwise every reconnect would request (and silently swap in) a
        // brand new code out from under the user while they're typing it.
        if (!sock.authState.creds.registered && !entry.pairingRequested) {
            let requested = false;

            const requestCode = async (attempt = 1) => {
                try {
                    let code = await withTimeout(sock.requestPairingCode(entry.id), 15000, 'requestPairingCode');
                    code = code?.match(/.{1,4}/g)?.join('-') || code;
                    entry.pairingCode = code;
                    entry.status = 'code_ready';
                    entry.error = null;
                    entry.pairingRequested = true;
                    entry.codeIssuedAt = Date.now();
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
                const restartRequired = statusCode === DisconnectReason.restartRequired || statusCode === 515;

                if (loggedOut) {
                    entry.status = 'logged_out';
                    try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {}
                    sessions.delete(entry.id);
                    console.log(`[❌] Session ${entry.id} logged out — removed`);
                } else if (restartRequired) {
                    // Expected: WA closes the socket once right after a pairing
                    // code is issued. Reconnect immediately using the same
                    // creds/entry — do NOT request a new code or wait 5s,
                    // that window is exactly when the user is entering the
                    // code that's already on screen.
                    startSocket(entry, sessionDir);
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
            const entry = { id, sock: null, config, status: 'pairing', pairingCode: null, error: null, createdAt: Date.now() };
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
