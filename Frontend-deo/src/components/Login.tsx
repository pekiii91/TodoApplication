import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
      navigate("/");
      // onLogin(); // obavesti da je korisnik ulogovan
    } catch {
      setError("Pogresan username ili lozinka.");
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "50px auto", textAlign: "left" }}>
      <h2 style={{ textAlign: "center" }}>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="username">Korisničko ime:</label>
          <input
            id="username"
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
          <label htmlFor="password">Lozinka:</label>
          <input
            id="password"
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
          Prijavi se
        </button>
      </form>
    </div>
  );
};

export default Login;
