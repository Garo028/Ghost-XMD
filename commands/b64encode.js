module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.encode your text*' }, { quoted: message });
    const out = Buffer.from(args.join(' '), 'utf8').toString('base64');
    await sock.sendMessage(chatId, { text: `🔐 *Base64:*\n${out}` }, { quoted: message });
};
