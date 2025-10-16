import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import { productAPI } from "../services/api";
import { useState } from "react";
import LoadingButton from "../components/LoadingButton.jsx";

export default function ProductsTab() {
  const { products, setData } = useOutletContext();
  const navigate = useNavigate();
  const [deletingProductId, setDeletingProductId] = useState(null);

  async function handleDeleteProduct(productId) {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setDeletingProductId(productId); // Set loading state for the specific product
      try {
        await productAPI.delete(productId);
        toast.success("Product deleted successfully!", toastOptions);
        // Refresh data
        const productsRes = await productAPI.getMy();
        setData((prev) => ({
          ...prev,
          products: productsRes.data.data || [], // Update products with new data
        }));
      } catch (err) {
        toast.error("Failed to delete product.", toastOptions);
      } finally {
        setDeletingProductId(null); // Clear loading state
      }
    }
  }

  // Handle case where products is undefined or null
  if (!products) {
    console.log("This is products in if:>", products);
    return <div>Loading products...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Products ({products.length})</h3>
        <button
          className="btn btn-primary rounded-pill px-4"
          onClick={() => navigate("/create-product")}
        >
          Add New Product
        </button>
      </div>
      {products.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No products found. Start by adding a new product!
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Currency</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>{product.title || "Unnamed Product"}</td>
                      <td>{(product.price || 0).toFixed(2)}</td>
                      <td>{product.currencyCode || "USD"}</td>
                      <td>
                        <button
                          className="btn btn-outline-primary btn-sm me-2"
                          onClick={() =>
                            navigate(`/edit-product/${product._id}`)
                          }
                        >
                          Edit
                        </button>
                        <LoadingButton
                          className="btn btn-outline-danger btn-sm"
                          loading={deletingProductId === product._id}
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Delete
                        </LoadingButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
