// system/plugins/aura.js
'use strict';
const fs = require('fs');
const path = require('path');

// Helper to load image as buffer
function getImageBuffer() {
    // Use your own image URL or local path
    const imageUrl = 'https://files.lordobitotech.xyz/mediafiles/db03a584-20e8-4119-b327-3bcac0190587.jpg';
    return { url: imageUrl };
}

module.exports = {
    commands: ['aura', 'plugins2'],
    description: 'Show bot stats, plugin count and developer info',
    permission: 'public',
    group: true,
    private: true,
    run: async (sock, message, args, ctx) => {
        // Count plugins dynamically from the plugins folder
        const pluginsDir = path.join(__dirname, '../plugins');
        let pluginCount = 0;
        if (fs.existsSync(pluginsDir)) {
            pluginCount = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js') && f !== 'aura.js').length;
        }

        // Get total commands from plugins (if available from your handler)
        let totalCommands = 0;
        if (global.plugins && Array.isArray(global.plugins)) {
            for (const p of global.plugins) {
                if (p.commands && Array.isArray(p.commands)) totalCommands += p.commands.length;
            }
        } else {
            totalCommands = pluginCount * 3; // fallback estimation
        }

        // Bot stats
        const uptime = process.uptime();
        const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
        const memUsage = process.memoryUsage();
        const ramUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
        
        // Current timestamp
        const now = new Date();
        const timestamp = now.toLocaleString();

        // Build stylish response
        const header = `*シ︎     𖣘𝗩𝗘𝗥𝗦𝗜𝗢𝗡 𝗔𝗨𝗥𝗔+𖣘*
> ✵✵✵✵✵✵   ♫︎    ✵✵✵✵✵✵

            *𝄞*`;

        const boxLines = [
            `_ʙᴏᴛ ɴᴀᴍᴇ_ : *RED DRAGON XMD*`,
            `_ᴅᴇᴠᴇʟᴏᴘᴇʀ_ : *@Reddragon*`,
            `_ᴠᴇʀsɪᴏɴ_ : *1.0.0*`,
            ``,
            `📊 *STATISTICS*`,
            `_ᴘʟᴜɢɪɴs ʟᴏᴀᴅᴇᴅ_ : *${pluginCount}*`,
            `_ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅs_ : *${totalCommands}+*`,
            `_ᴜsᴇʀs_ : *estimating...*`,
            `_ᴜᴘᴛɪᴍᴇ_ : *${uptimeStr}*`,
            `_ʀᴀᴍ ᴜsᴀɢᴇ_ : *${ramUsed} MB*`,
            `_ᴛɪᴍᴇsᴛᴀᴍᴘ_ : ${timestamp}`,
            ``,
            `🔥 *AURA ACTIVE*`,
            `_ᴘᴏᴡᴇʀᴇᴅ ʙʏ_ : RED DRAGON DFS`
        ];

        const box = `*╭─ׁ━❍↻ 𝙋𝙇𝙐𝙂𝙄𝙉𝙎 & 𝘼𝙐𝙍𝘼 ↺❍━╮*
${boxLines.map(l => `*┃* ⌬ ─· ${l}`).join('\n')}
*╰───────────────𝄞*

> ʀᴇᴅ ᴅʀᴀɢᴏɴ ᴅғs`;

        const caption = `${header}\n${box}`;

        // Send image with caption
        await sock.sendMessage(ctx.jid, {
            image: getImageBuffer(),
            caption: caption
        }, { quoted: message });
    }
};
