module.exports = async (sock, chatId, message) => {
    const ctx    = message.message?.extendedTextMessage?.contextInfo;
    const target = ctx?.participant;
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to a contact\u2019s message with *.block*' }, { quoted: message });
    try {
        await sock.updateBlockStatus(target, 'block');
        await sock.sendMessage(chatId, { text: `🚫 Blocked @${target.split('@')[0]}`, mentions: [target] }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to block: ' + e.message }, { quoted: message });
    }
};
