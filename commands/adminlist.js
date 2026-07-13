module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return sock.sendMessage(chatId, { text: '❌ Groups only!' }, { quoted: message });
    const meta   = await sock.groupMetadata(chatId);
    const admins = meta.participants.filter(p => p.admin);
    if (!admins.length) return sock.sendMessage(chatId, { text: 'No admins found.' }, { quoted: message });
    const list = admins.map((a, i) => `${i + 1}. @${a.id.split('@')[0]} ${a.admin === 'superadmin' ? '👑' : '⭐'}`).join('\n');
    await sock.sendMessage(chatId, { text: `👮 *GROUP ADMINS*\n\n${list}`, mentions: admins.map(a => a.id) }, { quoted: message });
};
