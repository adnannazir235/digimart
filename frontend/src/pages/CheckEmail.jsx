import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingButton from "../components/LoadingButton";
import { authAPI } from "../services/api";
import { toastOptions } from "../../config/styles";
import { FiMail } from "react-icons/fi";

export default function CheckEmail() {
  const location = useLocation();
  const emailToVerify = location.state?.email || "";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if the transient toast data is present in the navigation state
    if (location.state?.toast?.successMessage) {
      const { successMessage, toastOptions: stateToastOptions } =
        location.state.toast;

      // Show the success message toast
      toast.success(successMessage, stateToastOptions || toastOptions());

      // Clear the ephemeral navigation state. This causes a re-render,
      // but the email is safe since we've already checked it.
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname, // Use the full browser path to maintain the basename
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
        toastOptions(),
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
        toastOptions(),
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to resend email. Please try again.",
        toastOptions(),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="d-flex align-items-center py-5"
      style={{ minHeight: "80dvh" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-9 col-lg-7 col-xl-6">
            <div className="card border border-1 rounded-4 overflow-hidden shadow-sm">
              <div className="card-body p-4 p-md-5 text-center">
                <div className="mb-4 position-relative d-inline-block">
                  <FiMail className="text-primary" size={88} />
                </div>

                <h2 className="fw-bold mb-3">Verify Your Email</h2>

                <p className="lead text-muted mb-4">
                  A verification link has been sent to
                  <br />
                  <strong>{emailToVerify}</strong>
                </p>

                <p className="text-muted mb-5">
                  Please check your inbox (including spam/junk folder).
                  <br />
                  The email usually arrives within a minute.
                </p>

                <hr className="w-50 mx-auto my-4 opacity-25" />

                <p className="text-muted mb-4">
                  <strong>Didn't receive the email?</strong>
                </p>

                <LoadingButton
                  onClick={handleResend}
                  loading={loading}
                  type="button"
                  className="btn btn-primary px-5"
                  disabled={loading || !emailToVerify}
                >
                  Resend Verification Email
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
