// Self-roast only — never targets another person, to keep it playful and not enable harassment.
module.exports = async (sock, chatId, message) => {
    const sender = message.key.participant || message.key.remoteJid;
    const roasts = [
        "you're the human version of a loading bar stuck at 99%.",
        "you have the confidence of a WiFi signal that's always one bar.",
        "you're proof that even autocorrect gives up sometimes.",
        "you're like a software update — nobody asked, but here you are.",
        "you bring everyone so much joy... when you leave the chat.",
    ];
    const r = roasts[Math.floor(Math.random() * roasts.length)];
    await sock.sendMessage(chatId, { text: `🔥 @${sender.split('@')[0]}, ${r}`, mentions: [sender] }, { quoted: message });
};
