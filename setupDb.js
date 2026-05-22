require('dotenv').config();
const pool = require('./db');

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log('🍰 Setting up SweetBake database...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        image_url VARCHAR(255),
        stock INT DEFAULT 0,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150),
        phone VARCHAR(30),
        address TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
        status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','baking','ready','delivered','cancelled')),
        total_amount DECIMAL(10,2) DEFAULT 0,
        delivery_date DATE,
        delivery_address TEXT,
        special_notes TEXT,
        created_by INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id) ON DELETE SET NULL,
        product_name VARCHAR(150) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(80),
        date DATE DEFAULT CURRENT_DATE,
        notes TEXT,
        created_by INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed default categories
    await client.query(`
      INSERT INTO categories (name, description) VALUES
        ('Birthday Cakes', 'Custom birthday celebration cakes'),
        ('Wedding Cakes', 'Elegant tiered wedding cakes'),
        ('Cupcakes', 'Assorted flavored cupcakes'),
        ('Pastries', 'Croissants, danishes, and more'),
        ('Custom Orders', 'Special occasion custom cakes')
      ON CONFLICT DO NOTHING;
    `);

    // Seed default admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (name, email, password, role) VALUES
        ('Admin', 'admin@sweetbake.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING;
    `, [hash]);

    // Seed sample products
    await client.query(`
      INSERT INTO products (name, description, price, category_id, stock) VALUES
        ('Classic Chocolate Cake', 'Rich triple-layer chocolate cake with ganache', 1200.00, 1, 10),
        ('Strawberry Dream', 'Fresh strawberry cake with cream cheese frosting', 1350.00, 1, 8),
        ('Red Velvet', 'Southern-style red velvet with cream cheese', 1100.00, 1, 12),
        ('Wedding Ivory Elegance', '3-tier fondant wedding cake', 5500.00, 2, 3),
        ('Assorted Cupcakes (12)', 'Dozen mixed flavor cupcakes', 650.00, 3, 20),
        ('Butter Croissant', 'Flaky golden butter croissant', 95.00, 4, 30)
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Database setup complete!');
    console.log('👤 Admin login: admin@sweetbake.com / admin123');
  } catch (err) {
    console.error('❌ Setup error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

setupDatabase();
