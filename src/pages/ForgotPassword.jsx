import { Link } from "react-router-dom";
import { authAPI } from "../services/api";
import * as Yup from "yup";
import { useFormik } from "formik";
import LoadingButton from "../components/LoadingButton";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";

export default function ForgotPassword() {
  const resetPasswordSchema = Yup.object({
    email: Yup.string()
      .trim()
      .min(6, "Email must be at least 6 characters")
      .max(254, "Email must be at most 254 characters")
      .required("Email is required"),
  });

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: resetPasswordSchema,
    onSubmit,
  });

  async function onSubmit(values, { setSubmitting }) {
    try {
      const res = await authAPI.initiateForgotPassword(values);
      const successMessage = res.data.message || "Password reset email sent!";
      toast.success(successMessage, toastOptions);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to send password reset email. Try again later.",
        toastOptions
      );
    } finally {
      setSubmitting(false);
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
                onSubmit={formik.handleSubmit}
                className="col-12 col-md-6 col-lg-4 m-auto"
              >
                <div className="row mb-3">
                  <div className="col">
                    <input
                      type="email"
                      id="email"
                      {...formik.getFieldProps("email")}
                      className={`form-control ${formik.touched.email && formik.errors.email ? "is-invalid" : ""}`}
                      disabled={formik.isSubmitting}
                      placeholder="Enter your email"
                      required
                    />

                    {formik.touched.email && formik.errors.email && (
                      <div className="invalid-feedback">{formik.errors.email}</div>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <LoadingButton
                      loading={formik.isSubmitting}
                      isDisabled={formik.isSubmitting}
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
