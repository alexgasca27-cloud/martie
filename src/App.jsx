import { useMemo, useState } from 'react';
import { ShoppingBag, ChevronRight, Plus, Minus, Coffee, Home, UserRound } from 'lucide-react';

const products = [
  { id: 1, name: 'Latte', description: 'Espresso suave con leche cremosa.', price: 65, category: 'Café' },
  { id: 2, name: 'Cappuccino', description: 'Espresso, leche y espuma.', price: 68, category: 'Café' },
  { id: 3, name: 'Cold Brew', description: 'Café de extracción lenta, frío y refrescante.', price: 72, category: 'Fríos' },
  { id: 4, name: 'Matcha Latte', description: 'Matcha suave con leche cremosa.', price: 78, category: 'Fríos' },
  { id: 5, name: 'Croissant', description: 'Hojaldrado, mantequilloso y recién horneado.', price: 55, category: 'Panadería' },
  { id: 6, name: 'Toast de aguacate', description: 'Pan artesanal, aguacate y semillas.', price: 105, category: 'Comida' }
];

const categories = ['Todo', 'Café', 'Fríos', 'Panadería', 'Comida'];

export default function App() {
  const [category, setCategory] = useState('Todo');
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('home');

  const visible = useMemo(
    () => category === 'Todo' ? products : products.filter(p => p.category === category),
    [category]
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function add(product) {
    setCart(current => {
      const found = current.find(i => i.id === product.id);
      if (found) return current.map(i => i.id === product.id ? {...i, quantity: i.quantity + 1} : i);
      return [...current, {...product, quantity: 1}];
    });
  }

  function change(id, amount) {
    setCart(current => current
      .map(i => i.id === id ? {...i, quantity: i.quantity + amount} : i)
      .filter(i => i.quantity > 0)
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView('home')}>
          <span className="brand-mark">M</span>
          <span>
            <strong>MÁRTIE</strong>
            <small>CAFÉ Y BUENOS MOMENTOS</small>
          </span>
        </button>
        <button className="cart-button" onClick={() => setView('cart')} aria-label="Carrito">
          <ShoppingBag size={21}/>
          {totalItems > 0 && <b>{totalItems}</b>}
        </button>
      </header>

      <main>
        {view === 'home' && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">HECHO PARA TU MOMENTO</span>
                <h1>Café que<br/><em>se disfruta.</em></h1>
                <p>Algo rico, algo tuyo y un buen momento. Pide en Martie y nosotros hacemos el resto.</p>
                <button className="primary" onClick={() => setView('menu')}>
                  Ver menú <ChevronRight size={18}/>
                </button>
              </div>
              <div className="hero-cup"><Coffee size={72} strokeWidth={1.25}/></div>
            </section>

            <section className="section">
              <div className="section-heading">
                <div><span className="eyebrow">PARA EMPEZAR</span><h2>Lo más pedido</h2></div>
                <button className="text-button" onClick={() => setView('menu')}>Ver todo <ChevronRight size={16}/></button>
              </div>
              <div className="product-row">
                {products.slice(0,3).map(p => <ProductCard key={p.id} product={p} add={add}/>)}
              </div>
            </section>
          </>
        )}

        {view === 'menu' && (
          <section className="section page">
            <span className="eyebrow">MARTIE</span>
            <h1>Menú</h1>
            <div className="categories">
              {categories.map(c => <button className={category === c ? 'active' : ''} key={c} onClick={() => setCategory(c)}>{c}</button>)}
            </div>
            <div className="product-grid">
              {visible.map(p => <ProductCard key={p.id} product={p} add={add}/>)}
            </div>
          </section>
        )}

        {view === 'cart' && (
          <section className="section page">
            <span className="eyebrow">TU PEDIDO</span>
            <h1>Carrito</h1>
            {cart.length === 0 ? (
              <div className="empty"><ShoppingBag size={34}/><h3>Tu carrito está vacío</h3><p>Agrega algo rico para empezar.</p><button className="primary" onClick={() => setView('menu')}>Ver menú</button></div>
            ) : (
              <>
                <div className="cart-list">
                  {cart.map(item => (
                    <div className="cart-item" key={item.id}>
                      <div><strong>{item.name}</strong><small>{item.description}</small></div>
                      <div className="qty"><button onClick={() => change(item.id,-1)}><Minus size={15}/></button><span>{item.quantity}</span><button onClick={() => change(item.id,1)}><Plus size={15}/></button></div>
                      <strong>${item.price * item.quantity}</strong>
                    </div>
                  ))}
                </div>
                <div className="summary">
                  <div><span>Subtotal</span><strong>${total}</strong></div>
                  <div><span>Envío</span><span>Se calcula después</span></div>
                  <div className="grand"><span>Total</span><strong>${total}</strong></div>
                  <button className="primary full">Continuar pedido <ChevronRight size={18}/></button>
                </div>
              </>
            )}
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        <NavButton icon={<Home size={20}/>} label="Inicio" active={view==='home'} onClick={() => setView('home')}/>
        <NavButton icon={<Coffee size={20}/>} label="Menú" active={view==='menu'} onClick={() => setView('menu')}/>
        <NavButton icon={<ShoppingBag size={20}/>} label="Pedido" active={view==='cart'} onClick={() => setView('cart')} badge={totalItems}/>
        <NavButton icon={<UserRound size={20}/>} label="Perfil" />
      </nav>
    </div>
  );
}

function ProductCard({ product, add }) {
  return (
    <article className="product-card">
      <div className="product-image"><Coffee size={35} strokeWidth={1.25}/></div>
      <div className="product-info">
        <div><h3>{product.name}</h3><span>{product.category}</span></div>
        <p>{product.description}</p>
        <div className="product-bottom"><strong>${product.price}</strong><button onClick={() => add(product)} aria-label={'Agregar ' + product.name}><Plus size={18}/></button></div>
      </div>
    </article>
  );
}

function NavButton({ icon, label, active, onClick, badge }) {
  return <button className={active ? 'nav-item active' : 'nav-item'} onClick={onClick}>
    <span className="nav-icon">{icon}{badge ? <b>{badge}</b> : null}</span><small>{label}</small>
  </button>
}
