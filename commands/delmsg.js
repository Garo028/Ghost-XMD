module.exports = async (sock, chatId, message) => {
    const ctx = message.message?.extendedTextMessage?.contextInfo;
    if (!ctx?.stanzaId) return sock.sendMessage(chatId, { text: '❌ Reply to the message you want deleted with *.delete*' }, { quoted: message });
    try {
        await sock.sendMessage(chatId, {
            delete: { remoteJid: chatId, fromMe: false, id: ctx.stanzaId, participant: ctx.participant }
        });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to delete: ' + e.message }, { quoted: message });
    }
};
