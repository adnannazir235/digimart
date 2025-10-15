import { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext.jsx";
import { userAPI } from "../services/api.js";
import { toast } from "react-toastify";
import LoadingButton from "./LoadingButton";
import { toastOptions } from "../../config/styles.js";

export default function ProfileForm() {
  const { user, setUser } = useAuth();
  const [originalData, setOriginalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    age: 0,
    avatar: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || "",
        username: user.username || "",
        age: parseInt(user.age) || 0,
        avatar: user.avatar || "",
        bio: user.bio || "",
      };

      setOriginalData(userData);
      setFormData(userData);
    }
  }, [user]);

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setIsEditing(false);
  };

  // ✅ FIXED: Proper number handling for age input
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? (value === "" ? 0 : parseInt(value)) : value,
    }));
  };

  const createDataToSend = () => {
    const changedFields = {};

    if (formData.name !== originalData.name && formData.name !== "") {
      changedFields.name = formData.name;
    }
    if (
      formData.username !== originalData.username &&
      formData.username !== ""
    ) {
      changedFields.username = formData.username;
    }
    if (formData.age !== originalData.age && formData.age !== 0) {
      changedFields.age = Number(formData.age); // ✅ Ensure number to backend
    }
    if (formData.avatar !== originalData.avatar && formData.avatar !== "") {
      changedFields.avatar = formData.avatar;
    }
    if (formData.bio !== originalData.bio && formData.bio !== "") {
      changedFields.bio = formData.bio;
    }

    return changedFields;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing) {
      handleEditToggle();
      return;
    }

    const dataToSend = createDataToSend();

    if (Object.keys(dataToSend).length === 0) {
      toast.info("No changes detected. Nothing to update.", toastOptions);
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await userAPI.updateProfile(dataToSend);

      const updatedUser = response.data.data.user;
      setUser(updatedUser);

      setOriginalData({
        name: updatedUser.name || "",
        username: updatedUser.username || "",
        age: parseInt(updatedUser.age) || 0, // ✅ Ensure number
        avatar: updatedUser.avatar || "",
        bio: updatedUser.bio || "",
      });

      setFormData({
        name: updatedUser.name || "",
        username: updatedUser.username || "",
        age: parseInt(updatedUser.age) || 0, // ✅ Ensure number
        avatar: updatedUser.avatar || "",
        bio: updatedUser.bio || "",
      });

      toast.success(
        response.data.message || "Profile updated successfully!",
        toastOptions
      );

      setIsEditing(false);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update profile";
      toast.error(message, toastOptions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const getAvatarStatus = () => {
    const url = formData.avatar.trim();

    if (!url) return { text: "Enter image URL", className: "text-muted" };

    try {
      new URL(url);

      const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
      const urlLower = url.toLowerCase();
      const hasValidExtension = validExtensions.some((ext) =>
        urlLower.includes(ext)
      );

      if (hasValidExtension) {
        return { text: "✅ Valid image URL", className: "text-success" };
      } else {
        return {
          text: "⚠️ URL missing image extension",
          className: "text-warning",
        };
      }
    } catch {
      return { text: "❌ Invalid URL", className: "text-danger" };
    }
  };

  if (!user) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      {!isEditing && (
        <div className="text-center mb-4 pb-3 border-bottom">
          <img
            src={user.avatar}
            alt="Profile"
            className="rounded-circle img-fluid mx-auto d-block mb-2"
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
          />
          <h5 className="mb-1">{formData.name || "Your Name"}</h5>
          <p className="text-muted mb-0">@{formData.username || "username"}</p>
        </div>
      )}

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={!isEditing}
            maxLength="50"
            placeholder="Enter your full name"
          />
        </div>

        <div className="col-12 col-md-6">
          <label htmlFor="username" className="form-label">
            Username
          </label>

          <div className="input-group">
            <span className="input-group-text">@</span>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={!isEditing}
              maxLength="30"
              placeholder="username"
            />
          </div>
        </div>

        <div className="col-12 col-md-6">
          <label htmlFor="age" className="form-label">
            Age
          </label>
          <input
            type="number"
            className="form-control"
            id="age"
            name="age"
            value={formData.age} // ✅ Always show the number value
            onChange={handleInputChange}
            disabled={!isEditing}
            min="18"
            max="100"
            placeholder="Age"
          />
        </div>

        <div className="col-12 col-md-6">
          <label htmlFor="avatar" className="form-label">
            Profile Picture URL
          </label>
          <input
            type="url"
            className="form-control"
            id="avatar"
            name="avatar"
            value={formData.avatar}
            onChange={handleInputChange}
            disabled={!isEditing}
            maxLength="1100"
            placeholder="https://example.com/avatar.jpg"
          />

          {isEditing && (
            <div className="form-text">
              <span className={getAvatarStatus().className}>
                {getAvatarStatus().text}
              </span>
            </div>
          )}
        </div>

        <div className="col-12">
          <label htmlFor="bio" className="form-label">
            Bio
          </label>
          <textarea
            className="form-control"
            id="bio"
            name="bio"
            rows="3"
            value={formData.bio}
            onChange={handleInputChange}
            disabled={!isEditing}
            maxLength="500"
            placeholder="Tell us about yourself..."
          />
          <div className="form-text">{formData.bio.length}/500 characters</div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="d-grid gap-2 d-md-flex justify-content-md-between">
            <LoadingButton
              type="submit"
              className="btn btn-primary rounded-pill px-4 flex-fill flex-md-grow-0"
              loading={isLoading}
            >
              {isEditing ? "Update Profile" : "Edit Profile"}
            </LoadingButton>

            {isEditing && (
              <>
                <div className="d-md-none mb-2"></div>
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4 flex-fill flex-md-grow-0"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
