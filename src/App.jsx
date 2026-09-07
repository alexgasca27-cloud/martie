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

function pick(o,keys,def=null){for(const k of keys){if(o?.[k]!==undefined&&o?.[k]!==null)return o[k]}return def}
function normalizeProduct(p){
 const name=pick(p,["name","nombre"],"Producto");
 const price=Number(pick(p,["price","base_price","precio"],0));
 const desc=pick(p,["description","descripcion"],"");
 const cat=pick(p,["category_name","category","categoria"],"Café");
 const image=pick(p,["image_url","image","imagen_url","imagen"],"/images/latte.jpg");
 return {id:pick(p,["id"],name),name,desc,price,cat,img:image,available:Boolean(pick(p,["is_available","available","disponible"],true))};
}
function normalizeCategory(c){return pick(c,["name","nombre","title"],"Categoría")}
function normalizeOption(o){
 return {
  id:pick(o,["id"],Math.random()),
  name:pick(o,["name","title","label","nombre"],"Opción"),
  required:Boolean(pick(o,["required","is_required","obligatory","obligatoria"],false)),
  type:String(pick(o,["selection_type","type","input_type","tipo"],"single")).toLowerCase(),
  max:Number(pick(o,["max_selections","max","maximum"],0))||0,
  order:Number(pick(o,["display_order","sort_order","order","orden"],0))||0
 };
}
function normalizeValue(v){
 return {
  id:pick(v,["id"],Math.random()),
  optionId:pick(v,["option_id","product_option_id","productOptionId"],null),
  name:pick(v,["name","label","value","nombre"],"Opción"),
  delta:Number(pick(v,["price_delta","price_adjustment","additional_price","extra_price","precio_extra","price"],0))||0,
  available:Boolean(pick(v,["is_available","available","disponible"],true)),
  order:Number(pick(v,["display_order","sort_order","order","orden"],0))||0
 };
}

export default function App(){
 const [screen,setScreen]=useState("home"),[cat,setCat]=useState("Todos"),[products,setProducts]=useState(FALLBACK),[categories,setCategories]=useState(CATS),[loading,setLoading]=useState(true),[source,setSource]=useState("demo");
 const [product,setProduct]=useState(null),[cart,setCart]=useState([]),[optionMap,setOptionMap]=useState({});
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

   // Options are loaded independently. If the option tables are not populated yet,
   // the product uses the demo defaults below.
   const [{data:os,error:oe},{data:vs,error:ve}]=await Promise.all([
    supabase.from("product_options").select("*"),
    supabase.from("product_option_values").select("*")
   ]);
   if(!oe&&!ve){
    const opts=(os||[]).map(normalizeOption).sort((a,b)=>a.order-b.order);
    const vals=(vs||[]).map(normalizeValue).filter(v=>v.available).sort((a,b)=>a.order-b.order);
    const grouped={};
    for(const o of opts){
      grouped[o.id]={...o,values:vals.filter(v=>String(v.optionId)===String(o.id))};
    }
    const byProduct={};
    for(const o of opts){
      const pid=pick(os.find(x=>String(pick(x,["id"]))===String(o.id)),["product_id","productId","producto_id"],null);
      if(pid!==null){(byProduct[pid]??=[]).push(grouped[o.id])}
    }
    setOptionMap(byProduct);
   }
  }catch(e){console.warn("Martie: menú demo por ahora.",e)}
  finally{setLoading(false)}
 }
 const shown=cat==="Todos"?products:products.filter(p=>p.cat===cat);
 const cartCount=cart.reduce((a,x)=>a+x.qty,0),cartTotal=cart.reduce((a,x)=>a+x.qty*x.price,0);
 const demoConfigs={
  "Café":[
    {id:"size",name:"Tamaño",type:"single",values:[{id:"s1",name:"Chico",delta:0},{id:"s2",name:"Mediano",delta:6},{id:"s3",name:"Grande",delta:12}]},
    {id:"milk",name:"Tipo de leche",type:"single",values:[{id:"m1",name:"Entera",delta:0},{id:"m2",name:"Deslactosada",delta:0},{id:"m3",name:"Almendra",delta:0},{id:"m4",name:"Avena",delta:0}]},
    {id:"extras",name:"Extras",type:"multi",max:4,values:[{id:"e1",name:"Shot extra",delta:12},{id:"e2",name:"Vainilla",delta:8},{id:"e3",name:"Caramelo",delta:8},{id:"e4",name:"Canela",delta:8}]}
  ],
  "Matcha":[
    {id:"size",name:"Tamaño",type:"single",values:[{id:"s1",name:"Chico",delta:0},{id:"s2",name:"Mediano",delta:6},{id:"s3",name:"Grande",delta:12}]},
    {id:"milk",name:"Tipo de leche",type:"single",values:[{id:"m1",name:"Entera",delta:0},{id:"m2",name:"Deslactosada",delta:0},{id:"m3",name:"Almendra",delta:0},{id:"m4",name:"Avena",delta:0}]},
    {id:"sweet",name:"Endulzante",type:"single",values:[{id:"w1",name:"Sin azúcar",delta:0},{id:"w2",name:"Miel",delta:5},{id:"w3",name:"Stevia",delta:0}]}
  ],
  "Bebidas frías":[
    {id:"size",name:"Tamaño",type:"single",values:[{id:"s1",name:"Chico",delta:0},{id:"s2",name:"Mediano",delta:6},{id:"s3",name:"Grande",delta:12}]},
    {id:"extras",name:"Extras",type:"multi",max:3,values:[{id:"e1",name:"Vainilla",delta:8},{id:"e2",name:"Caramelo",delta:8},{id:"e3",name:"Shot extra",delta:12}]}
  ],
  "Postres":[{id:"filling",name:"Relleno",type:"single",values:[{id:"f1",name:"Natural",delta:0},{id:"f2",name:"Chocolate",delta:8},{id:"f3",name:"Almendra",delta:10}]}],
  "Comida":[{id:"extras",name:"Extras",type:"multi",max:3,values:[{id:"e1",name:"Aguacate",delta:12},{id:"e2",name:"Queso extra",delta:10}]}]
 };
 const fallbackOptions=product?(product.name==="Latte"||product.name==="Iced Latte"?demoConfigs[product.cat==="Bebidas frías"?"Bebidas frías":"Café"]:product.name==="Matcha Latte"?demoConfigs["Matcha"]:demoConfigs[product.cat]||[]):[];
 const dynamicOptions=product?(optionMap[product.id]?.length?optionMap[product.id]:fallbackOptions):[];
 const dynamicDelta=dynamicOptions.reduce((sum,o)=>sum+(o.values||[]).filter(v=>extras.includes(v.name)).reduce((x,v)=>x+v.delta,0),0);
 const detailTotal=product?product.price+dynamicDelta:0;
 const add=()=>{if(!product)return;const detail=extras.length?extras.join(" · "):"Sin personalización adicional";setCart(c=>[...c,{id:Date.now(),name:product.name,price:detailTotal,qty,detail,img:product.img}]);setProduct(null)};
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
    {dynamicOptions.map(o=><DynamicOption key={o.id} option={o} selected={extras} setSelected={setExtras}/>)}
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
function DynamicOption({option,selected,setSelected}){
 const multi=option.type.includes("multi")||option.type.includes("checkbox");
 const choose=v=>{
  const names=(option.values||[]).map(x=>x.name);
  if(multi){
   if(selected.includes(v.name)){setSelected(selected.filter(x=>x!==v.name));return}
   const current=selected.filter(x=>names.includes(x));
   if(option.max>0&&current.length>=option.max)return;
   setSelected([...selected,v.name]);
  }else{
   setSelected([...selected.filter(x=>!names.includes(x)),v.name]);
  }
 };
 return <div className="option dynamic"><h4>{option.name}{option.required&&<small className="required"> · obligatorio</small>}</h4><div>{(option.values||[]).map(v=><button className={selected.includes(v.name)?"selected":""} key={v.id} onClick={()=>choose(v)}>{v.name}{v.delta?` + ${money(v.delta)}`:""}</button>)}</div></div>
}
function Options({title,values,selected,set,deltas={}}){return <div className="option"><h4>{title}</h4><div>{values.map(v=><button className={selected===v?"selected":""} key={v} onClick={()=>set(v)}>{v}{deltas[v]?` + ${money(deltas[v])}`:""}</button>)}</div></div>}
function Nav({label,icon,active,onClick}){return <button className={active?"nav active":"nav"} onClick={onClick}><span>{icon}</span><small>{label}</small></button>}
