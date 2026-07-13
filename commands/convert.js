const TABLE = {
    'km-mi': v => v * 0.621371, 'mi-km': v => v / 0.621371,
    'kg-lb': v => v * 2.20462,  'lb-kg': v => v / 2.20462,
    'c-f':   v => v * 9/5 + 32, 'f-c':   v => (v - 32) * 5/9,
    'm-ft':  v => v * 3.28084,  'ft-m':  v => v / 3.28084,
};
module.exports = async (sock, chatId, message, args) => {
    if (args.length < 2) return sock.sendMessage(chatId, { text: '❌ Usage: *.convert 10 km-mi*\nSupported: km-mi, kg-lb, c-f, m-ft (and reverse)' }, { quoted: message });
    const value = parseFloat(args[0]);
    const key   = args[1].toLowerCase();
    if (isNaN(value) || !TABLE[key]) return sock.sendMessage(chatId, { text: '❌ Unsupported conversion. Try: km-mi, kg-lb, c-f, m-ft' }, { quoted: message });
    const result = TABLE[key](value).toFixed(2);
    await sock.sendMessage(chatId, { text: `🔄 ${value} ${key.split('-')[0]} = *${result} ${key.split('-')[1]}*` }, { quoted: message });
};
