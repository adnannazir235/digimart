import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import LoadingButton from "../components/LoadingButton";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token.", toastOptions);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match.", toastOptions);
      return;
    }

    setLoading(true);

    try {
      const res = await authAPI.resetPassword(formData, token);
      const successMessage =
        res.data.message ||
        "Password reset successfully. Please log in with your new password.";
      navigate(
        `/login?status=success&message=${encodeURIComponent(successMessage)}`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to reset password. Try again later.",
        toastOptions
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <section
        className="d-flex align-items-center justify-content-center py-5"
        style={{ minHeight: "82.29dvh", backgroundColor: "#f8f9fa" }}
      >
        <div className="container-fluid">
          <div className="container">
            <div className="row">
              <div className="col-12 col-md-6 col-lg-4 m-auto text-center">
                <h2 className="mb-4">Invalid Reset Link</h2>
                <p className="text-muted">
                  The reset link is invalid or expired. Please request a new
                  one.
                </p>
                <p>
                  <Link to="/forgot-password" className="btn btn-primary">
                    Request New Link
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="d-flex align-items-center justify-content-center py-5"
      style={{ minHeight: "82.29dvh", backgroundColor: "#f8f9fa" }}
    >
      <div className="container-fluid">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-6 col-lg-4 m-auto">
              <h2 className="text-center mb-4">Set New Password</h2>
              <p className="text-center text-muted mb-4">
                Enter your new password below to reset your account.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    className="form-control"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className="form-control"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="mb-3">
                  <LoadingButton
                    loading={loading}
                    type="submit"
                    className="btn btn-primary btn-sm w-100"
                  >
                    Reset Password
                  </LoadingButton>
                </div>
                <p className="text-center mt-2">
                  <Link to="/login" className="text-primary">
                    Back to Login
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
