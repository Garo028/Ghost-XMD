const QRCode = require('qrcode');
module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.qr text or a link*' }, { quoted: message });
    try {
        const buffer = await QRCode.toBuffer(args.join(' '), { width: 512, margin: 2 });
        await sock.sendMessage(chatId, { image: buffer, caption: '📱 *QR Code generated*' }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: '❌ Failed to generate QR code.' }, { quoted: message });
    }
};
