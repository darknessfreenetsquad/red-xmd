'use strict';

const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

// RED XMD layout: header + raw lines + footer
function fmt(title, lines) {
    const header = `*╭─ׁ━❍↻ ${title} ↺❍━╮*`;
    const middle = lines.join('\n');
    const footer = `*╰───────────────𝄞*\n> © ʀᴇᴅ ᴅʀᴀɢᴏɴ ᴅғs 🔥`;
    return `${header}\n${middle}\n${footer}`;
}

module.exports = {
    commands:    ['shazam', 'identify', 'shzm'],
    description: 'Identify a song from a replied audio/video message using AudD',
    permission:  'public',
    group:       true,
    private:     true,

    run: async (sock, message, args, ctx) => {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted) {
            return ctx.reply(fmt('🎵 SHAZAM', [
                '❌ Please *reply* to an audio or video message to identify the song.'
            ]));
        }

        const msgType = Object.keys(quoted)[0];
        if (!['audioMessage', 'videoMessage'].includes(msgType)) {
            return ctx.reply(fmt('🎵 SHAZAM', [
                '❌ Please reply to an *audio* or *video* message.'
            ]));
        }

        await ctx.reply(fmt('🎧 SHAZAM', [
            '🔍 Identifying song...',
            '⏳ Please wait a moment'
        ]));

        let tempFile = null;
        try {
            const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
            const stream = await downloadContentFromMessage(quoted[msgType], msgType.replace('Message', ''));
            let buffer = Buffer.alloc(0);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            tempFile = path.join(os.tmpdir(), `shazam_${Date.now()}.ogg`);
            fs.writeFileSync(tempFile, buffer);

            const form = new FormData();
            form.append('return', 'apple_music,spotify');
            form.append('api_token', 'test');
            form.append('file', new Blob([buffer]), 'audio.ogg');

            const res = await axios.post('https://api.audd.io/', form, { timeout: 30000 });
            const result = res.data?.result;

            if (!result) {
                return ctx.reply(fmt('❌ SHAZAM', [
                    '❌ Could not identify the song.',
                    '🎤 Try a clearer audio clip or a different recording.'
                ]));
            }

            const infoLines = [
                `🎤 *Title:* ${result.title}`,
                `🎸 *Artist:* ${result.artist}`,
                `💿 *Album:* ${result.album || 'N/A'}`,
                `📅 *Release:* ${result.release_date || 'N/A'}`,
                ``,
                `🔗 *Apple Music:* ${result.apple_music?.url || 'N/A'}`,
                `🎧 *Spotify:* ${result.spotify?.external_urls?.spotify || 'N/A'}`
            ];

            await ctx.reply(fmt('🎵 SONG IDENTIFIED', infoLines));
        } catch (err) {
            console.error('[Shazam]', err.message);
            await ctx.reply(fmt('⚠️ SHAZAM ERROR', [
                `❌ Failed to identify: ${err.message}`,
                '🔄 Please try again later or use a different audio clip.'
            ]));
        } finally {
            if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        }
    }
};
