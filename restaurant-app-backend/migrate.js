import pool from './src/config/db.js';

const createTables = async () => {
    try {
        console.log('Creating database tables...');

        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'manager')),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('users table created');

        await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(50),
        image VARCHAR(500),
        available BOOLEAN DEFAULT true,
        is_special BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('menu_items table created');

        await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        items JSONB NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(30) DEFAULT 'Pending',
        table_number INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('orders table created');

        await pool.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(20) NOT NULL,
        guests INTEGER NOT NULL,
        table_number INTEGER,
        special_requests TEXT,
        status VARCHAR(30) DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('reservations table created');

        console.log('All tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
};

createTables();
