const TOKEN_KEY = "accessToken";

export const getAccessToken = () => {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token || token === "null") return null;
        return JSON.parse(token);
    } catch (e) {
        console.error("Failed to parse accessToken:", e);
        return null;
    }
};

export const setAccessToken = (token) => {
    const value = JSON.stringify(token);
    localStorage.setItem(TOKEN_KEY, value);

    window.dispatchEvent(
        new StorageEvent("storage", {
            key: TOKEN_KEY,
            newValue: value,
        })
    );
};

export const removeAccessToken = () => {
    localStorage.removeItem(TOKEN_KEY);

    window.dispatchEvent(
        new StorageEvent("storage", {
            key: TOKEN_KEY,
            newValue: null,
        })
    );
};