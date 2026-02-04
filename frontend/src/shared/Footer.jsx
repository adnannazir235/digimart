import { Nav, Navbar } from "react-bootstrap";
import { FaHeart } from "react-icons/fa";
import { LinkContainer } from "react-router-bootstrap";

export default function Footer() {
  return (
    <footer className="border-top">
      <div className="container py-4">
        <div className="row align-items-center">
          {/* Left */}
          <div className="col-md-6 text-center text-md-start mb-4 mb-md-0">
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
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex flex-wrap justify-content-center justify-content-md-end gap-4">
              <Navbar>
                <Nav>
                  <LinkContainer to="/about" active="">
                    <Nav.Link className="small fw-medium p-0">About</Nav.Link>
                  </LinkContainer>
                </Nav>
              </Navbar>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
