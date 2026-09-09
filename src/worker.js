export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =====================================================
    // API
    // =====================================================

    if (url.pathname.startsWith("/api/")) {
      try {
        // -------------------------------------------------
        // HEALTH CHECK
        // -------------------------------------------------
        if (url.pathname === "/api/health") {
          const result = await env.DB
            .prepare("SELECT 1 AS ok")
            .first();

          return json({
            success: true,
            database: result?.ok === 1,
            service: "martie-api"
          });
        }

        // -------------------------------------------------
        // CATEGORÍAS
        // -------------------------------------------------
        if (url.pathname === "/api/categories") {
          const { results } = await env.DB
            .prepare(`
              SELECT
                id,
                name,
                description,
                sort_order
              FROM categories
              WHERE is_active = 1
              ORDER BY sort_order ASC, name ASC
            `)
            .all();

          return json({
            success: true,
            data: results
          });
        }

        // -------------------------------------------------
        // PRODUCTOS
        // -------------------------------------------------
        if (url.pathname === "/api/products") {
          const { results } = await env.DB
            .prepare(`
              SELECT
                p.id,
                p.category_id,
                c.name AS category_name,
                p.name,
                p.description,
                p.image_url,
                p.base_price,
                p.is_available,
                p.is_featured,
                p.is_new,
                p.is_bestseller,
                p.sort_order
              FROM products p
              LEFT JOIN categories c
                ON c.id = p.category_id
              WHERE p.is_available = 1
              ORDER BY
                c.sort_order ASC,
                p.sort_order ASC,
                p.name ASC
            `)
            .all();

          return json({
            success: true,
            data: results
          });
        }

        // -------------------------------------------------
        // OPCIONES DE PRODUCTO
        // -------------------------------------------------
        if (url.pathname === "/api/options") {
          const productId = url.searchParams.get("product_id");

          if (!productId) {
            return json(
              {
                success: false,
                error: "product_id es requerido"
              },
              400
            );
          }

          const { results } = await env.DB
            .prepare(`
              SELECT
                o.id AS option_id,
                o.name AS option_name,
                o.type,
                o.is_required,
                o.sort_order AS option_sort_order,
                ov.id AS value_id,
                ov.name AS value_name,
                ov.price_delta,
                ov.sort_order AS value_sort_order
              FROM product_options po
              INNER JOIN options o
                ON o.id = po.option_id
              INNER JOIN option_values ov
                ON ov.option_id = o.id
              WHERE
                po.product_id = ?
                AND o.is_active = 1
                AND ov.is_active = 1
              ORDER BY
                o.sort_order ASC,
                ov.sort_order ASC
            `)
            .bind(productId)
            .all();

          const grouped = {};

          for (const row of results) {
            if (!grouped[row.option_id]) {
              grouped[row.option_id] = {
                id: row.option_id,
                name: row.option_name,
                type: row.type,
                is_required: Boolean(row.is_required),
                sort_order: row.option_sort_order,
                values: []
              };
            }

            grouped[row.option_id].values.push({
              id: row.value_id,
              name: row.value_name,
              price_delta: row.price_delta,
              sort_order: row.value_sort_order
            });
          }

          return json({
            success: true,
            data: Object.values(grouped)
          });
        }

        // -------------------------------------------------
        // CONFIGURACIÓN
        // -------------------------------------------------
        if (url.pathname === "/api/settings") {
          const settings = await env.DB
            .prepare(`
              SELECT
                business_name,
                phone,
                whatsapp_number,
                opening_time,
                closing_time,
                slot_interval_minutes,
                preparation_minutes,
                bank_name,
                bank_account,
                bank_clabe,
                bank_holder,
                timezone,
                capacity_per_slot,
                pickup_address
              FROM settings
              WHERE id = 1
              LIMIT 1
            `)
            .first();

          return json({
            success: true,
            data: settings
          });
        }

        // -------------------------------------------------
        // ZONAS DE ENTREGA
        // -------------------------------------------------
        if (url.pathname === "/api/delivery-zones") {
          const { results } = await env.DB
            .prepare(`
              SELECT
                id,
                name,
                neighborhoods,
                postal_codes,
                delivery_fee
              FROM delivery_zones
              WHERE is_active = 1
              ORDER BY name ASC
            `)
            .all();

          return json({
            success: true,
            data: results
          });
        }

        // -------------------------------------------------
        // ENDPOINT NO ENCONTRADO
        // -------------------------------------------------
        return json(
          {
            success: false,
            error: "Endpoint no encontrado"
          },
          404
        );

      } catch (error) {
        console.error("Martie API error:", error);

        return json(
          {
            success: false,
            error: "Error interno del servidor"
          },
          500
        );
      }
    }

    // =====================================================
    // FRONTEND
    // =====================================================

    return env.ASSETS.fetch(request);
  }
};


// =======================================================
// JSON RESPONSE
// =======================================================

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
