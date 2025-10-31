import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import { productAPI } from "../services/api";
import Product from "../components/Product";
import LoadingSpinner from "../components/LoadingSpinner";
import GridLogo from "../assets/ui/grid.png";
import RowLogo from "../assets/ui/row.png";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayStyle, setDisplayStyle] = useState("card");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await productAPI.getAll();
        const activeProducts = (response.data.data || []).filter(
          (product) => product.isActive && !product.isDeleted
        );
        setProducts(activeProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center pb-4 my-5">
        <h3>Products ({products.length})</h3>
        <div
          className="btn-group"
          role="group"
          aria-label="Display style toggle"
        >
          <input
            type="radio"
            className="btn-check"
            name="displayStyle"
            id="cardView"
            autoComplete="off"
            checked={displayStyle === "card"}
            onChange={() => setDisplayStyle("card")}
          />
          <label
            className="btn btn-outline-light border rounded-0"
            htmlFor="cardView"
          >
            <img src={GridLogo} width="20" alt="Card View" />
          </label>
          <input
            type="radio"
            className="btn-check"
            name="displayStyle"
            id="rowView"
            autoComplete="off"
            checked={displayStyle === "row"}
            onChange={() => setDisplayStyle("row")}
          />
          <label
            className="btn btn-outline-light border rounded-0"
            htmlFor="rowView"
          >
            <img src={RowLogo} width="20" alt="Row View" />
          </label>
        </div>
      </div>
      {products.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No active products found.
        </div>
      ) : (
        <div
          className={
            displayStyle === "card" ? "row row-cols-1 row-cols-md-3 g-4" : ""
          }
        >
          {products.map((product) => (
            <div
              key={product._id}
              className={displayStyle === "card" ? "col" : ""}
            >
              <Product product={product} displayStyle={displayStyle} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
