import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  organization_id?: number | null;
  factory_id?: number | null;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("iot_token");

    console.log(
      "AuthContext token:",
      token ? "FOUND" : "NOT FOUND"
    );

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/api/users/me")
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error("Auth restore failed:", error);
        localStorage.removeItem("iot_token");
        localStorage.removeItem("iot_user");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (token: string, user: User) => {
    console.log("Saving login information...");

    localStorage.setItem("iot_token", token);
    localStorage.setItem("iot_user", JSON.stringify(user));

    setUser(user);

    console.log("Token saved:", !!localStorage.getItem("iot_token"));
  };

  const logout = () => {
    localStorage.removeItem("iot_token");
    localStorage.removeItem("iot_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}