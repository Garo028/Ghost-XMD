const axios = require('axios');
module.exports = async (sock, chatId, message, args) => {
    if (args.length < 2) return sock.sendMessage(chatId, { text: '❌ Usage: *.translate fr Hello world* (lang code + text)' }, { quoted: message });
    const langTo = args[0];
    const text   = args.slice(1).join(' ');
    try {
        const res = await axios.get(`https://api.mymemory.translated.net/get`, {
            params: { q: text, langpair: `en|${langTo}` }, timeout: 8000
        });
        const translated = res.data.responseData.translatedText;
        await sock.sendMessage(chatId, { text: `🌐 *Translation (→ ${langTo})*\n\n📝 *Original:* ${text}\n✅ *Result:* ${translated}` }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: '❌ Translation failed. Try again.' }, { quoted: message });
    }
};
