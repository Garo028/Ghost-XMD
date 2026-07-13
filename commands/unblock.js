module.exports = async (sock, chatId, message, args) => {
    const ctx     = message.message?.extendedTextMessage?.contextInfo;
    let target    = ctx?.participant;
    if (!target && args[0]) target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (!target) return sock.sendMessage(chatId, { text: '❌ Usage: reply with *.unblock* or *.unblock 2637XXXXXXXX*' }, { quoted: message });
    try {
        await sock.updateBlockStatus(target, 'unblock');
        await sock.sendMessage(chatId, { text: `✅ Unblocked @${target.split('@')[0]}`, mentions: [target] }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to unblock: ' + e.message }, { quoted: message });
    }
};
