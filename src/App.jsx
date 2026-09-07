import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const demoCategories = [
  { id: "all", name: "Todo" },
  { id: "coffee", name: "Café" },
  { id: "cold", name: "Fríos" },
  { id: "food", name: "Comida" },
  { id: "sweet", name: "Dulce" }
];

const demoProducts = [
  {
    id: "demo-1",
    name: "Latte Martie",
    description: "Espresso suave, leche cremosa y ese toque especial de Martie.",
    price: 68,
    category: "coffee",
    emoji: "☕",
    featured: true
  },
  {
    id: "demo-2",
    name: "Matcha Latte",
    description: "Matcha cremoso y equilibrado, servido frío o caliente.",
    price: 74,
    category: "coffee",
    emoji: "🍵",
    featured: true
  },
  {
    id: "demo-3",
    name: "Cold Brew",
    description: "Café de extracción lenta, fresco y con carácter.",
    price: 65,
    category: "cold",
    emoji: "🧊",
    featured: true
  },
  {
    id: "demo-4",
    name: "Croissant",
    description: "Hojaldre dorado, ligero y recién horneado.",
    price: 49,
    category: "sweet",
    emoji: "🥐",
    featured: false
  },
  {
    id: "demo-5",
    name: "Toast Martie",
    description: "Pan artesanal con ingredientes frescos y mucho sabor.",
    price: 89,
    category: "food",
    emoji: "🍞",
    featured: false
  },
  {
    id: "demo-6",
    name: "Iced Caramel",
    description: "Espresso, leche, hielo y caramelo.",
    price: 76,
    category: "cold",
    emoji: "🥤",
    featured: false
  }
];

function money(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  }).format(value);
}

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(demoCategories);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("martie_cart");
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("martie_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setProducts(demoProducts);
        setLoading(false);
        return;
      }

      try {
        const { data: cats } = await supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true });

        const { data: prods } = await supabase
          .from("products")
          .select("*")
          .order("sort_order", { ascending: true });

        if (cats?.length) {
          setCategories([
            { id: "all", name: "Todo" },
            ...cats.map(c => ({ id: c.id, name: c.name }))
          ]);
        }

        if (prods?.length) {
          setProducts(prods.map(p => ({
            ...p,
            price: Number(p.base_price ?? p.price ?? 0),
            category: p.category_id ?? p.category ?? "",
            emoji: "☕"
          })));
        } else {
          setProducts(demoProducts);
        }
      } catch {
        setProducts(demoProducts);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter(p => String(p.category) === String(activeCategory));
  }, [products, activeCategory]);

  const featured = products.filter(p => p.featured || p.is_featured).slice(0, 3);
  const visibleFeatured = featured.length ? featured : products.slice(0, 3);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function addToCart(product) {
    setCart(prev => {
      const found = prev.find(item => item.id === product.id);
      if (found) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        emoji: product.emoji || "☕"
      }];
    });
    setSelectedProduct(null);
  }

  function changeQuantity(id, amount) {
    setCart(prev =>
      prev
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  function goMenu(category = "all") {
    setActiveCategory(category);
    setActiveTab("menu");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setActiveTab("home")} aria-label="Ir al inicio">
          <span className="brand-mark">M</span>
          <span>
            <strong>MARTIE</strong>
            <small>CAFÉ Y BUENOS MOMENTOS</small>
          </span>
        </button>

        <button className="club-pill" onClick={() => setActiveTab("profile")}>
          <span>✦</span> Martie Club
        </button>
      </header>

      <main>
        {activeTab === "home" && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">BUENOS DÍAS, BUENOS MOMENTOS</span>
                <h1>Tu café,<br /><em>a tu manera.</em></h1>
                <p>Un espacio para bajar el ritmo, pedir algo rico y disfrutar el momento.</p>
                <button className="primary-btn" onClick={() => goMenu()}>
                  Ver menú <span>→</span>
                </button>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="sun"></div>
                <div className="cup">
                  <div className="cup-steam s1"></div>
                  <div className="cup-steam s2"></div>
                  <div className="cup-body">☕</div>
                  <div className="cup-handle"></div>
                </div>
                <span className="doodle d1">mmm...</span>
                <span className="doodle d2">♡</span>
              </div>
            </section>

            <section className="section">
              <div className="section-head">
                <div>
                  <span className="eyebrow">PARA HOY</span>
                  <h2>Lo que se antoja</h2>
                </div>
                <button className="text-btn" onClick={() => goMenu()}>Ver todo →</button>
              </div>

              <div className="category-row">
                {categories.filter(c => c.id !== "all").slice(0, 4).map(cat => (
                  <button key={cat.id} className="category-chip" onClick={() => goMenu(cat.id)}>
                    {cat.name}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="loading">Preparando el menú…</div>
              ) : (
                <div className="product-grid">
                  {visibleFeatured.map(product => (
                    <ProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
                  ))}
                </div>
              )}
            </section>

            <section className="club-banner">
              <div>
                <span className="eyebrow">MARTIE CLUB</span>
                <h2>Cada café cuenta.</h2>
                <p>Acumula puntos en tus compras y descubre beneficios especiales.</p>
              </div>
              <button className="secondary-btn" onClick={() => setActiveTab("profile")}>Conocer Club</button>
            </section>
          </>
        )}

        {activeTab === "menu" && (
          <section className="section menu-page">
            <div className="page-title">
              <span className="eyebrow">MARTIE</span>
              <h1>Menú</h1>
              <p>Elige tus favoritos y personalízalos a tu gusto.</p>
            </div>

            <div className="category-row menu-categories">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-chip ${activeCategory === cat.id ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="loading">Cargando menú…</div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "orders" && (
          <section className="section empty-page">
            <div className="empty-icon">☕</div>
            <span className="eyebrow">MIS PEDIDOS</span>
            <h1>Aquí aparecerán tus pedidos</h1>
            <p>Cuando hagas tu primer pedido podrás consultar su estado y volver a pedirlo fácilmente.</p>
            <button className="primary-btn" onClick={() => goMenu()}>Hacer un pedido</button>
          </section>
        )}

        {activeTab === "profile" && (
          <section className="section profile-page">
            <div className="page-title">
              <span className="eyebrow">MARTIE CLUB</span>
              <h1>Tu momento, tus puntos.</h1>
              <p>Inicia sesión para consultar tus pedidos, puntos y beneficios.</p>
            </div>
            <div className="club-card">
              <div className="club-star">✦</div>
              <div>
                <span>ACUMULA PUNTOS</span>
                <strong>10 puntos</strong>
                <small>por cada $100 MXN de compra</small>
              </div>
            </div>
            <button className="primary-btn full" onClick={() => alert("El acceso a Martie Club se conectará con Supabase Auth en el siguiente módulo.")}>
              Iniciar sesión
            </button>
          </section>
        )}
      </main>

      {cartCount > 0 && (
        <button className="cart-float" onClick={() => alert("El carrito completo se habilitará en el siguiente módulo.")}>
          <span>🛒</span>
          <strong>{cartCount}</strong>
          <b>{money(cartTotal)}</b>
        </button>
      )}

      <nav className="bottom-nav">
        <NavItem icon="⌂" label="Inicio" active={activeTab === "home"} onClick={() => setActiveTab("home")} />
        <NavItem icon="☕" label="Menú" active={activeTab === "menu"} onClick={() => goMenu()} />
        <NavItem icon="▣" label="Pedidos" active={activeTab === "orders"} onClick={() => setActiveTab("orders")} />
        <NavItem icon="○" label="Perfil" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
      </nav>

      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedProduct(null)}>×</button>
            <div className="modal-product-art">{selectedProduct.emoji || "☕"}</div>
            <span className="eyebrow">MARTIE</span>
            <h2>{selectedProduct.name}</h2>
            <p>{selectedProduct.description}</p>
            <div className="modal-bottom">
              <strong>{money(selectedProduct.price)}</strong>
              <button className="primary-btn" onClick={() => addToCart(selectedProduct)}>Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      <span>{icon}</span>
      <small>{label}</small>
    </button>
  );
}

function ProductCard({ product, onClick }) {
  const unavailable = product.is_available === false || product.available === false;
  return (
    <article className={`product-card ${unavailable ? "unavailable" : ""}`} onClick={!unavailable ? onClick : undefined}>
      <div className="product-art">
        <span>{product.emoji || "☕"}</span>
        {product.is_new && <i>NUEVO</i>}
        {unavailable && <div className="soldout">Agotado</div>}
      </div>
      <div className="product-info">
        <div>
          <h3>{product.name}</h3>
          <p>{product.description || "Una opción deliciosa de Martie."}</p>
        </div>
        <strong>{money(product.price)}</strong>
      </div>
    </article>
  );
}

export default App;