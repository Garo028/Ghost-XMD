module.exports = async (sock, chatId, message) => {
    // Safe access — message.body is set by main.js but guard anyway
    const body   = message.body || '';
    const args   = body.split(' ').slice(1).join(' ').trim();
    const target = args || 'Unknown Target';

    const text = `🖥️ *[GHOST XMD TERMINAL]*
━━━━━━━━━━━━━━━━━━━━━
🎯 Target    : *${target}*

[▓░░░░░░░░░]  10% — Initializing...
[▓▓▓░░░░░░░]  30% — Bypassing firewall...
[▓▓▓▓▓░░░░░]  50% — Injecting payload...
[▓▓▓▓▓▓▓░░░]  70% — Extracting data...
[▓▓▓▓▓▓▓▓▓░]  90% — Covering tracks...
[▓▓▓▓▓▓▓▓▓▓] 100% — *COMPLETE!*

✅ *HACK SUCCESSFUL*
📁 Files    : 2,048 extracted
🔑 Passwords: 17 cracked
📍 Location : *Nowhere lol*

_⚠️ This is just for fun — not real!_
━━━━━━━━━━━━━━━━━━━━━
_Powered by 👻 GHOST XMD 👻 ©_`;

    await sock.sendMessage(chatId, { text }, { quoted: message });
};
