module.exports = async (sock, chatId, message, args) => {
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) return sock.sendMessage(chatId, { text: '❌ This command works in groups only!' }, { quoted: message });

    const meta    = await sock.groupMetadata(chatId);
    const members = meta.participants;
    const mention = members.map(m => m.id);
    const customMsg = args.join(' ') || '👋 Hey everyone!';

    const text = `${customMsg}\n\n` + mention.map(id => `@${id.split('@')[0]}`).join(' ');
    await sock.sendMessage(chatId, { text, mentions: mention }, { quoted: message });
};
