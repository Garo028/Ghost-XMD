module.exports = async (sock, chatId, message, args) => {
    const choice = (args[0] || '').toLowerCase();
    const valid = ['rock', 'paper', 'scissors'];
    if (!valid.includes(choice)) return sock.sendMessage(chatId, { text: '❌ Usage: *.rps rock/paper/scissors*' }, { quoted: message });
    const bot = valid[Math.floor(Math.random() * 3)];
    let result;
    if (bot === choice) result = "It's a draw! 🤝";
    else if (
        (choice === 'rock' && bot === 'scissors') ||
        (choice === 'paper' && bot === 'rock') ||
        (choice === 'scissors' && bot === 'paper')
    ) result = 'You win! 🎉';
    else result = 'I win! 😎';
    await sock.sendMessage(chatId, { text: `✊✋✌️ *ROCK PAPER SCISSORS*\n\nYou: ${choice}\nMe: ${bot}\n\n${result}` }, { quoted: message });
};
