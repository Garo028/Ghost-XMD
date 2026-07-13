const axios = require('axios');
module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: *.weather London*' }, { quoted: message });
    const city = args.join(' ');
    try {
        const res  = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { timeout: 8000 });
        const d    = res.data.current_condition[0];
        const area = res.data.nearest_area[0];
        const name = area.areaName[0].value + ', ' + area.country[0].value;
        const text = `
🌤️ *WEATHER - ${name.toUpperCase()}*

🌡️ Temp     : ${d.temp_C}°C / ${d.temp_F}°F
💧 Humidity : ${d.humidity}%
💨 Wind     : ${d.windspeedKmph} km/h
👁️ Feels    : ${d.FeelsLikeC}°C
☁️ Condition: ${d.weatherDesc[0].value}
`.trim();
        await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Could not fetch weather. Check the city name.' }, { quoted: message });
    }
};
