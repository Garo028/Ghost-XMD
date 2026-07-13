module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.reverse your text*' }, { quoted: message });
    const text = args.join(' ').split('').reverse().join('');
    await sock.sendMessage(chatId, { text: `🔁 ${text}` }, { quoted: message });
};
