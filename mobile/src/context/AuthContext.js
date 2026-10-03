import React, { createContext, useState, useEffect, useContext } from "react";
import {
  setAuthToken,
  loginApi,
  registerApi,
  getMeApi,
  logoutApi,
  updateDetailsApi,
} from "../services/api";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Initialize session on startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (token) {
          setAuthToken(token);
          const currentUser = await getMeApi();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (err) {
        console.log("[AuthContext] Session expired or server offline:", err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginApi(email.trim(), password);
      if (data?.token) {
        setToken(data.token);
        setAuthToken(data.token);
        setUser(data.user || { name: email.split("@")[0], email });
        setIsGuest(false);
      }
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your credentials.";
      throw message;
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await registerApi(name.trim(), email.trim(), password);
      if (data?.token) {
        setToken(data.token);
        setAuthToken(data.token);
        setUser(data.user || { name, email });
        setIsGuest(false);
      }
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";
      throw message;
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser({
      _id: "guest",
      id: "guest",
      name: "Guest Explorer",
      email: "guest@neurolink.local",
      role: "guest",
      streakDays: 1,
      memberSince: "Today",
    });
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      // Ignore
    } finally {
      setUser(null);
      setToken(null);
      setAuthToken(null);
      setIsGuest(false);
    }
  };

  const updateUserProfile = async (updatedFields) => {
    try {
      if (!isGuest) {
        const updated = await updateDetailsApi(updatedFields);
        if (updated) {
          setUser((prev) => ({ ...prev, ...updated }));
          return { success: true };
        }
      }
      setUser((prev) => ({ ...prev, ...updatedFields }));
      return { success: true };
    } catch (err) {
      setUser((prev) => ({ ...prev, ...updatedFields }));
      return { success: true };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isGuest,
        isAuthenticated: !!user,
        login,
        register,
        continueAsGuest,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
