# Martie — integración final pendiente

## Ya incluido en V1 integral
- Landing, menú, categorías, producto, personalización, carrito.
- Checkout: datos, entrega, fecha/hora, pago, resumen, confirmación.
- Reglas de pago visibles: terminal/efectivo para recoger; transferencia para envío.
- Flujo de comprobante y WhatsApp preparado.
- Historial, seguimiento, Martie Club, login/registro y administración V1.

## Para producción con Supabase
1. Mantener la publishable key en Vercel y nunca subir la secret key.
2. Activar RLS para tablas públicas y privadas.
3. Crear Storage privado para comprobantes de transferencia.
4. Mover la creación de pedidos a una Edge Function.
5. Calcular fecha/hora disponible en servidor.
6. Validar precios/opciones desde base de datos antes de guardar el pedido.
7. Acreditar puntos únicamente después de pago válido y fulfillment.
8. Validar comprobantes manualmente desde administración.
9. Conectar WhatsApp Business API mediante Edge Function.
10. Configurar sucursal mediante `branch_id` desde el primer despliegue.
