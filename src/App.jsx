import { Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import CheckEmail from "./pages/CheckEmail";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import Settings from "./pages/Settings";
import Header from "./shared/Header";
import Footer from "./shared/Footer.jsx";
import { toast, ToastContainer } from "react-toastify";
import { useEffect, useRef } from "react";
import { toastOptions } from "../config/styles";
import { AuthProvider, useAuth } from "./contexts/authContext.jsx";
import { PublicOnlyRoute } from "./routes/PublicOnlyRoute.jsx";
import { RoleBasedRoute } from "./routes/RoleBasedRoute.jsx";
import NotFound from "./pages/NotFound.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import BuyerDashboard from "./pages/BuyerDashboard.jsx";
import SellerDashboard from "./pages/SellerDashboard.jsx";
import CreateShop from "./pages/CreateShop.jsx";
import ProductsTab from "./components/ProductsTab.jsx";
import OrdersTab from "./components/OrdersTab.jsx";

// Centralized toast handling component
function QueryHandler() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { login } = useAuth();
  const processedToasts = useRef(new Set());

  useEffect(() => {
    const status = searchParams.get("status");
    const message = searchParams.get("message");
    const accessToken = searchParams.get("accessToken");
    const toastId =
      searchParams.get("toastId") || `${status}-${message}-${Date.now()}`; // Add timestamp for uniqueness

    if (!status && !message && !accessToken) {
      return;
    }

    if (processedToasts.current.has(toastId)) {
      return;
    }

    console.log("QueryHandler: Processing query params:", {
      status,
      message,
      accessToken,
      toastId,
    });

    let shouldClearParams = false;

    if (accessToken) {
      console.log("QueryHandler: Setting accessToken and triggering login");
      login(accessToken);
      shouldClearParams = true;
    }

    if (status && message) {
      const decodedMessage = decodeURIComponent(message);
      console.log("QueryHandler: Displaying toast:", {
        status,
        decodedMessage,
      });

      processedToasts.current.add(toastId);

      // Use minimal delay to ensure ToastContainer is ready
      setTimeout(() => {
        switch (status) {
          case "success":
            toast.success(decodedMessage, { ...toastOptions, toastId });
            break;
          case "error":
            toast.error(decodedMessage, { ...toastOptions, toastId });
            break;
          case "info":
            toast.info(decodedMessage, { ...toastOptions, toastId });
            break;
          default:
            toast.info(decodedMessage, { ...toastOptions, toastId });
            break;
        }
      }, 1000);
      shouldClearParams = true;
    }

    if (shouldClearParams) {
      console.log("QueryHandler: Clearing query params");
      setSearchParams({}, { replace: true });
    }

    // Cleanup to ensure params are cleared on unmount
    return () => {
      if (shouldClearParams) {
        setSearchParams({}, { replace: true });
      }
    };
  }, [searchParams, setSearchParams, login]);

  return null;
}

export default function App() {
  return (
    <>
      <AuthProvider>
        <QueryHandler />
        <Header />
        <main style={{ minHeight: "82dvh" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />

            <Route element={<PublicOnlyRoute />}>
              <Route path="/signup" element={<SignUp />} />
              <Route path="/check-email" element={<CheckEmail />} />
              <Route path="/login" element={<LogIn />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Settings accessible to both buyer and seller */}
            <Route element={<RoleBasedRoute roles={["seller", "buyer"]} />}>
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route element={<RoleBasedRoute roles={["seller"]} />}>
              <Route path="/seller/dashboard" element={<SellerDashboard />}>
                <Route index element={<Navigate to="products" replace />} />
                <Route path="products" element={<ProductsTab />} />
                <Route path="orders" element={<OrdersTab />} />
              </Route>
            </Route>
            <Route element={<RoleBasedRoute roles={["buyer"]} />}>
              <Route path="/buyer/dashboard" element={<BuyerDashboard />}>
                <Route index element={<Navigate to="orders" replace />} />
                <Route path="orders" element={<OrdersTab />} />
              </Route>
              <Route path="/buyer/create-shop" element={<CreateShop />} />
            </Route>

            <Route path="*" element={<NotFound minHeight="82dvh" />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer />
      </AuthProvider>
    </>
  );
}
