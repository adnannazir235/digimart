import { Link, useNavigate, useSearchParams } from "react-router-dom";
import LoadingButton from "../components/LoadingButton";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import * as Yup from "yup";
import { useFormik } from "formik";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const resetPasswordSchema = Yup.object({
    newPassword: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-zA-Z]/, "Password must contain at least one letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .required("New password is required"),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords do not match")
      .required("Please confirm your password"),
  });

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordSchema,
    onSubmit,
  });

  async function onSubmit(values, { setSubmitting }) {
    if (!token) {
      toast.error("Invalid or missing reset token.", toastOptions());
      return;
    }

    try {
      const res = await authAPI.resetPassword(values, token);
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
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <section
        className="d-flex align-items-center justify-content-center py-5"
        style={{ minHeight: "82.29dvh" }}
      >
        <div className="container-fluid">
          <div className="container">
            <div className="row">
              <div className="col-12 col-md-6 col-lg-4 m-auto text-center">
                <h2>Invalid Reset Link</h2>
                <p className="text-muted my-4">
                  The reset link is invalid or expired. Please request a new
                  one.
                </p>
                
                <Link to="/forgot-password" className="btn btn-primary">
                    Request New Link
                </Link>
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
      style={{ minHeight: "82.29dvh" }}
    >
      <div className="container-fluid">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-6 col-lg-4 m-auto">
              <h2 className="text-center mb-4">Set New Password</h2>

              <p className="text-center text-muted mb-4">
                Enter your new password below to reset your account.
              </p>

              <form onSubmit={formik.handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    {...formik.getFieldProps("newPassword")}
                    className={`form-control ${formik.touched.newPassword && formik.errors.newPassword ? "is-invalid" : ""}`}
                    disabled={formik.isSubmitting}
                    placeholder="Enter new password"
                    required
                  />

                  {formik.touched.newPassword && formik.errors.newPassword && (
                    <div className="invalid-feedback">{formik.errors.newPassword}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    {...formik.getFieldProps("confirmPassword")}
                    className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "is-invalid" : ""}`}
                    disabled={formik.isSubmitting}
                    placeholder="Confirm new password"
                    required
                  />

                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <div className="invalid-feedback">{formik.errors.confirmPassword}</div>
                  )}
                </div>

                <div className="mb-3">
                  <LoadingButton
                    loading={formik.isSubmitting}
                    isDisabled={formik.isSubmitting}
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
