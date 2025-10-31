import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { productAPI } from "../services/api";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import Product from "./Product";
import LoadingSpinner from "./LoadingSpinner";
import GridLogo from "../assets/ui/grid.png";
import RowLogo from "../assets/ui/row.png";
import ModalPopup from "./ModalPopup";
import CreateProductForm from "./CreateProductForm";
import StripeConnectModal from "./StripeConnectModal"; // Import new modal

export default function ProductsTab() {
  const { shop } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false); // State for Stripe modal
  const [displayStyle, setDisplayStyle] = useState("row");
  const [productToDelete, setProductToDelete] = useState(null);

  // Fetch products only if onboarded and shop exists
  useEffect(() => {
    if (!shop || !user?.sellerOnboardingComplete) return setLoading(false);

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productAPI.getMy();
        setProducts(res.data.data || []);
      } catch (err) {
        setError("Failed to load products");
        toast.error("Failed to load products", toastOptions);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [shop, user?.sellerOnboardingComplete]);

  const handleDeleteProduct = async (productId) => {
    setDeletingProductId(productId);
    try {
      await productAPI.delete(productId);
      toast.success("Product deleted successfully!", toastOptions);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      toast.error("Failed to delete product.", toastOptions);
    } finally {
      setDeletingProductId(null);
      setIsDeletePopupOpen(false);
      setProductToDelete(null);
    }
  };

  const handleCreateProduct = async (formData) => {
    try {
      await productAPI.create(formData);
      toast.success("Product created successfully!", toastOptions);
      const res = await productAPI.getMy();
      setProducts(res.data.data || []);
      setIsCreatePopupOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleCancelCreate = () => setIsCreatePopupOpen(false);
  const handleCancelDelete = () => {
    setIsDeletePopupOpen(false);
    setProductToDelete(null);
  };

  // Handle Add Product button click
  const handleAddProductClick = () => {
    if (!user?.sellerOnboardingComplete) {
      setIsStripeModalOpen(true);
    } else {
      setIsCreatePopupOpen(true);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h3>Products ({products.length})</h3>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-primary px-4 me-2"
            onClick={handleAddProductClick} // Use new handler
          >
            Add Product
          </button>
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
      </div>

      {products.length === 0 ? (
        <div className="alert alert-info">
          No products found. Start by adding a new product!
        </div>
      ) : (
        <div
          className={
            displayStyle === "card" ? "row row-cols-1 row-cols-md-3" : ""
          }
        >
          {products.map((product) => (
            <div
              key={product._id}
              className={displayStyle === "card" ? "col" : ""}
            >
              <Product
                product={product}
                displayStyle={displayStyle}
                onEdit={() => navigate(`/edit-product/${product._id}`)}
                onDelete={() => {
                  setProductToDelete(product._id);
                  setIsDeletePopupOpen(true);
                }}
                isDeleting={deletingProductId === product._id}
              />
            </div>
          ))}
        </div>
      )}

      <ModalPopup
        title="Confirm Product Deletion"
        isOpen={isDeletePopupOpen}
        confirmText="Yes, Delete"
        cancelText="No"
        countdownSeconds={3}
        onConfirm={() => handleDeleteProduct(productToDelete)}
        onCancel={handleCancelDelete}
        loading={deletingProductId === productToDelete}
        isClosable={true}
      >
        <p>
          Are you sure you want to delete this product? This action cannot be
          undone.
        </p>
      </ModalPopup>

      <ModalPopup
        title="Create New Product"
        isOpen={isCreatePopupOpen}
        onCancel={handleCancelCreate}
        isClosable={true}
      >
        <CreateProductForm
          onSubmit={handleCreateProduct}
          onCancel={handleCancelCreate}
        />
      </ModalPopup>

      <StripeConnectModal
        isOpen={isStripeModalOpen}
        onCancel={() => setIsStripeModalOpen(false)}
      />
    </div>
  );
}
