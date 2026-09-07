# Martie — Frontend integral V1

Esta versión concentra el flujo completo de la app para avanzar rápido y corregir sobre una base única.

Incluye:
- Landing mobile-first con identidad Martie integrada.
- Menú y categorías.
- Ficha de producto y personalización por producto.
- Precio dinámico.
- Carrito con cantidades y persistencia local.
- Checkout de 4 pasos.
- Recoger / Envío.
- Datos de dirección.
- Fecha y horario con preparación mínima de 40 min e intervalos de 15 min.
- Métodos de pago según las reglas de Martie: terminal/efectivo para recoger y transferencia para envío.
- Flujo de comprobante de transferencia preparado.
- Confirmación y botón de WhatsApp.
- Historial y seguimiento de pedidos.
- Martie Club y puntos.
- Login/registro por email si Supabase Auth está configurado; modo demo si no.
- Vista de administración V1 para productos, pedidos, resumen y configuración.
- Supabase opcional para cargar categorías y productos; si falla, funciona el fallback demo.

## Importante
La vista de administración es una V1 visual/funcional local. La seguridad definitiva, RLS, creación server-side de órdenes, validación de horarios en servidor, Storage privado de comprobantes y WhatsApp Business API deben conectarse a las Edge Functions/RLS antes de producción.
