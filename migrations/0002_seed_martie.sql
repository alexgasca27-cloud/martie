PRAGMA foreign_keys = ON;

-- =========================================================
-- MARTIE — MIGRACIÓN 0002
-- Datos iniciales de Martie
-- Cloudflare D1 / SQLite
-- =========================================================

-- ---------------------------------------------------------
-- CONFIGURACIÓN
-- ---------------------------------------------------------

ALTER TABLE settings
ADD COLUMN timezone TEXT NOT NULL DEFAULT 'America/Merida';

ALTER TABLE settings
ADD COLUMN capacity_per_slot INTEGER NOT NULL DEFAULT 8;

ALTER TABLE settings
ADD COLUMN pickup_address TEXT NOT NULL DEFAULT '';

INSERT INTO settings (
  id,
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
) VALUES (
  1,
  'Martie',
  '9993596815',
  '9993596815',
  '09:00',
  '19:00',
  15,
  40,
  '',
  '',
  '',
  '',
  'America/Merida',
  8,
  ''
);

-- ---------------------------------------------------------
-- CATEGORÍAS
-- ---------------------------------------------------------

INSERT INTO categories (
  id,
  name,
  description,
  sort_order,
  is_active
) VALUES
(
  'cat-cafe',
  'Café',
  '',
  1,
  1
),
(
  'cat-bebidas-frias',
  'Bebidas frías',
  '',
  2,
  1
),
(
  'cat-comida',
  'Comida',
  '',
  3,
  1
),
(
  'cat-postres',
  'Postres',
  '',
  4,
  1
);

-- ---------------------------------------------------------
-- PRODUCTOS
-- ---------------------------------------------------------

INSERT INTO products (
  id,
  category_id,
  name,
  description,
  image_url,
  base_price,
  is_available,
  is_featured,
  is_new,
  is_bestseller,
  sort_order
) VALUES
(
  'prod-latte',
  'cat-cafe',
  'Latte',
  'Espresso + leche cremosa.',
  '/images/latte.jpg',
  49,
  1,
  0,
  0,
  0,
  1
),
(
  'prod-iced-latte',
  'cat-bebidas-frias',
  'Iced Latte',
  'Café frío, mismo gran sabor.',
  '/images/iced-latte.jpg',
  55,
  1,
  0,
  0,
  0,
  2
),
(
  'prod-matcha-latte',
  'cat-cafe',
  'Matcha Latte',
  'Energía natural.',
  '/images/matcha.jpg',
  59,
  1,
  0,
  0,
  0,
  3
),
(
  'prod-croissant',
  'cat-postres',
  'Croissant',
  'Hojaldre perfecto.',
  '/images/croissant.jpg',
  45,
  1,
  0,
  0,
  0,
  4
),
(
  'prod-bowl-frutas',
  'cat-comida',
  'Bowl de Frutas',
  'Frescura en cada bocado.',
  '/images/bowl.jpg',
  69,
  1,
  0,
  0,
  0,
  5
),
(
  'prod-smoothie-fresa',
  'cat-bebidas-frias',
  'Smoothie Fresa',
  'Natural y delicioso.',
  '/images/smoothie.jpg',
  55,
  1,
  0,
  0,
  0,
  6
);

-- ---------------------------------------------------------
-- OPCIONES
-- ---------------------------------------------------------

INSERT INTO options (
  id,
  name,
  type,
  is_required,
  sort_order,
  is_active
) VALUES
(
  'opt-latte-tamano',
  'Tamaño',
  'single',
  1,
  1,
  1
),
(
  'opt-latte-leche',
  'Tipo de leche',
  'single',
  1,
  2,
  1
),
(
  'opt-latte-extras',
  'Extras',
  'multi',
  0,
  3,
  1
),
(
  'opt-iced-tamano',
  'Tamaño',
  'single',
  1,
  1,
  1
),
(
  'opt-iced-extras',
  'Extras',
  'multi',
  0,
  3,
  1
),
(
  'opt-matcha-tamano',
  'Tamaño',
  'single',
  1,
  1,
  1
),
(
  'opt-matcha-leche',
  'Tipo de leche',
  'single',
  1,
  2,
  1
),
(
  'opt-matcha-endulzante',
  'Endulzante',
  'single',
  0,
  3,
  1
),
(
  'opt-croissant-relleno',
  'Relleno',
  'single',
  0,
  1,
  1
),
(
  'opt-bowl-extras',
  'Extras',
  'multi',
  0,
  1,
  1
);

-- ---------------------------------------------------------
-- RELACIÓN PRODUCTO → OPCIONES
-- ---------------------------------------------------------

INSERT INTO product_options (
  product_id,
  option_id
) VALUES
('prod-latte', 'opt-latte-tamano'),
('prod-latte', 'opt-latte-leche'),
('prod-latte', 'opt-latte-extras'),

('prod-iced-latte', 'opt-iced-tamano'),
('prod-iced-latte', 'opt-iced-extras'),

('prod-matcha-latte', 'opt-matcha-tamano'),
('prod-matcha-latte', 'opt-matcha-leche'),
('prod-matcha-latte', 'opt-matcha-endulzante'),

('prod-croissant', 'opt-croissant-relleno'),

('prod-bowl-frutas', 'opt-bowl-extras');

-- ---------------------------------------------------------
-- VALORES DE OPCIONES
-- ---------------------------------------------------------

-- Latte / Tamaño
INSERT INTO option_values (
  id,
  option_id,
  name,
  price_delta,
  sort_order,
  is_active
) VALUES
('val-latte-chico', 'opt-latte-tamano', 'Chico', 0, 1, 1),
('val-latte-mediano', 'opt-latte-tamano', 'Mediano', 6, 2, 1),
('val-latte-grande', 'opt-latte-tamano', 'Grande', 12, 3, 1);

-- Latte / Tipo de leche
INSERT INTO option_values (
  id,
  option_id,
  name,
  price_delta,
  sort_order,
  is_active
) VALUES
('val-latte-entera', 'opt-latte-leche', 'Entera', 0, 1, 1),
('val-latte-deslactosada', 'opt-latte-leche', 'Deslactosada', 0, 2, 1),
('val-latte-almendra', 'opt-latte-leche', 'Almendra', 0, 3, 1),
('val-latte-avena', 'opt-latte-leche', 'Avena', 0, 4, 1);

-- Latte / Extras
INSERT INTO option_values (
  id,
  option_id,
  name,
  price_delta,
  sort_order,
  is_active
) VALUES
('val-latte-shot', 'opt-latte-extras', 'Shot extra', 12, 1, 1),
('val-latte-vainilla', 'opt-latte-extras', 'Vainilla', 8, 2, 1),
('val-latte-caramelo', 'opt-latte-extras', 'Caramelo', 8, 3, 1),
('val-latte-canela', 'opt-latte-extras', 'Canela', 8, 4, 1);

-- Iced Latte / Tamaño
INSERT INTO option_values (
  id,
  option_id,
  name,
  price_delta,
  sort_order,
  is_active
) VALUES
('val-iced-chico', 'opt-iced-tamano', 'Chico', 0, 1, 1),
('val-iced-mediano', 'opt-iced-tamano', 'Mediano', 6, 2, 1),
('val-iced-grande', 'opt-iced-tamano', 'Grande', 12, 3, 1);

-- Iced Latte / Extras
INSERT INTO option_values (
  id,
  option_id,
  name,
  price_delta,
  sort_order,
  is_active
) VALUES
('val-iced-vainilla', 'opt-iced-extras', 'Vainilla', 8, 1, 1),
('val-iced-caramelo', 'opt-iced-extras', 'Caramelo', 8, 2, 1),
('val-iced-shot', 'opt-iced-extras', 'Shot extra', 12, 3, 1);

-- Matcha / Tamaño
INSERT INTO option_values (
  id,
  option_id,
  name,
  price_delta,
  sort_order,
  is_active
) VALUES
('val-matcha-chico', 'opt-matcha-tamano', 'Chico', 0, 1, 1),
('val-matcha-mediano', 'opt-matcha-tamano', 'Mediano', 6, 2, 1),
('val-matcha-grande', 'opt-matcha-tamano', 'Grande', 12, 3, 1);

-- Matcha / Tipo de leche
INSERT INTO option_values (
  id,
  option_id,
  name,
  price_delta,
  sort_order,
  is_active
) VALUES
('val-matcha-entera', 'opt-matcha-leche', 'Entera', 0, 1, 1),
('val-matcha-deslactosada', 'opt-matcha-leche', 'Deslactosada', 0, 2, 1),
('val-matcha-almendra', 'opt-matcha-leche', 'Almendra', 0, 3, 1),
('val-matcha-avena', 'opt-matcha-leche', 'Avena', 0, 4, 1);

-- Matcha / Endulzante
INSERT INTO option_values (
  id,
  option_id,
  name,
  price_delta,
  sort_order,
  is_active
) VALUES
('val-matcha-sin-azucar', 'opt-matcha-endulzante', 'Sin azúcar', 0, 1, 1),
('val-matcha-miel', 'opt-matcha-endulzante', 'Miel', 5, 2, 1),
('val-matcha-stevia', 'opt-matcha-endulzante', 'Stevia', 0, 3, 1);

-- Croissant / Relleno
INSERT INTO option_values (
  id,
  option_id,
  name,
  price_delta,
  sort_order,
  is_active
) VALUES
('val-croissant-natural', 'opt-croissant-relleno', 'Natural', 0, 1, 1),
('val-croissant-chocolate', 'opt-croissant-relleno', 'Chocolate', 8, 2, 1),
('val-croissant-almendra', 'opt-croissant-relleno', 'Almendra', 10, 3, 1);

-- Bowl de Frutas / Extras
INSERT INTO option_values (
  id,
  option_id,
  name,
  price_delta,
  sort_order,
  is_active
) VALUES
('val-bowl-granola', 'opt-bowl-extras', 'Granola', 6, 1, 1),
('val-bowl-yogurt', 'opt-bowl-extras', 'Yogurt', 8, 2, 1),
('val-bowl-frutos-rojos', 'opt-bowl-extras', 'Frutos rojos', 10, 3, 1);

-- ---------------------------------------------------------
-- ZONA DE ENTREGA
-- ---------------------------------------------------------

INSERT INTO delivery_zones (
  id,
  name,
  neighborhoods,
  postal_codes,
  delivery_fee,
  is_active
) VALUES (
  'zone-local',
  'Zona local',
  '',
  '',
  0,
  1
);
