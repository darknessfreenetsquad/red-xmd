'use strict';
const fs = require('fs');
const path = require('path');

// ----- Load global config to get the active theme name -----
let activeThemeName = 'default';
try {
    const config = require('../config');
    if (config.THEME) activeThemeName = config.THEME;
} catch(e) {
    console.warn('[Menu2] Could not load config, using default theme');
}

// ----- South African time (Johannesburg) -----
function getSouthAfricanTime() {
    const now = new Date();
    const options = {
        timeZone: 'Africa/Johannesburg',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return now.toLocaleString('en-ZA', options);
}

// ----- Category definitions (customise as needed) -----
const CATEGORIES = [
    { icon: '⬇️',  name: 'Downloaders',    cmds: ['yt','youtube','ytmp4','ytvideo','tiktok','threads','twitter','apk'] },
    { icon: '🎵',  name: 'Music & Audio',   cmds: ['play','play2','song','ytmp3','toaudio','tomp3','tts'] },
    { icon: '🌍',  name: 'Search & Info',   cmds: ['weather','time','timezone','clock','ip','domaincheck','fetch','github','npm'] },
    { icon: '🖼️', name: 'Media & Stickers', cmds: ['sticker','toimg','tojpeg','togif','qr','createqr','readqr','ttp','fancy'] },
    { icon: '👥',  name: 'Group Management', cmds: ['kick','out','promote','demote','tagall','hidetag','mute','unmute','kickall','closegroup','antilink'] },
    { icon: '👋',  name: 'Welcome',          cmds: ['welcome2','goodbye2','setwelcome2','setgoodbye2'] },
    { icon: '😄',  name: 'Fun & Games',      cmds: ['truth','dare','ttt','tictactoe','wordscramble','ws','coin','dice','choose','trivia'] },
    { icon: '🔧',  name: 'Tools',            cmds: ['ebinary','debinary','ebase','dbase','uuid','lorem','shorten','tinyurl','vgd','cleanuri','urlscan','onwa'] },
    { icon: '📊',  name: 'Bot Info',         cmds: ['menu2','help','list','ping','speed','met','alive','repo','deploy','theme2'] },
    { icon: '👑',  name: 'Owner',            cmds: ['public','self','settheme','antistatus'] },
];

function buildMenu(plugins, prefix, themeName) {
    // Collect all unique command names from plugins
    const allCmds = new Set();
    for (const p of plugins) {
        if (p.commands && Array.isArray(p.commands)) {
            for (const cmd of p.commands) allCmds.add(cmd);
        }
    }
    allCmds.delete('menu2');
    allCmds.delete('help');
    allCmds.delete('list');

    const assigned = new Set();
    const categoriesOut = [];

    for (const cat of CATEGORIES) {
        const found = [];
        for (const c of cat.cmds) {
            if (allCmds.has(c)) {
                found.push(c);
                assigned.add(c);
            }
        }
        if (found.length) {
            const lines = found.map(cmd => `┃  ⌬ ─· \`${prefix}${cmd}\``);
            categoriesOut.push(`╭─「 ${cat.icon} ${cat.name} 」\n${lines.join('\n')}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄`);
        }
    }

    const remaining = [...allCmds].filter(c => !assigned.has(c));
    if (remaining.length) {
        const lines = remaining.map(cmd => `┃  ⌬ ─· \`${prefix}${cmd}\``);
        categoriesOut.push(`╭─「 🔧 Other 」\n${lines.join('\n')}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄`);
    }

    const timeStr = getSouthAfricanTime();
    const header = `╭─ׁ━❍─↻𝙍𝙀𝘿 𝙓𝙈𝘿↺─❍━╮
┃  ⌬ ${timeStr}
┃  ⌬ ${plugins.length} plugins loaded
┃  ⌬ Prefix: \`${prefix}\`
┃  ⌬ THEME: ${themeName}
╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄`;

    const footer = `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╮
┃  💡 \`.help <cmd>\` for details ┃
┃  🔗 t.me/darknessfreenetsquad  ┃
╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╯
╰─ׁ━❍─↻𝙍𝙀𝘿 𝙓𝙈𝘿↺─❍━╯`;

    return `${header}\n\n${categoriesOut.join('\n\n')}\n\n${footer}`;
}

function loadPlugins() {
    const dir = __dirname; // /system/plugins/
    const plugins = [];
    if (!fs.existsSync(dir)) return plugins;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'menu2.js');
    for (const file of files) {
        try {
            const p = require(path.join(dir, file));
            if (p && Array.isArray(p.commands) && p.commands.length) plugins.push(p);
        } catch (err) {
            console.error(`[Menu2] Failed to load ${file}:`, err.message);
        }
    }
    return plugins;
}

module.exports = {
    commands: ['menu2', 'help', 'list'],
    description: 'Show all commands (categorized) with global theme from config',
    permission: 'public',
    group: true,
    private: true,
    run: async (sock, message, args, ctx) => {
        const prefix = ctx.prefix || '.';
        const plugins = loadPlugins();
        const menuText = buildMenu(plugins, prefix, activeThemeName);
        await sock.sendMessage(ctx.jid, { text: menuText }, { quoted: message });
    }
};
