import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/api.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "chargeops_token";
const USER_KEY = "chargeops_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const persistSession = (sessionToken, sessionUser) => {
    localStorage.setItem(TOKEN_KEY, sessionToken);
    localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    setToken(sessionToken);
    setUser(sessionUser);
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const { data } = await authApi.me();
        if (data?.data) {
          setUser(data.data);
          localStorage.setItem(USER_KEY, JSON.stringify(data.data));
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, [token]);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    persistSession(data.data.token, data.data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    persistSession(data.data.token, data.data.user);
    return data;
  };

  const logout = () => {
    clearSession();
  };

  const refreshUser = async () => {
    const { data } = await authApi.me();
    if (data?.data) {
      setUser(data.data);
      localStorage.setItem(USER_KEY, JSON.stringify(data.data));
    }
    return data?.data || null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        isBootstrapping,
        login,
        register,
        refreshUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
