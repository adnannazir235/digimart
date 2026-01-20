import { limitations } from "../../config/validation";

/**
 * Formats a numeric price value as a USD-formatted number string
 * without including the currency symbol.
 *
 * Examples:
 *  - 15 → "15.00"
 *  - 1500 → "1,500.00"
 *  - 1500 (cents) → "15.00"
 *
 * @param {number|string} value - Price value to format
 * @param {Object} [options]
 * @param {"cents"|"dollars"} [options.unit="dollars"] - Unit of the provided value
 * @returns {string} Formatted price string (e.g., "1,500.00")
 */
export const formatUsdPrice = (
    value,
    {
        unit = "dollars",
    } = {}
) => {
    const amount =
        unit === "cents" ? Number(value) / 100 : Number(value);

    return amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

/**
 * Returns the currency symbol for a given currency code
 * based on application configuration.
 *
 * @param {string} currencyCode - ISO currency code (e.g. "USD", "PKR")
 * @returns {string} Currency symbol (e.g. "$", "Rs") or the code itself if not found
 */
export const getCurrencySymbol = (currencyCode) => {
    const country = limitations.user.allowedCountries.find(
        (c) => c.currencyCode === currencyCode
    );

    return country?.currencySymbol ?? currencyCode;
};