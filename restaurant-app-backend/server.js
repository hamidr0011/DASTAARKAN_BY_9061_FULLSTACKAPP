import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import menuRoutes from './src/routes/menuRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import reservationRoutes from './src/routes/reservationRoutes.js';
import pool from './src/config/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Auto-create tables on startup
const runMigrations = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                role VARCHAR(20) DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
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
        console.log('Database tables ready.');
    } catch (err) {
        console.error('Migration error:', err.message);
    }
};


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Dastarkhan API is running',
        database: 'PostgreSQL via Supabase',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

const startServer = async () => {
    await runMigrations();
    app.listen(5000, '0.0.0.0', () => {
        console.log(`Dastarkhan API running on port 5000`);
        console.log(`Database: PostgreSQL via Railway`);
        console.log(`Health check: http://0.0.0.0:5000/health`);
    });
};

startServer();
