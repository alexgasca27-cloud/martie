import React,{useEffect,useState} from "react";
import {supabase,supabaseReady} from "./lib/supabase";

const FALLBACK=[
{id:1,name:"Latte",desc:"Espresso + leche cremosa.",price:49,cat:"Café",img:"/images/latte.jpg"},
{id:2,name:"Iced Latte",desc:"Café frío, mismo gran sabor.",price:55,cat:"Bebidas frías",img:"/images/iced-latte.jpg"},
{id:3,name:"Matcha Latte",desc:"Energía natural.",price:59,cat:"Café",img:"/images/matcha.jpg"},
{id:4,name:"Croissant",desc:"Hojaldre perfecto.",price:45,cat:"Postres",img:"/images/croissant.jpg"},
{id:5,name:"Bowl de Frutas",desc:"Frescura en cada bocado.",price:69,cat:"Comida",img:"/images/bowl.jpg"},
{id:6,name:"Smoothie Fresa",desc:"Natural y delicioso.",price:55,cat:"Bebidas frías",img:"/images/smoothie.jpg"}
];
const CATS=["Todos","Café","Bebidas frías","Comida","Postres"];
const money=n=>new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(n);

function normalizeProduct(p){
 const name=p.name??p.nombre??"Producto";
 const price=Number(p.price??p.base_price??p.precio??0);
 const desc=p.description??p.descripcion??"";
 const cat=p.category_name??p.category??p.categoria??"Café";
 const image=p.image_url??p.image??p.imagen_url??p.imagen??"/images/latte.jpg";
 return {id:p.id??name,name,desc,price,cat,img:image,available:p.is_available??p.available??p.disponible??true};
}
function normalizeCategory(c){return c.name??c.nombre??c.title??"Categoría"}

export default function App(){
 const [screen,setScreen]=useState("home"),[cat,setCat]=useState("Todos"),[products,setProducts]=useState(FALLBACK),[categories,setCategories]=useState(CATS),[loading,setLoading]=useState(true),[source,setSource]=useState("demo");
 const [product,setProduct]=useState(null),[cart,setCart]=useState([]);
 const [size,setSize]=useState("Chico"),[milk,setMilk]=useState("Entera"),[extras,setExtras]=useState([]),[qty,setQty]=useState(1);
 useEffect(()=>{loadMenu()},[]);
 async function loadMenu(){
  if(!supabaseReady){setLoading(false);return}
  try{
   const [{data:cs,error:ce},{data:ps,error:pe}]=await Promise.all([
    supabase.from("categories").select("*"),
    supabase.from("products").select("*")
   ]);
   if(ce||pe) throw ce||pe;
   const pc=(ps||[]).map(normalizeProduct).filter(p=>p.available);
   if(pc.length){setProducts(pc);setSource("supabase")}
   if((cs||[]).length)setCategories(["Todos",...(cs||[]).map(normalizeCategory)]);
  }catch(e){console.warn("Martie: menú demo por ahora.",e)}
  finally{setLoading(false)}
 }
 const shown=cat==="Todos"?products:products.filter(p=>p.cat===cat);
 const cartCount=cart.reduce((a,x)=>a+x.qty,0),cartTotal=cart.reduce((a,x)=>a+x.qty*x.price,0);
 const extra={"Shot extra":12,Vainilla:8,Caramelo:8,Canela:8};
 const sizeDelta={Chico:0,Mediano:6,Grande:12};
 const detailTotal=product?product.price+(sizeDelta[size]||0)+extras.reduce((a,x)=>a+extra[x],0):0;
 const open=p=>{setProduct(p);setSize("Chico");setMilk("Entera");setExtras([]);setQty(1)};
 const menu=c=>{setCat(c);setScreen("menu");window.scrollTo(0,0)};
 const add=()=>{if(!product)return;setCart(c=>[...c,{id:Date.now(),name:product.name,price:detailTotal,qty,detail:`${size} · ${milk}`,img:product.img}]);setProduct(null)};
 const toggle=e=>setExtras(x=>x.includes(e)?x.filter(v=>v!==e):[...x,e]);

 return <div className="app">
  <header className="topbar">
   <button className="logoBtn" onClick={()=>setScreen("home")}><img src="/branding/martie-logo.png" alt="Martie"/></button>
   <button className="clubTop" onClick={()=>setScreen("club")}>✦ Martie Club</button>
  </header>
  {screen==="home"&&<Home menu={menu} open={open} products={products}/>}
  {screen==="menu"&&<Menu cat={cat} setCat={setCat} shown={shown} open={open} categories={categories} loading={loading} source={source}/>}
  {screen==="club"&&<Club/>}
  {screen==="orders"&&<Orders cart={cart} total={cartTotal}/>}
  {cartCount>0&&<button className="cartBar" onClick={()=>setScreen("orders")}><span>🛒</span><b>{cartCount}</b><strong>{money(cartTotal)}</strong></button>}
  <nav className="bottom">
   <Nav label="Inicio" icon="⌂" active={screen==="home"} onClick={()=>setScreen("home")}/>
   <Nav label="Menú" icon="☕" active={screen==="menu"} onClick={()=>menu("Todos")}/>
   <Nav label="Pedidos" icon="▣" active={screen==="orders"} onClick={()=>setScreen("orders")}/>
   <Nav label="Perfil" icon="○" active={screen==="club"} onClick={()=>setScreen("club")}/>
  </nav>
  {product&&<div className="overlay" onClick={()=>setProduct(null)}>
   <section className="detail" onClick={e=>e.stopPropagation()}>
    <button className="close" onClick={()=>setProduct(null)}>×</button>
    <img className="detailImg" src={product.img} alt=""/>
    <div className="detailTitle"><div><h2>Personaliza tu {product.name}</h2><p>{product.desc}</p></div><strong>{money(detailTotal)}</strong></div>
    <Options title="Tamaño" values={["Chico","Mediano","Grande"]} selected={size} set={setSize} deltas={sizeDelta}/>
    <Options title="Tipo de leche" values={["Entera","Deslactosada","Almendra","Avena"]} selected={milk} set={setMilk}/>
    <div className="extras"><h4>Extras</h4>{Object.entries(extra).map(([e,v])=><label key={e}><input type="checkbox" checked={extras.includes(e)} onChange={()=>toggle(e)}/>{e}<span>+ {money(v)}</span></label>)}</div>
    <div className="qty"><button onClick={()=>setQty(Math.max(1,qty-1))}>−</button><b>{qty}</b><button onClick={()=>setQty(qty+1)}>+</button></div>
    <button className="add" onClick={add}>Agregar al carrito <i>|</i> {money(detailTotal*qty)}</button>
   </section>
  </div>}
 </div>
}
function Home({menu,open,products}){return <main>
 <section className="hero">
  <div className="heroText"><span className="kicker">BUENOS DÍAS, BUENOS MOMENTOS</span><h1>Tu café,<br/><em>a tu manera.</em></h1><p>Un espacio para bajar el ritmo, pedir algo rico y disfrutar el momento.</p><button className="dark" onClick={()=>menu("Todos")}>Ver menú <b>→</b></button></div>
  <div className="heroArt"><div className="blob"></div><img className="heroPhoto" src="/images/hero-latte.jpg" alt="Latte Martie"/><img className="character" src="/branding/martie-character.png" alt=""/><span className="scribble">mmm...</span></div><span className="heroHeart">♡</span>
 </section>
 <section className="section"><div className="heading"><div><span className="kicker">PARA HOY</span><h2>Lo que se antoja</h2></div><button onClick={()=>menu("Todos")}>Ver todo →</button></div><div className="chips">{["Café","Bebidas frías","Comida","Postres"].map(x=><button key={x} onClick={()=>menu(x)}>{x==="Bebidas frías"?"Bebidas":x}</button>)}</div><div className="miniGrid">{products.slice(0,3).map(p=><Mini key={p.id} p={p} open={open}/>)}</div></section>
 <section className="moment section"><div><span className="kicker">MOMENTOS MARTIE</span><h2>Pequeños<br/><em>momentos,</em><br/>grandes días.</h2></div><img src="/branding/martie-character.png" alt=""/></section>
 <section className="club section"><div><span className="kicker">MARTIE CLUB</span><h2>Más café,<br/>más momentos.</h2><button className="soft" onClick={()=>document.querySelector(".clubTop")?.click()}>Conocer beneficios →</button></div><img src="/branding/martie-character.png" alt=""/></section>
 <footer><img src="/branding/martie-logo.png" alt="Martie"/><p>Momentos que saben mejor ♡</p></footer>
 </main>}
function Menu({cat,setCat,shown,open,categories,loading,source}){return <main className="section page"><span className="kicker">MARTIE</span><h1>Nuestro menú</h1><p className="sub">Café, bebidas y más para cada momento.</p><div className="chips">{categories.map(c=><button className={cat===c?"active":""} key={c} onClick={()=>setCat(c)}>{c}</button>)}</div>{loading&&<div className="menuLoading">Cargando menú…</div>}<div className="grid">{shown.map(p=><Mini key={p.id} p={p} open={open} large/>)}</div>{!loading&&!shown.length&&<div className="menuLoading">No hay productos disponibles en esta categoría.</div>}<div className="inlineClub"><div><h2>Martie Club</h2><p>Más café, más momentos.</p><button className="soft">Conocer beneficios →</button></div><img src="/branding/martie-character.png" alt=""/></div></main>}
function Club(){return <main className="section profile"><img className="profileLogo" src="/branding/martie-logo.png" alt="Martie"/><div className="promo pink"><h1>Martie Club</h1><p>Más café, más momentos.</p><button className="soft">Conocer beneficios →</button></div><div className="promo green"><h2>Pequeños<br/><em>momentos,</em><br/>grandes días.</h2><img src="/branding/martie-character.png" alt=""/></div><div className="list">{[["♧","Recompensas","Acumula puntos y gana bebidas."],["☆","Promociones","Acceso a ofertas especiales."],["♡","Tus favoritos","Guarda lo que más te gusta."],["☕","Historial de pedidos","Revive tus momentos Martie."]].map(x=><button key={x[1]}><span>{x[0]}</span><div><b>{x[1]}</b><small>{x[2]}</small></div><strong>›</strong></button>)}</div><div className="profilePhoto"><img src="/images/club-latte.jpg" alt=""/><span>Momentos que<br/><em>saben mejor</em> ♡</span></div></main>}
function Orders({cart,total}){return <main className="section empty"><div>☕</div><span className="kicker">MIS PEDIDOS</span><h1>{cart.length?"Tu pedido está listo para continuar.":"Momentos que vuelven."}</h1><p>{cart.length?`${cart.reduce((a,x)=>a+x.qty,0)} productos · ${money(total)}`:"Aquí aparecerán tus pedidos y su seguimiento."}</p></main>}
function Mini({p,open,large}){return <article className={large?"card large":"mini"} onClick={()=>open(p)}><img src={p.img} alt={p.name}/><div><div><b>{p.name}</b><small>{p.desc}</small></div><strong>{money(p.price)}</strong></div>{large&&<button className="personalizeBtn">Personalizar</button>}</article>}
function Options({title,values,selected,set,deltas={}}){return <div className="option"><h4>{title}</h4><div>{values.map(v=><button className={selected===v?"selected":""} key={v} onClick={()=>set(v)}>{v}{deltas[v]?` + ${money(deltas[v])}`:""}</button>)}</div></div>}
function Nav({label,icon,active,onClick}){return <button className={active?"nav active":"nav"} onClick={onClick}><span>{icon}</span><small>{label}</small></button>}
