import { shopAPI } from "../services/api.js";
import * as Yup from "yup";
import { useFormik } from "formik";
import LoadingButton from "./LoadingButton";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles.js";

export default function ShopForm({
  shopData,
  setShopData,
  isEditing,
  setIsEditing,
  isDeleting,
}) {
  const updateShopSchema = Yup.object({
    shopName: Yup.string()
      .trim()
      .min(3, "Shop name must be at least 3 characters")
      .max(50, "Shop name too long")
      .matches(
        /^[a-zA-Z0-9\s_-]+$/,
        "Only letters, numbers, spaces, _, and - allowed"
      )
      .test("required-if-others", "Shop name is required", function (value) {
        const { description, logo } = this.parent;
        return !(description?.trim() || logo?.trim()) || !!value?.trim();
      })
      .optional(),

    description: Yup.string()
      .trim()
      .max(500, "Description too long")
      .optional(),

    logo: Yup.string()
      .trim()
      .url("Invalid URL")
      .max(1100, "URL too long")
      .optional(),
  });

  async function onSubmit(values, { setSubmitting }) {
    const dataToSend = {};

    // Only send if different AND not empty
    if (values.shopName.trim() !== "" && values.shopName !== shopData.shopName) {
      dataToSend.shopName = values.shopName.trim();
    }
    // For description/logo: if user cleared it → send null to "unset"
    if (values.description !== shopData.description) {
      dataToSend.description = values.description.trim() || null;
    }
    if (values.logo !== shopData.logo) {
      dataToSend.logo = values.logo.trim() || null;
    }

    // If no real changes, block submit
    if (Object.keys(dataToSend).length === 0) {
      toast.info("No changes detected.", toastOptions());
      setIsEditing(false);
      return;
    }

    try {
      const response = await shopAPI.updateShop(dataToSend);
      const updatedShop = response.data.data.shop;

      setShopData({
        shopId: updatedShop._id,
        shopName: updatedShop.shopName || "",
        description: updatedShop.description || "",
        logo: updatedShop.logo || "",
      });

      toast.success(response.data.message || "Shop updated!", toastOptions());
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update shop",
        toastOptions
      );
    } finally {
      setSubmitting(false);
    }
  }

  const formik = useFormik({
    initialValues: {
      shopName: shopData.shopName || "",
      description: shopData.description || "",
      logo: shopData.logo || "",
    },
    validationSchema: updateShopSchema,
    enableReinitialize: true,
    onSubmit,
  });

  const handleCancel = () => {
    formik.resetForm();
    setIsEditing(false);
  };

  return (
    <form onSubmit={formik.handleSubmit} className="mb-4">
      <div className="text-center mb-4 pb-3 border-bottom">
        {formik.values.logo && formik.values.logo !== "" && (
          <img
            src={formik.values.logo}
            alt="Shop Logo"
            className="rounded-circle img-fluid mx-auto d-block mb-2"
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
            onError={(e) => (e.target.src = "https://via.placeholder.com/80")}
          />
        )}
        <h5 className="mb-1">{formik.values.shopName || "Your Shop Name"}</h5>
      </div>

      <div className="row g-3">
        <div className="col-12">
          <label className="form-label">Shop Name <span className="text-danger">*</span></label>
          <input
            type="text"
            {...formik.getFieldProps("shopName")}
            className={`form-control ${formik.touched.shopName && formik.errors.shopName ? "is-invalid" : ""}`}
            disabled={!isEditing || formik.isSubmitting}
            maxLength="50"
            placeholder="Enter your shop name"
            required
          />

          {formik.touched.shopName && formik.errors.shopName && (
            <div className="invalid-feedback">{formik.errors.shopName}</div>
          )}
        </div>

        <div className="col-12">
          <label className="form-label">Description</label>
          <textarea
            rows="4"
            {...formik.getFieldProps("description")}
            className={`form-control ${formik.touched.description && formik.errors.description ? "is-invalid" : ""}`}
            disabled={!isEditing || formik.isSubmitting}
            maxLength="500"
            placeholder="Describe your shop..."
          />

          <div className="form-text text-end">{formik.values.description.length}/500</div>
          {formik.touched.description && formik.errors.description && (
            <div className="invalid-feedback">{formik.errors.description}</div>
          )}
        </div>

        <div className="col-12">
          <label className="form-label">Shop Logo URL</label>
          <input
            type="url"
            {...formik.getFieldProps("logo")}
            className={`form-control ${formik.touched.logo && formik.errors.logo ? "is-invalid" : ""}`}
            disabled={!isEditing || formik.isSubmitting}
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
          <div className="d-grid gap-2 d-md-flex justify-content-md-between">
            <LoadingButton
              type="button" // Critical: always button
              onClick={() => {
                if (isEditing) {
                  formik.handleSubmit(); // This triggers submit only when intended
                } else {
                  setIsEditing(true);
                }
              }}
              loading={formik.isSubmitting}
              isDisabled={formik.isSubmitting || isDeleting}
              className="btn btn-primary rounded-pill px-4"
            >
              {isEditing ? "Update Shop" : "Edit Shop"}
            </LoadingButton>

            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-outline-secondary rounded-pill px-4"
                disabled={formik.isSubmitting || isDeleting}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
