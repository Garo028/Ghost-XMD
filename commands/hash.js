const crypto = require('crypto');
module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.hash your text*' }, { quoted: message });
    const text = args.join(' ');
    const md5    = crypto.createHash('md5').update(text).digest('hex');
    const sha1   = crypto.createHash('sha1').update(text).digest('hex');
    const sha256 = crypto.createHash('sha256').update(text).digest('hex');
    await sock.sendMessage(chatId, { text: `🧬 *HASH RESULTS*\n\nMD5    : ${md5}\nSHA1   : ${sha1}\nSHA256 : ${sha256}` }, { quoted: message });
};
