import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";

const CreateProductPopup = ({ isOpen, onCancel, onSuccess, isClosable, user }) => {
  const createProductSchema = Yup.object({
    title: Yup.string()
      .trim()
      .min(3, "Product title must be at least 3 characters")
      .max(100, "Product title too long")
      .required("Product title is required"),

    description: Yup.string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description is too long")
      .required("Product description is required"),

    price: Yup.number()
      .typeError("Price must be a number")
      .positive("Price must be greater than 0")
      .required("Price is required"),

    isActive: Yup.boolean().default(true),

    file: Yup.mixed()
      .required("Product file is required")
      .test("fileSize", "File too large (max 10MB)", (value) => {
        return !value || value.size <= 10 * 1024 * 1024;
      })
      .test("fileType", "Only images, Videos and Audios allowed", (value) => {
        if (!value) return true;
        return [
          "image/jpeg",
          "image/png",
          "image/webp",
          "video/mp4",
          "audio/mpeg",
        ].includes(value.type)
      }),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      price: "",
      isActive: true,
      file: null
    },
    validationSchema: createProductSchema,
    onSubmit,
  });

  async function onSubmit(values, { setSubmitting, resetForm }) {
    const data = new FormData();
    data.append("title", values.title);
    data.append("description", values.description);
    data.append("price", values.price);
    data.append("isActive", values.isActive);
    if (values.file) data.append("file", values.file);

    try {
      await onSuccess(data);
      resetForm();
      onCancel();
    } catch (err) {
      toast.error(
        err.response.data.error || "Failed to create product.",
        toastOptions
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (isClosable && e.target === e.currentTarget) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "#00000038" }}
      onClick={handleOverlayClick}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={formik.handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Create New Product</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onCancel}
              />
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Product Title
                </label>
                <input
                  type="text"
                  className={`form-control ${formik.touched.title && formik.errors.title ? "is-invalid" : ""}`}
                  id="title"
                  {...formik.getFieldProps("title")}
                  required
                />

                {formik.touched.title && formik.errors.title && (
                  <div className="invalid-feedback">{formik.errors.title}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  className={`form-control ${formik.touched.description && formik.errors.description ? "is-invalid" : ""}`}
                  id="description"
                  rows="3"
                  {...formik.getFieldProps("description")}
                  required
                />

                {formik.touched.description && formik.errors.description && (
                  <div className="invalid-feedback">{formik.errors.description}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="price" className="form-label">
                  Price (USD)
                </label>
                <input
                  type="number"
                  className={`form-control ${formik.touched.price && formik.errors.price ? "is-invalid" : ""}`}
                  id="price"
                  {...formik.getFieldProps("price")}
                  required
                  min="0"
                  step="0.01"
                />

                {formik.touched.price && formik.errors.price && (
                  <div className="invalid-feedback">{formik.errors.price}</div>
                )}
              </div>

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isActive"
                  checked={formik.values.isActive}
                  {...formik.getFieldProps("isActive")}
                />
                <label className="form-check-label" htmlFor="isActive">
                  Active
                </label>
              </div>

              <div className="mb-3">
                <label htmlFor="file" className="form-label">
                  Product File
                </label>
                <input
                  type="file"
                  className={`form-control ${formik.touched.file && formik.errors.file ? "is-invalid" : ""}`}
                  id="file"
                  name="file"
                  onChange={(e) => {
                    formik.setFieldValue("file", e.currentTarget.files?.[0] || null);
                  }}
                  onBlur={formik.handleBlur}
                  required
                />

                {formik.touched.file && formik.errors.file && (
                  <div className="invalid-feedback">{formik.errors.file}</div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={formik.isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Creating…" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProductPopup;
