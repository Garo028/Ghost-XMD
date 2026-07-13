const settings = require('../settings');
module.exports = async (sock, chatId, message) => {
    const cfg = sock.config || settings;
    const uptime = process.uptime();
    const hrs  = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const secs = Math.floor(uptime % 60);
    const text = `
╔══〔 *${cfg.botName}* 〕══╗
║
║  ✅ *I'm Alive & Running!*
║  ⏱️ Uptime : ${hrs}h ${mins}m ${secs}s
║  🔥 Status : Online
║
╚══〔 *${settings.author}* 〕══╝
`.trim();
    await sock.sendMessage(chatId, { text }, { quoted: message });
};
