# Martie — integración

## Qué ya está implementado en el paquete
- Frontend cliente.
- Carrito real en la interfaz.
- Checkout.
- Validación server-side de pedido/precio/opciones.
- Horarios server-side.
- Capacidad por horario.
- Supabase Auth.
- Admin protegido por `martie_staff`.
- Productos y categorías persistentes.
- Opciones por producto.
- Estados de pedido.
- Pagos y comprobantes.
- Martie Club.
- WhatsApp mediante Edge Functions.

## Lo único que no puede venir dentro del ZIP
Las credenciales de servicios externos. En concreto, Meta exige que el negocio tenga WhatsApp Business Platform/Cloud API y proporcione un Phone Number ID y access token. Esos valores deben vivir como Secrets en Supabase, nunca en React ni GitHub.

Supabase también mantiene las publishable keys para navegador y las secret keys exclusivamente en backend/Edge Functions; las secret keys no deben exponerse en frontend. Ver documentación actual de Supabase.


### WhatsApp de confirmación interna
La confirmación de cada pedido se envía al número configurado en `martie_settings.whatsapp_number`. El valor inicial es `9993596815` y el administrador puede editarlo desde **Configuración → WhatsApp**. El teléfono del cliente se conserva como dato del pedido y no se usa como destinatario de la notificación interna.
