import {
  Routes,
  Route,
  Navigate,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
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
import ShopTab from "./components/ShopTab.jsx";
import Products from "./pages/Products.jsx";
import Product from "./pages/Product.jsx";
import Cart from "./pages/Cart.jsx";
import ReactGA from "react-ga4";
import useAnalyticsTracker from "./hooks/useAnalyticsTracker.jsx";

const GAInitializer = () => {
  useEffect(() => {
    // Determine if we are running in a production environment (not localhost)
    const isProduction =
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1";

    if (isProduction) {
      // Use the helper function to safely retrieve the environment variable
      const GA_MEASUREMENT_ID = import.meta.env.VITE_API_GA_MEASUREMENT_ID;

      if (GA_MEASUREMENT_ID) {
        ReactGA.initialize(GA_MEASUREMENT_ID);
      } else {
        console.warn(
          "Google Analytics skipped: VITE_API_GA_MEASUREMENT_ID is missing in production environment."
        );
      }
    }
  }, []);
  return null;
};

const RouteChangeTracker = () => {
  // Only call the hook if GA was initialized (i.e., if we are in production)
  const isProduction =
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";
  if (isProduction) {
    useAnalyticsTracker();
  }
  return null; // This component doesn't render anything
};

// Centralized toast handling component
function QueryHandler() {
  const { login, setUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const processedToasts = useRef(new Set());

  useEffect(() => {
    const status = searchParams.get("status");
    const message = searchParams.get("message");
    const accessToken = searchParams.get("accessToken");
    const stripeSuccess = searchParams.get("stripeSuccess");
    const toastId =
      searchParams.get("toastId") || `${status}-${message}-${Date.now()}`;

    if (!status && !message && !accessToken && !stripeSuccess) return;
    if (processedToasts.current.has(toastId)) return;

    console.log("QueryHandler: Processing query params:", {
      status,
      message,
      accessToken,
      stripeSuccess,
      toastId,
    });

    let shouldClearParams = false;

    if (accessToken) {
      console.log("QueryHandler: Setting accessToken and triggering login");
      login(accessToken);
      shouldClearParams = true;
    }

    if (stripeSuccess === "true") {
      processedToasts.current.add(toastId);
      setTimeout(async () => {
        toast.success("Stripe account connected successfully!", {
          ...toastOptions,
          toastId,
        });
        try {
          const res = await userAPI.getProfile();
          setUser(res.data.data.user); // Update user state
        } catch (err) {
          console.error("Failed to update user profile:", err);
        }
        navigate("/seller/dashboard", { replace: true });
      }, 1000);
      shouldClearParams = true;
    }

    if (status && message) {
      const decodedMessage = decodeURIComponent(message);
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
  }, [searchParams, setSearchParams, login, setUser]);

  return null;
}

function StripeCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const status = searchParams.get("status");
    const message = searchParams.get("message");

    if (error || (status === "false" && message)) {
      toast.error(message || "Stripe connection failed", toastOptions);
      navigate("/seller/dashboard", { replace: true });
    } else {
      navigate("/seller/dashboard?stripeSuccess=true", { replace: true });
    }
  }, [navigate, searchParams]);

  return <LoadingSpinner />;
}

export default function App() {
  return (
    <>
      <GAInitializer />
      <RouteChangeTracker />
      <AuthProvider>
        <QueryHandler />
        <Header />
        <main style={{ minHeight: "82dvh" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/products/:id" element={<Product />} />

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
              <Route path="/cart" element={<Cart />} />
            </Route>

            <Route element={<RoleBasedRoute roles={["seller"]} />}>
              <Route path="/stripe/callback" element={<StripeCallback />} />

              <Route path="/seller/dashboard" element={<SellerDashboard />}>
                <Route index element={<Navigate to="products" replace />} />
                <Route path="products" element={<ProductsTab />} />
                <Route path="orders-and-sales" element={<OrdersTab />} />
                <Route path="shop" element={<ShopTab />} />
              </Route>
            </Route>

            <Route element={<RoleBasedRoute roles={["buyer"]} />}>
              <Route path="/buyer/dashboard" element={<BuyerDashboard />}>
                <Route index element={<Navigate to="orders" replace />} />
                <Route path="orders" element={<OrdersTab isBuyer={true} />} />
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
