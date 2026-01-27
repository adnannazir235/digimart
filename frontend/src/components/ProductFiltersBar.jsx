import { useState } from "react";
import { FaFilter } from "react-icons/fa";
import { TiCancel } from "react-icons/ti";

export default function ProductFiltersBar({ filters, setFilters }) {
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    "All",
    "Templates",
    "Dashboards",
    "Icons",
    "UI Kits",
    "Code",
  ];

  const toggleFilters = () => setShowFilters((prev) => !prev);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const isFilterActive =
    filters.category !== "All" ||
    filters.status !== "all" ||
    filters.rating > 0 ||
    filters.priceSort !== "none";

  return (
    <>
      {/* Top row: Search + Sort + Filters toggle */}
      {/* Sort Dropdown */}
      <div className="col-6 col-md-4 col-lg-3">
        <select
          className="form-select"
          name="dateSort"
          value={filters.dateSort || "newest"}
          onChange={handleChange}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Filters Toggle Button */}
      <div className="col-6 col-md-3 col-lg-1">
        <button
          className={`btn btn-outline-primary w-100 ${
            showFilters || isFilterActive ? "active" : ""
          }`}
          onClick={toggleFilters}
        >
          <FaFilter size={15} />
        </button>
      </div>

      <hr className={`collapse my-4 ${showFilters ? "show" : ""}`} />

      {/* Collapsible Advanced Filters */}
      <div className={`row collapse row-gap-4 ${showFilters ? "show" : ""}`}>
        {/* Category */}
        <div className="col-sm-6 col-lg-3">
          <label className="form-label fw-bold small text-muted mb-2">
            Category
          </label>
          <select
            className="form-select"
            name="category"
            value={filters.category || "All"}
            onChange={handleChange}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="col-sm-6 col-lg-3">
          <label className="form-label fw-bold small text-muted mb-2">
            Status
          </label>
          <div className="d-flex flex-wrap gap-2 w-100">
            {["all", "active", "inactive"].map((status) => (
              <button
                key={status}
                type="button"
                className={`btn btn-sm flex-grow-1 small fw-medium ${
                  filters.status === status
                    ? "btn-primary text-white"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setFilters((prev) => ({ ...prev, status }))}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="col-sm-6 col-lg-3">
          <label className="form-label fw-bold small text-muted mb-2">
            Rating
          </label>
          <div className="d-flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                className={`btn btn-sm px-3 flex-grow-1 fw-medium ${
                  filters.rating === rating
                    ? "btn-warning text-white"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setFilters((prev) => ({ ...prev, rating }))}
              >
                {rating === 0 ? <TiCancel size={15} /> : rating}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Sort */}
        <div className="col-sm-6 col-lg-3">
          <label className="form-label fw-bold small text-muted mb-2">
            Pricing
          </label>
          <select
            className="form-select"
            name="priceSort"
            value={filters.priceSort || "none"}
            onChange={handleChange}
          >
            <option value="none">Default Ordering</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>
      </div>
    </>
  );
}
