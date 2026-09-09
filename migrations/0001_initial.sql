PRAGMA foreign_keys = ON;

-- =========================================================
-- MARTIE — MIGRACIÓN 0001
-- Estructura base
-- Cloudflare D1 / SQLite
-- =========================================================

-- =========================================================
-- USUARIOS
-- =========================================================

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  full_name TEXT,
  phone TEXT,
  birth_date TEXT,
  provider TEXT NOT NULL DEFAULT 'email',
  provider_id TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- SESIONES
-- =========================================================

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user
ON sessions(user_id);

CREATE INDEX idx_sessions_token
ON sessions(token_hash);

-- =========================================================
-- CATEGORÍAS
-- =========================================================

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- PRODUCTOS
-- =========================================================

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  category_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  base_price REAL NOT NULL DEFAULT 0,
  is_available INTEGER NOT NULL DEFAULT 1,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_new INTEGER NOT NULL DEFAULT 0,
  is_bestseller INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_products_category
ON products(category_id);

CREATE INDEX idx_products_available
ON products(is_available);

-- =========================================================
-- OPCIONES
-- =========================================================

CREATE TABLE options (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'single',
  is_required INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- VALORES DE OPCIONES
-- =========================================================

CREATE TABLE option_values (
  id TEXT PRIMARY KEY,
  option_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price_delta REAL NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (option_id)
    REFERENCES options(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_option_values_option
ON option_values(option_id);

-- =========================================================
-- PRODUCTOS ↔ OPCIONES
-- =========================================================

CREATE TABLE product_options (
  product_id TEXT NOT NULL,
  option_id TEXT NOT NULL,

  PRIMARY KEY (product_id, option_id),

  FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE,

  FOREIGN KEY (option_id)
    REFERENCES options(id)
    ON DELETE CASCADE
);

-- =========================================================
-- ZONAS DE ENTREGA
-- =========================================================

CREATE TABLE delivery_zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  neighborhoods TEXT,
  postal_codes TEXT,
  delivery_fee REAL NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- CONFIGURACIÓN GENERAL
-- =========================================================

CREATE TABLE settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),

  business_name TEXT NOT NULL DEFAULT 'Martie',

  phone TEXT,
  whatsapp_number TEXT,

  opening_time TEXT NOT NULL DEFAULT '09:00',
  closing_time TEXT NOT NULL DEFAULT '19:00',

  slot_interval_minutes INTEGER NOT NULL DEFAULT 15,
  preparation_minutes INTEGER NOT NULL DEFAULT 40,

  bank_name TEXT,
  bank_account TEXT,
  bank_clabe TEXT,
  bank_holder TEXT,

  logo_url TEXT,

  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- PERSONAL / ADMINISTRADORES
-- =========================================================

CREATE TABLE staff (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =========================================================
-- PEDIDOS
-- =========================================================

CREATE TABLE orders (
  id TEXT PRIMARY KEY,

  order_number TEXT UNIQUE NOT NULL,

  user_id TEXT,

  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,

  delivery_type TEXT NOT NULL,

  address TEXT,
  exterior_number TEXT,
  interior_number TEXT,
  neighborhood TEXT,
  postal_code TEXT,
  references_text TEXT,

  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,

  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'PENDING',

  order_status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',

  subtotal REAL NOT NULL DEFAULT 0,
  delivery_fee REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,

  customer_notes TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_orders_user
ON orders(user_id);

CREATE INDEX idx_orders_status
ON orders(order_status);

CREATE INDEX idx_orders_payment
ON orders(payment_status);

CREATE INDEX idx_orders_created
ON orders(created_at);

-- =========================================================
-- PRODUCTOS DEL PEDIDO
-- =========================================================

CREATE TABLE order_items (
  id TEXT PRIMARY KEY,

  order_id TEXT NOT NULL,

  product_id TEXT,

  product_name TEXT NOT NULL,

  quantity INTEGER NOT NULL DEFAULT 1,

  unit_price REAL NOT NULL DEFAULT 0,
  total_price REAL NOT NULL DEFAULT 0,

  personalization TEXT,
  notes TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,

  FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_order_items_order
ON order_items(order_id);

-- =========================================================
-- COMPROBANTES DE TRANSFERENCIA
-- =========================================================

CREATE TABLE payment_proofs (
  id TEXT PRIMARY KEY,

  order_id TEXT NOT NULL,

  file_key TEXT NOT NULL,
  file_url TEXT,

  original_name TEXT,
  mime_type TEXT,
  file_size INTEGER,

  status TEXT NOT NULL DEFAULT 'PROOF_RECEIVED',

  rejection_reason TEXT,

  reviewed_by TEXT,
  reviewed_at TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,

  FOREIGN KEY (reviewed_by)
    REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_payment_proofs_order
ON payment_proofs(order_id);

-- =========================================================
-- MARTIE CLUB
-- =========================================================

CREATE TABLE loyalty_members (
  id TEXT PRIMARY KEY,

  user_id TEXT UNIQUE NOT NULL,

  points_balance INTEGER NOT NULL DEFAULT 0,

  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =========================================================
-- MOVIMIENTOS DE PUNTOS
-- =========================================================

CREATE TABLE loyalty_transactions (
  id TEXT PRIMARY KEY,

  member_id TEXT NOT NULL,

  order_id TEXT,

  type TEXT NOT NULL,

  points INTEGER NOT NULL,

  description TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (member_id)
    REFERENCES loyalty_members(id)
    ON DELETE CASCADE,

  FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_loyalty_transactions_member
ON loyalty_transactions(member_id);

-- =========================================================
-- RECOMPENSAS
-- =========================================================

CREATE TABLE rewards (
  id TEXT PRIMARY KEY,

  name TEXT NOT NULL,
  description TEXT,

  points_required INTEGER NOT NULL DEFAULT 0,

  reward_type TEXT NOT NULL,

  reward_value REAL,

  is_active INTEGER NOT NULL DEFAULT 1,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- RECOMPENSAS DE CUMPLEAÑOS
-- =========================================================

CREATE TABLE birthday_rewards (
  id TEXT PRIMARY KEY,

  user_id TEXT NOT NULL,

  year INTEGER NOT NULL,

  reward_type TEXT NOT NULL DEFAULT 'FREE_DRINK',

  status TEXT NOT NULL DEFAULT 'AVAILABLE',

  redeemed_at TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, year),

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =========================================================
-- WHATSAPP
-- =========================================================

CREATE TABLE whatsapp_messages (
  id TEXT PRIMARY KEY,

  order_id TEXT,

  recipient TEXT NOT NULL,

  message_type TEXT,

  message_body TEXT,

  provider_message_id TEXT,

  status TEXT NOT NULL DEFAULT 'PENDING',

  error_message TEXT,

  sent_at TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_whatsapp_order
ON whatsapp_messages(order_id);

-- =========================================================
-- AUDITORÍA
-- =========================================================

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,

  user_id TEXT,

  action TEXT NOT NULL,

  entity_type TEXT,
  entity_id TEXT,

  details TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_audit_entity
ON audit_logs(entity_type, entity_id);
