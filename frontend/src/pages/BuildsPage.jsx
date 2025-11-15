import { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function BuildsPage() {
  const [products, setProducts] = useState([]);
  const [builds, setBuilds] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [deliveryType, setDeliveryType] = useState("parts"); // "parts" sau "assembled"

  const [cpuId, setCpuId] = useState("");
  const [gpuId, setGpuId] = useState("");
  const [moboId, setMoboId] = useState("");
  const [ramId, setRamId] = useState("");
  const [psuId, setPsuId] = useState("");
  const [caseId, setCaseId] = useState("");

  async function loadProducts() {
    try {
      const data = await apiRequest("/api/products");
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadBuilds() {
    try {
      const data = await apiRequest("/api/builds");
      setBuilds(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProducts();
    loadBuilds();
  }, []);

  // filtre după categorie
  const cpus = products.filter(p => p.category === "CPU");
  const gpus = products.filter(p => p.category === "GPU");
  const mobos = products.filter(p => p.category === "Motherboard");
  const rams = products.filter(p => p.category === "RAM");
  const psus = products.filter(p => p.category === "PSU");
  const cases = products.filter(p => p.category === "Case");

  function resetForm() {
    setName("");
    setDeliveryType("parts");
    setCpuId("");
    setGpuId("");
    setMoboId("");
    setRamId("");
    setPsuId("");
    setCaseId("");
  }

  async function handleCreateBuild(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (!name) {
        setError("Te rog să dai un nume build-ului.");
        return;
      }

      // toate componentele obligatorii
      if (!cpuId || !gpuId || !moboId || !ramId || !psuId || !caseId) {
        setError(
          "Trebuie să alegi CPU, GPU, placă de bază, RAM, sursă și carcasă."
        );
        return;
      }

      const components = [
        { productId: Number(cpuId), roleInBuild: "CPU", quantity: 1 },
        { productId: Number(gpuId), roleInBuild: "GPU", quantity: 1 },
        { productId: Number(moboId), roleInBuild: "Motherboard", quantity: 1 },
        { productId: Number(ramId), roleInBuild: "RAM", quantity: 1 },
        { productId: Number(psuId), roleInBuild: "PSU", quantity: 1 },
        { productId: Number(caseId), roleInBuild: "Case", quantity: 1 }
      ];

      await apiRequest("/api/builds", {
        method: "POST",
        body: JSON.stringify({
          name,
          isAssembledByShop: deliveryType === "assembled",
          components
        })
      });

      setMessage("Build creat cu succes!");
      resetForm();
      loadBuilds();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteBuild(id) {
    const ok = window.confirm("Sigur vrei să ștergi acest build?");
    if (!ok) return;

    try {
      await apiRequest(`/api/builds/${id}`, { method: "DELETE" });
      setMessage("Build șters.");
      loadBuilds();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddBuildToCart(id) {
    setError("");
    setMessage("");

    try {
      const data = await apiRequest(`/api/builds/${id}/add-to-cart`, {
        method: "POST"
      });
      setMessage(data.message || "Build adăugat în coș.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2 className="page-title">PC Builder</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      {/* Formular build nou */}
      <div className="section card">
        <h3>Construiește un PC nou</h3>
        <form onSubmit={handleCreateBuild}>
          <div style={{ marginTop: 8 }}>
            <label>Nume build</label><br />
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          {/* TIP LIVRARE ÎN INTERIORUL FORMULARULUI */}
          <div style={{ marginTop: 8 }}>
            <label>Tip livrare:</label><br />
            <label>
              <input
                type="radio"
                value="parts"
                checked={deliveryType === "parts"}
                onChange={e => setDeliveryType(e.target.value)}
              />{" "}
              Vreau doar componentele, voi asambla eu.
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="assembled"
                checked={deliveryType === "assembled"}
                onChange={e => setDeliveryType(e.target.value)}
              />{" "}
              Vreau PC-ul asamblat de magazin.
            </label>
          </div>

          <div style={{ marginTop: 8 }}>
            <label>CPU</label><br />
            <select value={cpuId} onChange={e => setCpuId(e.target.value)} style={{ width: "100%" }}>
              <option value="">-- alege CPU --</option>
              {cpus.map(cpu => (
                <option key={cpu.id} value={cpu.id}>
                  {cpu.name} ({cpu.price} lei)
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 8 }}>
            <label>GPU</label><br />
            <select value={gpuId} onChange={e => setGpuId(e.target.value)} style={{ width: "100%" }}>
              <option value="">-- alege GPU --</option>
              {gpus.map(gpu => (
                <option key={gpu.id} value={gpu.id}>
                  {gpu.name} ({gpu.price} lei)
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 8 }}>
            <label>Placă de bază</label><br />
            <select value={moboId} onChange={e => setMoboId(e.target.value)} style={{ width: "100%" }}>
              <option value="">-- alege placă de bază --</option>
              {mobos.map(mb => (
                <option key={mb.id} value={mb.id}>
                  {mb.name} ({mb.price} lei)
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 8 }}>
            <label>RAM</label><br />
            <select value={ramId} onChange={e => setRamId(e.target.value)} style={{ width: "100%" }}>
              <option value="">-- alege RAM --</option>
              {rams.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.price} lei)
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 8 }}>
            <label>PSU</label><br />
            <select value={psuId} onChange={e => setPsuId(e.target.value)} style={{ width: "100%" }}>
              <option value="">-- alege sursă --</option>
              {psus.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.price} lei)
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 8 }}>
            <label>Carcasă</label><br />
            <select value={caseId} onChange={e => setCaseId(e.target.value)} style={{ width: "100%" }}>
              <option value="">-- alege carcasă --</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.price} lei)
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary" type="submit" style={{ marginTop: 10 }}>
            Salvează build
          </button>
        </form>
      </div>

      {/* Lista de build-uri existente */}
      <div className="section">
        <h3>Build-urile mele</h3>
        {builds.length === 0 && <p>Nu ai niciun build salvat încă.</p>}

        <div className="product-grid">
          {builds.map(build => (
            <div key={build.id} className="card">
              <h4>{build.name}</h4>
              <p className="text-muted">
                Asamblare de magazin: {build.isAssembledByShop ? "Da" : "Nu"}
              </p>

              {build.components && build.components.length > 0 && (
                <div>
                  <strong>Componente:</strong>
                  {build.components.map(comp => (
                    <div key={comp.id} style={{ marginTop: 4, paddingLeft: 8 }}>
                      <span>
                        {comp.roleInBuild}: {comp.product?.name} (x{comp.quantity})
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 10 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddBuildToCart(build.id)}
                >
                  Adaugă build în coș
                </button>
                <button
                  className="btn btn-outline"
                  style={{ marginLeft: 8 }}
                  onClick={() => handleDeleteBuild(build.id)}
                >
                  Șterge build
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
