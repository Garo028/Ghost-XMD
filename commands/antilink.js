const groupState = require('../groupState');
module.exports = async (sock, chatId, message, args) => {
    if (!chatId.endsWith('@g.us')) return sock.sendMessage(chatId, { text: '❌ Groups only!' }, { quoted: message });
    const action = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(action)) return sock.sendMessage(chatId, { text: '❌ Usage: *.antilink on* / *.antilink off*' }, { quoted: message });
    groupState.setAntilink(chatId, action === 'on');
    await sock.sendMessage(chatId, { text: `🔗 Anti-link protection turned *${action}*` }, { quoted: message });
};
