module.exports = async (sock, chatId, message) => {
    const ctx     = message.message?.extendedTextMessage?.contextInfo;
    const target  = ctx?.participant || ctx?.remoteJid || message.key.remoteJid;

    try {
        const url = await sock.profilePictureUrl(target, 'image');
        await sock.sendMessage(chatId, { image: { url }, caption: `📸 Profile picture of @${target.split('@')[0]}`, mentions: [target] }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: '❌ No profile picture found or the account is private.' }, { quoted: message });
    }
};
