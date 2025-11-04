import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import { productAPI } from "../services/api";

export default function EditProduct({ product, onBack }) {
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    currencyCode: "PKR",
    active: true,
  });

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        currencyCode: product.currencyCode || "PKR",
        active: product.active ?? true,
      });
      setImagePreview(product.cloudinarySecureUrl || product.fileUrl || "");
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // // Preview new image
    // if (selectedFile) {
    //   const reader = new FileReader();
    //   reader.onloadend = () => setImagePreview(reader.result);
    //   reader.readAsDataURL(selectedFile);
    // }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product?._id) {
      toast.error("Invalid product.", toastOptions);
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("currencyCode", formData.currencyCode);
    data.append("active", formData.active);
    if (file) data.append("file", file);

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
              <form onSubmit={handleSubmit}>
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4 text-center">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="img-fluid rounded"
                    />
                  </div>
                )}

                {/* Form Fields */}
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Product Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="price" className="form-label">
                      Price
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="currencyCode" className="form-label">
                      Currency
                    </label>
                    <select
                      className="form-select"
                      id="currencyCode"
                      name="currencyCode"
                      value={formData.currencyCode}
                      onChange={handleChange}
                    >
                      <option value="PKR">PKR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="active">
                    Active (Visible to customers)
                  </label>
                </div>

                <div className="mb-4">
                  <label htmlFor="file" className="form-label">
                    Update Product File (optional)
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="file"
                    onChange={handleFileChange}
                  />
                  <div className="form-text">
                    Leave empty to keep current file.
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={goBack}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Saving…" : "Save Changes"}
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
