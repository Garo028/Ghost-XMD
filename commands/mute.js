module.exports = async (sock, chatId, message, args) => {
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) return sock.sendMessage(chatId, { text: '❌ Groups only!' }, { quoted: message });

    const action = args[0]?.toLowerCase();
    if (!action || !['on','off'].includes(action))
        return sock.sendMessage(chatId, { text: '❌ Usage: *.mute on* / *.mute off*' }, { quoted: message });

    try {
        await sock.groupSettingUpdate(chatId, action === 'on' ? 'announcement' : 'not_announcement');
        const emoji = action === 'on' ? '🔇' : '🔊';
        await sock.sendMessage(chatId, { text: `${emoji} Group ${action === 'on' ? 'muted' : 'unmuted'}! Only admins can send messages.` }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed: ' + e.message }, { quoted: message });
    }
};
