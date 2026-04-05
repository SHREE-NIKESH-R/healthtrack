import { createContext, useContext, useState, useEffect } from "react";
import { authApi, profileApi } from "../services";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ht_token");
    const savedUser = localStorage.getItem("ht_user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      profileApi
        .get()
        .then((r) => setProfile(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token, user: u } = res.data;
    localStorage.setItem("ht_token", token);
    localStorage.setItem("ht_user", JSON.stringify(u));
    setUser(u);
    try {
      const p = await profileApi.get();
      setProfile(p.data);
    } catch {
      // profile may not exist yet, that's ok
    }
    return u;
  };

  const register = async (email, password) => {
    const res = await authApi.register({ email, password });
    const { token, user: u } = res.data;
    localStorage.setItem("ht_token", token);
    localStorage.setItem("ht_user", JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem("ht_token");
    localStorage.removeItem("ht_user");
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const r = await profileApi.get();
      setProfile(r.data);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
