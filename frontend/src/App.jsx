import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "./api";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import AccountPage from "./pages/AccountPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import BuildsPage from "./pages/BuildsPage";

function Navbar() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  async function fetchCartCount() {
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const data = await apiRequest("/api/cart");
      // dacă răspunsul tău e { items, total }
      const items = data.items || [];
      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (err) {
      setCartCount(0);
    }
  }

  useEffect(() => {
    // la mount + când se schimbă tokenul (login/logout)
    fetchCartCount();

    function handleCartUpdated() {
      fetchCartCount();
    }

    window.addEventListener("cart-updated", handleCartUpdated);
    return () => window.removeEventListener("cart-updated", handleCartUpdated);
  }, [token]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setCartCount(0);
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="nav-title">PC Builder Shop</div>

      <div className="nav-links">
        <Link to="/">Produse</Link>

        <Link to="/cart" className="cart-link">
          Coș
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </Link>

        {token && (
          <>
            <Link to="/builds">PC Builder</Link>
            <Link to="/orders">Comenzile mele</Link>
            <Link to="/account">Profil</Link>
            {role === "admin" && (
              <Link to="/admin/products">Admin produse</Link>
            )}
          </>
        )}
      </div>

      <div className="nav-actions">
        {!token ? (
          <>
            <button
              className="btn btn-outline"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </>
        ) : (
          <button className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/builds" element={<BuildsPage />} />
        </Routes>
      </main>
    </div>
  );
}
