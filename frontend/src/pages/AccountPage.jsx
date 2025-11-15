import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Read 
  useEffect(() => {
    async function loadMe() {
      try {
        const data = await apiRequest("/api/auth/me");
        setEmail(data.email);
        setRole(data.role);
      } catch (err) {
        setError(err.message);
      }
    }
    loadMe();
  }, []);

  // Update 
  async function handleUpdate(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const body = { email };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const data = await apiRequest("/api/users/me", {
        method: "PUT",
        body: JSON.stringify(body)
      });

      setMessage(data.message || "Profil actualizat");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    }
  }

  // Delete 
  async function handleDelete() {
    const ok = window.confirm(
      "Ești sigur că vrei să îți ștergi contul? Această acțiune este permanentă."
    );
    if (!ok) return;

    try {
      await apiRequest("/api/users/me", { method: "DELETE" });
      localStorage.removeItem("token");
      navigate("/register");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Profilul meu</h2>
      {role && <p>Rol: {role}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <form onSubmit={handleUpdate} style={{ maxWidth: "400px", marginTop: "10px" }}>
        <div>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginTop: "15px" }}>
          <label>Parola curentă (doar dacă vrei să schimbi parola)</label><br />
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <label>Parolă nouă</label><br />
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <button type="submit" style={{ marginTop: "15px" }}>
          Actualizează profil
        </button>
      </form>

      <hr style={{ margin: "20px 0" }} />

      <button
        onClick={handleDelete}
        style={{ background: "red", color: "white", padding: "8px 12px", border: "none" }}
      >
        Șterge contul
      </button>
    </div>
  );
}
