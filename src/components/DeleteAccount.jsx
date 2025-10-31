import { useState } from "react";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import ModalPopup from "./ModalPopup";
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

      if (response.data.success) {
        setUser(null);
        setAccessToken(null);

        toast.success(
          response.data.message || "Account deleted successfully",
          toastOptions
        );

        setTimeout(() => {
          window.location.reload();
        }, 1300);
      } else {
        toast.error(response.data.message, toastOptions);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete account",
        toastOptions
      );
    } finally {
      setLoading(false);
      setIsPopupOpen(false);
    }
  };

  const handleCancel = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => setIsPopupOpen(true)}
      >
        Delete Account
      </button>

      <ModalPopup
        title="Confirm Account Deletion"
        isOpen={isPopupOpen}
        confirmText="Yes, Delete"
        cancelText="No"
        countdownSeconds={3}
        onConfirm={handleDeleteAccount}
        onCancel={handleCancel}
        loading={loading}
        isClosable={false}
      >
        <p>
          Are you sure you want to delete your account? This action cannot be
          undone.
        </p>
      </ModalPopup>
    </>
  );
}
