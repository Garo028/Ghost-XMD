module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.count your text here*' }, { quoted: message });
    const text  = args.join(' ');
    const words = text.trim().split(/\s+/).length;
    const chars = text.length;
    const noSpace = text.replace(/\s/g, '').length;
    await sock.sendMessage(chatId, { text: `🔢 *TEXT COUNT*\n\n📝 Words      : ${words}\n🔡 Characters : ${chars}\n🔡 No spaces  : ${noSpace}` }, { quoted: message });
};
