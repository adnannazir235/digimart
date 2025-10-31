import { useState } from "react";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";

const CreateProductForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    currencyCode: "PKR",
    active: false,
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("currencyCode", formData.currencyCode);
    data.append("active", formData.active);
    if (file) {
      data.append("file", file);
    }

    try {
      await onSubmit(data);
      // Reset form on successful submit
      setFormData({
        title: "",
        description: "",
        price: "",
        currencyCode: "PKR",
        active: false,
      });
      setFile(null);
    } catch (err) {
      toast.error("Failed to create product.", toastOptions);
    }
  };

  // Function to reset form (passed to ModalPopup)
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      currencyCode: "PKR",
      active: false,
    });
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit}>
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
          value={formData.description}
          onChange={handleChange}
          required
        ></textarea>
      </div>
      <div className="mb-3">
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
      <div className="mb-3">
        <label htmlFor="currencyCode" className="form-label">
          Currency Code
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
          <option value="EUR">EUR</option>
          {/* Add more currencies as needed */}
        </select>
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
          Active
        </label>
      </div>
      <div className="mb-3">
        <label htmlFor="file" className="form-label">
          Product File
        </label>
        <input
          type="file"
          className="form-control"
          id="file"
          name="file"
          onChange={handleFileChange}
          required
        />
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Create Product
        </button>
      </div>
    </form>
  );
};

export default CreateProductForm;
