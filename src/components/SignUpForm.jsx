import { NavLink } from "react-router-dom";
import LoadingButton from "../components/LoadingButton";

export default function SignUpForm({
  formData,
  handleChange,
  handleSubmit,
  loading,
}) {
  return (
    <form onSubmit={handleSubmit} className="col-12 col-md-6 col-lg-5 m-auto">
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            name="username"
            id="username"
            className="form-control"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            className="form-control"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          <LoadingButton
            loading={loading}
            type="submit"
            className="btn btn-primary w-100"
          >
            Sign Up
          </LoadingButton>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col text-center">
          Already have an account? <NavLink to="/login">Sign in</NavLink>
        </div>
      </div>
    </form>
  );
}
