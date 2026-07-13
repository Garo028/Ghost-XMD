const axios = require('axios');
module.exports = async (sock, chatId, message) => {
    try {
        const res = await axios.get('https://api.adviceslip.com/advice', { timeout: 8000 });
        await sock.sendMessage(chatId, { text: `💡 *ADVICE*\n\n${res.data.slip.advice}` }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: '💡 *ADVICE*\n\nIf it can wait until tomorrow, let it wait.' }, { quoted: message });
    }
};
