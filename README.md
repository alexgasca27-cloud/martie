# Martie — Frontend V1

Frontend mobile-first de Martie, preparado para GitHub + Vercel + Supabase.

## Incluye
- Inicio / Home
- Menú y categorías
- Productos
- Modal inicial de producto
- Carrito persistente en navegador
- Martie Club (base visual)
- Navegación móvil
- Conexión preparada con Supabase
- Datos demo automáticos si la base todavía está vacía

## Variables de entorno
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

No colocar nunca la secret key de Supabase en el frontend.

## Desarrollo
```bash
npm install
npm run dev
```

## Producción
```bash
npm run build
```

El proyecto está pensado para desplegarse directamente en Vercel.
