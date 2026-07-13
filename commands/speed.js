module.exports = async (sock, chatId, message) => {
    const start = Date.now();
    await sock.sendMessage(chatId, { text: '🚀 Running speed test...' }, { quoted: message });
    const end = Date.now();
    const ms  = end - start;
    const status = ms < 100 ? '🟢 Excellent' : ms < 300 ? '🟡 Good' : '🔴 Slow';
    await sock.sendMessage(chatId, {
        text: `⚡ *SPEED TEST*\n\n📶 Latency : *${ms}ms*\n📊 Status  : ${status}\n🤖 Bot     : Online ✅`
    }, { quoted: message });
};
