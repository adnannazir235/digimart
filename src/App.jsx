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

function App() {
  // useSearchParams returns an array: [currentSearchParams, setSearchParamsFunction]
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const toastOptions = {
      position: "bottom-right",
      autoClose: 15000,
      pauseOnHover: true,
      draggable: true,
      // theme: "dark",
    };

    // 1. Read the parameters from the URL
    const status = searchParams.get("status");
    const message = searchParams.get("message");

    if (status && message) {
      // 2. Display the appropriate toast based on the status
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

      // 3. IMPORTANT: Clear the query parameters from the URL.
      // This prevents the toast from reappearing if the user refreshes or navigates.
      // We pass an empty object to set the query string back to empty.
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]); // Effect re-runs when URL parameters change
  return (
    <>
      <Header />
      <main style={{ height: "82dvh" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
}

export default App;
