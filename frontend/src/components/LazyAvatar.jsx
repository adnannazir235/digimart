import { useState } from "react";
import { generateRandomColor, getInitials } from "../utils";

const LazyAvatar = ({ name, src }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [randomColor] = useState(generateRandomColor());
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
          style={{ padding: "1px 7px" }}
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
            opacity: imageLoaded ? null : 0,
            display: imageLoaded ? null : "none",
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};

export default LazyAvatar;
