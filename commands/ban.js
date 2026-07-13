const settings = require('../settings');
module.exports = async (sock, chatId, message) => {
    const cfg = sock.config || settings;
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) return sock.sendMessage(chatId, { text: '❌ Groups only!' }, { quoted: message });

    const ctx    = message.message?.extendedTextMessage?.contextInfo;
    const target = ctx?.participant;
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to someone to ban them.' }, { quoted: message });

    const ownerJid = cfg.ownerNumber + '@s.whatsapp.net';
    if (target === ownerJid) return sock.sendMessage(chatId, { text: '⚠️ Cannot ban the owner!' }, { quoted: message });

    try {
        await sock.groupParticipantsUpdate(chatId, [target], 'remove');
        await sock.sendMessage(chatId, { text: `🚫 @${target.split('@')[0]} has been *banned* from this group!`, mentions: [target] }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to ban: ' + e.message }, { quoted: message });
    }
};
