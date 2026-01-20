// Utility to get initials from a name (same as before)
export const getInitials = (name) => {
    if (!name) return "?";
    const nameParts = name.split(" ").filter(Boolean); // Filter out any empty strings
    if (nameParts.length > 1) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
};