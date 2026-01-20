// Utility to generate a random HSL color (same as before)
export const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 45;
    const lightness = 65;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};