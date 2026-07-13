module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.unbinary 01001000 01101001*' }, { quoted: message });
    try {
        const text = args.join(' ').split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
        await sock.sendMessage(chatId, { text: `🔤 ${text}` }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: '❌ Invalid binary input.' }, { quoted: message });
    }
};
