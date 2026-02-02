import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaBoxOpen } from "react-icons/fa";
import { toastOptions } from "../../config/styles";
import { productAPI } from "../services/api";
import Product from "./Product";
import ProductFiltersBar from "./ProductFiltersBar";
import LoadingSpinner from "./LoadingSpinner";
import ModalPopup from "./ModalPopup";
import CreateProductPopup from "./CreateProductPopup";
import StripeConnectModal from "./StripeConnectModal";
import EditProduct from "./EditProduct";
import ProductSearchBar from "./ProductSearchBar";

export default function ProductsTab() {
  const displayStyle = "row";
  const { user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [filters, setFilters] = useState({
    searchValue: "",
    category: "All",
    rating: 0,
    status: "all",
    dateSort: "newest",
    priceSort: "none",
  });
  const [tabState, setTabState] = useState({
    current: "Products",
    product: null,
  });

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productAPI.getMy();
        setProducts(res.data.data || []);
        setError(null);
      } catch (err) {
        setError("Failed to load products");
        toast.error("Failed to load products", toastOptions());
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Logic to filter and sort products based on the provided object structure
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (filters.searchValue.trim()) {
      const q = filters.searchValue.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q)
      );
    }

    // Category
    if (filters.category !== "All") {
      result = result.filter((p) => p.category === filters.category);
    }

    // Rating
    if (filters.rating > 0) {
      result = result.filter(
        (p) => (p.stats?.ratingAvg ?? 0) >= filters.rating
      );
    }

    // Status
    if (filters.status !== "all") {
      const isActive = filters.status === "active";
      result = result.filter((p) => p.isActive === isActive);
    }

    // Date sort
    result.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return filters.dateSort === "newest" ? db - da : da - db;
    });

    // Price sort
    if (filters.priceSort === "low-high") {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.priceSort === "high-low") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, filters]);

  const handleCreateProduct = async (formData) => {
    try {
      await productAPI.create(formData);
      toast.success("Product created successfully!", toastOptions());
      const res = await productAPI.getMy();
      setProducts(res.data.data || []);
      setIsCreatePopupOpen(false);
    } catch (err) {
      toast.error("Failed to create product", toastOptions());
    }
  };

  const handleDeleteProduct = async (productId) => {
    setDeletingProductId(productId);
    try {
      await productAPI.delete(productId);
      toast.success("Product deleted successfully!", toastOptions());
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      toast.error("Failed to delete product.", toastOptions());
    } finally {
      setDeletingProductId(null);
      setIsDeletePopupOpen(false);
      setProductToDelete(null);
    }
  };

  const handleCancelCreate = () => setIsCreatePopupOpen(false);

  const handleAddProductClick = () => {
    if (!user?.sellerOnboardingComplete) {
      setIsStripeModalOpen(true);
    } else {
      setIsCreatePopupOpen(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const ProductsTabView = () => {
    const hasProducts = products.length > 0;
    const hasFilteredProducts = filteredProducts.length > 0;

    return (
      <>
        {/* LOADING STATE */}
        {loading && <LoadingSpinner />}

        {/* EMPTY STATE */}
        {!loading && !hasProducts && (
          <div className="text-center py-5 rounded-3 border border-dashed border-gray-200">
            <div className="mb-3 bg-primary bg-opacity-10 p-4 rounded-circle d-inline-block mb-4">
              <FaBoxOpen size={40} />
            </div>
            <h5 className="fw-bold">No products found</h5>
            <p className="text-secondary mt-2">
              Start by adding your first digital product to your shop.
            </p>
          </div>
        )}

        {/* PRODUCTS LIST */}
        {!loading && hasProducts && (
          <>
            {!hasFilteredProducts ? (
              <div className="text-center py-5 rounded-3 border-2 border">
                <i className="fa-solid fa-filter text-4xl text-secondary-subtle mb-3"></i>
                <p className="text-secondary fw-medium mb-2">
                  No products found matching your filters.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      searchValue: "",
                      category: "All",
                      rating: 0,
                      status: "all",
                      dateSort: "newest",
                      priceSort: "none",
                    })
                  }
                  className="btn btn-sm btn-link text-decoration-none"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div
                className={
                  displayStyle === "card"
                    ? "row row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-3 g-4"
                    : ""
                }
              >
                {filteredProducts.map((product) => (
                  <Product
                    key={product._id}
                    product={product}
                    displayStyle={displayStyle}
                    autoSwitchDisplayStyle
                    onEdit={() => setTabState({ current: "Edit", product })}
                    onDelete={() => {
                      setProductToDelete(product._id);
                      setIsDeletePopupOpen(true);
                    }}
                    isDeleting={deletingProductId === product._id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <>
      {tabState.current === "Products" ? (
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold">
              Products{" "}
              <span className="text-muted fw-normal">({products.length})</span>
            </h3>
            <button
              className="btn btn-primary px-4 shadow-sm"
              onClick={handleAddProductClick}
              disabled={loading}
            >
              <i className="fa-solid fa-plus me-2"></i>Add Product
            </button>
          </div>

          {/* SEARCH & FILTERS */}
          {!loading && products.length !== 0 && (
            <div className="p-4 rounded-3 shadow-sm border border-gray-100 mb-4">
              <div className="row g-3 align-items-center">
                <ProductSearchBar
                  filters={filters}
                  filteredProducts={filteredProducts}
                  handleChange={handleChange}
                />
                <ProductFiltersBar
                  filters={filters}
                  setFilters={setFilters}
                />
              </div>
            </div>
          )}

          <ProductsTabView />

          <ModalPopup
            title="Confirm Product Deletion"
            isOpen={isDeletePopupOpen}
            confirmText="Yes, Delete"
            cancelText="No"
            countdownSeconds={3}
            onConfirm={() => handleDeleteProduct(productToDelete)}
            onCancel={() => {
              setIsDeletePopupOpen(false);
              setProductToDelete(null);
            }}
            loading={deletingProductId === productToDelete}
            isClosable
          >
            <p>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
          </ModalPopup>

          <CreateProductPopup
            isOpen={isCreatePopupOpen}
            onCancel={handleCancelCreate}
            onSuccess={handleCreateProduct}
            isClosable={false}
            user={user}
          />

          <StripeConnectModal
            isOpen={isStripeModalOpen}
            onCancel={() => setIsStripeModalOpen(false)}
          />
        </div>
      ) : tabState.current === "Edit" ? (
        <EditProduct
          product={tabState.product}
          onBack={() => setTabState({ current: "Products", product: null })}
          user={user}
        />
      ) : null}
    </>
  );
}
