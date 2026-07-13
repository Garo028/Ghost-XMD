module.exports = async (sock, chatId, message) => {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return sock.sendMessage(chatId, { text: '❌ Reply to a view-once message with *.vv*' }, { quoted: message });

    const viewOnce = quoted?.viewOnceMessage?.message || quoted?.viewOnceMessageV2?.message;
    if (!viewOnce) return sock.sendMessage(chatId, { text: '❌ That is not a view-once message!' }, { quoted: message });

    const mediaType = viewOnce.imageMessage ? 'imageMessage' : viewOnce.videoMessage ? 'videoMessage' : null;
    if (!mediaType) return sock.sendMessage(chatId, { text: '❌ Unsupported view-once media type.' }, { quoted: message });

    try {
        const { downloadMediaMessage } = require('@whiskeysockets/baileys');
        const buffer = await downloadMediaMessage({ message: viewOnce, key: message.key }, 'buffer', {});
        const mimetype = viewOnce[mediaType].mimetype || (mediaType === 'imageMessage' ? 'image/jpeg' : 'video/mp4');
        await sock.sendMessage(chatId, { [mediaType === 'imageMessage' ? 'image' : 'video']: buffer, mimetype }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to reveal media: ' + e.message }, { quoted: message });
    }
};
