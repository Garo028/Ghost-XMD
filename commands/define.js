const axios = require('axios');
module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.define word*' }, { quoted: message });
    const word = args[0];
    try {
        const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { timeout: 8000 });
        const entry = res.data[0];
        const meaning = entry.meanings[0];
        const def = meaning.definitions[0];
        await sock.sendMessage(chatId, {
            text: `📚 *${entry.word}* (${meaning.partOfSpeech})\n\n${def.definition}${def.example ? `\n\n💬 _"${def.example}"_` : ''}`
        }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: `❌ No definition found for "${word}"` }, { quoted: message });
    }
};
