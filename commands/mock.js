module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.mock your text*' }, { quoted: message });
    const text = args.join(' ').split('').map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join('');
    await sock.sendMessage(chatId, { text: `🤪 ${text}` }, { quoted: message });
};
