import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles.js";
import { limitations } from "../../config/validation";
import { shopAPI } from "../services/api.js";
import { fetchUser } from "../features/auth/authSlice.js";
import LoadingButton from "../components/LoadingButton.jsx";

export default function CreateShop() {
  const dispatch = useDispatch();

  const createShopSchema = Yup.object({
    shopName: Yup.string()
      .trim()
      .min(limitations.shop.minShopNameLength, `Shop name must be at least ${limitations.user.minPassLength} characters`)
      .max(limitations.shop.maxShopNameLength, `Shop name cannot exceed ${limitations.shop.maxShopNameLength} characters`)
      .required("Shop name is required"),

    description: Yup.string()
      .trim()
      .max(limitations.shop.maxShopDescriptionLength, `Description cannot exceed ${limitations.shop.maxShopDescriptionLength} characters`)
      .optional(),

    logo: Yup.string()
      .trim()
      .max(limitations.shop.maxShopLogoLength, "URL too long")
      .url("Must be a valid URL (e.g. https://example.com/image.jpg)")
      .optional(),
  });

  const formik = useFormik({
    initialValues: {
      shopName: "",
      description: "",
      logo: "",
    },
    validationSchema: createShopSchema,
    onSubmit,
  });

  async function onSubmit(values, { setSubmitting, resetForm }) {
    try {
      const response = await shopAPI.createShop(values);

      resetForm();
      toast.success(
        response.data.message || "Shop created successfully!",
        toastOptions()
      );

      // Fetch updated user profile to ensure role is updated
      dispatch(fetchUser());
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create shop";
      toast.error(message, toastOptions());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "81dvh" }}>
      <div className="container">
        <div className="row justify-content-center align-items-center h-100">
          <div className="col-12 col-md-10 col-lg-8 col-xl-6">
            <form onSubmit={formik.handleSubmit} className="mb-4">
              <div className="text-center mb-4 pb-3 border-bottom">
                <h5 className="mb-1">Create a New Shop</h5>
                <p className="text-muted mb-0">
                  Fill in the details to set up your shop.
                </p>
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="shopName" className="form-label">
                    Shop Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formik.touched.shopName && formik.errors.shopName ? "is-invalid" : ""}`}
                    id="shopName"
                    {...formik.getFieldProps("shopName")}
                    maxLength="50"
                    placeholder="Enter shop name"
                    required
                  />

                  {formik.touched.shopName && formik.errors.shopName && (
                    <div className="invalid-feedback">{formik.errors.shopName}</div>
                  )}
                </div>

                <div className="col-12">
                  <label htmlFor="description" className="form-label">
                    Description (Optional)
                  </label>
                  <textarea
                    className={`form-control ${formik.touched.description && formik.errors.description ? "is-invalid" : ""}`}
                    id="description"
                    rows="4"
                    {...formik.getFieldProps("description")}
                    placeholder="Describe your shop..."
                  />
                  <div className="form-text">
                    {formik.values.description.length}/500 characters
                  </div>

                  {formik.touched.description && formik.errors.description && (
                    <div className="invalid-feedback">{formik.errors.description}</div>
                  )}
                </div>

                <div className="col-12">
                  <label htmlFor="logo" className="form-label">
                    Shop Logo URL (Optional)
                  </label>
                  <input
                    type="url"
                    className={`form-control ${formik.touched.logo && formik.errors.logo ? "is-invalid" : ""}`}
                    id="logo"
                    {...formik.getFieldProps("logo")}
                    maxLength="1100"
                    placeholder="https://example.com/logo.jpg"
                  />

                  {formik.touched.logo && formik.errors.logo && (
                    <div className="invalid-feedback">{formik.errors.logo}</div>
                  )}
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-12">
                  <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                    <LoadingButton
                      type="submit"
                      className="btn btn-primary rounded-pill px-4 flex-fill flex-md-grow-0"
                      loading={formik.isSubmitting}
                      isDisabled={formik.isSubmitting}
                    >
                      Create Shop
                    </LoadingButton>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
