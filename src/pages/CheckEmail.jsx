import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingButton from "../components/LoadingButton";
import { authAPI } from "../services/api";
import { toastOptions } from "../../config/styles";

export default function CheckEmail() {
  const location = useLocation();
  const emailToVerify = location.state?.email || ""; // No need for useState since it's static
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if the transient toast data is present in the navigation state
    if (location.state?.toast?.successMessage) {
      const { successMessage, toastOptions: stateToastOptions } =
        location.state.toast;

      // Show the success message toast
      toast.success(successMessage, stateToastOptions || toastOptions);

      // Clear the ephemeral navigation state. This causes a re-render,
      // but the email is safe since we've already checked it.
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname // Use the full browser path to maintain the basename
      );
    }
    // Dependency array is minimal here, as we are only reacting to the initial state being present
  }, [location.pathname, location.state?.toast]);

  // Synchronous check before rendering content
  if (
    !emailToVerify ||
    typeof emailToVerify !== "string" ||
    emailToVerify.trim() === ""
  ) {
    return <Navigate to="/signup" replace />;
  }

  const handleResend = async () => {
    if (!emailToVerify) {
      toast.error(
        "Error: Cannot resend email. The original email address is missing.",
        toastOptions
      );
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resendVerificationEmail({
        email: emailToVerify,
      });
      toast.success(
        res.data?.message ||
          `Verification email successfully resent to ${emailToVerify}.`,
        toastOptions
      );
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

  return (
    <section className="container-fluid py-5 h-100">
      <div className="container h-100">
        <div className="row justify-content-center h-100">
          <div className="col-12 col-md-8 col-lg-6 text-center">
            <h2>✅ Please Verify Your Account</h2>
            <p className="lead mt-3">
              We’ve sent a verification link to your email (
              <strong>{emailToVerify}</strong>
              ).
              <br />
              <strong>Check your inbox (and spam folder)</strong> and click the
              link to activate your account.
            </p>
            <div className="mt-4 p-3 bg-light rounded">
              <p>
                <strong>Didn’t get the email?</strong>
              </p>
              <LoadingButton
                onClick={handleResend}
                loading={loading}
                type="button"
                className="btn btn-primary"
                disabled={loading || !emailToVerify}
              >
                Resend Verification Email
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
