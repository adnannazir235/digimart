import { useState, useEffect } from "react";
import { shopAPI } from "../services/api.js";
import { toast } from "react-toastify";
import LoadingButton from "./LoadingButton";
import { toastOptions } from "../../config/styles.js";

export default function ShopForm({
  shopData,
  setShopData,
  isEditing,
  setIsEditing,
  isDeleting,
}) {
  const [originalData, setOriginalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: "",
    description: "",
    logo: "",
  });

  useEffect(() => {
    if (shopData) {
      const data = {
        shopName: shopData.shopName || "",
        description: shopData.description || "",
        logo: shopData.logo || "",
      };
      setOriginalData(data);
      setFormData(data);
    }
  }, [shopData]);

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createDataToSend = () => {
    const changedFields = {};

    if (
      formData.shopName !== originalData.shopName &&
      formData.shopName.trim() !== ""
    ) {
      changedFields.shopName = formData.shopName.trim();
    }
    if (formData.description !== originalData.description) {
      changedFields.description = formData.description.trim();
    }
    if (formData.logo !== originalData.logo) {
      changedFields.logo = formData.logo.trim();
    }

    return changedFields;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!formData.shopName.trim()) {
      toast.error("Shop name is required and cannot be empty.", toastOptions);
      return;
    }
    if (formData.shopName.length < 3 || formData.shopName.length > 50) {
      toast.error(
        "Shop name must be between 3 and 50 characters.",
        toastOptions
      );
      return;
    }
    if (!/^[a-zA-Z0-9\s_-]+$/.test(formData.shopName)) {
      toast.error(
        "Shop name can only contain letters, numbers, spaces, underscores, and hyphens.",
        toastOptions
      );
      return;
    }
    if (formData.description.length > 500) {
      toast.error("Description cannot exceed 500 characters.", toastOptions);
      return;
    }
    if (formData.logo.trim()) {
      try {
        new URL(formData.logo);
      } catch {
        toast.error("Invalid logo URL.", toastOptions);
        return;
      }
      if (formData.logo.length > 1100) {
        toast.error("Logo URL cannot exceed 1100 characters.", toastOptions);
        return;
      }
    }

    const dataToSend = createDataToSend();

    if (Object.keys(dataToSend).length === 0) {
      toast.info("No changes detected. Nothing to update.", toastOptions);
      setIsEditing(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await shopAPI.updateShop(dataToSend);
      const updatedShop = response.data.data.shop;

      setShopData({
        shopId: updatedShop._id,
        shopName: updatedShop.shopName || "",
        description: updatedShop.description || "",
        logo: updatedShop.logo || "",
      });

      setOriginalData({
        shopName: updatedShop.shopName || "",
        description: updatedShop.description || "",
        logo: updatedShop.logo || "",
      });

      setFormData({
        shopName: updatedShop.shopName || "",
        description: updatedShop.description || "",
        logo: updatedShop.logo || "",
      });

      toast.success(
        response.data.message || "Shop updated successfully!",
        toastOptions
      );
      setIsEditing(false);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update shop";
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

  if (!shopData) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="text-center mb-4 pb-3 border-bottom">
        {shopData.logo && (
          <img
            src={formData.logo || "https://via.placeholder.com/80"}
            alt="Shop Logo"
            className="rounded-circle img-fluid mx-auto d-block mb-2"
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
          />
        )}
        <h5 className="mb-1">{formData.shopName || "Your Shop Name"}</h5>
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
            disabled={!isEditing}
            maxLength="50"
            placeholder="Enter your shop name"
            required
          />
        </div>

        <div className="col-12">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleInputChange}
            disabled={!isEditing}
            maxLength="500"
            placeholder="Describe your shop..."
          />
          <div className="form-text">
            {formData.description.length}/500 characters
          </div>
        </div>

        <div className="col-12">
          <label htmlFor="logo" className="form-label">
            Shop Logo URL
          </label>
          <input
            type="url"
            className="form-control"
            id="logo"
            name="logo"
            value={formData.logo}
            onChange={handleInputChange}
            disabled={!isEditing}
            maxLength="1100"
            placeholder="https://example.com/logo.jpg"
          />
          {isEditing && (
            <div className="form-text">
              <span className={getLogoStatus().className}>
                {getLogoStatus().text}
              </span>
            </div>
          )}
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
              {isEditing ? "Update Shop" : "Edit Shop"}
            </LoadingButton>

            {isEditing && (
              <>
                <div className="d-md-none mb-2"></div>
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4 flex-fill flex-md-grow-0"
                  onClick={handleCancel}
                  disabled={isLoading || isDeleting}
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
