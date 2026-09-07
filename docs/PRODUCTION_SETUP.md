# Martie — puesta en producción

## 1. Supabase
1. Abre SQL Editor.
2. Ejecuta `supabase/migrations/20260907_martie_production.sql` completo.
3. Crea/usa una cuenta en Auth > Users.
4. Ejecuta en SQL Editor:
   `select public.martie_promote_admin('TU_CORREO_ADMIN');`
5. En Edge Functions > Secrets agrega:
   - `WHATSAPP_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_API_VERSION` = `v23.0`
6. Las claves `SUPABASE_URL` y `SUPABASE_SECRET_KEYS` ya están disponibles en Edge Functions; no las copies al frontend.

## 2. Edge Functions
Se incluyen:
- `create-order`: valida precios/opciones, horarios, capacidad y crea pedido.
- `available-slots`: calcula horarios con hora del servidor en America/Merida.
- `admin-update-order`: valida rol admin y actualiza estados; al entregar acredita puntos.
- `send-whatsapp`: envía confirmaciones.
- `send-status-whatsapp`: envía actualizaciones de estado.

Puedes desplegarlas desde el Dashboard de Supabase o con CLI. Si usas GitHub Actions, configura los secrets `SUPABASE_ACCESS_TOKEN` y `SUPABASE_PROJECT_REF`.

## 3. Vercel
Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_MARTIE_WHATSAPP_NUMBER`

Nunca agregues `sb_secret_...` a Vercel frontend, GitHub o código React.

## 4. WhatsApp Business
Necesitas una cuenta de WhatsApp Business Platform/Cloud API, un número de empresa, Phone Number ID y access token. El backend usa esos valores como secrets y llama al endpoint de mensajes de Meta. Para mensajes iniciados por la empresa después de la ventana de atención, configura plantillas aprobadas y adapta `send-status-whatsapp` a template messages.

## 5. Flujo real
Cliente -> carrito -> checkout -> `create-order` -> validación server-side -> pedido en Supabase -> WhatsApp -> Admin -> pago/validación -> preparación -> listo/en camino -> entregado -> puntos.

## 6. Importante
El terminal de tarjeta es físico; nunca se capturan datos de tarjeta en la web. Envío siempre exige transferencia. Transferencia no se prepara hasta ser aprobada por administración.


### WhatsApp de confirmación interna
La confirmación de cada pedido se envía al número configurado en `martie_settings.whatsapp_number`. El valor inicial es `9993596815` y el administrador puede editarlo desde **Configuración → WhatsApp**. El teléfono del cliente se conserva como dato del pedido y no se usa como destinatario de la notificación interna.
