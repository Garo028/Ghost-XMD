const warns = {};
module.exports = async (sock, chatId, message, args) => {
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) return sock.sendMessage(chatId, { text: '❌ Groups only!' }, { quoted: message });

    const ctx    = message.message?.extendedTextMessage?.contextInfo;
    const target = ctx?.participant;
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to someone to warn them.' }, { quoted: message });

    const key = `${chatId}:${target}`;
    warns[key] = (warns[key] || 0) + 1;
    const reason = args.join(' ') || 'No reason given';

    await sock.sendMessage(chatId, {
        text: `⚠️ *WARNING* ⚠️\n\n@${target.split('@')[0]} has been warned!\n📋 Reason: ${reason}\n🔢 Warns: ${warns[key]}/3`,
        mentions: [target]
    }, { quoted: message });

    if (warns[key] >= 3) {
        try {
            await sock.groupParticipantsUpdate(chatId, [target], 'remove');
            delete warns[key];
            await sock.sendMessage(chatId, { text: `🚫 @${target.split('@')[0]} was kicked after 3 warnings!`, mentions: [target] }, { quoted: message });
        } catch {}
    }
};
