/**
 * 👻 GHOST XMD 👻 — Web Pair Server
 * Anyone can open the site, enter their WhatsApp number, get a pairing
 * code, and run their own isolated instance of the bot with their own
 * prefix / bot name — all from one Render deployment.
 */

require('dotenv').config();

const path    = require('path');
const express = require('express');
const chalk   = require('chalk');

const sm = require('./sessionManager');

const PORT = process.env.PORT || 3000;
const app  = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Start pairing for a number ─────────────────────────────────────────────
app.post('/api/pair', async (req, res) => {
    try {
        const { number } = req.body;
        if (!number) return res.status(400).json({ ok: false, error: 'Number is required' });

        const entry = await sm.createSession(number);
        res.json({ ok: true, id: entry.id, status: entry.status });
    } catch (err) {
        res.status(400).json({ ok: false, error: err.message });
    }
});

// ── Poll pairing / connection status ───────────────────────────────────────
app.get('/api/status/:id', (req, res) => {
    const entry = sm.getSession(req.params.id);
    if (!entry) return res.status(404).json({ ok: false, error: 'Session not found' });

    res.json({
        ok: true,
        id: entry.id,
        status: entry.status,          // pairing | code_ready | connected | reconnecting | logged_out | error
        pairingCode: entry.pairingCode,
        error: entry.error,
        config: entry.config,
    });
});

// ── Update a user's own bot settings (prefix / name / mode) ───────────────
app.post('/api/settings/:id', (req, res) => {
    try {
        const config = sm.updateConfig(req.params.id, req.body || {});
        res.json({ ok: true, config });
    } catch (err) {
        res.status(400).json({ ok: false, error: err.message });
    }
});

// ── Log out / unlink a session ─────────────────────────────────────────────
app.post('/api/logout/:id', (req, res) => {
    const removed = sm.destroySession(req.params.id);
    res.json({ ok: removed });
});

// ── List all active sessions (basic public stats, no numbers exposed) ─────
app.get('/api/sessions', (req, res) => {
    const list = sm.listSessions().map(s => ({
        status: s.status,
        botName: s.botName,
    }));
    res.json({ ok: true, count: list.length, sessions: list });
});

app.get('/ping', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
    console.log(chalk.cyan(`[⚡] Ghost XMD web-pair server running on port ${PORT}`));
    sm.restoreSessions().catch(err => console.error(chalk.red('[ERR] restoreSessions:', err.message)));
});

process.on('uncaughtException',  err    => console.error(chalk.red('[UNCAUGHT]',  err.message)));
process.on('unhandledRejection', reason => console.error(chalk.red('[UNHANDLED]', reason)));
