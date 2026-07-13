module.exports = async (sock, chatId, message) => {
    const roll = Math.floor(Math.random() * 6) + 1;
    const faces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    await sock.sendMessage(chatId, { text: `🎲 *Dice Roll:* ${faces[roll]} *${roll}*` }, { quoted: message });
};
