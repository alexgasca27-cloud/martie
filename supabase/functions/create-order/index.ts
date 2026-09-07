import { createClient } from 'jsr:@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST,OPTIONS' }
const json=(body:any,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}})
const secretKeys=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}')
const admin=createClient(Deno.env.get('SUPABASE_URL')!,secretKeys.default)
const money=(n:number)=>Math.round((Number(n)||0)*100)/100
const localParts=(date=new Date())=>{
 const f=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Merida',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(date)
 const o:any={};for(const x of f)o[x.type]=x.value;return o
}
function minutes(t:string){const [h,m]=t.split(':').map(Number);return h*60+m}
function validSlot(date:string,time:string,settings:any){
 const [y,mo,d]=date.split('-').map(Number); if(!y||!mo||!d)return false
 const now=localParts(); const today=`${now.year}-${now.month}-${now.day}`
 const open=minutes(settings.opening_time), close=minutes(settings.closing_time), requested=minutes(time)
 if(requested<open||requested>close)return false
 if(date===today){
   const current=Number(now.hour)*60+Number(now.minute)
   const min=current+Number(settings.prep_minutes||40)
   const interval=Number(settings.slot_interval||15)
   const rounded=Math.ceil(min/interval)*interval
   if(requested<rounded)return false
 }
 return true
}
async function getUser(req:Request){
 const h=req.headers.get('Authorization'); if(!h?.startsWith('Bearer '))return null
 const token=h.slice(7); const {data}=await admin.auth.getUser(token); return data.user||null
}

Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
 try{
  const body=await req.json(); const user=await getUser(req)
  const {data:settings,error:se}=await admin.from('martie_settings').select('*').eq('id',true).single(); if(se)throw se
  const {items,customer,delivery_method,scheduled_date,scheduled_time,payment_method,notes=''}=body
  if(!Array.isArray(items)||!items.length)return json({error:'El carrito está vacío.'},400)
  if(!customer?.name||!customer?.phone)return json({error:'Faltan datos del cliente.'},400)
  if(!['pickup','delivery'].includes(delivery_method))return json({error:'Tipo de entrega inválido.'},400)
  if(delivery_method==='delivery'&&payment_method!=='TRANSFER')return json({error:'Los envíos requieren transferencia bancaria.'},400)
  if(delivery_method==='pickup'&&!['CARD_TERMINAL','CASH','TRANSFER'].includes(payment_method))return json({error:'Método de pago inválido.'},400)
  if(!validSlot(scheduled_date,scheduled_time,settings))return json({error:'Ese horario ya no está disponible. Selecciona otro.'},409)

  const ids=items.map((x:any)=>x.product_id)
  const {data:products,error:pe}=await admin.from('martie_products').select('id,name,description,base_price,is_available').in('id',ids)
  if(pe)throw pe
  const pmap=new Map((products||[]).map((p:any)=>[String(p.id),p]))
  if(products?.length!==ids.length)return json({error:'Uno de los productos ya no está disponible.'},409)
  const {data:values,error:ve}=await admin.from('martie_option_values').select('id,option_id,name,price_delta,is_available,martie_options!inner(product_id)')
  if(ve)throw ve
  let subtotal=0; const serverItems:any[]=[]
  for(const raw of items){
   const p=pmap.get(String(raw.product_id)); if(!p||!p.is_available)return json({error:`${raw.name||'Un producto'} ya no está disponible.`},409)
   const qty=Math.max(1,Math.floor(Number(raw.quantity)||0)); if(qty>50)return json({error:'Cantidad máxima por producto: 50.'},400)
   const selected=Array.isArray(raw.option_value_ids)?raw.option_value_ids.map(String):[]
   const valid=(values||[]).filter((v:any)=>selected.includes(String(v.id))&&String(v.martie_options?.product_id)===String(p.id)&&v.is_available)
   if(valid.length!==selected.length)return json({error:`Las opciones de ${p.name} cambiaron. Vuelve a personalizarlo.`},409)
   const delta=valid.reduce((a:any,v:any)=>a+Number(v.price_delta||0),0)
   const unit=money(Number(p.base_price)+delta); subtotal+=money(unit*qty)
   serverItems.push({product_id:p.id,product_name:p.name,base_price:p.base_price,unit_price:unit,quantity:qty,personalization:{option_value_ids:selected,labels:valid.map((v:any)=>v.name)},notes:String(raw.notes||'')})
  }
  let deliveryFee=0
  if(delivery_method==='delivery'){
    const zoneId=body.delivery_zone_id||null
    if(zoneId){const {data:z}=await admin.from('martie_delivery_zones').select('fee').eq('id',zoneId).eq('is_active',true).single(); if(!z)return json({error:'La zona de entrega no está disponible.'},409); deliveryFee=Number(z.fee||0)}
    else {const {data:z}=await admin.from('martie_delivery_zones').select('fee').eq('is_active',true).order('fee').limit(1).maybeSingle();deliveryFee=Number(z?.fee||0)}
  }
  const total=money(subtotal+deliveryFee)
  const {count}=await admin.from('martie_orders').select('id',{count:'exact',head:true}).eq('scheduled_date',scheduled_date).eq('scheduled_time',scheduled_time).neq('order_status','CANCELLED')
  if((count||0)>=Number(settings.capacity_per_slot||8))return json({error:'Ese horario se llenó. Selecciona otro.'},409)
  const stamp=Date.now().toString().slice(-5); const orderNumber=`MRT-${scheduled_date.replaceAll('-','')}-${stamp}`
  const paymentStatus=payment_method==='TRANSFER'?'WAITING_PROOF':'PENDING'
  const orderStatus=payment_method==='TRANSFER'?'PENDING_PAYMENT':'PENDING_CONFIRMATION'
  const {data:order,error:oe}=await admin.from('martie_orders').insert({order_number:orderNumber,user_id:user?.id||null,customer_name:customer.name,customer_phone:customer.phone,customer_email:customer.email||null,delivery_method,address:customer.address||{},scheduled_date,scheduled_time,payment_method,payment_status:paymentStatus,order_status:orderStatus,subtotal,delivery_fee:deliveryFee,total,notes}).select().single()
  if(oe)throw oe
  const {error:ie}=await admin.from('martie_order_items').insert(serverItems.map(x=>({...x,order_id:order.id}))); if(ie)throw ie
  await admin.from('martie_audit_logs').insert({actor_user_id:user?.id||null,action:'CREATE_ORDER',entity:'martie_orders',entity_id:order.id,details:{order_number:orderNumber}})
  return json({order:{...order,items:serverItems},message:'Pedido creado correctamente.'})
 }catch(e){console.error(e);return json({error:e?.message||'No se pudo crear el pedido.'},500)}
})
