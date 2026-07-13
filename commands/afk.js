const store = new Map(); // jid -> { reason, since }

module.exports = async (sock, chatId, message, args) => {
    const sender = message.key.participant || message.key.remoteJid;
    if (store.has(sender)) {
        store.delete(sender);
        return sock.sendMessage(chatId, { text: `👋 Welcome back @${sender.split('@')[0]}, I removed your AFK status.`, mentions: [sender] }, { quoted: message });
    }
    const reason = args.join(' ') || 'No reason given';
    store.set(sender, { reason, since: Date.now() });
    await sock.sendMessage(chatId, { text: `💤 @${sender.split('@')[0]} is now AFK: ${reason}`, mentions: [sender] }, { quoted: message });
};

module.exports.store = store;
