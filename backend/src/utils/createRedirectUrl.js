const { v4: uuidv4 } = require("uuid");

exports.createRedirectUrl = (status, message, endpointRoute, accessToken, isCountrySelected = true) => {
    // 1. Validate FRONTEND_URL
    if (!process.env.FRONTEND_URL) {
        console.error("FRONTEND_URL is not defined in environment variables");
        throw new Error("FRONTEND_URL is not defined");
    }

    // 2. Normalize endpointRoute to avoid leading/trailing slashes
    const normalizedRoute = endpointRoute.replace(/^\/+|\/+$/g, "");

    // 3. Construct base URL
    const baseUrlParts = [process.env.FRONTEND_URL.replace(/\/+$/, "")];

    if (process.env.REACT_FRONTEND_URL_BASE_NAME) {
        baseUrlParts.push(process.env.REACT_FRONTEND_URL_BASE_NAME.replace(/\/+$/, ""));
    }

    if (normalizedRoute) {
        baseUrlParts.push(normalizedRoute);
    }

    const baseUrl = baseUrlParts.join("/");

    // 4. Construct the query string
    const queryParams = [
        `status=${encodeURIComponent(status)}`,
        `message=${encodeURIComponent(message)}`,
        `toastId=${encodeURIComponent(uuidv4())}` // Add unique toastId
    ];

    if (accessToken) {
        queryParams.push(`accessToken=${encodeURIComponent(accessToken)}`);
    }

    if (!isCountrySelected) {
        queryParams.push(`isCS=${encodeURIComponent(isCountrySelected)}`);
    }

    const queryString = `?${queryParams.join("&")}`;

    // 5. Return the full URL
    const fullUrl = `${baseUrl}${queryString}`;
    console.log("feUrl:>", fullUrl);
    return fullUrl;
};