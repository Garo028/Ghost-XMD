module.exports = async (sock, chatId, message) => {
    const result = Math.random() < 0.5 ? '🪙 *HEADS*' : '🪙 *TAILS*';
    await sock.sendMessage(chatId, { text: `🎲 Coin Flip Result: ${result}` }, { quoted: message });
};
