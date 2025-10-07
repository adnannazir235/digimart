import { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { authAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useLocalStorage("accessToken", null);
  const [loading, setLoading] = useState(true);

  // Use an effect to fetch user data only when accessToken becomes available
  useEffect(() => {
    async function fetchUser() {
      if (accessToken) {
        try {
          const res = await authAPI.getProfile();
          setUser(res.data.data.user);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      }
      // Ensure minimum loading time to avoid flicker
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLoading(false);
    }
    fetchUser();
  }, [accessToken]); // Re-run this effect whenever the accessToken changes

  const login = (accessToken) => {
    setAccessToken(accessToken);
  };

  const logout = async () => {
    // Call the logout API first, as it needs the accessToken.
    if (accessToken) {
      try {
        await authAPI.logout();
      } catch (error) {
        console.error("Failed to call logout API:", error);
        // We still proceed with client-side logout even if the API call fails.
        // This is a design decision. You could show a toast here.
      }
    }

    // Clear user data and access token from local state and storage.
    setUser(null);
    setAccessToken(null);
  };

  const value = { user, accessToken, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
};

/* eslint-disable react-refresh/only-export-components */
export const useAuth = () => {
  return useContext(AuthContext);
};
