import { FaHeart } from "react-icons/fa";
import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-top">
      <div className="container py-4">
        <div className="row align-items-center">
          {/* Left */}
          <div className="col-lg-6 text-center text-lg-start mb-4 mb-lg-0">
            <h5 className="fw-bold mb-3">DigiMart</h5>
            <p className="text-secondary small mb-0 lh-sm">
              Made with <FaHeart /> by{" "}
              <a
                href="https://github.com/adnannazir235"
                target="_blank"
                rel="noopener noreferrer"
                className="btn border-0 p-0 m-0 text-decoration-underline"
              >
                @Adnan
              </a>
            </p>
          </div>

          {/* Right */}
          <div className="col-lg-6 text-center text-lg-end">
            <div className="d-flex flex-wrap justify-content-center justify-content-lg-end gap-4">
              <NavLink to="/about" className="text-muted small fw-medium">
                About
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
