import { useState } from "react";
import { useAuth } from "../contexts/authContext";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import ModalPopup from "./ModalPopup";
import GoogleLogo from "../assets/google/logo.png";

export default function DisconnectGoogleAccount() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleDisconnectGoogle = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await authAPI.disconnectGoogle();

      if (response.data.success) {
        toast.success(response.data.message, toastOptions);

        setTimeout(() => {
          window.location.reload();
        }, 1300);
      } else {
        toast.error(response.data.message, toastOptions);
      }
    } catch (error) {
      toast(
        error.response?.data?.message || "Failed to disconnect Google account",
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
        Disconnect Google Account
        <img src={GoogleLogo} height="20" className="ms-2" alt="Google Logo" />
      </button>

      <ModalPopup
        title="Confirm Google Account Disconnection"
        isOpen={isPopupOpen}
        confirmText="Yes, Disconnect"
        cancelText="No"
        countdownSeconds={3}
        onConfirm={handleDisconnectGoogle}
        onCancel={handleCancel}
        loading={loading}
        isClosable={false}
      >
        <p>
          Are you sure you want to disconnect your Google account?{" "}
          {!user.isPassSet &&
            "This action requires a password to be set for your account. Please ensure your password is set before proceeding."}
        </p>
      </ModalPopup>
    </>
  );
}
