module.exports = async (sock, chatId, message) => {
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) return sock.sendMessage(chatId, { text: '❌ Groups only!' }, { quoted: message });

    const ctx    = message.message?.extendedTextMessage?.contextInfo;
    const target = ctx?.participant;
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to someone to demote them.' }, { quoted: message });

    try {
        await sock.groupParticipantsUpdate(chatId, [target], 'demote');
        await sock.sendMessage(chatId, { text: `🔻 @${target.split('@')[0]} has been demoted!`, mentions: [target] }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to demote: ' + e.message }, { quoted: message });
    }
};
