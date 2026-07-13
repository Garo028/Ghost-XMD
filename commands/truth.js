module.exports = async (sock, chatId, message) => {
    const truths = [
        "What's the most embarrassing thing you've ever done?",
        "What's a secret you've never told anyone?",
        "What's the biggest lie you've ever told?",
        "Who's your secret crush?",
        "What's your biggest fear?",
        "What's the worst gift you've ever received?",
    ];
    const t = truths[Math.floor(Math.random() * truths.length)];
    await sock.sendMessage(chatId, { text: `😮 *TRUTH*\n\n${t}` }, { quoted: message });
};
