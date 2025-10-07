import { useState } from "react";

// Utility to get initials from a name (same as before)
const getInitials = (name) => {
  if (!name) return "?";
  const nameParts = name.split(" ").filter(Boolean); // Filter out any empty strings
  if (nameParts.length > 1) {
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  }
  return nameParts[0][0].toUpperCase();
};

// Utility to generate a random HSL color (same as before)
const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 45;
  const lightness = 65;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const LazyAvatar = ({ name, src }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const randomColor = generateRandomColor();

  const initials = getInitials(name);

  // This is the key decision point for what to display
  const showPlaceholder = !src || imageError || !imageLoaded;

  return (
    <div
      className="avatar-container rounded-circle d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: showPlaceholder ? randomColor : "transparent",
      }}
    >
      {showPlaceholder && (
        <span
          className="avatar-initials fw-bold"
          style={{ padding: "4px 10px" }}
        >
          {initials}
        </span>
      )}

      {src && (
        <img
          src={src}
          alt={`${name}'s avatar`}
          className="avatar-image rounded-circle"
          height="25"
          style={{
            // Use CSS visibility for a smooth fade transition instead of display: none
            opacity: imageLoaded ? 1 : 0,
            visibility: imageLoaded ? "visible" : "hidden",
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};

export default LazyAvatar;
