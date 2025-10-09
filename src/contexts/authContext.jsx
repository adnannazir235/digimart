import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { authAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useLocalStorage("accessToken", null);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false); // Add ref to track ongoing fetch

  const navigate = useNavigate();

  const fetchUser = async () => {
    if (!accessToken || isFetching.current) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Skip if user already loaded
    if (user) {
      setLoading(false);
      return;
    }

    isFetching.current = true; // Mark fetch as in progress
    setLoading(true);
    try {
      const res = await authAPI.getProfile();
      setUser(res.data.data.user);
    } catch (error) {
      const message = error.response?.data?.message;
      if (error.response?.status === 401) {
        setAccessToken(null);
        navigate("/login");
        toast.error("Session expired. Please log in again.", toastOptions);
      } else if (message === "Account doesn't exist") {
        toast.error(message, toastOptions);
        navigate("/signup");
      } else {
        console.error("Failed to fetch user profile:", error);
        toast.error(message || "Authentication error", toastOptions);
        setAccessToken(null);
        navigate("/login");
      }
    } finally {
      setLoading(false);
      isFetching.current = false; // Reset fetch flag
    }
  };

  useEffect(() => {
    if (accessToken && !user && !isFetching.current) {
      fetchUser();
    } else {
      setLoading(false); // Ensure loading is false if no fetch is needed
    }
  }, [accessToken]); // Run when accessToken changes

  // Storage event: Update token, but fetch user only if none exists
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "accessToken") {
        const newToken = event.newValue ? JSON.parse(event.newValue) : null;
        setAccessToken(newToken);
        if (newToken && !user && !isFetching.current) {
          console.log("Storage event triggered fetchUser");
          fetchUser(); // Fetch only if user not set
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setAccessToken]); // Dependencies stable

  const login = async (newAccessToken) => {
    setAccessToken(newAccessToken);
    await fetchUser(); // Fetch after login
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error("Failed to call logout API:", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      navigate("/login");
    }
  };

  const value = {
    user,
    setUser,
    setAccessToken,
    accessToken,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
};

/* eslint-disable react-refresh/only-export-components */
export const useAuth = () => useContext(AuthContext);
