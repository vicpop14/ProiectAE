import { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

   async function loadCart() {
    setError("");
    try {
      const data = await apiRequest("/api/cart");
      setCart(data);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

   async function handleCheckout() {
    setError("");
    setMessage("");
    try {
      const data = await apiRequest("/api/orders/checkout", {
        method: "POST"
      });
      setMessage(data.message);
      // coș gol după checkout
      setCart({ items: [], total: 0 });
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      setError(err.message);
    }
  }

    async function handleChangeQuantity(item, delta) {
  const newQty = item.quantity + delta;
  if (newQty < 1) return; 

  try {
    await apiRequest(`/api/cart/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({ quantity: newQty })
    });
    loadCart(); 
  } catch (err) {
    console.error(err);
  }
}


  async function handleDeleteItem(id) {
    try {
      await apiRequest(`/api/cart/${id}`, { method: "DELETE" });
      loadCart();
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  return (
  <div>
    <h2 className="page-title">Coșul meu</h2>
    {error && <p style={{ color: "red" }}>{error}</p>}

    {cart.items.length === 0 && <p>Coșul este gol.</p>}

    {cart.items.map(item => (
      <div key={item.id} className="card">
        <h3>{item.product?.name}</h3>
        <p>
          Cantitate:{" "}
          <button className="btn btn-outline" onClick={() => handleChangeQuantity(item, -1)}>-</button>
          <span style={{ margin: "0 8px" }}>{item.quantity}</span>
          <button className="btn btn-outline" onClick={() => handleChangeQuantity(item, 1)}>+</button>
        </p>
        <p>Preț unitar: {item.product?.price} lei</p>
        <p>Subtotal: {item.quantity * (item.product?.price ?? 0)} lei</p>

        <button
          className="btn btn-danger"
          onClick={() => handleDeleteItem(item.id)}
        >
          Șterge
        </button>
      </div>
    ))}

    <h3 style={{ marginTop: "16px" }}>Total: {cart.total} lei</h3>

    {cart.items.length > 0 && (
      <button
        className="btn btn-primary"
        style={{ marginTop: "10px" }}
        onClick={handleCheckout}
      >
        Finalizează comanda
      </button>
    )}

    {message && <p style={{ color: "green" }}>{message}</p>}
  </div>
);
}
