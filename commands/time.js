module.exports = async (sock, chatId, message) => {
    const now  = new Date();
    const date = now.toDateString();
    const time = now.toTimeString().split(' ')[0];
    const tz   = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await sock.sendMessage(chatId, {
        text: `🕐 *TIME & DATE*\n\n📅 Date : ${date}\n🕐 Time : ${time}\n🌍 Zone : ${tz}`
    }, { quoted: message });
};
