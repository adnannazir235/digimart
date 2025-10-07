import { Routes, Route, useSearchParams } from "react-router-dom";
import CheckEmail from "./pages/CheckEmail";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { toast, ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { toastOptions } from "../config/styles";
import { AuthProvider } from "./contexts/authContext.jsx";
import { PublicOnlyRoute } from "./routes/PublicOnlyRoute.jsx";
import { RoleBasedRoute } from "./routes/RoleBasedRoute.jsx";

// This component will contain the application's content and can use the AuthContext
function AppContent() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Toast notification logic based on URL search parameters
    const status = searchParams.get("status");
    const message = searchParams.get("message");

    if (status && message) {
      switch (status) {
        case "success":
          toast.success(message, toastOptions);
          break;
        case "error":
          toast.error(message, toastOptions);
          break;
        case "info":
          toast.info(message, toastOptions);
          break;
        default:
          toast.info(message, toastOptions);
          break;
      }
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  return (
    <>
      <Header />
      <main style={{ height: "82dvh" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/check-email" element={<CheckEmail />} />
            <Route path="/login" element={<LogIn />} />
          </Route>

          <Route element={<RoleBasedRoute roles={["seller"]} />}>
            {/* Seller routes */}
          </Route>

          <Route element={<RoleBasedRoute roles={["buyer"]} />}>
            {/* Buyer routes */}
          </Route>
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
}

// Top-level component to provide the AuthContext
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
