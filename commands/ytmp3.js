const axios = require('axios');

// ─── ytmp3 ──────────────────────────────────────────────────

const ytmp3 = {
  name: 'ytmp3',
  command: ['ytmp3', 'play', 'music'],
  category: 'Downloader',
  desc: 'Download music from YouTube by search query',

  run: async ({ trashcore, m, args, xreply, chat }) => {
    try {
      const query = args.join(' ');

      if (!query) {
        return xreply('Usage: .ytmp3 <song name>\n\nExample: .ytmp3 Jahprayzah Ruzhowa');
      }

      await xreply('🎵 Searching and downloading music...');

      const { data } = await axios.get(
        `https://api.drexapp.space/downloader/yta?q=${encodeURIComponent(query)}`
      );

      if (!data.status || !data.result) {
        return xreply('❌ Could not find the song. Try a different search.');
      }

      const res = data.result;

      await trashcore.sendMessage(chat, {
        audio: { url: res.dl_url },
        mimetype: 'audio/mpeg',
        fileName: `${res.title}.mp3`,
        ptt: false
      }, { quoted: m });

      await trashcore.sendMessage(chat, {
        text:
`🎵 *Music Downloaded*

📌 Title: ${res.title}
⏱ Duration: ${res.duration}
📦 Size: ${res.size}

> Downloaded by 👻 GHOST XMD 👻`
      }, { quoted: m });

    } catch (err) {
      console.error('YTMP3 Error:', err);
      xreply('❌ Error downloading music');
    }
  }
};

module.exports = ytmp3;
