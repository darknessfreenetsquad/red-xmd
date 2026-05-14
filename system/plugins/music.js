'use strict';
const playdl = require('play-dl');
const axios = require('axios');

// RED XMD style - applies to ALL messages
function fmt(title, lines) {
    const header = `*╭─ׁ━❍↻ ${title} ↺❍━╮*`;
    const middle = lines.map(l => `*┃* ⌬ ─· ${l}`).join('\n');
    const footer = `*╰───────────────𝄞*\n> © ʀᴇᴅ ᴅʀᴀɢᴏɴ ᴅғs 🔥`;
    return `${header}\n${middle}\n${footer}`;
}

// For simple messages without title (always includes footer)
function simpleMsg(content) {
    return `${content}\n\n> © ʀᴇᴅ ᴅʀᴀɢᴏɴ ᴅғs 🔥`;
}

// Fallback APIs
const FALLBACK_APIS = (link) => [
    `https://apiskeith.top/download/audio?url=${encodeURIComponent(link)}`,
    `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(link)}`,
    `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(link)}`,
    `https://api.akuari.my.id/downloader/youtubeaudio?link=${encodeURIComponent(link)}`
];

module.exports = {
    commands: ['play3', 'song2'],
    description: 'Search and download a song from YouTube',
    permission: 'public',
    group: true,
    private: true,

    run: async (sock, message, args, ctx) => {
        const query = args.join(' ').trim();
        const jid = message.key.remoteJid;
        
        if (!query) {
            // Error message with full layout
            return ctx.reply(fmt('ERROR', ['❌ Usage: .play3 <song name or YouTube link>']));
        }

        // Search message with layout
        await ctx.reply(fmt('MUSIC', [`🔍 Searching: *${query}*...`]));

        try {
            let videoUrl, title, artist, thumbnail, duration;

            const isUrl = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(query);

            if (isUrl) {
                const info = await playdl.video_info(query);
                const det = info.video_details;
                videoUrl = query;
                title = det.title || 'Unknown Title';
                artist = det.channel?.name || 'Unknown Artist';
                thumbnail = det.thumbnails?.[det.thumbnails.length - 1]?.url || '';
                duration = det.durationRaw || '';
            } else {
                const results = await playdl.search(query, { source: { youtube: 'video' }, limit: 1 });
                if (!results?.length) throw new Error('No results found');
                const v = results[0];
                videoUrl = v.url;
                title = v.title || 'Unknown Title';
                artist = v.channel?.name || 'Unknown Artist';
                thumbnail = v.thumbnails?.[v.thumbnails.length - 1]?.url || '';
                duration = v.durationRaw || '';
            }

            // Info message with full box layout
            const infoLines = [
                `🎵 *${title}*`,
                `🎤 *Artist:* ${artist}`,
                `⏱ *Duration:* ${duration}`,
                ``,
                `⏳ Downloading audio...`
            ];
            await ctx.reply(fmt('MUSIC INFO', infoLines));

            // Try play-dl stream
            let audioBuffer = null;
            try {
                const stream = await playdl.stream(videoUrl, { quality: 2 });
                const chunks = [];
                for await (const chunk of stream.stream) chunks.push(chunk);
                audioBuffer = Buffer.concat(chunks);
            } catch (streamErr) {
                console.warn('[Music] play-dl stream failed:', streamErr.message);
            }

            // Fallback to public APIs
            let audioUrl = null;
            if (!audioBuffer) {
                for (const apiUrl of FALLBACK_APIS(videoUrl)) {
                    try {
                        const { data } = await axios.get(apiUrl, { timeout: 25000 });
                        const dl = (typeof data?.result === 'string' ? data.result : null) ||
                                   data?.result?.downloadUrl ||
                                   data?.result?.url ||
                                   data?.download ||
                                   data?.url ||
                                   data?.link;
                        if (dl) { audioUrl = dl; break; }
                    } catch { /* next */ }
                }
            }

            if (!audioBuffer && !audioUrl) {
                throw new Error('All download methods failed. Try again later.');
            }

            // Send playable audio
            const safeTitle = title.replace(/[^\w\s-]/g, '').trim().slice(0, 50);
            
            if (audioBuffer) {
                await sock.sendMessage(jid, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    ptt: false
                }, { quoted: message });
            } else {
                await sock.sendMessage(jid, {
                    audio: { url: audioUrl },
                    mimetype: 'audio/mpeg',
                    ptt: false
                }, { quoted: message });
            }

            // Success message with full layout (includes footer)
            await ctx.reply(fmt('MUSIC', ['✅ Song sent successfully!']));

        } catch (err) {
            console.error('[play3]', err);
            // Error message with full layout
            ctx.reply(fmt('ERROR', [`❌ Could not download: ${err.message}`]));
        }
    }
};
