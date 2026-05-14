const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function toBool(val, defaultOn = true) {
    if (val === undefined || val === null || val === '') return defaultOn;
    return val.toLowerCase() !== 'false';
}

module.exports = {
    SESSION_ID:            process.env.SESSION_ID || "red~H4sIAAAAAAAAA5VW21LbSBD9Fz1PZeei21CVqjWObSBcYwOOt/IgrLEssCUhyQaT4t/3dItLHnazrKvA0mim+/Q5p1v+6RVl3rivbuft/fSqOt8mraPLdlfh29vfLBau9oSXJm3i7f0VhEIFVig/EkYKKYwvtMZ9ZEQcCW1ioUwglFTCRkKFCpeBMEIpnPOl8H0RB8JKoaUVViMWDijsDHzhI4zEkh8I3Glf09kfz8KrNjerfP4bUFppoQOJo1Zo5YsQR3UsDMWVHYoIeWLgMKEIY6G7J9rHE4UnoQEg/AUE3TCqMBQRMANjiEXUpiw/R7GIG6sfz4Qsyeu8yAbV0q1dnaxA4zmWPkYlYVEREGgjrOICdKCZFWQgQmMm1GIbisJCCAJpPwBFVKJlbFQtlRZ2j4ARFCtwrGQsiF8IQDrID3GpiBsL/lEvKR0DlcGlMcJ0OU2nYcjbYgAnwEQ8YARcjYZ+Csi1MkydhqwcT3USI5YVfsgyM49NnhUuPUxd0ebt7sNm1FKKqGNNsb20Iq0oiWReIvZCGHaZsTXEAhDDhtqQXRURGtNhzR4lomi7jATCkTes4VIU5ZD6QxTGzD55ipxCqMh8ivVUJJLPzGjpi442Tc/JDJaZVLSJrAg6tQZNIfeXIe9xlT4ZIyA70FH9K4fn9Wsv3/0fL1IKSVJS/2qBFuQuJ5cxraw6laOUFAEpigOayAOjWrIdyKuazADyYyqRiycrsKUiQa4iVgOeBx9zIwIppCBwlB0ykXa4g7GBDjgNc0vU0Kpkx2MOkLpdv1PLmK7ljQhwY2NBDLJhYSBoEApr30hM2k39O67YGLojB/lszGKxshAFHQgJqSeRmpghk1Ee8hWPSsn9CHAELKJNnT3oli4jNLDujqnO2z7TTjNSkcFpE80Oa5kb3olDKJyMTXNAG92phZzYCOMprhPBCIEiVCEbkQ4CrKaZwhPOdO2OIxEpBBcdpt6ewmXtsrxp66TNy4LWUIGXpNuxm9euZdN508n0Tg0m25uJqubL+1t7eRcfhb1vT2Z4Wq5v9H26Wp6Wx0XyvfwMQqu6nLumcekBApf17gQ3SeYakPxDeIV7bDs7czYlvEVeN+1lsalWZZK+ev31YTKfl5uiHe+KeZ8uINmefF92bYtJ3ZCumyKp58t86/rLpMXKIlk17q1AVztEbOuNe5vv/TIlI4z6+lRdDgMgX7NBcmz0rB+FUmMUBXpP6z+bTw8UNamqT4VrsXXFu3x0agylfRvHNqaNtI4iEwrlNQkAtUvv+Q0wxU9dm+QrIPT65/eD5sgfDI6SSz2PR6PeIOv1s573XuCrczslisn2vsgO0vGXURkGmYzDbD0bprc38ny9P92ezS8O7i+nV5PRQH7+hyCIsFCzi9FT+6388rVsk2JzfTRojnezrDLBbHJR7m4mF5vZw2Zu68eb5iGv/MfkKb8bL85WwyzYHPXc8ebUfG93Wfi4SjePvj2crfd7nylb6rb53P2a7Ns0mD0Up8fqenjQj6aLw3F2eVJfnFyb1I6W301obx/Ww2l/7P+xOLt6Opze3kfOPY2fsu0JaMiz1WF9cD3r79f+41VaZA9Xw9EXSvba06uXl0vO7iLp6HaROx6QLyr8l5QdbjKcRNz3EC8T999mKzo3EhinGjOUf/Dw7MH4oF88YTfL6f1C3ekbXqI3Do1RDM3ufRDSPJPi5f1K05cGH4ek1xfNWqzjVwK69hnNU62SdlHWa+BJirQu2Wx1uaEmOCwW5W9fX1rQRKJ/hmbAKmna3nt3TfK1a9pkXWEsRPj4cYDp5K13vaoat3jPvDSl16PPyemJ9/w36mc8xWYKAAA=",
    // PREFIX supports comma-separated list: ".,!,/,?"
    // Use "any" to accept any leading symbol, or "" / "none" for no prefix
    PREFIX:                process.env.PREFIX || ".",
    BOT_NAME:              process.env.BOT_NAME || "© ʀᴇᴅ ᴅʀᴀɢᴏɴ ᴅғs",
    OWNER_NUMBER:          process.env.OWNER_NUMBER || "27634988678",
    OWNER_NAME:            process.env.OWNER_NAME || "© ʀᴇᴅ ᴅʀᴀɢᴏɴ ᴅғs",
    DESCRIPTION:           process.env.DESCRIPTION || "© ʀᴇᴅ ᴅʀᴀɢᴏɴ ᴅғs",
    ALIVE_IMG:             process.env.ALIVE_IMG || "https://files.lordobitotech.xyz/mediafiles/5c555e30-0bce-4f20-b5c6-8eaee7cc47ac.jpg",
    LIVE_MSG:              process.env.LIVE_MSG || "© ʀᴇᴅ is active",
    MODE:                  process.env.MODE || "both",
    AUTO_STATUS_SEEN:      toBool(process.env.AUTO_STATUS_SEEN,      true),
    AUTO_STATUS_REACT:     toBool(process.env.AUTO_STATUS_REACT,     true),
    AUTO_STATUS_REPLY:     toBool(process.env.AUTO_STATUS_REPLY,     false),
    AUTO_STATUS_MSG:       process.env.AUTO_STATUS_MSG || "Seen by © ʀᴇᴅ  XMD",
    CUSTOM_REACT_EMOJIS:   process.env.CUSTOM_REACT_EMOJIS || "❤️,🔥,💯,😍,👏,💙,🙌",
    Status_Saver:          process.env.Status_Saver  || process.env.STATUS_SAVER  || 'false',
    STATUS_REPLY:          process.env.STATUS_REPLY  || 'false',
    STATUS_MSG:            process.env.STATUS_MSG    || 'RED MD 💖 SUCCESSFULLY VIEWED YOUR STATUS',
    READ_MESSAGE:          toBool(process.env.READ_MESSAGE,          false),
    AUTO_REACT_NEWSLETTER:   toBool(process.env.AUTO_REACT_NEWSLETTER,   true),
    ANTI_BAD:              toBool(process.env.ANTI_BAD,              false),
    ALWAYS_ONLINE:         toBool(process.env.ALWAYS_ONLINE,         true),
    AUTO_TYPING:           toBool(process.env.AUTO_TYPING,           true),
    AUTO_RECORDING:        toBool(process.env.AUTO_RECORDING,        false),
    DELETE_LINKS:          toBool(process.env.DELETE_LINKS,          false),
    ANTIDELETE_GROUP:      toBool(process.env.ANTIDELETE_GROUP,      true),
    ANTIDELETE_PRIVATE:    toBool(process.env.ANTIDELETE_PRIVATE,    true),
    ANTILINK:              toBool(process.env.ANTILINK,               false),
    ANTIVV:                toBool(process.env.ANTIVV,                 true),
    DEBUG:                 toBool(process.env.DEBUG,                 false),
    THEME:                 (process.env.THEME || 'Gojo').toLowerCase().trim(),
    GREETING:              process.env.GREETING || '',
    APP_URL:               process.env.APP_URL || '',
};
