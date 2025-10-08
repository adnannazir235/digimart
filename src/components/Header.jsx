import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";
import LazyAvatar from "./LazyAvatar.jsx";
import digiMartLogo from "../assets/logo/DigiMart.png";

export default function Header() {
  const { user, logout } = useAuth();

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
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
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
                      SignUp
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
                      Login
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
            </ul>

            {user && (
              <div className="dropdown ms-2">
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
                    <a className="dropdown-item" href="#">
                      Profile
                    </a>
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
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
