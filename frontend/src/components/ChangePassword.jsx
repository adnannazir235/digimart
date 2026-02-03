import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import { limitations } from "../../config/validation";
import { authAPI } from "../services/api";
import { logout } from "../features/auth/authSlice";
import LoadingButton from "../components/LoadingButton";

const ChangePassword = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changePasswordSchema = Yup.object({
    oldPassword: Yup.string()
      .required("Current password is required"),

    newPassword: Yup.string()
      .min(limitations.user.minPassLength, `New password must be at least ${limitations.user.minPassLength} characters`)
      .max(limitations.user.maxPassLength, "Password too long")
      .matches(/[a-z]/, "Must contain a lowercase letter")
      .matches(/[A-Z]/, "Must contain an uppercase letter")
      .matches(/[0-9]/, "Must contain a number")
      .matches(/[^a-zA-Z0-9]/, "Must contain a special character (!@#$%^&*)")
      .required("New password is required"),

    confirmNewPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "New Passwords do not match")
      .required("Confirm password is required"),
  });

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema: changePasswordSchema,
    onSubmit: handleChangePassword
  });

  async function handleChangePassword(values, { setSubmitting, resetForm }) {
    try {
      const res = await authAPI.changePassword(values);

      if (res.data.success) {
        toast.success("Password changed successfully!", toastOptions());

        resetForm();
        dispatch(logout());
        navigate("/login");
      } else {
        toast.error(
          res.data.message || "Error changing password",
          toastOptions()
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Error changing password";

      toast.error(message, toastOptions());

      if (error.response?.status === 401) {
        navigate("/login"); // Fallback only for auth failure
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
          <label htmlFor="oldPassword" className="form-label">
            Current Password
          </label>
          <input
            type="password"
            id="oldPassword"
            {...formik.getFieldProps("oldPassword")}
            className={`form-control ${formik.touched.oldPassword && formik.errors.oldPassword ? "is-invalid" : ""}`}
            placeholder="Current Password"
          />

          {formik.touched.oldPassword && formik.errors.oldPassword && (
            <div className="invalid-feedback">{formik.errors.oldPassword}</div>
          )}
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <label htmlFor="newPassword" className="form-label">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            {...formik.getFieldProps("newPassword")}
            className={`form-control ${formik.touched.newPassword && formik.errors.newPassword ? "is-invalid" : ""}`}
            placeholder="New Password"
          />

          {formik.touched.newPassword && formik.errors.newPassword && (
            <div className="invalid-feedback">{formik.errors.newPassword}</div>
          )}
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <label htmlFor="confirmNewPassword" className="form-label">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmNewPassword"
            {...formik.getFieldProps("confirmNewPassword")}
            className={`form-control ${formik.touched.confirmNewPassword && formik.errors.confirmNewPassword ? "is-invalid" : ""}`}
            placeholder="Confirm New Password"
          />

          {formik.touched.confirmNewPassword && formik.errors.confirmNewPassword && (
            <div className="invalid-feedback">{formik.errors.confirmNewPassword}</div>
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
            Change Password
          </LoadingButton>
        </div>
      </div>
    </form>
  );
};

export default ChangePassword;
