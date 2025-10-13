import { Routes, Route, useSearchParams } from "react-router-dom";
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

// Centralized toast handling component
function QueryHandler() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setAccessToken, login } = useAuth();
  const processedToasts = useRef(new Set()); // Track processed toast events

  useEffect(() => {
    // Toast notification logic based on URL search parameters
    const status = searchParams.get("status");
    const message = searchParams.get("message");
    const accessToken = searchParams.get("accessToken");
    const toastId = searchParams.get("toastId") || `${status}-${message}`; // Unique identifier for toast

    // Skip if no relevant query params or toast already processed
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

    // Process accessToken if present
    if (accessToken) {
      console.log("QueryHandler: Setting accessToken and triggering login");
      setAccessToken(accessToken);
      login(accessToken);
      shouldClearParams = true;
    }

    // Process toast if status and message are present
    if (status && message) {
      const decodedMessage = decodeURIComponent(message);
      console.log("QueryHandler: Displaying toast:", {
        status,
        decodedMessage,
      });

      // Mark toast as processed
      processedToasts.current.add(toastId);

      setTimeout(() => {
        switch (status) {
          case "success":
            toast.success(decodedMessage, toastOptions);
            break;
          case "error":
            toast.error(decodedMessage, toastOptions);
            break;
          case "info":
            toast.info(decodedMessage, toastOptions);
            break;
          default:
            toast.info(decodedMessage, toastOptions);
            break;
        }
      }, 2000);
      shouldClearParams = true;
    }

    // Clear query params to prevent reprocessing
    if (shouldClearParams) {
      console.log("QueryHandler: Clearing query params");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, setAccessToken, login]);

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

            <Route element={<RoleBasedRoute roles={["seller", "buyer"]} />}>
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* <Route element={<RoleBasedRoute roles={["seller"]} />}></Route> */}
            {/* <Route element={<RoleBasedRoute roles={["buyer"]} />}></Route> */}
            <Route
              path="*"
              element={<NotFound height="100%" minHeight="100%" />}
            />
          </Routes>
        </main>
        <Footer />
        <ToastContainer />
      </AuthProvider>
    </>
  );
}
