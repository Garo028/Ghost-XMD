module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.setbotname My Bot Name*' }, { quoted: message });
    const name = args.join(' ').slice(0, 40);
    sock.updateSessionConfig?.({ botName: name });
    await sock.sendMessage(chatId, { text: `✅ Bot name changed to: ${name}` }, { quoted: message });
};
