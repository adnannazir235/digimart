import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingButton from "../components/LoadingButton";
import { authAPI } from "../services/api";

export default function LogIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 15000,
    pauseOnHover: true,
    draggable: true,
    // theme: "dark",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await authAPI.login(formData);
      const successMessage =
        res.data.message ||
        res.data.status ||
        "Registration successful! Check your email.";
      setTimeout(() => {
        console.log("Navigating to /check-email");
        navigate("/check-email", {
          state: {
            email: formData.email,
            toast: { successMessage, toastOptions },
          },
        });
      }, 5000); // Match toast delay
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed",
        toastOptions
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container-fluid py-5 h-100">
      <div className="container h-100">
        <div className="row justify-content-center h-100">
          <div className="col">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
              Welcome Back!
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Sign in to access your account.
            </p>
            <form
              onSubmit={handleSubmit}
              className="col-12 col-md-6 col-lg-5 m-auto"
            >
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
                  <LoadingButton
                    loading={loading}
                    type="submit"
                    className="btn btn-primary w-100"
                  >
                    Sign In
                  </LoadingButton>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col text-center">
                  Need an account? <NavLink to="/signup">Sign up</NavLink>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
