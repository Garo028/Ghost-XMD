const axios = require('axios');
module.exports = async (sock, chatId, message, args) => {
    if (args.length < 3) return sock.sendMessage(chatId, { text: '❌ Usage: *.currency 100 USD ZWL*' }, { quoted: message });
    const [amountRaw, from, to] = args;
    const amount = parseFloat(amountRaw);
    if (isNaN(amount)) return sock.sendMessage(chatId, { text: '❌ Amount must be a number.' }, { quoted: message });
    try {
        const res = await axios.get(`https://api.frankfurter.app/latest`, {
            params: { amount, from: from.toUpperCase(), to: to.toUpperCase() }, timeout: 8000
        });
        const result = res.data.rates[to.toUpperCase()];
        await sock.sendMessage(chatId, { text: `💱 *CURRENCY CONVERT*\n\n${amount} ${from.toUpperCase()} = *${result} ${to.toUpperCase()}*` }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: '❌ Conversion failed — check the currency codes (e.g. USD, EUR, ZAR).' }, { quoted: message });
    }
};
