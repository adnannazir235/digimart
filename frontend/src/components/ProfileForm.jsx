import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "../features/auth/authSlice.js";
import { userAPI } from "../services/api.js";
import { useFormik } from "formik";
import * as Yup from "yup";
import LoadingButton from "./LoadingButton";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles.js";
import useDebounce from "../hooks/useDebounce.js";

export default function ProfileForm() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);

  const profileValidationSchema = Yup.object({
    // We make them optional at root level, but conditionally required/validated
    name: Yup.string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters")
      .nullable()
      .optional(),

    username: Yup.string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .matches(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, _, -")
      .nullable()
      .optional(),

    age: Yup.number()
      .typeError("Age must be a number")
      .min(18, "You must be at least 18 years old")
      .max(120, "Age seems unrealistic")
      .integer("Age must be a whole number")
      .nullable()
      .optional(),

    avatar: Yup.string()
      .url("Avatar must be a valid URL (e.g. https://example.com/image.jpg)")
      .nullable()
      .optional(),

    bio: Yup.string()
      .trim()
      .max(500, "Bio must be at most 500 characters")
      .nullable()
      .optional(),
  });

  if (!user) return null;

  const formik = useFormik({
    initialValues: {
      name: user?.name || "",
      username: user?.username || "",
      age: Number(user?.age) || 0,
      avatar: user?.avatar || "",
      bio: user?.bio || "",
    },
    validationSchema: profileValidationSchema,
    onSubmit,
    enableReinitialize: true,
    validateOnChange: true, // true, by Default
    validateOnBlur: true, // true, by Default
  });

  const debouncedAvatar = useDebounce(formik.values.avatar, 500);

  async function onSubmit(values, { setSubmitting }) {
    try {
      const response = await userAPI.updateProfile(values);

      dispatch(fetchUser());
      toast.success(response.data.message || "Profile updated!", toastOptions());
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update profile",
        toastOptions()
      );
    } finally {
      setSubmitting(false);
    }
  }

  const getAvatarStatus = () => {
    const url = debouncedAvatar.trim();

    if (!url) return { text: "Enter image URL", className: "text-muted" };

    try {
      new URL(url);
      return { text: "✅ Valid image URL", className: "text-success" };
    } catch {
      return { text: "❌ Invalid URL", className: "text-danger" };
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="mb-4">
      <div className="text-center mb-4 pb-3 border-bottom">
        <img
          src={user.avatar}
          alt="Profile"
          className="rounded-circle img-fluid mx-auto d-block mb-2"
          style={{ width: "80px", height: "80px", objectFit: "cover" }}
        />
        <h5 className="mb-1">{formik.values.name || "Your Name"}</h5>
        <p className="text-muted mb-0">@{formik.values.username || "username"}</p>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label htmlFor="name" className="form-label">
            Full Name
          </label>

          <input
            type="text"
            className={`form-control ${formik.touched.name && formik.errors.name ? "is-invalid" : ""}`}
            id="name"
            {...formik.getFieldProps("name")}
            disabled={formik.isSubmitting || !isEditing}
            maxLength="50"
            placeholder="Enter your full name"
          />

          {formik.touched.name && formik.errors.name ? (
            <div className="text-danger">{formik.errors.name}</div>
          ) : null}
        </div>

        <div className="col-12 col-md-6">
          <label htmlFor="username" className="form-label">
            Username
          </label>

          <div className="input-group">
            <span className="input-group-text">@</span>
            <input
              type="text"
              className={`form-control ${formik.touched.username && formik.errors.username ? "is-invalid" : ""}`}
              id="username"
              {...formik.getFieldProps("username")}
              disabled={formik.isSubmitting || !isEditing}
              maxLength="30"
              placeholder="username"
            />
            {formik.touched.username && formik.errors.username && (
              <div className="invalid-feedback">{formik.errors.username}</div>
            )}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <label htmlFor="age" className="form-label">
            Age
          </label>

          <input
            type="number"
            className={`form-control ${formik.touched.age && formik.errors.age ? "is-invalid" : ""}`}
            id="age"
            {...formik.getFieldProps("age")}
            disabled={formik.isSubmitting || !isEditing}
            min="18"
            max="100"
            placeholder="Age"
          />

          {formik.touched.age && formik.errors.age ? (
            <div className="text-danger">{formik.errors.age}</div>
          ) : null}
        </div>

        <div className="col-12 col-md-6">
          <label htmlFor="avatar" className="form-label">
            Profile Picture URL
          </label>

          <input
            type="url"
            className={`form-control ${formik.touched.avatar && formik.errors.avatar ? "is-invalid" : ""}`}
            id="avatar"
            value={formik.values.avatar}
            onChange={(e) => {
              formik.setFieldValue("avatar", e.target.value, false); // no validate
            }}
            onBlur={() => {
              formik.validateField("avatar"); // validate once
            }}
            disabled={formik.isSubmitting || !isEditing}
            maxLength="1100"
          />

          {isEditing && (
            <div className="form-text">
              <span className={getAvatarStatus().className}>
                {getAvatarStatus().text}
              </span>
            </div>
          )}
        </div>

        <div className="col-12">
          <label htmlFor="bio" className="form-label">
            Bio
          </label>

          <textarea
            className={`form-control ${formik.touched.bio && formik.errors.bio ? "is-invalid" : ""}`}
            id="bio"
            rows="3"
            {...formik.getFieldProps("bio")}
            disabled={formik.isSubmitting || !isEditing}
            maxLength="500"
            placeholder="Tell us about yourself..."
          />

          {formik.touched.bio && formik.errors.bio ? (
            <div className="text-danger">{formik.errors.bio}</div>
          ) : null}
          <div className="form-text">{formik.values.bio.length}/500 characters</div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="d-grid gap-2 d-md-flex justify-content-md-between">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn btn-sm btn-outline-primary px-4"
              >
                Edit Profile
              </button>
            ) : (
              <LoadingButton
                type="submit"
                loading={formik.isSubmitting}
                isDisabled={formik.isSubmitting}
                className="btn btn-sm btn-primary px-4"
              >
                Update Profile
              </LoadingButton>
            )}

            {isEditing && (
              <>
                <div className="d-md-none mb-2"></div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary px-4 flex-fill flex-md-grow-0"
                  onClick={() => {
                    setIsEditing(false);
                    formik.resetForm();
                  }}
                  disabled={formik.isSubmitting}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
