import { useNavigate } from "react-router-dom";

export default function Product({
  product,
  displayStyle = "card",
  onEdit,
  onDelete,
  isDeleting,
  addBuyButton = false,   // Controls Buy button visibility
}) {
  const navigate = useNavigate();

  // Destructure relevant product properties
  const {
    _id, // <-- Get ID here
    title,
    description,
    price,
    currencyCode = "USD",
    category,
    stats = { totalSales: 0, totalDownloads: 0, ratingAvg: 0 },
    fileUrl,
    cloudinarySecureUrl,
  } = product;

  // Fallback ID
  const productId = _id || product.id;

  // Use cloudinarySecureUrl if available, else fallback to fileUrl
  const imageUrl =
    cloudinarySecureUrl || fileUrl || "https://via.placeholder.com/200";

  const handleBuyClick = () => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  // Card style component
  const CardView = () => (
    <div className="card h-100 shadow-sm border">
      <img
        src={imageUrl}
        className="card-img-top"
        alt={title || "Product"}
        style={{
          height: "220px",
          objectFit: "cover",
          borderTopLeftRadius: "0.375rem",
          borderTopRightRadius: "0.375rem",
        }}
      />
      <div className="card-body d-flex flex-column align-items-start p-4">
        <h5 className="card-title mb-2 fw-bold" style={{ fontSize: "1.25rem" }}>
          {title || "Unnamed Product"}
        </h5>
        {category && (
          <p className="text-muted small mb-2" style={{ fontSize: "0.9rem" }}>
            {category}
          </p>
        )}
        <p
          className="card-text text-secondary mb-3"
          style={{ fontSize: "1rem", lineHeight: "1.5" }}
        >
          {description || "No description available"}
        </p>
        <div className="mt-auto w-100">
          <h6
            className="text-primary mb-3 fw-semibold"
            style={{ fontSize: "1.1rem" }}
          >
            {(price || 0).toFixed(2)} {currencyCode}
          </h6>
          <div
            className="d-flex justify-content-between text-muted small mb-3"
            style={{ fontSize: "0.85rem" }}
          >
            <span>Sales: {stats.totalSales}</span>
            <span>Downloads: {stats.totalDownloads}</span>
            <span>Rating: {stats.ratingAvg.toFixed(1)}</span>
          </div>

          {/* BUTTONS */}
          <div className="d-flex gap-2">
            {addBuyButton && productId && (
              <button
                className="btn btn-primary btn-sm px-3 flex-fill"
                onClick={handleBuyClick}
                style={{ fontSize: "0.85rem" }}
              >
                Buy
              </button>
            )}
            {onEdit && onDelete && (
              <>
                <button
                  className="btn btn-outline-primary btn-sm px-3 flex-fill"
                  onClick={onEdit}
                  style={{ fontSize: "0.85rem" }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-outline-danger btn-sm px-3 flex-fill"
                  onClick={onDelete}
                  disabled={isDeleting}
                  style={{ fontSize: "0.85rem" }}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Row style component
  const RowView = () => (
    <div className="row align-items-center py-3 border-bottom border-light-subtle bg-light rounded-3 mb-3">
      <div className="col-md-2">
        <img
          src={imageUrl}
          className="img-fluid rounded"
          alt={title || "Product"}
          style={{ maxHeight: "120px", objectFit: "cover" }}
        />
      </div>
      <div className="col-md-5 ps-4">
        <h5 className="mb-1 fw-bold" style={{ fontSize: "1.25rem" }}>
          {title || "Unnamed Product"}
        </h5>
        {category && (
          <p className="text-muted small mb-1" style={{ fontSize: "0.9rem" }}>
            {category}
          </p>
        )}
        <p
          className="text-secondary mb-0"
          style={{ fontSize: "1rem", lineHeight: "1.5" }}
        >
          {description || "No description available"}
        </p>
      </div>
      <div className="col-md-2">
        <h6 className="text-primary fw-semibold" style={{ fontSize: "1.1rem" }}>
          {(price || 0).toFixed(2)} {currencyCode}
        </h6>
      </div>
      <div
        className="col-md-3 text-muted small ps-4"
        style={{ fontSize: "0.85rem" }}
      >
        <div>Sales: {stats.totalSales}</div>
        <div>Downloads: {stats.totalDownloads}</div>
        <div>Rating: {stats.ratingAvg.toFixed(1)}</div>

        {/* BUTTONS */}
        <div className="d-flex gap-2 mt-2">
          {addBuyButton && productId && (
            <button
              className="btn btn-primary btn-sm px-3 flex-fill"
              onClick={handleBuyClick}
              style={{ fontSize: "0.85rem" }}
            >
              Buy
            </button>
          )}
          {onEdit && onDelete && (
            <>
              <button
                className="btn btn-outline-primary btn-sm px-3 flex-fill"
                onClick={onEdit}
                style={{ fontSize: "0.85rem" }}
              >
                Edit
              </button>
              <button
                className="btn btn-outline-danger btn-sm px-3 flex-fill"
                onClick={onDelete}
                disabled={isDeleting}
                style={{ fontSize: "0.85rem" }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Render based on displayStyle prop
  return (
    <div className="mb-4">
      {displayStyle === "row" ? <RowView /> : <CardView />}
    </div>
  );
}
