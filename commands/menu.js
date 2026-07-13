const fs   = require('fs');
const path = require('path');
const settings = require('../settings');

const MENU_IMAGE = path.join(__dirname, '..', 'assets', 'menu.png');

module.exports = async (sock, chatId, message) => {
    const senderJid = message.key.participant || message.key.remoteJid;
    const cfg = sock.config || settings;

    const menu = `*${cfg.botName}*
_Fear is my power_

📌 Prefix: *${cfg.prefix}*
📌 Commands: *80*
📌 Mode: *${cfg.mode || 'public'}*

*✦ GENERAL*
ping, ghost, alive, hack, owner, menu, info, speed, stats, jid

*✦ DOWNLOAD*
tiktok, pindl, fbdl, ytmp3, lirik

*✦ GROUP*
tagall, everyone, kick, ban, promote, demote, mute, warn, groupinfo, groupname, groupdesc, welcome, antilink, lock, adminlist, delete, poll

*✦ OWNER CONTROLS*
setprefix, setbotname, mode

*✦ TOOLS*
vv, pp, bd, sticker, tts, translate, weather, wiki, short, tolink, time, calc, qr, currency, define, hash, encode, decode, binary, unbinary, count, convert, bmi, block, unblock, afk

*✦ FUN*
joke, quote, flip, dice, 8ball, truth, dare, riddle, advice, fact, compliment, roastme, ship, choose, rps, reverse, mock, clap

_Type ${cfg.prefix}help <command> for details._`;

    try {
        if (fs.existsSync(MENU_IMAGE)) {
            await sock.sendMessage(chatId, {
                image: fs.readFileSync(MENU_IMAGE),
                caption: menu,
                mentions: [senderJid],
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: menu, mentions: [senderJid] }, { quoted: message });
        }
    } catch {
        await sock.sendMessage(chatId, { text: menu, mentions: [senderJid] }, { quoted: message });
    }
};
