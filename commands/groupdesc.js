module.exports = async (sock, chatId, message, args) => {
    if (!chatId.endsWith('@g.us')) return sock.sendMessage(chatId, { text: '❌ Groups only!' }, { quoted: message });
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.groupdesc New description*' }, { quoted: message });
    try {
        await sock.groupUpdateDescription(chatId, args.join(' '));
        await sock.sendMessage(chatId, { text: '✅ Group description updated!' }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed: ' + e.message }, { quoted: message });
    }
};
