import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, getToken } from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (getToken()) {
        try {
          const d = await api.get("/auth/me");
          setUser(d.user);
          setShop(d.shop);
        } catch (e) {
          // Only drop the session if the token is genuinely invalid/expired.
          // Transient errors (network, server restart) keep you logged in.
          if (e.status === 401 || e.status === 404) setToken(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function login(phone, password) {
    const d = await api.post("/auth/login", { phone, password });
    setToken(d.token);
    setUser(d.user);
    setShop(d.shop);
    return d.user;
  }
  function logout() {
    setToken(null);
    setUser(null);
    setShop(null);
  }
  async function refresh() {
    const d = await api.get("/auth/me");
    setUser(d.user);
    setShop(d.shop);
  }

  return (
    <AuthCtx.Provider value={{ user, shop, loading, login, logout, setShop, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
