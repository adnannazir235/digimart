import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; // ← NEW
import { useSelector } from "react-redux";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { productAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";
import Product from "../components/Product";

export default function Products() {
  const productViewStyle = "card";
  const { user } = useSelector((state) => state.auth);
  const [cart, setCart] = useLocalStorage("cart", []);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams(); // ← NEW

  // Read page from URL, fallback to 1
  const page = parseInt(searchParams.get("page")) || 1;

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const response = await productAPI.getAll(page);
        const activeProducts = (response.data.data || []).filter(
          (product) => product.isActive && !product.isDeleted,
        );
        setProducts(activeProducts);
        setTotalPages(response.data.totalPages);
        setTotalProducts(
          response.data.totalProducts || response.data.data?.length || 0,
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [page]); // only re-fetch when page changes

  function toggleCart(isInCart, productId) {
    if (!user) return;

    const newCart = isInCart
      ? cart.filter((pid) => pid !== productId)
      : [...cart, productId];

    setCart(newCart);

    window.dispatchEvent(new CustomEvent("cart-updated", { detail: newCart }));
  }

  // Handle page change → update URL
  const handlePageChange = (num) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", num);
      return newParams;
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center py-4">
        <h3 className="fw-bold">
          Products{" "}
          <span className="text-muted fw-normal">({totalProducts})</span>
        </h3>
      </div>

      {products.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No active products found.
        </div>
      ) : (
        <>
          <div
            className={
              productViewStyle === "card" &&
              "row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"
            }
          >
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

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange} // ← updated
          />
        </>
      )}
    </div>
  );
}
