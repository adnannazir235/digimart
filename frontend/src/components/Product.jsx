import { FaEdit } from "react-icons/fa";
import { FiDownload, FiShoppingBag, FiStar } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function Product({
  product,
  displayStyle = "card",
  onEdit,
  onDelete,
  isDeleting,
  showBuyButton = false,
  autoSwitchDisplayStyle = false,
}) {
  const navigate = useNavigate();

  const {
    _id,
    title,
    description,
    price,
    category,
    stats = { totalSales: 0, totalDownloads: 0, ratingAvg: 0 },
    fileUrl,
  } = product;

  const productId = _id || product.id;
  const imageUrl = fileUrl || "https://via.placeholder.com/200";

  const handleBuyClick = () => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  const CardView = () => (
    <div className="card h-100 shadow-sm hover-lift transition-all duration-300 rounded-2 overflow-hidden border border-light-subtle">
      <div className="position-relative">
        <img
          src={imageUrl}
          className="card-img-top"
          alt={title || "Product"}
          style={{
            height: "220px",
            objectFit: "cover",
          }}
        />
      </div>

      <div className="card-body d-flex flex-column p-4">
        <div className="mb-2">
          {category && (
            <span
              className="badge text-secondary fw-normal rounded-1 px-2 py-1"
              style={{ fontSize: "0.75rem" }}
            >
              {category}
            </span>
          )}
        </div>

        <h5 className="card-title fw-bold mb-2 text-truncate" title={title}>
          {title || "Unnamed Product"}
        </h5>

        <p
          className="card-text text-secondary small mb-4 lh-sm"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description || "No description available"}
        </p>

        <div className="mt-auto w-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="text-primary fw-semibold mb-0 fs-5">
              ${(price || 0).toFixed(2)}
            </h6>

            <div className="d-flex gap-3 text-muted small">
              <span className="d-flex align-items-center gap-1">
                <FiShoppingBag size={14} /> {stats.totalSales}
              </span>
              <span className="d-flex align-items-center gap-1">
                <FiDownload size={14} /> {stats.totalDownloads}
              </span>
              <span className="d-flex align-items-center gap-1">
                <FiStar size={14} className="text-warning" />{" "}
                {stats.ratingAvg.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="d-flex gap-2">
            {showBuyButton && productId && (
              <button
                className={
                  "btn btn-sm flex-fill fw-medium rounded-pill px-3 " +
                  (product.isSeller === false || product.isSeller === null
                    ? "btn-primary shadow-sm"
                    : "btn-outline-secondary")
                }
                onClick={handleBuyClick}
              >
                {product.isSeller === null
                  ? "View More"
                  : product.isSeller === false
                    ? "Show More"
                    : "Preview"}
              </button>
            )}

            {onEdit && onDelete && (
              <>
                <button
                  className="btn btn-outline-primary btn-sm fw-medium rounded-pill px-3 border"
                  onClick={onEdit}
                >
                  <FaEdit size={15} />
                </button>
                <button
                  className="btn btn-sm btn-outline-danger fw-medium rounded-pill px-3"
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "..." : <MdDelete size={15} />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const RowView = () => (
    <div className="bg-body border border-light-subtle rounded-3 p-3 shadow-sm hover-lift transition-all duration-300 mb-3">
      <div className="row align-items-center g-3">
        <div className="col-md-2">
          <img
            src={imageUrl}
            className="img-fluid rounded-3"
            alt={title || "Product"}
            style={{ maxHeight: "100px", objectFit: "cover", width: "100%" }}
          />
        </div>

        <div className="col-md-4 ps-md-0">
          <div className="d-flex align-items-center gap-2 mb-1">
            {category && (
              <span
                className="badge text-secondary fw-normal rounded-1 px-2 py-1"
                style={{ fontSize: "0.7rem" }}
              >
                {category}
              </span>
            )}
          </div>
          <h5 className="fw-bold mb-1 text-truncate">
            {title || "Unnamed Product"}
          </h5>
          <p
            className="text-secondary small mb-0 text-truncate"
            style={{ maxWidth: "95%" }}
          >
            {description || "No description available"}
          </p>
        </div>

        <div className="col-md-2">
          <h6 className="text-primary fw-bold fs-5 mb-0">
            ${(price || 0).toFixed(2)}
          </h6>
        </div>

        <div className="col-12 col-md-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 ps-md-0">
          {/* Stats */}
          <div className="d-flex gap-3 text-muted small flex-shrink-0 mb-2 mb-md-0">
            <div>
              Sales: <span className="fw-bold">{stats.totalSales}</span>
            </div>
            <div>
              Rating: <span className="fw-bold">{stats.ratingAvg.toFixed(1)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex flex-wrap gap-2 ms-md-auto w-100 w-md-auto">
            {showBuyButton && productId && (
              <button
                className={
                  "btn btn-sm fw-medium rounded-pill flex-grow-1 " +
                  (product.isSeller === false ? "btn-primary shadow-sm" : "btn-outline-secondary")
                }
                onClick={handleBuyClick}
              >
                {product.isSeller === false ? "Show More" : "Preview"}
              </button>
            )}

            {onEdit && onDelete && (
              <>
                <button
                  className="btn btn-outline-primary btn-sm fw-medium rounded-pill flex-grow-1"
                  onClick={onEdit}
                >
                  <FaEdit size={15} />
                </button>
                <button
                  className="btn btn-sm btn-outline-danger fw-medium rounded-pill flex-grow-1"
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "..." : <MdDelete size={15} />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (autoSwitchDisplayStyle) {
    return (
      <>
        <div className="d-md-none">
          <CardView />
        </div>

        {displayStyle === "row" ? (
          <div className="d-none d-md-block">
            <RowView />
          </div>
        ) : (
          <div className="d-none d-md-block">
            <CardView />
          </div>
        )}
      </>
    );
  }

  return <>{displayStyle === "row" ? <RowView /> : <CardView />}</>;
}
