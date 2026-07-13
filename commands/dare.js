module.exports = async (sock, chatId, message) => {
    const dares = [
        "Send a voice note singing your favorite song.",
        "Text your crush 'hi' right now.",
        "Change your profile picture for 1 hour.",
        "Speak in an accent for the next 5 messages.",
        "Do 10 push-ups right now.",
        "Post an embarrassing old photo to your status.",
    ];
    const d = dares[Math.floor(Math.random() * dares.length)];
    await sock.sendMessage(chatId, { text: `🔥 *DARE*\n\n${d}` }, { quoted: message });
};
