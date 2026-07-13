module.exports = async (sock, chatId, message, args) => {
    if (args.length < 2) return sock.sendMessage(chatId, { text: '❌ Usage: *.choose pizza or burger or sushi*' }, { quoted: message });
    const options = args.join(' ').split(/\s+or\s+/i).map(s => s.trim()).filter(Boolean);
    const pick = options[Math.floor(Math.random() * options.length)];
    await sock.sendMessage(chatId, { text: `🤔 I choose... *${pick}*` }, { quoted: message });
};
