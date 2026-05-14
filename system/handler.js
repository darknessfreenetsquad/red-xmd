const fs = require('fs');
const path = require('path');

// Load all plugins from system/plugins folder
const plugins = [];

function loadPlugins() {
    const pluginDir = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginDir)) return;
    const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
        try {
            const plugin = require(path.join(pluginDir, file));
            const mods = Array.isArray(plugin) ? plugin : [plugin];
            for (const mod of mods) {
                if (mod.commands && Array.isArray(mod.commands) && typeof mod.run === 'function') {
                    plugins.push(mod);
                }
            }
        } catch (err) {
            console.error(`[Plugin] Error loading ${file}:`, err.message);
        }
    }
    console.log(`[Handler] Loaded ${plugins.length} plugins`);
}
loadPlugins();

// Main message handler – returns true if a plugin handled the command
async function handleMessages(sock, message) {
    try {
        const msg = message.message;
        if (!msg) return false;

        // Extract text (supports normal text, extendedText, and caption for media)
        let text = msg.conversation ||
                   msg.extendedTextMessage?.text ||
                   msg.imageMessage?.caption ||
                   msg.videoMessage?.caption ||
                   '';
        if (!text) return false;

        // Detect prefix (your bot uses . as prefix, but you can support multiple)
        const prefixes = ['.', '#', '!']; // adjust as needed
        let usedPrefix = null;
        for (const p of prefixes) {
            if (text.startsWith(p)) {
                usedPrefix = p;
                text = text.slice(p.length).trim();
                break;
            }
        }
        if (!usedPrefix) return false;

        const parts = text.split(/\s+/);
        const command = parts.shift().toLowerCase();
        const args = parts;

        // Find plugin that matches this command
        const plugin = plugins.find(p => p.commands.includes(command));
        if (!plugin) return false;

        // Build context object (what the plugin expects)
        const chatId = message.key.remoteJid;
        const sender = message.key.participant || chatId;
        const isGroup = chatId?.endsWith('@g.us') || false;

        // Fetch group metadata only if needed (for admin checks)
        let groupMetadata = null;
        let isAdmin = false;
        let isBotAdmin = false;
        let participants = [];
        if (isGroup) {
            try {
                groupMetadata = await sock.groupMetadata(chatId);
                participants = groupMetadata.participants || [];
                const isSenderAdmin = participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
                const isBotAdmin = participants.some(p => p.id === sock.user.id && (p.admin === 'admin' || p.admin === 'superadmin'));
                isAdmin = isSenderAdmin;
                isBotAdmin = isBotAdmin;
            } catch (err) {
                console.log("[Handler] Failed to get group metadata:", err.message);
            }
        }

        const ctx = {
            sock,
            jid: chatId,
            isGroup,
            isAdmin,
            isBotAdmin,
            groupMetadata,
            participants,
            from: sender,
            mentionedJid: msg.extendedTextMessage?.contextInfo?.mentionedJid || [],
            contextInfo: {},
            theme: {}, // leave empty or add simple strings
            reply: (text) => sock.sendMessage(chatId, { text }, { quoted: message }),
            safeSend: (content, opts) => sock.sendMessage(chatId, content, { quoted: message, ...opts })
        };

        // Execute the plugin
        await plugin.run(sock, message, args, ctx);
        return true; // command was handled

    } catch (err) {
        console.error("[Handler] Error:", err);
        return false;
    }
}

module.exports = { handleMessages, plugins };
