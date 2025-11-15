import { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  const categoryLabels = {
    CPU: "Procesoare",
    GPU: "Plăci video",
    Motherboard: "Plăci de bază",
    RAM: "Memorii RAM",
    PSU: "Surse (PSU)",
    Case: "Carcase",
    Service: "Servicii",
    SSD: "SSD-uri"
  };

  const categoryOrder = [
    "CPU",
    "GPU",
    "Motherboard",
    "RAM",
    "PSU",
    "Case",
    "SSD",
    "Service"
  ];

  const productsByCategory = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  async function loadProducts() {
    try {
      const data = await apiRequest("/api/products");
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  }

  // 🔔 mesaj + notificare navbar-ului
  async function handleAddToCart(productId) {
    setMessage("");
    try {
      await apiRequest("/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId, quantity: 1 })
      });
      setMessage("Produs adăugat în coș ✅");

      // anunțăm global că s-a modificat coșul (Navbar ascultă asta)
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      setMessage(err.message || "Eroare la adăugarea în coș");
    }
  }

  // 🕒 ștergem mesajul după 2.5 secunde
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 2500);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div>
      <h2 className="page-title">Produse</h2>

      
      {message && (
         <div
    className="card"
    style={{
      position: "fixed",
      top: 20,           
      right: 20,
      zIndex: 1000,
      minWidth: "260px",
      borderLeft: "4px solid #4f46e5",
      boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)",
      fontWeight: 500
    }}
  >
    {message}
  </div>
      )}

      {categoryOrder.map(cat => {
        const items = productsByCategory[cat];
        if (!items || items.length === 0) return null;

        return (
          <div key={cat} className="section">
            <h3>{categoryLabels[cat] || cat}</h3>
            <div className="product-grid">
              {items.map(p => (
                <div key={p.id} className="card">
                  <h4>{p.name}</h4>
                  {p.description && (
                    <p className="text-muted">{p.description}</p>
                  )}
                  <p>
                    <strong>Categorie:</strong> {p.category}
                  </p>
                  <p>
                    <strong>Preț:</strong> {p.price} lei
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddToCart(p.id)}
                  >
                    Adaugă în coș
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
