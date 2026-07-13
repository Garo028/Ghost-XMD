module.exports = async (sock, chatId, message, args) => {
    if (!args[0] || args[0].length > 3) return sock.sendMessage(chatId, { text: '❌ Usage: *.setprefix !* (1-3 characters)' }, { quoted: message });
    sock.updateSessionConfig?.({ prefix: args[0] });
    await sock.sendMessage(chatId, { text: `✅ Prefix changed to: ${args[0]}` }, { quoted: message });
};
