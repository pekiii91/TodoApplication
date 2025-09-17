import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import RegisterModal from "./RegisterModal";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "https://localhost:44303/api/user/login",
        {
          username,
          password,
        }
      );

      const token = response.data.token;
      localStorage.setItem("token", token);
      console.log("Token je sačuvan:", localStorage.getItem("token"));

      navigate("/"); // idi na početnu
    } catch {
      setError("Pogrešan username ili lozinka.");
    }
  };

  //Zatvara modal i ide na početnu stranu
  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    navigate("/"); // odmah ide na početnu stranu
  };

  return (
    <div style={{ maxWidth: "300px", margin: "50px auto", textAlign: "left" }}>
      <h2 style={{ textAlign: "center" }}>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="login-username">Korisničko ime:</label>
          <input
            id="login-username"
            name="username"
            type="text"
            placeholder="Korisničko ime"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="login-password">Lozinka:</label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button type="submit" style={{ width: "100%", padding: "8px" }}>
          Prijavite se
        </button>
      </form>

      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <button
          onClick={() => setShowRegisterModal(true)}
          style={{
            background: "transparent",
            border: "none",
            color: "blue",
            cursor: "pointer",
          }}
        >
          Registruj se
        </button>
      </div>

      {/* Prikazujemo modal samo kad je showRegisterModal true */}
      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
};

export default Login;
