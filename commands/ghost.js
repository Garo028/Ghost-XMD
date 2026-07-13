const settings = require('../settings');
const os = require('os');

module.exports = async (sock, chatId, message) => {
    const cfg = sock.config || settings;
    const uptime = process.uptime();
    const hrs  = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const secs = Math.floor(uptime % 60);
    const mem  = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);

    const text = `
╔══〔 *👻 GHOST XMD 👻* 〕══╗
║
║  🤖 *Bot Name* : ${cfg.botName}
║  👑 *Owner*    : ${settings.botOwner}
║  🔖 *Version*  : ${settings.version}
║  ⏱️ *Uptime*   : ${hrs}h ${mins}m ${secs}s
║  💾 *RAM Used* : ${mem} MB
║  🖥️ *Platform* : ${os.platform()}
║  ⚡ *Status*   : Online ✅
║
╚══〔 *${settings.author}* 〕══╝
`.trim();

    await sock.sendMessage(chatId, { text }, { quoted: message });
};
