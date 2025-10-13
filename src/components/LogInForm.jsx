import { Link } from "react-router-dom";
import LoadingButton from "../components/LoadingButton";
import GoogleLogo from "../assets/google/logo.png";

export default function LogInForm({
  formData,
  handleChange,
  handleSubmit,
  loading,
  googleLoading,
  handleGoogleAuth,
  resendEmailInfo,
  sendVerificationEmail,
}) {
  return (
    <form onSubmit={handleSubmit} className="col-12 col-md-6 col-lg-5 m-auto">
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
            disabled={loading || googleLoading}
          />
        </div>
      </div>

      {resendEmailInfo.requiresVerification && (
        <div className="row mb-2">
          <div className="col">
            <button
              className="btn btn-link btn-sm"
              onClick={sendVerificationEmail}
              disabled={loading || googleLoading}
            >
              Send Verification Email ▶
            </button>
          </div>
        </div>
      )}

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
            disabled={loading || googleLoading}
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <LoadingButton
            loading={loading}
            type="submit"
            className="btn btn-primary w-100"
            disabled={googleLoading}
          >
            Sign In
          </LoadingButton>
        </div>
      </div>

      <div className="row my-3">
        <p className="text-center">OR</p>
      </div>

      <div className="row mb-3">
        <div className="col">
          <LoadingButton
            loading={googleLoading}
            type="button"
            className="btn btn-light border w-100"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            Continue with Google
            <img
              src={GoogleLogo}
              height="20"
              className="ms-2"
              alt="Google's Logo - PNG"
            />
          </LoadingButton>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col text-center">
          Don't have an Account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </form>
  );
}
