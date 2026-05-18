const fs = require("fs-extra");
const toMs = require("ms");
//======================
let premium = [];
try {
premium = JSON.parse(fs.readFileSync("./system/database/premium.json", "utf8"));
if (!Array.isArray(premium)) throw new Error("File premium.json has an error!");
} catch (err) {
console.error("⚠️ premium.json error.");
premium = [];
}
const addPremiumUser = (userId, expired, _dir = premium) => {
if (!Array.isArray(_dir)) {
console.error("❌ ERROR: _dir bukan array!");
return false;
}
console.log(`🔹 user ${userId}  duration ${expired}`);
const msTime = toMs(expired);
if (!msTime) {
console.error("❌ Format '30d', '7d', '1h' dsb.");
return false;
}
const cekUser = _dir.find((user) => user.id === userId);
if (cekUser) {
cekUser.expired += msTime;
console.log(`🔄 User premium acces have expired try or contact the owner for access${cekUser.expired}`);
} else {
const obj = { id: userId, expired: Date.now() + msTime };
_dir.push(obj);
console.log(`✅ User added: ${JSON.stringify(obj)}`);
}
try {
fs.writeFileSync("./system/database/premium.json", JSON.stringify(_dir, null, 2));
console.log("📝 Database premium!");
} catch (error) {
console.error("❌ premium.json:", error);
return false;
}
return true;
};;
const getPremiumPosition = (userId, _dir) => {
return _dir.findIndex((user) => user.id === userId);
};
const getPremiumExpired = (userId, _dir) => {
const user = _dir.find((u) => u.id === userId);
return user ? user.expired : null;
};
const checkPremiumUser = (userId, _dir) => {
return _dir.some((user) => user.id === userId);
};
const expiredCheck = (conn, _dir) => {
setInterval(() => {
_dir.forEach((user, index) => {
if (Date.now() >= user.expired) {
console.log(`🔥 Premium expired: ${user.id}`);
_dir.splice(index, 1);
fs.writeFileSync("./system/database/premium.json", JSON.stringify(_dir, null, 2));
conn.sendMessage(user.id, { text: "Premium is deleted ." });
}
});
}, 1000);
};
//======================
const delPremiumUser = (userId, _dir = premium) => {
if (!Array.isArray(_dir)) {
console.error("❌ ERROR: _dir bukan array!");
return false;
}
let index = _dir.findIndex(user => user.id === userId);
if (index !== -1) {
_dir.splice(index, 1);
try {
fs.writeFileSync("./system/database/premium.json", JSON.stringify(_dir, null, 2));
console.log(`✅ Removed Premium: ${userId}`);
return true;
} catch (error) {
console.error("❌ Error premium.json:", error);
return false;
}
}
return false;
};
const getAllPremiumUser = (_dir) => {
return _dir.map((user) => user.id);
};
//======================
module.exports = {
addPremiumUser,
getPremiumExpired,
getPremiumPosition,
delPremiumUser,
expiredCheck,
checkPremiumUser,
getAllPremiumUser,
};
// ===================== THEME SYSTEM (ADD THIS) =====================
const themesConfig = {
    obito: { name: "🦊 Obito Uchiwa", emoji: "🥷", style: "cool" },
    naruto: { name: "🍥 Naruto", emoji: "🍥", style: "energetic" },
    sasuke: { name: "⚡ Jonsnow", emoji: "⚡", style: "cold" },
    gojo: { name: "🔥 Goku", emoji: "🔥", style: "arrogant" },
    luffy: { name: "🏴‍☠️ Luffy", emoji: "👒", style: "happy" },
    sukuna: { name: "👹 Sukuna", emoji: "👹", style: "dark" },
    tech: { name: "🥶 Vegita", emoji: "🥶", style: "modern" },
    cute: { name: "🌸 Ayra", emoji: "🌸", style: "cute" }
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
