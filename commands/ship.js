module.exports = async (sock, chatId, message, args) => {
    if (args.length < 2) return sock.sendMessage(chatId, { text: '❌ Usage: *.ship Name1 Name2*' }, { quoted: message });
    const a = args[0], b = args[1];
    let score = 0;
    for (const ch of (a + b)) score += ch.charCodeAt(0);
    const pct = score % 101;
    const bar = '💖'.repeat(Math.round(pct / 10)) + '🖤'.repeat(10 - Math.round(pct / 10));
    await sock.sendMessage(chatId, { text: `💘 *SHIP METER*\n\n${a} + ${b}\n${bar}\n*${pct}% compatible*` }, { quoted: message });
};
