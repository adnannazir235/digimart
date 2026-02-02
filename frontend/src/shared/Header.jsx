import { useEffect, useState } from "react";
import { Navbar, Nav, NavDropdown, Badge } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice.js";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { FaSignOutAlt } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { FiSettings } from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";
import digiMartLogo from "../assets/logos/digimart.svg";
import LazyAvatar from "../components/LazyAvatar.jsx";
import ThemeToggleDropdownItem from "../components/ThemeToggleDropdownItem.jsx";

export default function Header() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cart] = useLocalStorage("cart", []);
  const [cartCount, setCartCount] = useState(
    Array.isArray(cart) ? cart.length : 0,
  );

  useEffect(() => {
    setCartCount(Array.isArray(cart) ? cart.length : 0);

    const handleCartUpdate = (e) => {
      const updatedCart = e.detail;
      setCartCount(Array.isArray(updatedCart) ? updatedCart.length : 0);
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, [cart]);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <Navbar expand="lg" sticky="top" className="glass-nav">
      <div className="container-fluid px-3 px-md-4">
        <LinkContainer to="/" active="">
          <Navbar.Brand className="fw-semibold d-flex align-items-center gap-2 fs-4">
            <img
              src={digiMartLogo}
              alt="DigiMart Logo"
              width="42"
              height="38"
              className="d-inline-block align-text-top rounded"
            />
            DigiMart
          </Navbar.Brand>
        </LinkContainer>

        {/* Mobile Theme Toggle (Visible only on mobile, left of hamburger) */}
        <ThemeToggleDropdownItem
          variant="nav"
          isMobile={true}
          className="d-lg-none me-2"
        />

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border border-1 " />

        <Navbar.Collapse className="py-lg-0 py-4" id="basic-navbar-nav">
          <Nav className="ms-auto column-gap-lg-4">
            {/* Explore */}
            <LinkContainer to="/products" active="">
              <Nav.Link className="fw-medium">Explore</Nav.Link>
            </LinkContainer>

            {user ? (
              <>
                {/* Desktop: icons + dropdown */}
                <div className="d-none d-lg-flex align-items-center gap-3">
                  <LinkContainer to="/cart">
                    <Nav.Link
                      className="position-relative d-flex align-items-center"
                      active=""
                    >
                      <IoCartOutline size={20} />
                      {cartCount > 0 && (
                        <Badge
                          pill
                          bg="danger"
                          className="position-absolute translate-middle border-light shadow-sm"
                          style={{ top: "16%", left: "86%" }}
                        >
                          {cartCount}
                        </Badge>
                      )}
                    </Nav.Link>
                  </LinkContainer>

                  {/* Avatar dropdown */}
                  <div className="dropdown">
                    <button
                      className="border-0 bg-transparent"
                      data-bs-toggle="dropdown"
                    >
                      <LazyAvatar name={user.username} src={user.avatar} />
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                      {user.role === "seller" && (
                        <LinkContainer to="/seller/dashboard/products">
                          <NavDropdown.Item className="d-flex align-items-center gap-2">
                            <MdOutlineDashboard size={16} /> Seller Dashboard
                          </NavDropdown.Item>
                        </LinkContainer>
                      )}

                      {user.role === "buyer" && (
                        <LinkContainer to="/buyer/dashboard/orders">
                          <NavDropdown.Item className="d-flex align-items-center gap-2">
                            <MdOutlineDashboard size={16} /> Buyer Dashboard
                          </NavDropdown.Item>
                        </LinkContainer>
                      )}

                      <NavDropdown.Divider />

                      <LinkContainer to="/settings">
                        <NavDropdown.Item className="d-flex align-items-center gap-2">
                          <FiSettings size={16} /> Settings
                        </NavDropdown.Item>
                      </LinkContainer>

                      <NavDropdown.Divider />

                      <ThemeToggleDropdownItem variant="dropdown" />

                      <NavDropdown.Divider />

                      <NavDropdown.Item
                        className="text-danger d-flex align-items-center gap-2"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt size={16} /> Log Out
                      </NavDropdown.Item>
                    </ul>
                  </div>
                </div>

                {/* Mobile: simple nav links */}
                <div className="d-lg-none w-100">
                  <LinkContainer to="/cart">
                    <Nav.Link active="">
                      Cart {cartCount > 0 && `(${cartCount})`}
                    </Nav.Link>
                  </LinkContainer>

                  {user.role === "seller" && (
                    <LinkContainer to="/seller/dashboard/products">
                      <Nav.Link active="">Seller Dashboard</Nav.Link>
                    </LinkContainer>
                  )}

                  {user.role === "buyer" && (
                    <LinkContainer to="/buyer/dashboard/orders">
                      <Nav.Link active="">Buyer Dashboard</Nav.Link>
                    </LinkContainer>
                  )}

                  <LinkContainer to="/settings">
                    <Nav.Link active="">Settings</Nav.Link>
                  </LinkContainer>

                  <Nav.Link onClick={handleLogout} className="text-danger">
                    Log Out
                  </Nav.Link>
                </div>
              </>
            ) : (
              <>
                <LinkContainer to="/login" active="">
                  <Nav.Link className="fw-medium">Log In</Nav.Link>
                </LinkContainer>

                <LinkContainer to="/signup" active="">
                  <Nav.Link className="fw-medium">Sign Up</Nav.Link>
                </LinkContainer>

                {/* Guest Desktop Theme Toggle */}
                <ThemeToggleDropdownItem
                  variant="nav"
                  className="d-lg-block d-none"
                />
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
}
