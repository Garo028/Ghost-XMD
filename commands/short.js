const axios = require('axios');
module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.short https://example.com/long-url*' }, { quoted: message });
    const url = args[0];
    try {
        const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, { timeout: 8000 });
        await sock.sendMessage(chatId, { text: `🔗 *URL Shortener*\n\n📎 Original : ${url}\n✅ Short    : ${res.data}` }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: '❌ Failed to shorten URL. Make sure it starts with https://' }, { quoted: message });
    }
};
