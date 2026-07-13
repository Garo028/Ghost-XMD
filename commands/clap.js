module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.clap your text here*' }, { quoted: message });
    const text = args.join(' ').split(' ').join(' 👏 ');
    await sock.sendMessage(chatId, { text: `👏 ${text} 👏` }, { quoted: message });
};
