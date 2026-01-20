import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-light text-center text-lg-start border-top mt-auto">
      <div className="container py-4">
        <div className="row align-items-center">
          {/* Left */}
          <div className="col-lg-6 text-center text-lg-start mb-3 mb-lg-0">
            <h5 className="fw-bold mb-3">DigiMart</h5>
            <p className="text-muted small mb-0">
              Built with ❤️ using React, Node.js, Express, MongoDB & Stripe
            </p>
          </div>

          {/* Right */}
          <div className="col-lg-6 text-center text-lg-end">
            <div className="d-flex flex-wrap justify-content-center justify-content-lg-end gap-4">
              <NavLink
                to="/contact"
                className="text-muted text-decoration-none small"
              >
                Contact
              </NavLink>

              <a
                href="https://github.com/adnannazir235"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted text-decoration-none small"
              >
                GitHub Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
