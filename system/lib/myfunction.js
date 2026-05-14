const { 
    jidNormalizedUser,
    proto,
    getContentType,
    areJidsSameUser,
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");
const fs = require('fs-extra');
const axios = require('axios');
const toMs = require('ms');

// ===================== UTILITIES =====================
const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000);
exports.unixTimestampSeconds = unixTimestampSeconds;

exports.generateMessageTag = (epoch) => {
    let tag = exports.unixTimestampSeconds().toString();
    if (epoch) tag += '.--' + epoch;
    return tag;
};

exports.runtime = function(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d > 0 ? `${d} *day* ` : ""}${h > 0 ? `${h} *hour* ` : ""}${m > 0 ? `${m} *minute*` : ""}`.trim();
};

exports.jsonformat = (string) => JSON.stringify(string, null, 2);

exports.sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.isUrl = (url) => url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'));

exports.parseMention = (text = '') => [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');

exports.getGroupAdmins = (participants) => {
    let admins = [];
    for (let i of participants) {
        if (i.admin === "superadmin" || i.admin === "admin") admins.push(i.id);
    }
    return admins;
};

exports.getBuffer = async (url, options) => {
    try {
        const res = await axios({ method: "get", url, ...options, responseType: 'arraybuffer' });
        return res.data;
    } catch { return null; }
};

exports.getSizeMedia = (path) => {
    const stat = fs.statSync(path);
    const bytes = stat.size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

exports.fetchJson = async (url, options) => {
    const res = await axios(url, options);
    return res.data;
};

// ===================== PREMIUM =====================
let premium = [];
try {
    premium = JSON.parse(fs.readFileSync("./system/database/premium.json", "utf8"));
    if (!Array.isArray(premium)) throw new Error();
} catch { premium = []; }

const addPremiumUser = (userId, expired, _dir = premium) => {
    if (!Array.isArray(_dir)) return false;
    const msTime = toMs(expired);
    if (!msTime) return false;
    const cekUser = _dir.find(u => u.id === userId);
    if (cekUser) cekUser.expired += msTime;
    else _dir.push({ id: userId, expired: Date.now() + msTime });
    fs.writeFileSync("./system/database/premium.json", JSON.stringify(_dir, null, 2));
    return true;
};

const getPremiumExpired = (userId, _dir) => _dir.find(u => u.id === userId)?.expired || null;
const checkPremiumUser = (userId, _dir) => _dir.some(u => u.id === userId);
const delPremiumUser = (userId, _dir = premium) => {
    const idx = _dir.findIndex(u => u.id === userId);
    if (idx !== -1) {
        _dir.splice(idx, 1);
        fs.writeFileSync("./system/database/premium.json", JSON.stringify(_dir, null, 2));
        return true;
    }
    return false;
};
const getAllPremiumUser = (_dir) => _dir.map(u => u.id);
const expiredCheck = (conn, _dir) => {
    setInterval(() => {
        _dir.forEach((user, i) => {
            if (Date.now() >= user.expired) {
                _dir.splice(i, 1);
                fs.writeFileSync("./system/database/premium.json", JSON.stringify(_dir, null, 2));
                conn.sendMessage(user.id, { text: "Your premium has expired." });
            }
        });
    }, 1000);
};

// ===================== THEME SYSTEM =====================
const themesConfig = {
    obito: { name: "🦊 Obito Uchiwa", emoji: "🥷", style: "cool" },
    naruto: { name: "🍥 Naruto", emoji: "🍥", style: "energetic" },
    jonsnow: { name: "⚔️ Jon Snow", emoji: "⚔️", style: "cold" },
    itachi: { name: "🐦‍⬛ Itachi", emoji: "🐦‍⬛", style: "calm" },
    goku: { name: "🐉 Goku", emoji: "🐉", style: "powerful" },
    xlicon: { name: "❌ Xlicon", emoji: "❌", style: "dark" }
};

exports.getUserTheme = (sender) => {
    try {
        const db = JSON.parse(fs.readFileSync("./system/database/themes.json"));
        return db[sender] || "obito";
    } catch { return "obito"; }
};

exports.setUserTheme = (sender, theme) => {
    try {
        const db = JSON.parse(fs.readFileSync("./system/database/themes.json"));
        db[sender] = theme;
        fs.writeFileSync("./system/database/themes.json", JSON.stringify(db, null, 2));
        return true;
    } catch { return false; }
};

exports.getTheme = (name) => themesConfig[name] || themesConfig.obito;
exports.getAllThemes = () => themesConfig;

// ===================== SMSG (MESSAGE PARSER) =====================
exports.smsg = (conn, m, store) => {
    if (!m) return m;
    const M = proto.WebMessageInfo;
    if (m.key) {
        m.id = m.key.id;
        m.isBaileys = m.id?.startsWith('BAE5') && m.id.length === 16;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat?.endsWith('@g.us');
        m.sender = conn.decodeJid(m.fromMe && conn.user.id || m.participant || m.key.participant || m.chat || '');
        if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || '';
    }
    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = (m.mtype === 'viewOnceMessage' ? m.message[m.mtype]?.message?.[getContentType(m.message[m.mtype]?.message)] : m.message[m.mtype]) || {};
        m.body = m.message.conversation || m.msg.caption || m.msg.text || '';
        let quoted = m.quoted = m.msg?.contextInfo?.quotedMessage || null;
        m.mentionedJid = m.msg?.contextInfo?.mentionedJid || [];
        if (quoted) {
            let type = getContentType(quoted);
            m.quoted = quoted[type] || {};
            if (type === 'productMessage') {
                type = getContentType(m.quoted);
                m.quoted = m.quoted[type] || {};
            }
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted };
            m.quoted.key = {
                remoteJid: m.msg?.contextInfo?.remoteJid || m.chat,
                participant: jidNormalizedUser(m.msg?.contextInfo?.participant || m.sender),
                fromMe: areJidsSameUser(jidNormalizedUser(m.msg?.contextInfo?.participant || m.sender), jidNormalizedUser(conn.user?.id)),
                id: m.msg?.contextInfo?.stanzaId
            };
            m.quoted.mtype = type;
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || '';
            m.quoted.download = async () => {
                const stream = await downloadContentFromMessage(m.quoted, m.quoted.mimetype?.split('/')[0] || 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                return buffer;
            };
        }
    }
    if (m.msg?.url) {
        m.download = async () => {
            const stream = await downloadContentFromMessage(m.msg, m.msg.mimetype?.split('/')[0] || 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            return buffer;
        };
    }
    m.reply = (text, chatId = m.chat, options = {}) => conn.sendMessage(chatId, { text }, { quoted: m, ...options });
    return m;
};

// ===================== EXPORT ALL =====================
module.exports = {
    unixTimestampSeconds,
    generateMessageTag: exports.generateMessageTag,
    runtime: exports.runtime,
    jsonformat: exports.jsonformat,
    sleep: exports.sleep,
    isUrl: exports.isUrl,
    parseMention: exports.parseMention,
    getGroupAdmins: exports.getGroupAdmins,
    getBuffer: exports.getBuffer,
    getSizeMedia: exports.getSizeMedia,
    fetchJson: exports.fetchJson,
    addPremiumUser,
    getPremiumExpired,
    checkPremiumUser,
    delPremiumUser,
    getAllPremiumUser,
    expiredCheck,
    getUserTheme: exports.getUserTheme,
    setUserTheme: exports.setUserTheme,
    getTheme: exports.getTheme,
    getAllThemes: exports.getAllThemes,
    smsg: exports.smsg
};
