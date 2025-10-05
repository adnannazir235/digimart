import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import LoadingButton from "../components/LoadingButton";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  // useEffect(() => {
  //   navigate("/check-email", {
  //     state: {
  //       email: "hello",
  //       toast: { successMessage: "Worked", toastOptions },
  //     },
  //   });
  // });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match", toastOptions);
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      const successMessage =
        res.data.message ||
        res.data.status ||
        "Registration successful! Check your email.";
      console.log("Navigating to /check-email");
      navigate("/check-email", {
        state: {
          email: formData.email,
          toast: { successMessage },
        },
      });
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
              Create Account!
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Create your account on digimart.
            </p>
            <form
              onSubmit={handleSubmit}
              className="col-12 col-md-6 col-lg-5 m-auto"
            >
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
                  Already have an account?{" "}
                  <NavLink to="/login">Sign in</NavLink>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
