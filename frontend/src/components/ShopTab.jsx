import { useOutletContext, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "../features/auth/authSlice.js";
import { shopAPI } from "../services/api.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toastOptions } from "../../config/styles.js";
import ShopForm from "./ShopForm.jsx";
import ModalPopup from "./ModalPopup.jsx";

export default function ShopTab() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const { shop, setShop } = useOutletContext();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!user || !shop) return <Navigate to="/buyer/create-shop" replace />;

  const shopData = {
    shopId: shop._id,
    shopName: shop.shopName || "",
    description: shop.description || "",
    logo: shop.logo || "",
  };

  const handleDeleteShop = async () => {
    setIsDeleting(true);
    try {
      await shopAPI.deleteShop(shopData.shopId);
      dispatch(fetchUser());
      setShop(null); // Clear shop from context
      toast.success("Shop deleted successfully!", toastOptions());
      navigate("/buyer/create-shop", {
        state: { successMessage: "Shop deleted successfully!" },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete shop", toastOptions());
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="mb-4">
      <ShopForm
        shopData={shopData}
        setShopData={(updated) =>
          setShop({
            _id: updated.shopId,
            shopName: updated.shopName,
            description: updated.description,
            logo: updated.logo,
          })
        }
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isDeleting={isDeleting}
      />

      <div className="row mt-4">
        <div className="col-12">
          <div className="d-grid gap-2 d-md-flex justify-content-end">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-outline-danger rounded-pill px-4"
              disabled={isDeleting || isEditing}
            >
              Delete Shop
            </button>
          </div>
        </div>
      </div>

      <ModalPopup
        isOpen={showDeleteModal}
        title="Delete Shop?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteShop}
        onCancel={() => setShowDeleteModal(false)}
        loading={isDeleting}
        countdownSeconds={5}
        isClosable={false}
      >
        <p>
          Are you sure you want to <strong>permanently delete</strong> your shop?
          <br />
          This will also delete all associated products and cannot be undone.
        </p>
      </ModalPopup>
    </div>
  );
}
