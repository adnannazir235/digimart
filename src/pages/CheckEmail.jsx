import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingButton from "../components/LoadingButton";
import { authAPI } from "../services/api";

export default function CheckEmail() {
  const location = useLocation();

  // 🔑 THE KEY FIX: Use useState to capture the email on initial mount ONLY.
  // This satisfies BOTH requirements:
  // 1. If an email is present, it is locked into local state, surviving the cleanup re-render (Goal A).
  // 2. If the page is fully reloaded (location.state is null), emailToVerify is initialized to "" (falsy),
  //    which triggers the defensive redirect (Goal B).
  const [emailToVerify] = useState(location.state?.email || "");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Standard toast options
  const toastOptions = {
    position: "bottom-right",
    autoClose: 15000,
    pauseOnHover: true,
    draggable: true,
    // theme: "dark",
  };

  // 1. Defensive Redirect Hook (Only runs if the email is initially missing on mount/reload)
  useEffect(() => {
    // If emailToVerify is an empty string (meaning it was never successfully passed from signup)
    if (
      !emailToVerify ||
      typeof emailToVerify !== "string" ||
      emailToVerify.trim() === ""
    ) {
      console.log(
        "DEFENSE: Navigating to /signup because emailToVerify is missing on mount/reload."
      );
      // navigate() automatically prepends the basename
      navigate("/signup", { replace: true });
      return;
    }
    // Dependency array ensures this triggers immediately if the initial state is missing
  }, [emailToVerify, navigate]);

  // 2. Toast & State Cleanup Hook (Only runs when navigation state is present)
  useEffect(() => {
    // Check if the transient toast data is present in the navigation state
    if (location.state?.toast?.successMessage) {
      const { successMessage, toastOptions: stateToastOptions } =
        location.state.toast;

      // Show the success message toast
      toast.success(successMessage, stateToastOptions || toastOptions);

      // Clear the ephemeral navigation state. This causes a re-render,
      // but the email is safe in the component's internal useState.
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname // Use the full browser path to maintain the basename
      );
    }
    // Dependency array is minimal here, as we are only reacting to the initial state being present
  }, [location.pathname]);

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
        {emailToVerify ? (
          <div className="row justify-content-center h-100">
            <div className="col-12 col-md-8 col-lg-6 text-center">
              <h2>✅ Please Verify Your Account</h2>
              <p className="lead mt-3">
                We’ve sent a verification link to your email (
                {emailToVerify ? (
                  <strong>{emailToVerify}</strong>
                ) : (
                  <span>N/A</span>
                )}
                ).
                <br />
                <strong>Check your inbox (and spam folder)</strong> and click
                the link to activate your account.
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
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
