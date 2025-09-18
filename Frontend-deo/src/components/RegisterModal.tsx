import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

interface RegisterModalProps {
  onClose: () => void;
  onRegisterSuccess: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "https://localhost:44303/api/user/register",
        {
          username,
          password,
        }
      );

      const token = response.data.token; //Backend odmah vraca token
      localStorage.setItem("token", token);
      console.log("Korisnik registrovan i token sacuvan:", token);

      navigate("/"); //obavesti roditelja da je registracija uspesna
      onClose(); //zatvori modal
    } catch {
      setError("Registracija nije uspela. Pokušajte ponovo.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          width: "300px",
          textAlign: "left",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Registracija</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="register-username">Korisničko ime:</label>
            <input
              id="register-username"
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
            <label htmlFor="register-password">Lozinka:</label>
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="Lozinka"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "8px",
              background: "#4caf50",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Registruj se
          </button>
        </form>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "8px",
            background: "#ccc",
            border: "none",
            cursor: "pointer",
          }}
        >
          Zatvori
        </button>
      </div>
    </div>
  );
};

export default RegisterModal;
