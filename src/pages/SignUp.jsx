import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";
import SignUpForm from "../components/SignUpForm";
import { toastOptions } from "../../config/styles";
import { useAuth } from "../contexts/authContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function SignUp() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        {user ? (
          <LoadingSpinner />
        ) : (
          <div className="row justify-content-center h-100">
            <div className="col">
              <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
                Create Account!
              </h1>
              <p className="text-gray-500 text-center mb-8">
                Create your account on digimart.
              </p>
              <SignUpForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
