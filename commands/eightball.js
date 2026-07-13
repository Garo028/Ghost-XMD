module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Ask a question! Example: *.8ball Will I be rich?*' }, { quoted: message });
    const answers = [
        '✅ It is certain.','✅ Without a doubt.','✅ Yes, definitely!','✅ You may rely on it.',
        '✅ Most likely.','🔵 Outlook good.','🔵 Signs point to yes.',
        '🟡 Reply hazy, try again.','🟡 Ask again later.','🟡 Cannot predict now.',
        '❌ Don\'t count on it.','❌ My reply is no.','❌ My sources say no.',
        '❌ Outlook not so good.','❌ Very doubtful.'
    ];
    const answer = answers[Math.floor(Math.random() * answers.length)];
    const q = args.join(' ');
    await sock.sendMessage(chatId, { text: `🎱 *Magic 8-Ball*\n\n❓ *Q:* ${q}\n💬 *A:* ${answer}` }, { quoted: message });
};
