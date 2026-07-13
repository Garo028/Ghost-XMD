module.exports = async (sock, chatId, message) => {
    const ctx    = message.message?.extendedTextMessage?.contextInfo;
    const target = ctx?.participant || message.key.remoteJid;
    const sender = target.split('@')[0];

    let ppUrl = 'No profile picture';
    try { ppUrl = await sock.profilePictureUrl(target, 'image'); } catch {}

    const text = `
╔══〔 *USER INFO* 〕══╗
║
║  📱 *Number* : +${sender}
║  🆔 *JID*    : ${target}
║  🖼️ *PP*     : ${ppUrl !== 'No profile picture' ? 'Available ✅' : 'None ❌'}
║
╚══〔 *© ghostxmd* 〕══╝
`.trim();
    await sock.sendMessage(chatId, { text }, { quoted: message });
};
