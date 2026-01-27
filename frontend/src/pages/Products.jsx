import { useState, useEffect } from "react";
import { productAPI } from "../services/api";
import Product from "../components/Product";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const productViewStyle = "card";

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
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center py-4">
        <h3>Products ({products.length})</h3>
      </div>

      {products.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No active products found.
        </div>
      ) : (
        <div className={productViewStyle === "card" && "row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"}>
          {products.map((product) => (
            <div key={product._id} className="col">
              <Product
                product={product}
                displayStyle={productViewStyle}
                showBuyButton={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
