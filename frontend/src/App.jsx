import {
  Routes,
  Route,
  Navigate,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { useEffect, useRef, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser, login } from "./features/auth/authSlice.js";
import { PublicOnlyRoute } from "./routes/PublicOnlyRoute.jsx";
import { RoleBasedRoute } from "./routes/RoleBasedRoute.jsx";
import Header from "./shared/Header";
import Footer from "./shared/Footer.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import ReactGA from "react-ga4";
import useAnalyticsTracker from "./hooks/useAnalyticsTracker";
import useDocumentTitle from "./hooks/useDocumentTitle";
import { toast, ToastContainer } from "react-toastify";
import { toastOptions } from "../config/styles";

const Home = lazy(() => import("./pages/Home"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const SignUp = lazy(() => import("./pages/SignUp"));
const LogIn = lazy(() => import("./pages/LogIn"));
const Settings = lazy(() => import("./pages/Settings"));
const CheckEmail = lazy(() => import("./pages/CheckEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));
const DashboardLayout = lazy(() => import("./shared/DashboardLayout.jsx"));
const BuyerDashboard = lazy(() => import("./pages/BuyerDashboard.jsx"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard.jsx"));
const CreateShop = lazy(() => import("./pages/CreateShop.jsx"));
const ProductsTab = lazy(() => import("./components/ProductsTab.jsx"));
const TransactionsTab = lazy(() => import("./components/TransactionsTab.jsx"));
const ShopTab = lazy(() => import("./components/ShopTab.jsx"));
const Products = lazy(() => import("./pages/Products.jsx"));
const Product = lazy(() => import("./pages/Product.jsx"));
const OrderDetails = lazy(() => import("./pages/OrderDetails.jsx"));
const SaleDetails = lazy(() => import("./pages/SaleDetails.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const GAInitializer = () => {
  useEffect(() => {
    // Determine if we are running in a production environment (not localhost)
    const localHosts = ["localhost", "192.", "127."];
    const isProduction = !localHosts.some(host =>
      window.location.hostname.startsWith(host)
    );

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

function QueryHandler() {
  const dispatch = useDispatch();
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
      dispatch(login(accessToken));
      shouldClearParams = true;
    }

    if (stripeSuccess === "true") {
      processedToasts.current.add(toastId);
      setTimeout(async () => {
        toast.success("Stripe account connected successfully!", {
          ...toastOptions(),
          toastId,
        });

        dispatch(fetchUser());
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
            toast.success(decodedMessage, { ...toastOptions(), toastId });
            break;
          case "error":
            toast.error(decodedMessage, { ...toastOptions(), toastId });
            break;
          case "info":
            toast.info(decodedMessage, { ...toastOptions(), toastId });
            break;
          default:
            toast.info(decodedMessage, { ...toastOptions(), toastId });
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
  }, [searchParams, setSearchParams, dispatch]);

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
      toast.error(message || "Stripe connection failed", toastOptions());
      navigate("/seller/dashboard", { replace: true });
    } else {
      navigate("/seller/dashboard?stripeSuccess=true", { replace: true });
    }
  }, [navigate, searchParams]);

  return <LoadingSpinner />;
}

export default function App() {
  useDocumentTitle();
  const dispatch = useDispatch();
  const { accessToken, loading } = useSelector((state) => state.auth);

  // Fetch user on app start if token exists
  useEffect(() => {
    if (accessToken && loading) {
      dispatch(fetchUser());
    }
  }, [accessToken, dispatch, loading]);

  // Show spinner while checking auth on first load
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <GAInitializer />
      <RouteChangeTracker />
      <QueryHandler />
      <Header />
      <main style={{ minHeight: "80dvh" }} className="container-fluid">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/products/:id" element={<Product />} />

            <Route element={<PublicOnlyRoute />}>
              <Route path="/signup" element={<SignUp />} />
              <Route path="/check-email" element={<CheckEmail />} />
              <Route path="/login" element={<LogIn />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            <Route element={<RoleBasedRoute roles={["seller", "buyer"]} />}>
              <Route path="/settings" element={<Settings />} />
              <Route path="/cart" element={<Cart />} />
            </Route>

            <Route element={<RoleBasedRoute roles={["seller"]} />}>
              <Route path="/stripe/callback" element={<StripeCallback />} />

              {/* 1. SellerDashboard handles Logic (Stripe, Loading, Context) */}
              <Route path="/seller/dashboard" element={<SellerDashboard />}>

                {/* 2. DashboardLayout handles the UI (Sidebar, Container) */}
                <Route element={<DashboardLayout type="seller" />}>
                  {/* 3. These are the actual content pages rendered inside the Layout */}
                  <Route index element={<Navigate to="products" replace />} />
                  <Route path="products" element={<ProductsTab />} />
                  <Route path="orders-and-sales" element={<TransactionsTab isBuyer={false} />} />

                  {/* Detail Routes */}
                  <Route path="orders-and-sales/orders/:orderUid" element={<OrderDetails />} />
                  <Route path="orders-and-sales/sales/:orderUid" element={<SaleDetails />} />
                  <Route path="shop" element={<ShopTab />} />
                </Route>

              </Route>
            </Route>

            <Route element={<RoleBasedRoute roles={["buyer"]} />}>
              {/* 1. BuyerDashboard handles Logic */}
              <Route path="/buyer/dashboard" element={<BuyerDashboard />}>

                {/* 2. DashboardLayout handles the UI */}
                <Route element={<DashboardLayout type="buyer" />}>
                  <Route index element={<Navigate to="orders" replace />} />
                  <Route path="orders" element={<TransactionsTab isBuyer={true} />} />
                  <Route path="orders/:orderUid" element={<OrderDetails />} />
                </Route>

              </Route>

              <Route path="/buyer/create-shop" element={<CreateShop />} />
            </Route>

            <Route path="*" element={<NotFound minHeight="80dvh" />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
}
