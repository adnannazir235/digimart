import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { productAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Product from "../components/Product";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const PRODUCTS_TO_SHOW = 4;

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await productAPI.getAll(1);
        const activeProducts = (response.data.data || []).filter(
          (p) => p.isActive && !p.isDeleted && !p.isSeller,
        );

        // You can also sort by newest / most popular / random etc.
        // For now → just newest first (assuming newer have higher _id or createdAt)
        const sorted = activeProducts
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, PRODUCTS_TO_SHOW);

        setFeaturedProducts(sorted);
      } catch (err) {
        console.error("Failed to load featured products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  const goToAllProducts = () => {
    navigate("/products");
  };

  return (
    <>
      <section className="container py-5 my-5">
        <div className="row justify-content-center text-center">
          <div className="col-lg-8">
            <h6 className="text-primary fw-bold text-uppercase letter-spacing-lg mb-3">
              Welcome to DigiMart
            </h6>
            <h1 className="display-4 fw-bold mb-4">
              Digital Products Marketplace
            </h1>
            <p className="lead text-white-75 mb-4 pb-2">
              Discover high-quality digital assets, tools, templates, courses,
              software, graphics & more — created by talented creators from
              around the world.
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <button
                className="btn btn-primary px-5"
                onClick={goToAllProducts}
              >
                Explore Products
              </button>
              <a href="#featured" className="btn btn-light border px-5">
                See Featured
              </a>
            </div>
          </div>
        </div>
      </section>

      <hr />

      <section id="featured" className="container py-5 my-5">
        <div>
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold">Featured Products</h2>
            <p className="text-muted lead">
              Hand-picked selection of digital goods
            </p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-5">
              <p className="lead text-muted">
                No featured products available right now...
              </p>
            </div>
          ) : (
            <>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {featuredProducts.map((product) => (
                  <div key={product._id} className="col">
                    <Product
                      product={product}
                      displayStyle="card"
                      showBuyButton={true}
                    />
                  </div>
                ))}
              </div>

              <div className="text-center mt-5 pt-3">
                <button
                  className="btn btn-outline-primary px-5"
                  onClick={goToAllProducts}
                >
                  <div className="d-flex align-items-center gap-2">
                    View All Products <IoIosArrowForward />
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
