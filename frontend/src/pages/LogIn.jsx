import { useState } from "react";
import { authAPI } from "../services/api";
import LogInForm from "../components/LogInForm";
import { useNavigate } from "react-router-dom";
import { toastOptions } from "../../config/styles";

export default function LogIn() {
  const [googleLoading, setGoogleLoading] = useState(false); // State for Google auth loading
  const [resendEmailInfo, setResendEmailInfo] = useState({});
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const sendVerificationEmail = async (email) => {
    setResendLoading(true);

    try {
      console.log("In try");
      const res = await authAPI.resendVerificationEmail({
        email: email,
      });
      console.log("In try navigating...");
      navigate("/check-email",
        {
          state: {
            email: email,
            toast: {
              successMessage: res.data.message || "Verification email resent! Check your inbox.",
              toastOptions: toastOptions(), // optional, can be customized
            },
          }
        },
      );
    } catch (error) {
      navigate(
        `/login?status=error&message=${encodeURIComponent(
          error.response?.data?.message ||
            "Failed to resend email. Please try again.",
        )}`,
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleAuthRedirect = () => {
    setGoogleLoading(true);
    console.log("LogIn.jsx: Initiating Google auth redirect");
    authAPI.googleAuth("settings");
  };

  return (
    <section
      className="d-flex py-5"
      style={{ minHeight: "80dvh" }}
    >
      <div className="container">
        <div className="row justify-content-center align-items-center h-100">
          <div className="col">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
              Welcome Back!
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Sign in to access your account.
            </p>
            <LogInForm
              googleLoading={googleLoading}
              handleGoogleAuth={handleGoogleAuthRedirect}
              resendEmailInfo={resendEmailInfo}
              sendVerificationEmail={sendVerificationEmail}
              setResendEmailInfo={setResendEmailInfo}
              resendLoading={resendLoading}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
