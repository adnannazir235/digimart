const fetch = require("node-fetch");
const tokenCache = new Map();

async function verifyConnection() {
    try {
        await getAccessToken();
        console.log("✅ ZohoMail: Connected");
        return true;
    } catch (err) {
        console.warn("❌ ZohoMail: Connection failed", err.message);
        return false;
    }
}

const setToken = (token, expiresIn) => {
    const expiryTime = Date.now() + expiresIn * 1000;
    tokenCache.set("zoho_token", { token, expiryTime });
};

const getToken = () => {
    const data = tokenCache.get("zoho_token");
    if (!data) return null;

    if (Date.now() > data.expiryTime) {
        tokenCache.delete("zoho_token");
        return null;
    }

    return data.token;
};

async function getAccessToken() {
    let token = getToken();
    if (token) return token;

    const url = `https://accounts.zoho.com/oauth/v2/token?refresh_token=${process.env.ZOHO_REFRESH_TOKEN}&client_id=${process.env.ZOHO_CLIENT_ID}&client_secret=${process.env.ZOHO_CLIENT_SECRET}&grant_type=refresh_token`;

    const res = await fetch(url, { method: "POST" });
    const data = await res.json();

    if (!data.access_token) {
        throw new Error("Failed to get Zoho access token");
    }

    setToken(data.access_token, data.expires_in || 3600);
    return data.access_token;
}

async function sendMail(options) {
    const accessToken = await getAccessToken();

    const payload = {
        fromAddress: process.env.ZOHO_EMAIL,
        toAddress: options.to,
        subject: options.subject,
        content: options.html || options.text,
    };

    const res = await fetch(
        `https://mail.zoho.com/api/accounts/${process.env.ZOHO_ACCOUNT_ID}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
    }

    return res.json();
}

module.exports = { sendMail, verifyConnection };