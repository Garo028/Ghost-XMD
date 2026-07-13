const axios = require('axios');

// ─── pindl ──────────────────────────────────────────────────

const pindl = {
  name: 'pindl',
  command: ['pindl', 'pinterest', 'pintdl'],
  category: 'Downloader',
  desc: 'Download Pinterest videos & images',

  run: async ({ trashcore, m, args, xreply, chat }) => {
    try {
      const url = args[0];

      if (!url) {
        return xreply(
          'Usage: .pindl <pinterest url>\n\n' +
          'Example: .pindl https://pin.it/xxx'
        );
      }

      if (!url.includes('pinterest.com') && !url.includes('pin.it')) {
        return xreply('❌ Please provide a valid Pinterest URL');
      }

      await xreply('⏳ Fetching Pinterest media...');

      const { data } = await axios.get(
        `https://api.drexapp.space/downloader/pinterest?url=${encodeURIComponent(url)}`
      );

      if (!data.status || !data.result) {
        return xreply('❌ Could not fetch media. Make sure the link is a valid Pinterest post.');
      }

      const res = data.result;

      const caption =
        `📌 *Pinterest ${res.type === 'video' ? 'Video' : 'Image'}*\n\n` +
        `📝 Title: ${res.title || 'N/A'}\n` +
        `👤 Author: ${res.author || 'N/A'} (@${res.username || 'N/A'})\n` +
        `📅 Uploaded: ${res.upload_date ? new Date(res.upload_date).toDateString() : 'N/A'}\n\n` +
        `> Downloaded by 👻 GHOST XMD 👻`;

      if (res.type === 'video') {
        await trashcore.sendMessage(chat, {
          video: { url: res.media_url },
          caption,
          mimetype: 'video/mp4'
        }, { quoted: m });
      } else {
        await trashcore.sendMessage(chat, {
          image: { url: res.media_url },
          caption
        }, { quoted: m });
      }

    } catch (err) {
      console.error('PINDL Error:', err);
      xreply('❌ Error downloading Pinterest media');
    }
  }
};

module.exports = pindl;
