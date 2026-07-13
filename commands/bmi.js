module.exports = async (sock, chatId, message, args) => {
    if (args.length < 2) return sock.sendMessage(chatId, { text: '❌ Usage: *.bmi weight(kg) height(m)* — e.g. *.bmi 70 1.75*' }, { quoted: message });
    const weight = parseFloat(args[0]);
    const height = parseFloat(args[1]);
    if (isNaN(weight) || isNaN(height) || height <= 0) return sock.sendMessage(chatId, { text: '❌ Enter valid numbers, e.g. *.bmi 70 1.75*' }, { quoted: message });
    const bmi = (weight / (height * height)).toFixed(1);
    let category = 'Normal';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 25 && bmi < 30) category = 'Overweight';
    else if (bmi >= 30) category = 'Obese';
    await sock.sendMessage(chatId, { text: `⚖️ *BMI CALCULATOR*\n\nBMI: *${bmi}*\nCategory: *${category}*` }, { quoted: message });
};
