module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.calc 5+5*' }, { quoted: message });
    const expr = args.join('').replace(/[^0-9+\-*/().%\s]/g, '');
    try {
        // eslint-disable-next-line no-new-func
        const result = Function(`"use strict"; return (${expr})`)();
        await sock.sendMessage(chatId, { text: `🔢 *Calculator*\n\n📝 ${expr}\n✅ = *${result}*` }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: '❌ Invalid expression!' }, { quoted: message });
    }
};
