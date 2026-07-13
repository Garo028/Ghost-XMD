const axios = require('axios');

// ─── fbdl ──────────────────────────────────────────────────

const fbdl = {
  name: 'fbdl',
  command: ['fbdl', 'fb', 'facebookdl'],
  category: 'Downloader',
  desc: 'Download Facebook videos',

  run: async ({ trashcore, m, args, xreply, chat }) => {
    try {
      const url = args[0];
      const quality = args[1]?.toLowerCase() || 'hd';

      if (!url) {
        return xreply(
          'Usage: .fbdl <facebook url> [quality]\n\n' +
          'Quality options:\n' +
          '• *hd* - 720p High quality (default)\n' +
          '• *sd* - 360p Standard quality\n\n' +
          'Example: .fbdl https://facebook.com/share/r/xxx hd'
        );
      }

      if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
        return xreply('❌ Please provide a valid Facebook URL');
      }

      await xreply('⏳ Fetching Facebook video...');

      const { data } = await axios.get(
        `https://api.drexapp.space/downloader/facebookv2?url=${encodeURIComponent(url)}`
      );

      if (!data.status || !data.result) {
        return xreply('❌ Could not fetch video. Make sure the link is a public Facebook video.');
      }

      const res = data.result;

      const hdLink = res.qualities?.[0]?.link || res.media_url;
      const sdLink = res.qualities?.[1]?.link || res.media_url;

      const videoUrl = quality === 'sd' ? sdLink : hdLink;
      const qualityLabel = quality === 'sd'
        ? (res.qualities?.[1]?.quality || '360p (SD)')
        : (res.qualities?.[0]?.quality || '720p (HD)');

      await trashcore.sendMessage(chat, {
        video: { url: videoUrl },
        caption:
          `📘 *Facebook Video*\n\n` +
          `📊 Quality: ${qualityLabel}\n\n` +
          `> Downloaded by 👻 GHOST XMD 👻`,
        mimetype: 'video/mp4'
      }, { quoted: m });

    } catch (err) {
      console.error('FBDL Error:', err);
      xreply('❌ Error downloading Facebook video');
    }
  }
};

module.exports = fbdl;
