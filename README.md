# Martie V33

Corrección del acceso administrativo: `/admin` valida primero el registro del usuario en `martie_staff` y usa `martie_is_admin()` como respaldo. Mantiene el resto de V32 sin cambios.
