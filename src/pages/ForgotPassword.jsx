import { useState } from "react";
import { Link } from "react-router-dom";
import LoadingButton from "../components/LoadingButton";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.initiateForgotPassword(formData);
      const successMessage = res.data.message || "Password reset email sent!";
      toast.success(successMessage, toastOptions);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to send password reset email. Try again later.",
        toastOptions
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="d-flex align-items-center justify-content-center py-5"
      style={{ minHeight: "82.29dvh" }}
    >
      <div className="container-fluid">
        <div className="container">
          <div className="row">
            <div className="col">
              <h2 className="text-center mb-4">Reset Your Password</h2>
              <p className="text-center text-muted mb-4">
                Enter your email address to receive a password reset link.
                <br /> We'll send instructions to regain access to your account.
              </p>
              <form
                onSubmit={handleSubmit}
                className="col-12 col-md-6 col-lg-4 m-auto"
              >
                <div className="row mb-3">
                  <div className="col">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col">
                    <LoadingButton
                      loading={loading}
                      type="submit"
                      className="btn btn-primary btn-sm w-100"
                    >
                      Send Reset Password Email
                    </LoadingButton>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col text-center">
                    <Link to="/login" className="text-primary">
                      Back to Login
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
