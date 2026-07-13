module.exports = async (sock, chatId, message, args) => {
    const action = (args[0] || '').toLowerCase();
    if (!['public', 'self'].includes(action)) return sock.sendMessage(chatId, { text: '❌ Usage: *.mode public* / *.mode self*' }, { quoted: message });
    sock.updateSessionConfig?.({ mode: action });
    await sock.sendMessage(chatId, { text: `✅ Bot mode set to *${action}*${action === 'self' ? ' — only you can use commands now.' : ' — everyone can use commands.'}` }, { quoted: message });
};
