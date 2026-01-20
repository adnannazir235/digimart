import * as Yup from "yup";
import { useFormik } from "formik";
import { productAPI } from "../services/api";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";

export default function EditProduct({ product, onBack }) {
  const editProductSchema = Yup.object({
    title: Yup.string()
      .trim()
      .min(3, "Product title must be at least 3 characters")
      .max(100, "Product title too long")
      .required("Product title is required"),

    description: Yup.string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description too long")
      .required("Description is required"),

    price: Yup.number()
      .typeError("Price must be a number")
      .positive("Price must be greater than 0")
      .required("Price is required"),

    isActive: Yup.boolean().default(true),

    // Optional file — only validate if user uploads a new one
    file: Yup.mixed()
      .nullable()
      .notRequired()
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
      title: product?.title || "",
      description: product?.description || "",
      price: product?.price?.toString() || "",
      isActive: product?.isActive ?? true,
      file: null,
    },
    validationSchema: editProductSchema,
    onSubmit,
  });

  async function onSubmit(values, { setSubmitting }) {
    if (!product?._id) {
      toast.error("Invalid product.", toastOptions);
      return;
    }

    const data = new FormData();
    data.append("title", values.title);
    data.append("description", values.description);
    data.append("price", values.price);
    data.append("isActive", values.isActive);
    if (values.file) data.append("file", values.file);

    try {
      await productAPI.update(product._id, data);
      toast.success("Product updated successfully!", toastOptions);
      window.location.reload();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to update product.",
        toastOptions
      );
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => onBack?.();

  if (!product) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">Product not found.</div>
        <button className="btn btn-primary" onClick={goBack}>
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col">
          <div className="card border-0">
            <div className="card-body">
              <form onSubmit={formik.handleSubmit}>
                {(product.cloudinarySecureUrl || product.fileUrl) && (
                  <div className="mb-4 text-center">
                    <img
                      src={product.cloudinarySecureUrl || product.fileUrl}
                      alt="Product preview"
                      className="img-fluid rounded"
                      style={{ maxHeight: "300px", objectFit: "contain" }}
                    />
                  </div>
                )}

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
                    className={`form-control rounded-0 ${formik.touched.description && formik.errors.description ? "is-invalid" : ""}`}
                    id="description"
                    rows="4"
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
                    min="0"
                    step="0.01"
                    required
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

                <div className="mb-4">
                  <label htmlFor="file" className="form-label">
                    Update Product File (optional)
                  </label>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    className={`form-control ${formik.touched.file && formik.errors.file ? "is-invalid" : ""}`}
                    onChange={(e) => {
                      formik.setFieldValue("file", e.currentTarget.files?.[0] || null);
                    }}
                    onBlur={formik.handleBlur}
                  />
                  <div className="form-text">
                    Leave empty to keep current file.
                  </div>

                  {formik.touched.file && formik.errors.file && (
                    <div className="invalid-feedback">{formik.errors.file}</div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={goBack}
                    disabled={formik.isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
