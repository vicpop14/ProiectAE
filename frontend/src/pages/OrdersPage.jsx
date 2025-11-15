import { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  async function loadOrders() {
    setError("");
    try {
      const data = await apiRequest("/api/orders");
      setOrders(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleString("ro-RO");
  }

  return (
    <div>
      <h2>Comenzile mele</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {orders.length === 0 && !error && <p>Nu ai nicio comandă încă.</p>}

      <div style={{ display: "grid", gap: "15px", marginTop: "10px" }}>
        {orders.map(order => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "6px"
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              <strong>Comanda #{order.id}</strong> <br />
              <span>Data: {formatDate(order.createdAt)}</span> <br />
              <span>Total: {order.total} lei</span>
            </div>

            <div style={{ marginTop: "8px" }}>
              <strong>Produse:</strong>
              {order.items.map(item => (
                <div
                  key={item.id}
                  style={{
                    marginTop: "5px",
                    paddingLeft: "10px",
                    borderLeft: "2px solid #eee"
                  }}
                >
                  <div>{item.product?.name}</div>
                  <div>
                    Cantitate: {item.quantity} × {item.priceAtOrder} lei
                  </div>
                  <div>
                    Subtotal: {item.quantity * item.priceAtOrder} lei
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
