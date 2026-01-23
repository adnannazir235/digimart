import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { authAPI } from "../services/api";
import { limitations } from "../../config/validation";
import { toastOptions } from "../../config/styles";
import LoadingButton from "../components/LoadingButton";
import { FcGoogle } from "react-icons/fc";

export default function SignUpForm({
  handleGoogleAuth,
  googleLoading,
}) {
  const navigate = useNavigate();

  const signUpValidationSchema = Yup.object({
    username: Yup.string()
      .trim()
      .min(5, "Username must be at least 5 characters")
      .max(30, "Username must be at most 30 characters")
      .required("Username is required"),
    email: Yup.string()
      .trim()
      .email("Invalid email address")
      .min(6, "Email must be at least 6 characters")
      .max(254, "Email must be at most 254 characters")
      .required("Email is required"),
    country: Yup.string()
      .trim()
      .oneOf(
        ["Pakistan", "United States"],
        "Selected country is not supported."
      ),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-zA-Z]/, "Password must contain at least one letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Confirm Password & Password must match")
      .required("Confirm Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      country: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: signUpValidationSchema,
    onSubmit,
  })

  async function onSubmit(values, { setSubmitting, resetForm }) {
    // Your submit logic here (adapted)
    try {
      const res = await authAPI.register(values);
      const successMessage =
        res.data.message ||
        res.data.status ||
        "Registration successful! Check your email.";

      navigate("/check-email", {
        state: {
          email: values.email,
          toast: { successMessage },
        },
      });
      resetForm(); // Optional: Reset form after success
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed",
        toastOptions
      );
    } finally {
      setSubmitting(false); // Handles loading state
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="col-12 col-md-6 col-lg-5 m-auto">
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="username" className="form-label">
            Username <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="username"
            className={`form-control ${formik.touched.username && formik.errors.username ? "is-invalid" : ""}`}
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur} // Tracks touched for error display
            disabled={formik.isSubmitting || googleLoading}
          />
          {formik.touched.username && formik.errors.username ? (
            <div className="text-danger">{formik.errors.username}</div>
          ) : null}
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <label htmlFor="email" className="form-label">
            Email <span className="text-danger">*</span>
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

      <div className="row mb-3">
        <div className="col">
          <label htmlFor="country" className="form-label">
            Country
          </label>
          <select
            id="country"
            className={`form-select ${formik.touched.country && formik.errors.country ? "is-invalid" : ""}`}
            value={formik.values.country}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={formik.isSubmitting || googleLoading}
          >
            <option defaultValue={true} disabled value="">Select your country</option>
            {limitations.user.allowedCountries.map((country) => (
              <option key={country.countryCode} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          {formik.touched.country && formik.errors.country ? (
            <div className="text-danger">{formik.errors.country}</div>
          ) : null}
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <label htmlFor="password" className="form-label">
            Password <span className="text-danger">*</span>
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
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password <span className="text-danger">*</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "is-invalid" : ""}`}
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={formik.isSubmitting || googleLoading}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
            <div className="text-danger">{formik.errors.confirmPassword}</div>
          ) : null}
        </div>
      </div>

      <div className="row">
        <div className="col">
          <LoadingButton
            loading={formik.isSubmitting}
            isDisabled={formik.isSubmitting || googleLoading}
            type="submit"
            className="btn btn-primary w-100"
          >
            Sign Up
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
            <FcGoogle size={25} className="ms-2" />
          </LoadingButton>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col text-center">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </form>
  );
}
