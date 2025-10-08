import { useState } from "react";
import { useAuth } from "../contexts/authContext";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import { useNavigate } from "react-router-dom";
import LoadingButton from "../components/LoadingButton";

const ChangePassword = () => {
  const { user, setUser, setAccessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    const { oldPassword, newPassword, confirmNewPassword } = formData;

    // Client-side validation
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill all fields", toastOptions);
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters", toastOptions);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match", toastOptions);
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.changePassword({
        oldPassword,
        newPassword,
        confirmNewPassword,
      });

      if (res.data.success) {
        toast.success("Password changed successfully!", toastOptions);
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setUser(null);
        setAccessToken(null);
        navigate("/login");
      } else {
        toast.error(
          res.data.message || "Error changing password",
          toastOptions
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Error changing password";

      toast.error(message, toastOptions);

      if (error.response?.status === 401) {
        navigate("/login"); // Fallback only for auth failure
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleChangePassword();
      }}
      className="col-12 col-md-6 col-lg-5 m-auto"
    >
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="oldPassword" className="form-label">
            Current Password
          </label>
          <input
            type="password"
            name="oldPassword"
            id="oldPassword"
            className="form-control"
            value={formData.oldPassword}
            onChange={handleInputChange}
            placeholder="Old Password"
            required
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="newPassword" className="form-label">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            id="newPassword"
            className="form-control"
            value={formData.newPassword}
            onChange={handleInputChange}
            placeholder="New Password"
            required
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="confirmNewPassword" className="form-label">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmNewPassword"
            id="confirmNewPassword"
            className="form-control"
            value={formData.confirmNewPassword}
            onChange={handleInputChange}
            placeholder="Confirm New Password"
            required
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          <LoadingButton
            loading={loading}
            type="submit"
            className="btn btn-primary w-100"
          >
            Change Password
          </LoadingButton>
        </div>
      </div>
    </form>
  );
};

export default ChangePassword;
