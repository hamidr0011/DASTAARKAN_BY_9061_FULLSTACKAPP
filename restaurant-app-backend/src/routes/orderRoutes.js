import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireManager } from '../middleware/auth.js';

const router = express.Router();

// Generate order code
const generateOrderCode = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${num}`;
};

// POST place new order (customer)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { items, subtotal, tax, total, order_type, table_number, special_request } = req.body;
        const orderCode = generateOrderCode();

        const { rows } = await pool.query(
            'INSERT INTO orders (order_code, customer_id, customer_name, items, subtotal, tax, total, status, order_type, table_number, special_request) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [orderCode, req.user.id, req.user.name, JSON.stringify(items), subtotal, tax, total, 'Placed', order_type, table_number || null, special_request || '']
        );

        const data = rows[0];

        return res.status(201).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// GET customer's own orders
router.get('/my-orders', verifyToken, async (req, res) => {
    try {
        const { rows: data } = await pool.query(
            'SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// GET all orders (manager only)
router.get('/', verifyToken, requireManager, async (req, res) => {
    try {
        const { status } = req.query;
        let queryStr = 'SELECT * FROM orders';
        let queryParams = [];

        if (status && status !== 'All') {
            queryStr += ' WHERE status = $1';
            queryParams.push(status);
        }

        queryStr += ' ORDER BY created_at DESC';

        const { rows: data } = await pool.query(queryStr, queryParams);

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// GET single order
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM orders WHERE id = $1',
            [req.params.id]
        );
        const data = rows[0];

        if (!data) return res.status(404).json({ success: false, error: 'Order not found' });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH update order status (manager only)
router.patch('/:id/status', verifyToken, requireManager, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Placed', 'Preparing', 'Ready', 'Served', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status value' });
        }

        const { rows } = await pool.query(
            'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );
        const data = rows[0];

        if (!data) return res.status(404).json({ success: false, error: 'Order not found' });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH cancel order (customer -- only if Placed)
router.patch('/:id/cancel', verifyToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT status, customer_id FROM orders WHERE id = $1',
            [req.params.id]
        );
        const order = rows[0];

        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        if (order.customer_id !== req.user.id) return res.status(403).json({ success: false, error: 'Unauthorized' });
        if (order.status !== 'Placed') return res.status(400).json({ success: false, error: 'Only Placed orders can be cancelled' });

        const { rows: updatedRows } = await pool.query(
            "UPDATE orders SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
            [req.params.id]
        );
        const data = updatedRows[0];

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
