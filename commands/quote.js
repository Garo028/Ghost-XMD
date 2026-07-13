const axios = require('axios');
module.exports = async (sock, chatId, message) => {
    try {
        const res = await axios.get('https://api.quotable.io/random', { timeout: 8000 });
        const { content, author } = res.data;
        await sock.sendMessage(chatId, { text: `💭 *QUOTE*\n\n_"${content}"_\n\n— *${author}*` }, { quoted: message });
    } catch {
        const quotes = [
            ['The only way to do great work is to love what you do.', 'Steve Jobs'],
            ['In the middle of difficulty lies opportunity.', 'Albert Einstein'],
            ['Success is not final, failure is not fatal.', 'Winston Churchill'],
        ];
        const [q, a] = quotes[Math.floor(Math.random() * quotes.length)];
        await sock.sendMessage(chatId, { text: `💭 *QUOTE*\n\n_"${q}"_\n\n— *${a}*` }, { quoted: message });
    }
};
