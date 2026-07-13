const settings = require('../settings');
module.exports = async (sock, chatId, message) => {
    const cfg = sock.config || settings;
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) return sock.sendMessage(chatId, { text: '❌ Groups only!' }, { quoted: message });

    const ctx    = message.message?.extendedTextMessage?.contextInfo;
    const target = ctx?.participant;
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to someone to kick them.' }, { quoted: message });

    const sender = message.key.participant || message.key.remoteJid;
    const ownerJid = cfg.ownerNumber + '@s.whatsapp.net';
    if (target === ownerJid) return sock.sendMessage(chatId, { text: '⚠️ Cannot kick the owner!' }, { quoted: message });

    try {
        await sock.groupParticipantsUpdate(chatId, [target], 'remove');
        await sock.sendMessage(chatId, { text: `✅ @${target.split('@')[0]} has been kicked!`, mentions: [target] }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to kick: ' + e.message }, { quoted: message });
    }
};
