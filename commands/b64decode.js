module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.decode base64string*' }, { quoted: message });
    try {
        const out = Buffer.from(args.join(''), 'base64').toString('utf8');
        await sock.sendMessage(chatId, { text: `🔓 *Decoded:*\n${out}` }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: '❌ Invalid base64 input.' }, { quoted: message });
    }
};
