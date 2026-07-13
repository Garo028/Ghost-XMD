const axios = require('axios');
module.exports = async (sock, chatId, message) => {
    try {
        const res = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en', { timeout: 8000 });
        await sock.sendMessage(chatId, { text: `🧠 *RANDOM FACT*\n\n${res.data.text}` }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: '🧠 *RANDOM FACT*\n\nHoney never spoils.' }, { quoted: message });
    }
};
