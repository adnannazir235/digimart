import { useOutletContext, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";
import { shopAPI, userAPI } from "../services/api.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LoadingButton from "./LoadingButton";
import { toastOptions } from "../../config/styles.js";
import ShopForm from "./ShopForm.jsx";

export default function ShopTab() {
  const { user, setUser } = useAuth();
  const { shop, setShop } = useOutletContext(); // Only shop & setShop
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user || !shop) {
    return <Navigate to="/buyer/create-shop" replace />;
  }

  const shopData = {
    shopId: shop._id,
    shopName: shop.shopName || "",
    description: shop.description || "",
    logo: shop.logo || "",
  };

  const handleDeleteShop = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your shop? This will also delete all associated products."
      )
    )
      return;

    setIsDeleting(true);
    try {
      await shopAPI.deleteShop(shopData.shopId);
      const profileResponse = await userAPI.getProfile();
      setUser(profileResponse.data.data.user);
      setShop(null); // Clear shop from context
      toast.success("Shop deleted successfully!", toastOptions);
      navigate("/buyer/create-shop", {
        state: { successMessage: "Shop deleted successfully!" },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete shop",
        toastOptions
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mb-4">
      <ShopForm
        shopData={shopData}
        setShopData={(updated) => {
          setShop({
            _id: updated.shopId,
            shopName: updated.shopName,
            description: updated.description,
            logo: updated.logo,
          });
        }}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isDeleting={isDeleting}
      />
      <div className="row mt-2">
        <div className="col-12">
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <LoadingButton
              type="button"
              className="btn btn-outline-danger rounded-pill px-4 flex-fill flex-md-grow-0"
              loading={isDeleting}
              onClick={handleDeleteShop}
              disabled={isEditing}
            >
              Delete Shop
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}
