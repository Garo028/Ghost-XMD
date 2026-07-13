module.exports = async (sock, chatId, message) => {
    const riddles = [
        ['What has keys but no locks, space but no room, and you can enter but not go in?', 'A keyboard'],
        ['The more you take, the more you leave behind. What am I?', 'Footsteps'],
        ['What has a face and two hands but no arms or legs?', 'A clock'],
        ['What can travel around the world while staying in a corner?', 'A stamp'],
        ['What gets wetter the more it dries?', 'A towel'],
    ];
    const [q, a] = riddles[Math.floor(Math.random() * riddles.length)];
    await sock.sendMessage(chatId, { text: `🧩 *RIDDLE*\n\n${q}\n\n||Answer: ${a}||` }, { quoted: message });
};
