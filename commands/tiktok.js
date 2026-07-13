const axios = require('axios');

// ─── tiktok ─────────────────────────────────────────────────

const tiktok = {
  name: 'tiktok',
  command: ['tiktok', 'tt'],
  category: 'Downloader',
  desc: 'Download TikTok videos',

  run: async ({ trashcore, m, args, xreply, chat }) => {
    try {
      const url = args[0];

      if (!url) {
        return xreply('Usage: .tiktok <tiktok url>');
      }

      await xreply('📥 Downloading TikTok video...');

      const { data } = await axios.get(
        `https://api.drexapp.space/downloader/tiktok?url=${encodeURIComponent(url)}`
      );

      if (!data.status || !data.result?.result) {
        return xreply('❌ Failed to fetch TikTok video');
      }

      const res = data.result.result;

      await trashcore.sendMessage(chat, {
        video: { url: res.play },
        caption:
`🎵 ${res.title}

👤 Author: ${res.author.nickname}
⏱ Duration: ${res.duration}s
❤️ Likes: ${res.digg_count}
💬 Comments: ${res.comment_count}`
      }, { quoted: m });

    } catch (err) {
      console.error('TIKTOK Error:', err);
      xreply('❌ Error downloading TikTok video');
    }
  }
};

module.exports = tiktok;
