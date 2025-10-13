import { useState } from "react";
import { useAuth } from "../contexts/authContext";
import { authAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import LoadingButton from "./LoadingButton";

const SetPassword = () => {
  const { user, setUser, setAccessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSetPassword = async () => {
    const { password, confirmPassword } = formData;

    // Client-side validation
    if (!password || !confirmPassword) {
      toast.error("Please fill all fields", toastOptions);
      return;
    }

    setLoading(true);

    try {
      const res = await authAPI.setPassword({
        password,
        confirmPassword,
      });

      if (res.data.success) {
        toast.success(
          "Password set successfully! Please log in again.",
          toastOptions
        );

        setFormData({
          password: "",
          confirmPassword: "",
        });

        setUser(null);
        setAccessToken(null);
        navigate("/login");
      } else {
        toast.error(res.data.message || "Error setting password", toastOptions);
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || "Error setting password";
      if (status === 401) {
        toast.error("Session expired. Please log in again.", toastOptions);
        setUser(null);
        setAccessToken(null);
        navigate("/login");
      } else {
        toast.error(message, toastOptions);
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
        handleSetPassword();
      }}
      className="col-12 col-md-6 col-lg-5 m-auto"
    >
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="password" className="form-label">
            New Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className="form-control"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="New Password"
            required
            disabled={loading}
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            className="form-control"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm New Password"
            required
            disabled={loading}
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
            Set Password
          </LoadingButton>
        </div>
      </div>
    </form>
  );
};

export default SetPassword;
