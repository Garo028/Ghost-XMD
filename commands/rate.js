module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.rate pizza*' }, { quoted: message });
    const thing = args.join(' ');
    let seed = 0;
    for (const ch of thing) seed += ch.charCodeAt(0);
    const score = seed % 101;
    await sock.sendMessage(chatId, { text: `⭐ I'd rate *${thing}* a solid *${score}/100*` }, { quoted: message });
};
