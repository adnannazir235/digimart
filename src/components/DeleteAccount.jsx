import { useState } from "react";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import ConfirmPopup from "./ConfirmPopup";
import { authAPI } from "../services/api";
import { useAuth } from "../contexts/authContext";

export default function DeleteAccount() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setAccessToken } = useAuth();

  const handleDeleteAccount = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await authAPI.deleteAccount();
      console.log(response.data);

      setUser(null);
      setAccessToken(null);

      toast.success(
        response.data.message || "Account deleted successfully",
        toastOptions
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete account",
        toastOptions
      );
    } finally {
      setLoading(false);
      setIsPopupOpen(false); // Close popup after response, whether success or error
    }
  };

  const handleCancel = () => {
    setIsPopupOpen(false); // Close popup on cancel
  };

  return (
    <>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => setIsPopupOpen(true)}
      >
        Delete Account
      </button>

      <ConfirmPopup
        title="Confirm Account Deletion"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="No"
        countdownSeconds={3}
        isOpen={isPopupOpen}
        onConfirm={handleDeleteAccount}
        onCancel={handleCancel}
        loading={loading}
      />
    </>
  );
}
