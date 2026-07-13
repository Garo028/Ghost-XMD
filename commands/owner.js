const settings = require('../settings');
module.exports = async (sock, chatId, message) => {
    const cfg = sock.config || settings;
    const ownerJid = cfg.ownerNumber + '@s.whatsapp.net';
    const text = `
╔══〔 *OWNER INFO* 〕══╗
║
║  👑 *Name*   : ${settings.botOwner}
║  📱 *Number* : +${settings.ownerNumber}
║  🤖 *Bot*    : ${cfg.botName}
║
╚══〔 *${settings.author}* 〕══╝
`.trim();
    await sock.sendMessage(chatId, { text, mentions: [ownerJid] }, { quoted: message });
};
