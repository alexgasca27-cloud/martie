import { useMemo, useState } from "react";

const categories = ["Todos", "Café", "Bebidas frías", "Comida", "Postres"];

const products = [
  { id: 1, name: "Latte", description: "Espresso + leche cremosa.", price: 49, category: "Café", image: "/images/latte.jpg" },
  { id: 2, name: "Iced Latte", description: "Café frío, mismo gran sabor.", price: 55, category: "Bebidas frías", image: "/images/iced-latte.jpg" },
  { id: 3, name: "Matcha Latte", description: "Energía natural.", price: 59, category: "Café", image: "/images/matcha.jpg" },
  { id: 4, name: "Croissant", description: "Hojaldre perfecto.", price: 45, category: "Postres", image: "/images/croissant.jpg" },
  { id: 5, name: "Bowl de Frutas", description: "Frescura en cada bocado.", price: 69, category: "Comida", image: "/images/bowl.jpg" },
  { id: 6, name: "Smoothie Fresa", description: "Natural y delicioso.", price: 55, category: "Bebidas frías", image: "/images/smoothie.jpg" },
];

const money = n => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

export default function App() {
  const [tab, setTab] = useState("home");
  const [category, setCategory] = useState("Todos");
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);
  const [size, setSize] = useState("Chico");
  const [milk, setMilk] = useState("Entera");
  const [extras, setExtras] = useState([]);
  const [qty, setQty] = useState(1);

  const filtered = useMemo(
    () => category === "Todos" ? products : products.filter(p => p.category === category),
    [category]
  );

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const extraPrices = { "Shot extra": 12, Vainilla: 8, Caramelo: 8, Canela: 8 };
  const selectedTotal = selected
    ? selected.price + extras.reduce((s, e) => s + extraPrices[e], 0)
    : 0;

  function openProduct(p) {
    setSelected(p);
    setSize("Chico");
    setMilk("Entera");
    setExtras([]);
    setQty(1);
  }

  function toggleExtra(e) {
    setExtras(x => x.includes(e) ? x.filter(v => v !== e) : [...x, e]);
  }

  function addSelected() {
    if (!selected) return;
    const item = {
      id: `${selected.id}-${size}-${milk}-${extras.join(",")}`,
      name: selected.name,
      price: selectedTotal,
      qty,
      detail: `${size} · ${milk}${extras.length ? ` · ${extras.join(", ")}` : ""}`,
      image: selected.image
    };
    setCart(prev => [...prev, item]);
    setSelected(null);
    setTab("home");
  }

  function goMenu(cat = "Todos") {
    setCategory(cat);
    setTab("menu");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app">
      <header className="top">
        <button className="logo-button" onClick={() => setTab("home")}>
          <img src="/branding/martie-logo-transparent.png" alt="Martie" />
        </button>
        <button className="club-top" onClick={() => setTab("profile")}>✦&nbsp; Martie Club</button>
      </header>

      {tab === "home" && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <span className="kicker">BUENOS DÍAS,</span>
              <h1>Tu café,<br /><i>a tu manera.</i></h1>
              <p>Un espacio para bajar el ritmo, pedir algo rico y disfrutar el momento.</p>
              <button className="dark-btn" onClick={() => goMenu()}>Ver menú <b>→</b></button>
            </div>
            <div className="hero-visual">
              <div className="organic"></div>
              <img className="hero-cup" src="/images/hero-latte.jpg" alt="" />
              <img className="hero-character" src="/branding/martie-character.png" alt="" />
              <span className="scribble">mmm...</span>
            </div>
            <span className="heart">♡</span>
          </section>

          <section className="today section">
            <div className="section-title">
              <div><span className="kicker">PARA HOY</span><h2>Lo que se antoja</h2></div>
              <button onClick={() => goMenu()}>Ver todo →</button>
            </div>
            <div className="chips">
              {categories.slice(1).map(c => <button key={c} onClick={() => goMenu(c)}>{c}</button>)}
            </div>
            <div className="mini-grid">
              {products.slice(0, 3).map(p => <MiniCard key={p.id} product={p} onClick={() => openProduct(p)} />)}
            </div>
          </section>

          <section className="moment section">
            <div>
              <span className="kicker">MOMENTOS MARTIE</span>
              <h2>Pequeños<br /><i>momentos,</i><br />grandes días.</h2>
            </div>
            <img src="/branding/martie-character.png" alt="" />
            <span className="spark">✦</span>
          </section>

          <section className="club-card section">
            <div>
              <span className="kicker">MARTIE CLUB</span>
              <h2>Más café,<br />más momentos.</h2>
              <button className="soft-btn" onClick={() => setTab("profile")}>Conocer beneficios&nbsp; →</button>
            </div>
            <img src="/branding/martie-character.png" alt="" />
          </section>

          <footer className="signature">
            <img src="/branding/martie-logo-transparent.png" alt="Martie" />
            <p>Momentos que saben mejor ♡</p>
          </footer>
        </>
      )}

      {tab === "menu" && (
        <main className="section page">
          <div className="page-heading">
            <span className="kicker">MARTIE</span>
            <h1>Nuestro menú</h1>
            <p>Café, bebidas y más para cada momento.</p>
          </div>
          <div className="chips menu-chips">
            {categories.map(c => <button className={category === c ? "active" : ""} key={c} onClick={() => setCategory(c)}>{c}</button>)}
          </div>
          <div className="menu-grid">
            {filtered.map(p => <ProductCard key={p.id} product={p} onClick={() => openProduct(p)} />)}
          </div>
          <div className="club-inline">
            <div><h2>Martie Club</h2><p>Más café, más momentos.</p><button className="soft-btn" onClick={() => setTab("profile")}>Conocer beneficios →</button></div>
            <img src="/branding/martie-character.png" alt="" />
          </div>
        </main>
      )}

      {tab === "orders" && (
        <main className="section page empty">
          <div className="empty-art">☕</div>
          <span className="kicker">MIS PEDIDOS</span>
          <h1>Momentos que vuelven.</h1>
          <p>Aquí podrás consultar el estado de tus pedidos y pedir nuevamente tus favoritos.</p>
          {cart.length ? <button className="dark-btn" onClick={() => setTab("menu")}>Seguir comprando →</button> : <button className="dark-btn" onClick={() => goMenu()}>Hacer un pedido →</button>}
        </main>
      )}

      {tab === "profile" && (
        <main className="section profile">
          <div className="profile-head"><img src="/branding/martie-logo-transparent.png" alt="Martie" /></div>
          <section className="profile-promo pink"><h1>Martie Club</h1><p>Más café, más momentos.</p><button className="soft-btn">Conocer beneficios →</button></section>
          <section className="profile-promo green"><h2>Pequeños <i>momentos,</i><br />grandes días.</h2><img src="/branding/martie-character.png" alt="" /></section>
          <div className="profile-list">
            {[
              ["♧", "Recompensas", "Acumula puntos y gana bebidas."],
              ["☆", "Promociones", "Acceso a ofertas especiales."],
              ["♡", "Tus favoritos", "Guarda lo que más te gusta."],
              ["☕", "Historial de pedidos", "Revive tus momentos Martie."]
            ].map(([icon,title,desc]) => <button key={title}><span>{icon}</span><div><b>{title}</b><small>{desc}</small></div><strong>›</strong></button>)}
          </div>
          <div className="profile-photo"><img src="/images/club-latte.jpg" alt="" /><span>Momentos que<br /><i>saben mejor</i> ♡</span></div>
        </main>
      )}

      {count > 0 && <button className="cart-pill" onClick={() => setTab("orders")}><span>🛒</span><b>{count}</b><strong>{money(total)}</strong></button>}

      <nav className="bottom">
        <Nav icon="⌂" label="Inicio" active={tab === "home"} onClick={() => setTab("home")} />
        <Nav icon="☕" label="Menú" active={tab === "menu"} onClick={() => goMenu()} />
        <Nav icon="▣" label="Pedidos" active={tab === "orders"} onClick={() => setTab("orders")} />
        <Nav icon="○" label="Perfil" active={tab === "profile"} onClick={() => setTab("profile")} />
      </nav>

      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="product-detail" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>×</button>
            <div className="detail-photo"><img src={selected.image} alt="" /></div>
            <div className="detail-head"><div><h2>{selected.name}</h2><p>{selected.description}</p></div><strong>{money(selected.price)}</strong></div>
            <Option title="Tamaño" values={["Chico","Mediano","Grande"]} selected={size} onSelect={setSize} />
            <Option title="Tipo de leche" values={["Entera","Deslactosada","Almendra","Avena"]} selected={milk} onSelect={setMilk} />
            <div className="option-block"><h4>Extras</h4>{Object.keys(extraPrices).map(e => <label key={e}><input type="checkbox" checked={extras.includes(e)} onChange={() => toggleExtra(e)} /><span>{e}</span><b>+ {money(extraPrices[e])}</b></label>)}</div>
            <div className="qty"><button onClick={() => setQty(Math.max(1, qty - 1))}>−</button><b>{qty}</b><button onClick={() => setQty(qty + 1)}>+</button></div>
            <button className="add-btn" onClick={addSelected}>Agregar al carrito <span>|</span> {money(selectedTotal * qty)}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniCard({ product, onClick }) {
  return <article className="mini-card" onClick={onClick}><img src={product.image} alt="" /><div><b>{product.name}</b><strong>{money(product.price)}</strong></div></article>;
}
function ProductCard({ product, onClick }) {
  return <article className="product-card" onClick={onClick}><img src={product.image} alt="" /><div><div><h3>{product.name}</h3><p>{product.description}</p></div><strong>{money(product.price)}</strong></div><button>+</button></article>;
}
function Option({ title, values, selected, onSelect }) {
  return <div className="option-block"><h4>{title}</h4><div className="options">{values.map(v => <button className={v === selected ? "selected" : ""} key={v} onClick={() => onSelect(v)}>{v}</button>)}</div></div>;
}
function Nav({ icon, label, active, onClick }) {
  return <button className={active ? "nav-item active" : "nav-item"} onClick={onClick}><span>{icon}</span><small>{label}</small></button>;
}