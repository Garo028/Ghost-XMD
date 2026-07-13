const axios = require('axios');
module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.tts Hello world*' }, { quoted: message });
    const text = args.join(' ');
    try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
        const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
        await sock.sendMessage(chatId, { audio: Buffer.from(res.data), mimetype: 'audio/mpeg', ptt: true }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ TTS failed: ' + e.message }, { quoted: message });
    }
};
