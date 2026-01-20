const axios = require("axios");

exports.getUsdEquivalent = async (currencyCode = "USD", amount) => {
    if (currencyCode.toUpperCase() === "USD") {
        return amount;
    }

    const upperCurrency = currencyCode.toUpperCase();

    try {
        const apiKey = process.env.EXCHANGERATE_API_KEY;
        const endpoint = apiKey
            ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
            : "https://open.er-api.com/v6/latest/USD";
        const response = await axios.get(endpoint);
        const rates = response.data.conversion_rates;

        if (!rates[upperCurrency]) {
            throw new Error(`Currency ${currencyCode} not supported by exchange rate API`);
        }

        const usdValue = amount / rates[upperCurrency];

        return Math.round(usdValue);

    } catch (error) {
        console.error("Exchange rate API error:", error.message);
        const fallbackMin = { PKR: 283.84 };
        const rate = fallbackMin[upperCurrency] || 280;
        return Math.round(amount / rate);
    }
};

exports.getRawRate = async (currencyCode = "USD") => {
    if (currencyCode.toUpperCase() === "USD") {
        return 1;
    }

    try {
        const apiKey = process.env.EXCHANGERATE_API_KEY;
        const endpoint = apiKey
            ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
            : "https://open.er-api.com/v6/latest/USD";
        const response = await axios.get(endpoint);
        const rates = response.data.conversion_rates;
        const upperCurrency = currencyCode.toUpperCase();

        if (!rates[upperCurrency]) {
            throw new Error(`Currency ${currencyCode} not supported by exchange rate API`);
        }

        return rates[upperCurrency];
    } catch (error) {
        console.error("Exchange rate API error:", error.message);
        const fallbackRates = { USD: 1, PKR: 283.84 }; // From your response
        return fallbackRates[upperCurrency] || null;
    }
};