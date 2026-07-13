module.exports = async (sock, chatId, message, args) => {
    if (!chatId.endsWith('@g.us')) return sock.sendMessage(chatId, { text: '❌ Groups only!' }, { quoted: message });
    const action = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(action)) return sock.sendMessage(chatId, { text: '❌ Usage: *.lock on* / *.lock off* (restricts who can edit group info)' }, { quoted: message });
    try {
        await sock.groupSettingUpdate(chatId, action === 'on' ? 'locked' : 'unlocked');
        await sock.sendMessage(chatId, { text: `${action === 'on' ? '🔒' : '🔓'} Group info editing ${action === 'on' ? 'locked to admins' : 'unlocked for everyone'}.` }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed: ' + e.message }, { quoted: message });
    }
};
