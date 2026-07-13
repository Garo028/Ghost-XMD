const axios = require('axios');

// ─── lirik ──────────────────────────────────────────────────

const lirik = {
  name: 'lirik',
  command: ['lirik', 'lyrics'],
  category: 'Search',
  desc: 'Search song lyrics',

  run: async ({ trashcore, m, args, xreply, chat }) => {
    try {
      const query = args.join(' ');

      if (!query) {
        return xreply('Usage: .lirik <song name>');
      }

      await xreply('🎵 Searching lyrics...');

      const { data } = await axios.get(
        `https://api.drexapp.space/search/lyrics?q=${encodeURIComponent(query)}`
      );

      if (!data.status || !data.result) {
        return xreply('❌ Lyrics not found');
      }

      const res = data.result;

      const lyrics =
        res.lyrics.length > 3500
          ? res.lyrics.slice(0, 3500) + '...'
          : res.lyrics;

      await trashcore.sendMessage(chat, {
        text:
`🎵 *Lyrics Found*

📌 Title: ${res.title}
🎤 Artist: ${res.artist}
💽 Album: ${res.album}

📝 Lyrics:

${lyrics}`
      }, { quoted: m });

    } catch (err) {
      console.error('LIRIK Error:', err);
      xreply('❌ Error fetching lyrics');
    }
  }
};

module.exports = lirik;
