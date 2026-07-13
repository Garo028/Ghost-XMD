const axios = require('axios');
module.exports = async (sock, chatId, message) => {
    try {
        const res  = await axios.get('https://official-joke-api.appspot.com/random_joke', { timeout: 8000 });
        const { setup, punchline } = res.data;
        await sock.sendMessage(chatId, { text: `😂 *JOKE TIME*\n\n${setup}\n\n||${punchline}||` }, { quoted: message });
    } catch {
        const jokes = [
            ["Why don't scientists trust atoms?", "Because they make up everything!"],
            ["Why did the scarecrow win an award?", "Because he was outstanding in his field!"],
            ["Why don't eggs tell jokes?", "They'd crack each other up!"],
        ];
        const [setup, punchline] = jokes[Math.floor(Math.random() * jokes.length)];
        await sock.sendMessage(chatId, { text: `😂 *JOKE TIME*\n\n${setup}\n\n${punchline}` }, { quoted: message });
    }
};
