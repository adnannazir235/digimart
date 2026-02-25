import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import LoadingSpinner from "../components/LoadingSpinner";
import Product from "../components/Product";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { productAPI } from "../services/api";

export default function Products() {
  const productViewStyle = "card";
  const [products, setProducts] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useLocalStorage("cart", []);

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

  function toggleCart(isInCart, productId) {
    if (!user) return;

    const newCart = isInCart
      ? cart.filter((pid) => pid !== productId)
      : [...cart, productId];

    setCart(newCart);

    window.dispatchEvent(new CustomEvent("cart-updated", { detail: newCart }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center py-4">
        <h3 className="fw-bold">
          Products{" "}
          <span className="text-muted fw-normal">({products.length})</span>
        </h3>
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
                showAddToCartButton={true}
                cart={cart}
                setCart={setCart}
                toggleCart={toggleCart}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
