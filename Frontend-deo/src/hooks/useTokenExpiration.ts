// hooks/useTokenExpiration.ts
import { useEffect } from "react";
import { getToken, decodeToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export const useTokenExpiration = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const decoded = decodeToken(token);
    if (!decoded?.exp) return;

    const timeout = decoded.exp * 1000 - Date.now();

    if (timeout > 0) {
      const timer = setTimeout(() => {
        alert("Vaša sesija je istekla. Prijavite se ponovo.");
        localStorage.removeItem("token");
        navigate("/login");
      }, timeout);

      return () => clearTimeout(timer);
    } else {
      // već isteklo
      alert("Vaša sesija je istekla. Prijavite se ponovo.");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);
};
