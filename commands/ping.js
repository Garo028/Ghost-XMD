module.exports = async (sock, chatId, message) => {
    const start = Date.now();

    // Send one message with the actual measured latency
    const ms     = Date.now() - start;
    const status = ms < 100 ? '🟢 Excellent' : ms < 300 ? '🟡 Good' : '🔴 Slow';

    const text = `╔══〔 *PING* 〕══╗
║
║  🏓 *Pong!*
║  ⚡ Speed : *${ms}ms*
║  📶 Status: ${status}
║  🤖 Bot   : *Online*
║
╚══════════════╝`;

    await sock.sendMessage(chatId, { text }, { quoted: message });
};
