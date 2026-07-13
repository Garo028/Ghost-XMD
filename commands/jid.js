module.exports = async (sock, chatId, message) => {
    const ctx    = message.message?.extendedTextMessage?.contextInfo;
    const target = ctx?.participant;
    const sender = message.key.participant || message.key.remoteJid;
    const text = target
        ? `🆔 *Replied user JID:*\n${target}`
        : `🆔 *Your JID:*\n${sender}\n\n💬 *Chat JID:*\n${chatId}`;
    await sock.sendMessage(chatId, { text }, { quoted: message });
};
