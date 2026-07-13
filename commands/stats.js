const counters = { commands: 0, startedAt: Date.now() };
module.exports = async (sock, chatId, message) => {
    const mins = Math.floor((Date.now() - counters.startedAt) / 60000);
    await sock.sendMessage(chatId, {
        text: `📊 *THIS BOT'S STATS*\n\n⚡ Commands run : ${counters.commands}\n⏱️ Session age  : ${mins} min\n🤖 Bot name     : ${sock.config?.botName || 'Ghost XMD'}`
    }, { quoted: message });
};
module.exports.counters = counters;
