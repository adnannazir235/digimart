import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authAPI } from "../services/api";
import LogInForm from "../components/LogInForm";
import { useAuth } from "../contexts/authContext";
import { toastOptions } from "../../config/styles";

export default function LogIn() {
  const [loading, setLoading] = useState(false);
  const [resendEmailInfo, setResendEmailInfo] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const sendVerificationEmail = async (e) => {
    e.preventDefault();

    try {
      const res = await authAPI.resendVerificationEmail({
        email: formData.email,
      });
      const successMessage =
        res.data.message ||
        res.data.status ||
        "Verification email resent! Check your inbox.";

      console.log("Navigating to /check-email");

      navigate("/check-email", {
        state: {
          email: formData.email,
          toast: { successMessage },
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to resend email. Please try again.",
        toastOptions
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authAPI.login(formData);

      // Update the global state via the context
      login(res.data.accessToken);

      const successMessage = res.data.message || "Login successful!";
      navigate(
        `/?status=success&message=${encodeURIComponent(successMessage)}`
      );
    } catch (error) {
      console.error(error);

      if (error.response?.data?.requiresVerification) {
        setResendEmailInfo((prevObj) => {
          return { ...prevObj, requiresVerification: true };
        });
      }

      toast.error(
        error.response?.data?.message || "Login failed. Try again later.",
        toastOptions
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container-fluid py-5">
      <div className="container">
        <div
          className="row justify-content-center"
          style={{ minHeight: "69dvh" }}
        >
          <div className="col">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
              Welcome Back!
            </h1>

            <p className="text-gray-500 text-center mb-8">
              Sign in to access your account.
            </p>

            <LogInForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              loading={loading}
              resendEmailInfo={resendEmailInfo}
              sendVerificationEmail={sendVerificationEmail}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
