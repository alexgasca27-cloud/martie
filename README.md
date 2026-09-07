# Martie — versión de producción

Esta versión deja la aplicación y el backend listos para trabajar juntos:

- Landing y menú responsive con identidad Martie.
- Productos y categorías persistentes en Supabase.
- Personalización por producto y precios validados en servidor.
- Carrito con edición, cantidades y persistencia local.
- Checkout completo.
- Recoger / envío.
- Envío obliga a transferencia.
- Terminal física y efectivo solo para recoger.
- Transferencia con estado de comprobante pendiente.
- Horarios calculados en servidor con 40 min de preparación, intervalos de 15 min, apertura 09:00 y cierre 19:00.
- Capacidad por horario.
- Pedidos persistentes.
- Panel administrativo protegido por rol.
- Gestión de productos, opciones, pedidos y configuración.
- Aprobación/rechazo de transferencias.
- Martie Club y acreditación de puntos al entregar un pedido pagado.
- WhatsApp preparado mediante Supabase Edge Functions.
- Sin claves secretas en React/GitHub.

## Puesta en marcha

1. Ejecuta `supabase/migrations/20260907_martie_production.sql` completo en Supabase SQL Editor.
2. Crea una cuenta en Supabase Auth.
3. Ejecuta `select public.martie_promote_admin('TU_CORREO');` para convertir esa cuenta en administrador.
4. Despliega las Edge Functions de `supabase/functions/`.
5. En Supabase Secrets configura `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` y opcionalmente `WHATSAPP_API_VERSION`.
6. En Vercel configura `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` y opcionalmente `VITE_MARTIE_WHATSAPP_NUMBER`.
7. Haz push a `main` y Vercel desplegará el frontend.

Lee `docs/PRODUCTION_SETUP.md` para el procedimiento exacto.


### WhatsApp de confirmación interna
La confirmación de cada pedido se envía al número configurado en `martie_settings.whatsapp_number`. El valor inicial es `9993596815` y el administrador puede editarlo desde **Configuración → WhatsApp**. El teléfono del cliente se conserva como dato del pedido y no se usa como destinatario de la notificación interna.


## V31
Admin en /admin con login propio. AdminRoute es la única puerta de acceso.
