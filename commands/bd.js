module.exports = async (sock, chatId, message, args) => {
    const ctx    = message.message?.extendedTextMessage?.contextInfo;
    const target = ctx?.participant;
    const name   = args.join(' ') || (target ? `@${target.split('@')[0]}` : 'you');
    const mention = target ? [target] : [];

    const text = `
🎂🎉 *HAPPY BIRTHDAY* 🎉🎂

🎈 Wishing ${name} a wonderful birthday!
🎁 May all your dreams come true
🥳 Have an amazing day filled with joy
🌟 From: *👻 GHOST XMD 👻*

╔══〔 *🎂 BIRTHDAY WISHES* 〕══╗
║  🎊 Another year, another blessing!
║  💫 Stay blessed and stay winning!
╚══〔 *© ghostxmd* 〕══╝
`.trim();

    await sock.sendMessage(chatId, { text, mentions: mention }, { quoted: message });
};
