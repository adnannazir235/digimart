export const toastOptions = () => {
    // 1. Check if user manually toggled dark mode (data-bs-theme="dark")
    const htmlTag = document.documentElement;
    const dataTheme = htmlTag.getAttribute('data-bs-theme');

    // 2. Check system preference if no manual attribute is found
    const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 3. Decide final theme
    const currentTheme = dataTheme ? dataTheme : (isSystemDark ? 'dark' : 'light');

    return {
        position: "bottom-right",
        autoClose: 10000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: currentTheme,
    };
};

export const getBadgeClasses = (status) => {
    switch (status) {
        case "completed": return "badge bg-success";
        case "pending": return "badge bg-warning";
        case "refunded": return "badge bg-info";
        case "canceled": return "badge bg-secondary";
        case "failed": return "badge bg-danger";
        default: return "bg-light text-dark";
    }
};