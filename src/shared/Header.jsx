import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useEffect, useState } from "react"; // Add useEffect, useState
import LazyAvatar from "../components/LazyAvatar.jsx";
import digiMartLogo from "../assets/DigiMart/logo.png";
import CartIcon from "../assets/ui/cart.png";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cart] = useLocalStorage("cart", []);
  const [cartCount, setCartCount] = useState(0);

  // Sync cart count on mount and storage changes
  useEffect(() => {
    const updateCount = () => {
      const items = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(Array.isArray(items) ? items.length : 0);
    };

    updateCount(); // Initial

    const handleStorage = (e) => {
      if (e.key === "cart") {
        updateCount();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Optional: Dispatch storage event when cart changes locally
  useEffect(() => {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "cart",
        newValue: JSON.stringify(cart),
      })
    );
  }, [cart]);

  return (
    <header>
      <nav
        className="navbar navbar-expand-lg bg-light"
        style={{ height: "8dvh" }}
      >
        <div className="container-fluid">
          <NavLink className="navbar-brand" to="/">
            <img
              src={digiMartLogo}
              alt="Logo"
              width="40"
              height="37"
              className="d-inline-block align-text-top"
            />
            <span
              className="ms-2"
              style={{ verticalAlign: "-webkit-baseline-middle" }}
            >
              DigiMart
            </span>
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  aria-current="page"
                  to="/"
                >
                  Home
                </NavLink>
              </li>

              {!user && (
                <>
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                      aria-current="page"
                      to="/signup"
                    >
                      Sign Up
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                      aria-current="page"
                      to="/login"
                    >
                      Log In
                    </NavLink>
                  </li>
                </>
              )}

              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  aria-current="page"
                  to="/products"
                >
                  Products
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  aria-current="page"
                  to="/privacy"
                >
                  Privacy
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  aria-current="page"
                  to="/contact"
                >
                  Contact
                </NavLink>
              </li>

              <li className="nav-item mx-2">
                <button
                  onClick={() => navigate("/cart")}
                  className="btn btn-link position-relative p-0 border-0"
                  style={{ lineHeight: 1 }}
                  aria-label={`Cart with ${cartCount} items`}
                  data-testid="cart-button"
                >
                  <img
                    src={CartIcon}
                    alt="Cart"
                    width="23"
                    height="23"
                    className="d-inline-block"
                  />
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{
                        fontSize: "0.65rem",
                        zIndex: 1,
                        minWidth: "18px",
                        height: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {cartCount}
                      <span className="visually-hidden">items in cart</span>
                    </span>
                </button>
              </li>

              {user && (
                <li className="nav-item ms-3">
                  <div className="dropdown">
                    <button
                      className="border-0 bg-transparent"
                      style={{ verticalAlign: "middle" }}
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <LazyAvatar name={user.username} src={user.avatar} />
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end border-0 shadow bg-body rounded">
                      <li>
                        <NavLink
                          className="dropdown-item"
                          to={
                            user.role === "seller"
                              ? "/seller/dashboard"
                              : "/buyer/dashboard"
                          }
                        >
                          Dashboard
                        </NavLink>
                      </li>
                      <li>
                        <NavLink className="dropdown-item" to="/settings">
                          Settings
                        </NavLink>
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={logout}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
