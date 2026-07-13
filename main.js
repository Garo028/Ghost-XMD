/**
 * 👻 GHOST XMD 👻 — Message Handler
 */

const chalk    = require('chalk');
const settings = require('./settings');

const menuCmd      = require('./commands/menu');
const pingCmd      = require('./commands/ping');
const ghostCmd     = require('./commands/ghost');
const hackCmd      = require('./commands/hack');
const tiktokCmd    = require('./commands/tiktok');
const pindlCmd     = require('./commands/pindl');
const fbdlCmd      = require('./commands/fbdl');
const lirikCmd     = require('./commands/lirik');
const ytmp3Cmd     = require('./commands/ytmp3');

// ── New Commands ─────────────────────────────────────────────────────────────
const vvCmd        = require('./commands/vv');
const tagallCmd    = require('./commands/tagall');
const ppCmd        = require('./commands/pp');
const bdCmd        = require('./commands/bd');
const stickerCmd   = require('./commands/sticker');
const aliveCmd     = require('./commands/alive');
const kickCmd      = require('./commands/kick');
const promoteCmd   = require('./commands/promote');
const demoteCmd    = require('./commands/demote');
const muteCmd      = require('./commands/mute');
const ownerCmd     = require('./commands/owner');
const groupinfoCmd = require('./commands/groupinfo');
const jokeCmd      = require('./commands/joke');
const quoteCmd     = require('./commands/quote');
const flipCmd      = require('./commands/flip');
const diceCmd      = require('./commands/dice');
const eightballCmd = require('./commands/eightball');
const timeCmd      = require('./commands/time');
const calcCmd      = require('./commands/calc');
const warnCmd      = require('./commands/warn');
const weatherCmd   = require('./commands/weather');
const translateCmd = require('./commands/translate');
const infoCmd      = require('./commands/info');
const tolinkCmd    = require('./commands/tolink');
const speedCmd     = require('./commands/speed');
const ttsCmd       = require('./commands/tts');
const banCmd       = require('./commands/ban');
const wikiCmd      = require('./commands/wiki');
const shortCmd     = require('./commands/short');
const everyoneCmd  = require('./commands/everyone');

// ── 41 New Commands (to reach 80 total) ───────────────────────────────────────
const reverseCmd    = require('./commands/reverse');
const mockCmd       = require('./commands/mock');
const clapCmd       = require('./commands/clap');
const binaryCmd     = require('./commands/binary');
const unbinaryCmd   = require('./commands/unbinary');
const b64encodeCmd  = require('./commands/b64encode');
const b64decodeCmd  = require('./commands/b64decode');
const hashCmd       = require('./commands/hash');
const countCmd      = require('./commands/count');
const qrCmd         = require('./commands/qr');
const currencyCmd   = require('./commands/currency');
const defineCmd     = require('./commands/define');
const adviceCmd     = require('./commands/advice');
const factCmd       = require('./commands/fact');
const riddleCmd     = require('./commands/riddle');
const truthCmd      = require('./commands/truth');
const dareCmd       = require('./commands/dare');
const complimentCmd = require('./commands/compliment');
const roastmeCmd    = require('./commands/roastme');
const shipCmd       = require('./commands/ship');
const chooseCmd     = require('./commands/choose');
const rateCmd       = require('./commands/rate');
const rpsCmd        = require('./commands/rps');
const pollCmd       = require('./commands/poll');
const jidCmd        = require('./commands/jid');
const blockCmd      = require('./commands/block');
const unblockCmd    = require('./commands/unblock');
const afkCmd        = require('./commands/afk');
const groupnameCmd  = require('./commands/groupname');
const groupdescCmd  = require('./commands/groupdesc');
const welcomeCmd    = require('./commands/welcome');
const antilinkCmd   = require('./commands/antilink');
const setprefixCmd  = require('./commands/setprefix');
const setbotnameCmd = require('./commands/setbotname');
const modeCmd       = require('./commands/mode');
const delmsgCmd     = require('./commands/delmsg');
const lockCmd       = require('./commands/lock');
const adminlistCmd  = require('./commands/adminlist');
const statsCmd      = require('./commands/stats');
const convertCmd    = require('./commands/convert');
const bmiCmd        = require('./commands/bmi');

const groupState    = require('./groupState');

async function handleMessages(sock, { messages }) {
    if (!messages || !Array.isArray(messages)) return;

    const PREFIX = sock.config?.prefix || settings.prefix;

    for (const message of messages) {
        try {
            if (!message || !message.key || !message.message) continue;

            const chatId = message.key.remoteJid;
            if (!chatId || chatId === 'status@broadcast') continue;

            if (Object.keys(message.message)[0] === 'ephemeralMessage') {
                message.message = message.message.ephemeralMessage.message;
            }
            if (Object.keys(message.message)[0] === 'viewOnceMessage') {
                message.message = message.message.viewOnceMessage.message;
            }

            const body = (
                message.message?.conversation ||
                message.message?.extendedTextMessage?.text ||
                message.message?.imageMessage?.caption ||
                message.message?.videoMessage?.caption ||
                message.message?.buttonsResponseMessage?.selectedButtonId ||
                message.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                ''
            ).trim();

            message.body = body;

            const senderJid    = message.key.participant || message.key.remoteJid;
            const senderNumber = senderJid.split('@')[0];

            // ── AFK: welcome back the sender if they were AFK ──────────────────
            if (afkCmd.store.has(senderJid) && !body.startsWith(PREFIX + 'afk')) {
                afkCmd.store.delete(senderJid);
                await sock.sendMessage(chatId, { text: `👋 Welcome back @${senderNumber}, I removed your AFK status.`, mentions: [senderJid] }, { quoted: message });
            }
            // ── AFK: notify if someone mentions/replies to an AFK user ─────────
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const repliedTo = message.message?.extendedTextMessage?.contextInfo?.participant;
            for (const jid of [...mentioned, repliedTo].filter(Boolean)) {
                if (afkCmd.store.has(jid)) {
                    const info = afkCmd.store.get(jid);
                    const mins = Math.floor((Date.now() - info.since) / 60000);
                    await sock.sendMessage(chatId, { text: `💤 @${jid.split('@')[0]} is AFK (${mins}m ago): ${info.reason}`, mentions: [jid] }, { quoted: message });
                    break;
                }
            }

            // ── Anti-link enforcement ───────────────────────────────────────────
            if (chatId.endsWith('@g.us') && groupState.isAntilinkOn(chatId) && /(https?:\/\/|chat\.whatsapp\.com)/i.test(body)) {
                try {
                    const meta  = await sock.groupMetadata(chatId);
                    const isAdmin = meta.participants.find(p => p.id === senderJid)?.admin;
                    if (!isAdmin) {
                        await sock.sendMessage(chatId, { delete: message.key });
                        await sock.sendMessage(chatId, { text: `🔗 Link removed — anti-link is ON for this group.` });
                        continue;
                    }
                } catch {}
            }

            if (!body.startsWith(PREFIX)) continue;

            const parts = body.slice(PREFIX.length).trim().split(' ');
            const cmd   = parts[0].toLowerCase();
            const args  = parts.slice(1);
            if (!cmd) continue;

            // ── Self mode: only the owner number can run commands ──────────────
            if (sock.config?.mode === 'self' && senderNumber !== sock.config.ownerNumber) continue;

            statsCmd.counters.commands++;

            const xreply    = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
            const trashcore = sock;
            const chat      = chatId;
            const m         = message;

            console.log(chalk.cyan(`[CMD] .${cmd} from ${chatId}`));

            switch (cmd) {
                // ── Original ────────────────────────────────────────────────
                case 'menu':                                   await menuCmd(sock, chatId, message); break;
                case 'ping':                                   await pingCmd(sock, chatId, message); break;
                case 'ghost':                                  await ghostCmd(sock, chatId, message); break;
                case 'hack':                                   await hackCmd(sock, chatId, message); break;
                case 'tiktok': case 'tt':
                    await tiktokCmd.run({ trashcore, m, args, xreply, chat }); break;
                case 'pindl': case 'pinterest': case 'pintdl':
                    await pindlCmd.run({ trashcore, m, args, xreply, chat }); break;
                case 'fbdl': case 'fb': case 'facebookdl':
                    await fbdlCmd.run({ trashcore, m, args, xreply, chat }); break;
                case 'lirik': case 'lyrics':
                    await lirikCmd.run({ trashcore, m, args, xreply, chat }); break;
                case 'ytmp3': case 'play': case 'music':
                    await ytmp3Cmd.run({ trashcore, m, args, xreply, chat }); break;

                // ── New Commands ─────────────────────────────────────────────
                case 'vv':                                     await vvCmd(sock, chatId, message); break;
                case 'tagall': case 'tag':                     await tagallCmd(sock, chatId, message, args); break;
                case 'everyone':                               await everyoneCmd(sock, chatId, message, args); break;
                case 'pp':                                     await ppCmd(sock, chatId, message); break;
                case 'bd': case 'birthday':                    await bdCmd(sock, chatId, message, args); break;
                case 'sticker': case 's':                      await stickerCmd(sock, chatId, message); break;
                case 'alive':                                  await aliveCmd(sock, chatId, message); break;
                case 'kick':                                   await kickCmd(sock, chatId, message); break;
                case 'ban':                                    await banCmd(sock, chatId, message); break;
                case 'promote': case 'admin':                  await promoteCmd(sock, chatId, message); break;
                case 'demote':                                 await demoteCmd(sock, chatId, message); break;
                case 'mute': case 'unmute':                    await muteCmd(sock, chatId, message, args); break;
                case 'owner':                                  await ownerCmd(sock, chatId, message); break;
                case 'groupinfo': case 'ginfo':                await groupinfoCmd(sock, chatId, message); break;
                case 'joke':                                   await jokeCmd(sock, chatId, message); break;
                case 'quote':                                  await quoteCmd(sock, chatId, message); break;
                case 'flip':                                   await flipCmd(sock, chatId, message); break;
                case 'dice':                                   await diceCmd(sock, chatId, message); break;
                case '8ball': case 'ball':                     await eightballCmd(sock, chatId, message, args); break;
                case 'time': case 'date':                      await timeCmd(sock, chatId, message); break;
                case 'calc': case 'math':                      await calcCmd(sock, chatId, message, args); break;
                case 'warn':                                   await warnCmd(sock, chatId, message, args); break;
                case 'weather':                                await weatherCmd(sock, chatId, message, args); break;
                case 'translate': case 'tr':                   await translateCmd(sock, chatId, message, args); break;
                case 'info':                                   await infoCmd(sock, chatId, message); break;
                case 'tolink':                                 await tolinkCmd(sock, chatId, message); break;
                case 'speed':                                  await speedCmd(sock, chatId, message); break;
                case 'tts':                                    await ttsCmd(sock, chatId, message, args); break;
                case 'wiki':                                   await wikiCmd(sock, chatId, message, args); break;
                case 'short': case 'shorten':                  await shortCmd(sock, chatId, message, args); break;

                // ── 41 New Commands ────────────────────────────────────────────
                case 'reverse':                                await reverseCmd(sock, chatId, message, args); break;
                case 'mock':                                   await mockCmd(sock, chatId, message, args); break;
                case 'clap':                                   await clapCmd(sock, chatId, message, args); break;
                case 'binary':                                 await binaryCmd(sock, chatId, message, args); break;
                case 'unbinary':                               await unbinaryCmd(sock, chatId, message, args); break;
                case 'encode':                                 await b64encodeCmd(sock, chatId, message, args); break;
                case 'decode':                                 await b64decodeCmd(sock, chatId, message, args); break;
                case 'hash':                                   await hashCmd(sock, chatId, message, args); break;
                case 'count':                                  await countCmd(sock, chatId, message, args); break;
                case 'qr':                                     await qrCmd(sock, chatId, message, args); break;
                case 'currency':                               await currencyCmd(sock, chatId, message, args); break;
                case 'define':                                 await defineCmd(sock, chatId, message, args); break;
                case 'advice':                                 await adviceCmd(sock, chatId, message); break;
                case 'fact':                                   await factCmd(sock, chatId, message); break;
                case 'riddle':                                 await riddleCmd(sock, chatId, message); break;
                case 'truth':                                  await truthCmd(sock, chatId, message); break;
                case 'dare':                                   await dareCmd(sock, chatId, message); break;
                case 'compliment':                             await complimentCmd(sock, chatId, message); break;
                case 'roastme':                                await roastmeCmd(sock, chatId, message); break;
                case 'ship':                                   await shipCmd(sock, chatId, message, args); break;
                case 'choose':                                 await chooseCmd(sock, chatId, message, args); break;
                case 'rate':                                   await rateCmd(sock, chatId, message, args); break;
                case 'rps':                                    await rpsCmd(sock, chatId, message, args); break;
                case 'poll':                                   await pollCmd(sock, chatId, message, args); break;
                case 'jid':                                    await jidCmd(sock, chatId, message); break;
                case 'block':                                  await blockCmd(sock, chatId, message); break;
                case 'unblock':                                await unblockCmd(sock, chatId, message, args); break;
                case 'afk':                                    await afkCmd(sock, chatId, message, args); break;
                case 'groupname': case 'setname':              await groupnameCmd(sock, chatId, message, args); break;
                case 'groupdesc': case 'setdesc':               await groupdescCmd(sock, chatId, message, args); break;
                case 'welcome':                                await welcomeCmd(sock, chatId, message, args); break;
                case 'antilink':                               await antilinkCmd(sock, chatId, message, args); break;
                case 'setprefix':                              await setprefixCmd(sock, chatId, message, args); break;
                case 'setbotname':                             await setbotnameCmd(sock, chatId, message, args); break;
                case 'mode':                                   await modeCmd(sock, chatId, message, args); break;
                case 'delete': case 'del':                     await delmsgCmd(sock, chatId, message); break;
                case 'lock':                                   await lockCmd(sock, chatId, message, args); break;
                case 'adminlist': case 'staff':                await adminlistCmd(sock, chatId, message); break;
                case 'stats':                                  await statsCmd(sock, chatId, message); break;
                case 'convert':                                await convertCmd(sock, chatId, message, args); break;
                case 'bmi':                                    await bmiCmd(sock, chatId, message, args); break;

                default: break;
            }

        } catch (err) {
            console.error(chalk.red(`[ERR] handleMessages: ${err.message}`));
        }
    }
}

module.exports = { handleMessages };
