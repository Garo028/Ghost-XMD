const axios = require('axios');
module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.wiki Albert Einstein*' }, { quoted: message });
    const query = args.join(' ');
    try {
        const res = await axios.get('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(query), { timeout: 8000 });
        const { title, extract, content_urls } = res.data;
        const short = extract?.length > 500 ? extract.slice(0, 500) + '...' : extract;
        await sock.sendMessage(chatId, {
            text: `📖 *${title}*\n\n${short}\n\n🔗 ${content_urls?.desktop?.page || ''}`
        }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: `❌ No Wikipedia article found for "${query}"` }, { quoted: message });
    }
};
