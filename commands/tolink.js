const axios = require('axios');
module.exports = async (sock, chatId, message) => {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imgMsg = message.message?.imageMessage || quoted?.imageMessage;
    if (!imgMsg) return sock.sendMessage(chatId, { text: '❌ Reply to an image with *.tolink*' }, { quoted: message });

    try {
        const { downloadMediaMessage } = require('@whiskeysockets/baileys');
        const buffer  = await downloadMediaMessage({ message: { imageMessage: imgMsg }, key: message.key }, 'buffer', {});
        const b64     = buffer.toString('base64');
        const res     = await axios.post('https://api.imgbb.com/1/upload', new URLSearchParams({
            key: 'YOUR_IMGBB_KEY', // User should replace with their key
            image: b64
        }), { timeout: 15000 });
        const url = res.data.data.url;
        await sock.sendMessage(chatId, { text: `🔗 *Image Link:*\n${url}` }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to upload image. Add your ImgBB API key in tolink.js' }, { quoted: message });
    }
};
