import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import LogInForm from "../components/LogInForm";
import { useAuth } from "../contexts/authContext";

export default function LogIn() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // State for Google auth loading
  const [resendEmailInfo, setResendEmailInfo] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const sendVerificationEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authAPI.resendVerificationEmail({
        email: formData.email,
      });
      navigate(
        `/check-email?status=success&message=${encodeURIComponent(
          res.data.message || "Verification email resent! Check your inbox."
        )}`,
        { state: { email: formData.email } }
      );
    } catch (error) {
      navigate(
        `/login?status=error&message=${encodeURIComponent(
          error.response?.data?.message ||
            "Failed to resend email. Please try again."
        )}`
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
      login(res.data.accessToken);
      navigate("/?status=success&message=Logged%20in%20successfully!");
    } catch (error) {
      if (error.response?.data?.requiresVerification) {
        setResendEmailInfo((prevObj) => ({
          ...prevObj,
          requiresVerification: true,
        }));
      }
      navigate(
        `/login?status=error&message=${encodeURIComponent(
          error.response?.data?.message || "Login failed. Try again later."
        )}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuthRedirect = () => {
    setGoogleLoading(true);
    console.log("LogIn.jsx: Initiating Google auth redirect");
    authAPI.googleAuth("settings");
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
              googleLoading={googleLoading}
              handleGoogleAuth={handleGoogleAuthRedirect}
              resendEmailInfo={resendEmailInfo}
              sendVerificationEmail={sendVerificationEmail}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
