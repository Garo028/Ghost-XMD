module.exports = async (sock, chatId, message, args) => {
    const raw = args.join(' ');
    const parts = raw.split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length < 3) return sock.sendMessage(chatId, { text: '❌ Usage: *.poll Question | Option1 | Option2 | Option3*' }, { quoted: message });
    const [question, ...options] = parts;
    try {
        await sock.sendMessage(chatId, {
            poll: { name: question, values: options.slice(0, 12), selectableCount: 1 }
        }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to create poll: ' + e.message }, { quoted: message });
    }
};
