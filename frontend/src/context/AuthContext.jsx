"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "@/lib/api";

// Create the context
const AuthContext = createContext(null);

// Provider component that wraps our app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // Helper to extract avatar from any format
  const extractAvatar = (userData) => {
    if (!userData) return null;

    // If it's a string (URL or base64)
    if (typeof userData === "string") {
      return { url: userData };
    }

    // If it's an object with url
    if (userData.url) {
      return { url: userData.url };
    }

    // If it's a Strapi media object
    if (userData.formats?.thumbnail?.url) {
      return { url: userData.formats.thumbnail.url };
    }

    return null;
  };

  // Fetch full user profile with avatar
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!token || !currentUser?.id) return;

      const response = await fetch(
        `http://localhost:1337/api/users/${currentUser.id}?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Refreshed user avatar:", data.avatar);

        const updatedUser = {
          ...currentUser,
          username: data.username || currentUser.username,
          email: data.email || currentUser.email,
          avatar: extractAvatar(data.avatar),
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      // Check if account is suspended
      if (response.user.account_status === "Suspended") {
        return {
          success: false,
          error:
            "Your account has been suspended. Please contact the administrator.",
        };
      }

      // Get role from custom_role field first, then fallback to built-in role
      let roleName = response.user.custom_role || null;

      if (!roleName || roleName === "Authenticated") {
        if (response.user.role) {
          if (typeof response.user.role === "string") {
            roleName = response.user.role;
          } else if (response.user.role.name) {
            roleName = response.user.role.name;
          }
        }
      }

      if (!roleName) {
        roleName = "Authenticated";
      }

      const userData = {
        id: response.user.id,
        documentId: response.user.documentId,
        username: response.user.username,
        email: response.user.email,
        role: roleName,
        custom_role: response.user.custom_role || roleName,
        account_status: response.user.account_status || "Active",
        avatar: extractAvatar(response.user.avatar),
      };

      console.log("Saving user data:", userData);

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", response.jwt);

      // Refresh to get full profile with avatar
      setTimeout(() => refreshUser(), 500);

      return { success: true };
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";

      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message === "Network Error") {
        errorMessage = "Cannot connect to server. Is Strapi running?";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      const response = await authAPI.register(username, email, password);

      let roleName = "Authenticated";

      if (response.user.custom_role) {
        roleName = response.user.custom_role;
      } else if (response.user.role) {
        if (typeof response.user.role === "string") {
          roleName = response.user.role;
        } else if (response.user.role.name) {
          roleName = response.user.role.name;
        }
      }

      const userData = {
        id: response.user.id,
        documentId: response.user.documentId,
        username: response.user.username,
        email: response.user.email,
        role: roleName,
        custom_role: roleName,
        avatar: extractAvatar(response.user.avatar),
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", response.jwt);

      return { success: true };
    } catch (error) {
      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
