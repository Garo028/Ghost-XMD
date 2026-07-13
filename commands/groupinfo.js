module.exports = async (sock, chatId, message) => {
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) return sock.sendMessage(chatId, { text: '❌ Groups only!' }, { quoted: message });

    const meta    = await sock.groupMetadata(chatId);
    const admins  = meta.participants.filter(p => p.admin).map(p => `@${p.id.split('@')[0]}`).join(', ');
    const created = new Date(meta.creation * 1000).toDateString();

    const text = `
╔══〔 *GROUP INFO* 〕══╗
║
║  📛 *Name*    : ${meta.subject}
║  👥 *Members* : ${meta.participants.length}
║  👑 *Admins*  : ${admins || 'None'}
║  📅 *Created* : ${created}
║  🆔 *ID*      : ${chatId}
║
╚══〔 *© ghostxmd* 〕══╝
`.trim();
    await sock.sendMessage(chatId, { text }, { quoted: message });
};
