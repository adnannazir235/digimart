import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import { limitations } from "../../config/validation";
import { authAPI } from "../services/api";
import { logout } from "../features/auth/authSlice";
import LoadingButton from "./LoadingButton";

const SetPassword = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setPasswordSchema = Yup.object({
    password: Yup.string()
      .min(limitations.user.minPassLength, `Password must be at least ${limitations.user.minPassLength} characters`)
      .max(limitations.user.maxPassLength, "Password too long")
      .matches(/[a-z]/, "Must contain a lowercase letter")
      .matches(/[A-Z]/, "Must contain an uppercase letter")
      .matches(/[0-9]/, "Must contain a number")
      .matches(/[^a-zA-Z0-9]/, "Must contain a special character (!@#$%^&* etc.)")
      .required("Password is required"),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords do not match")
      .required("Please confirm your password"),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: setPasswordSchema,
    onSubmit: handleSetPassword
  });

  async function handleSetPassword(vlaues, { setSubmitting, resetForm }) {
    try {
      const res = await authAPI.setPassword(vlaues);

      if (res.data.success) {
        toast.success(
          "Password set successfully! Please log in again.",
          toastOptions()
        );

        resetForm();
        dispatch(logout());
        navigate("/login");
      } else {
        toast.error(res.data.message || "Error setting password", toastOptions());
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || "Error setting password";
      if (status === 401) {
        toast.error("Session expired. Please log in again.", toastOptions());
        dispatch(logout());
        navigate("/login");
      } else {
        toast.error(message, toastOptions());
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="col-12 col-md-6 col-lg-5 m-auto"
    >
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="password" className="form-label">
            New Password
          </label>
          <input
            type="password"
            id="password"
            className={`form-control ${formik.touched.password && formik.errors.password ? "is-invalid" : ""}`}
            {...formik.getFieldProps("password")}
            placeholder="New Password"
            required
            disabled={formik.isSubmitting}
          />

          {formik.touched.password && formik.errors.password && (
            <div className="invalid-feedback">{formik.errors.password}</div>
          )}
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "is-invalid" : ""}`}
            {...formik.getFieldProps("confirmPassword")}
            placeholder="Confirm New Password"
            required
            disabled={formik.isSubmitting}
          />

          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <div className="invalid-feedback">{formik.errors.confirmPassword}</div>
          )}
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <LoadingButton
            loading={formik.isSubmitting}
            isDisabled={formik.isSubmitting}
            type="submit"
            className="btn btn-primary w-100"
          >
            Set Password
          </LoadingButton>
        </div>
      </div>
    </form>
  );
};

export default SetPassword;
