import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { authAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useLocalStorage("accessToken", null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetching = useRef(false);
  const navigate = useNavigate();

  const fetchUser = async () => {
    if (!accessToken || isFetching.current) {
      setUser(null);
      setLoading(false);
      return;
    }

    isFetching.current = true;
    setLoading(true);
    try {
      const res = await authAPI.getProfile();
      setUser(res.data.data.user);
      setError(null);
    } catch (error) {
      const message = error.response?.data?.message;
      if (error.response?.status === 401) {
        setAccessToken(null);
        setError("Session expired. Please log in again.");
        // Toast handled by QueryHandler
      } else if (message === "Account doesn't exist") {
        setError("Account doesn't exist.");
        navigate("/signup");
        // Toast handled by QueryHandler
      } else {
        console.error("Failed to fetch user profile:", error);
        setError(message || "Authentication error");
        setAccessToken(null);
        // Toast handled by QueryHandler
      }
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    if (accessToken && !user && !isFetching.current) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "accessToken") {
        const newToken = event.newValue ? JSON.parse(event.newValue) : null;
        console.log(
          "Storage event triggered:> Setting accessToken in handleStorageChange:",
          newToken
        );
        setAccessToken(newToken);

        if (!newToken) {
          console.log("Setting user to null in handleStorageChange");
          setUser(null); // Clear user when token is removed
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setAccessToken, user]);

  const login = async (newAccessToken) => {
    setAccessToken(newAccessToken);
    await fetchUser();
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error("Failed to call logout API:", error);
      setError("Failed to logout. Please try again.");
      // Toast handled by QueryHandler
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
    error,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
};

/* eslint-disable react-refresh/only-export-components */
export const useAuth = () => useContext(AuthContext);
