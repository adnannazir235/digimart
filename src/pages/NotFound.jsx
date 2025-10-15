import { Link } from "react-router-dom";

export default function NotFound({ height, minHeight }) {
  return (
    <section className="container-fluid d-flex" style={{ height, minHeight }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <h6 className="fs-3">404</h6>
            <h1 className="display-4 mb-4">Page Not Found</h1>
            <p className="text-gray-500 mb-3">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/" className="btn btn-link">
              Go Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
