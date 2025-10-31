import { useState } from "react";
import { toast } from "react-toastify";
import { shopAPI, userAPI } from "../services/api.js";
import LoadingButton from "../components/LoadingButton.jsx";
import { toastOptions } from "../../config/styles.js";
import { useAuth } from "../contexts/authContext.jsx";
import { useNavigate } from "react-router-dom";

export default function CreateShop() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: "",
    description: "",
    logo: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.shopName.trim()) {
      toast.error("Shop name is required.", toastOptions);
      return false;
    }
    if (formData.logo.trim()) {
      try {
        new URL(formData.logo);
      } catch {
        toast.error("Invalid logo URL.", toastOptions);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await shopAPI.createShop({
        shopName: formData.shopName.trim(),
        description: formData.description.trim() || "",
        logo: formData.logo.trim() || "",
      });

      // Reset form
      setFormData({
        shopName: "",
        description: "",
        logo: "",
      });

      toast.success(
        response.data.message || "Shop created successfully!",
        toastOptions
      );

      // Fetch updated user profile to ensure role is updated
      const profileResponse = await userAPI.getProfile();
      setUser(profileResponse.data.data.user);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create shop";
      toast.error(message, toastOptions);
    } finally {
      setIsLoading(false);
    }
  };

  const getLogoStatus = () => {
    const url = formData.logo.trim();
    if (!url)
      return { text: "Enter image URL (optional)", className: "text-muted" };
    try {
      new URL(url);
      return { text: "✅ Valid image URL", className: "text-success" };
    } catch {
      return { text: "❌ Invalid URL", className: "text-danger" };
    }
  };

  return (
    <div className="container-fluid d-flex" style={{ minHeight: "81dvh" }}>
      <div className="container">
        <div className="row">
          <div className="col-8">
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="text-center mb-4 pb-3 border-bottom">
                <h5 className="mb-1">Create a New Shop</h5>
                <p className="text-muted mb-0">
                  Fill in the details to set up your shop.
                </p>
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="shopName" className="form-label">
                    Shop Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="shopName"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    maxLength="50"
                    placeholder="Enter shop name"
                    required
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="description" className="form-label">
                    Description (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    maxLength="500"
                    placeholder="Describe your shop..."
                  />
                  <div className="form-text">
                    {formData.description.length}/500 characters
                  </div>
                </div>

                <div className="col-12">
                  <label htmlFor="logo" className="form-label">
                    Shop Logo URL (Optional)
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    id="logo"
                    name="logo"
                    value={formData.logo}
                    onChange={handleInputChange}
                    maxLength="1100"
                    placeholder="https://example.com/logo.jpg"
                  />
                  <div className="form-text">
                    <span className={getLogoStatus().className}>
                      {getLogoStatus().text}
                    </span>
                  </div>
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-12">
                  <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                    <LoadingButton
                      type="submit"
                      className="btn btn-primary rounded-pill px-4 flex-fill flex-md-grow-0"
                      loading={isLoading}
                    >
                      Create Shop
                    </LoadingButton>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
