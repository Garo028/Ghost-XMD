module.exports = async (sock, chatId, message) => {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imgMsg = message.message?.imageMessage || quoted?.imageMessage;
    if (!imgMsg) return sock.sendMessage(chatId, { text: '❌ Send or reply to an image with *.sticker*' }, { quoted: message });

    try {
        const { downloadMediaMessage } = require('@whiskeysockets/baileys');
        const buffer = await downloadMediaMessage({ message: { imageMessage: imgMsg }, key: message.key }, 'buffer', {});
        await sock.sendMessage(chatId, { sticker: buffer }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to create sticker: ' + e.message }, { quoted: message });
    }
};
