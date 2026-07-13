module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.binary your text*' }, { quoted: message });
    const text = args.join(' ');
    const bin = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    await sock.sendMessage(chatId, { text: `💾 ${bin}` }, { quoted: message });
};
