import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../features/auth/authSlice";
import { useFormik } from "formik";
import { authAPI } from "../services/api";
import * as Yup from "yup";
import LoadingButton from "../components/LoadingButton";
import GoogleLogo from "../assets/google/logo.png";

export default function LogInForm({
  googleLoading,
  handleGoogleAuth,
  resendEmailInfo,
  sendVerificationEmail,
  setResendEmailInfo,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logInValidationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .min(6, "Email must be at least 6 characters")
      .max(254, "Email must be at most 254 characters")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-zA-Z]/, "Password must contain at least one letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: logInValidationSchema,
    onSubmit,
  })

  async function onSubmit(values, { setSubmitting, resetForm }) {
    setSubmitting(true);

    try {
      const res = await authAPI.login(values);
      dispatch(login(res.data.accessToken));
      navigate(
        `/login?status=success&message=${encodeURIComponent(
          res?.data?.message || "Logged in successfully!"
        )}`);
      resetForm();
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
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="col-12 col-md-6 col-lg-5 m-auto">
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            className={`form-control ${formik.touched.email && formik.errors.email ? "is-invalid" : ""}`}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={formik.isSubmitting || googleLoading}
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="text-danger">{formik.errors.email}</div>
          ) : null}
        </div>
      </div>

      {resendEmailInfo.requiresVerification && (
        <div className="row mb-2">
          <div className="col">
            <button
              className="btn btn-link btn-sm"
              onClick={sendVerificationEmail}
              disabled={formik.isSubmitting || googleLoading}
            >
              Send Verification Email ▶
            </button>
          </div>
        </div>
      )}

      <div className="row mb-3">
        <div className="col">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            className={`form-control ${formik.touched.password && formik.errors.password ? "is-invalid" : ""}`}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={formik.isSubmitting || googleLoading}
          />
          {formik.touched.password && formik.errors.password ? (
            <div className="text-danger">{formik.errors.password}</div>
          ) : null}
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <LoadingButton
            loading={formik.isSubmitting}
            isDisabled={formik.isSubmitting || googleLoading}
            type="submit"
            className="btn btn-primary w-100"
          >
            Sign In
          </LoadingButton>
        </div>
      </div>

      <div className="row my-3">
        <p className="text-center">OR</p>
      </div>

      <div className="row mb-3">
        <div className="col">
          <LoadingButton
            loading={googleLoading}
            isDisabled={formik.isSubmitting || googleLoading}
            type="button"
            className="btn btn-light border w-100"
            onClick={handleGoogleAuth}
          >
            Continue with Google
            <img
              src={GoogleLogo}
              height="20"
              className="ms-2"
              alt="Google's Logo - PNG"
            />
          </LoadingButton>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col text-center">
          Don't have an Account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </form>
  );
}
