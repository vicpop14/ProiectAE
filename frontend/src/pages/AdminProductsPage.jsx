import { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    id: null,
    name: "",
    description: "",
    category: "",
    price: "",
    stock: ""
  });
  const [isEditing, setIsEditing] = useState(false);

  async function loadProducts() {
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/api/products");
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // verificăm și rolul (doar admin are acces)
  async function checkAdmin() {
    try {
      const me = await apiRequest("/api/auth/me");
      if (me.role !== "admin") {
        setError("Acces interzis. Doar adminul poate gestiona produsele.");
      }
    } catch (err) {
      setError("Trebuie să fii logat ca admin.");
    }
  }

  useEffect(() => {
    checkAdmin();
    loadProducts();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm({
      id: null,
      name: "",
      description: "",
      category: "",
      price: "",
      stock: ""
    });
    setIsEditing(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const body = {
        name: form.name,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock)
      };

      if (!form.name || !form.category || isNaN(body.price)) {
        setError("Nume, categorie și preț sunt obligatorii.");
        return;
      }

      if (isEditing && form.id != null) {
        await apiRequest(`/api/products/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(body)
        });
        setMessage("Produs actualizat cu succes.");
      } else {
        await apiRequest("/api/products", {
          method: "POST",
          body: JSON.stringify(body)
        });
        setMessage("Produs creat cu succes.");
      }

      resetForm();
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(product) {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description || "",
      category: product.category || "",
      price: product.price,
      stock: product.stock
    });
    setIsEditing(true);
    setMessage("");
    setError("");
  }

  async function handleDelete(id) {
    const ok = window.confirm("Sigur vrei să ștergi acest produs?");
    if (!ok) return;

    try {
      await apiRequest(`/api/products/${id}`, {
        method: "DELETE"
      });
      setMessage("Produs șters.");
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Administrare produse</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <h3>{isEditing ? "Editează produs" : "Adaugă produs nou"}</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
        <div>
          <label>Nume</label><br />
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginTop: "8px" }}>
          <label>Descriere</label><br />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            style={{ width: "100%", minHeight: "60px" }}
          />
        </div>
        <div style={{ marginTop: "8px" }}>
          <label>Categorie</label><br />
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginTop: "8px" }}>
          <label>Preț (lei)</label><br />
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginTop: "8px" }}>
          <label>Stoc</label><br />
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>
        <button type="submit" style={{ marginTop: "10px" }}>
          {isEditing ? "Salvează modificările" : "Adaugă produs"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={resetForm}
            style={{ marginTop: "10px", marginLeft: "10px" }}
          >
            Renunță
          </button>
        )}
      </form>

      <hr style={{ margin: "20px 0" }} />

      <h3>Lista de produse</h3>
      {loading && <p>Se încarcă...</p>}
      {!loading && products.length === 0 && <p>Nu există produse.</p>}

      <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
        {products.map(p => (
          <div
            key={p.id}
            style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "6px" }}
          >
            <strong>{p.name}</strong> (#{p.id}) <br />
            <span>Categorie: {p.category}</span><br />
            <span>Preț: {p.price} lei</span><br />
            <span>Stoc: {p.stock}</span>

            <div style={{ marginTop: "8px" }}>
              <button onClick={() => handleEdit(p)}>Editează</button>
              <button
                onClick={() => handleDelete(p.id)}
                style={{ marginLeft: "8px" }}
              >
                Șterge
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
