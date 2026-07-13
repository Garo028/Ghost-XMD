module.exports = async (sock, chatId, message) => {
    const ctx    = message.message?.extendedTextMessage?.contextInfo;
    const target = ctx?.participant || message.key.participant || message.key.remoteJid;
    const compliments = [
        "is honestly one of the most genuine people around.",
        "has the best energy in any room.",
        "always knows how to make people smile.",
        "is way more talented than they give themselves credit for.",
        "has a heart of gold.",
    ];
    const c = compliments[Math.floor(Math.random() * compliments.length)];
    await sock.sendMessage(chatId, { text: `✨ @${target.split('@')[0]} ${c}`, mentions: [target] }, { quoted: message });
};
