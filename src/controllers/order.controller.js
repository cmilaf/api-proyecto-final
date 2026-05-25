import pool from '../config/config_db.js';

export const createOrder = async (req, res) => {
    const { items } = req.body; 
    const userId = req.user.id;

    if (!items || items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        let totalAmount = 0;
        const itemsToSave = [];

        for (let item of items) {
            const [products] = await connection.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
            if (products.length === 0) throw new Error(`Product ID ${item.product_id} not found`);

            const product = products[0];
            if (product.stock < item.quantity) throw new Error(`Not enough stock for: ${product.name}`);

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            itemsToSave.push({
                product_id: product.id,
                quantity: item.quantity,
                price_at_purchase: product.price
            });

            await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, product.id]);
        }

        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
            [userId, totalAmount]
        );
        const orderId = orderResult.insertId;

        for (let details of itemsToSave) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, details.product_id, details.quantity, details.price_at_purchase]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Order processed successfully', orderId });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
};

export const getMyOrders = async (req, res) => {
    const userId = req.user.id;
    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC', [userId]);
        
        for (let order of orders) {
            const [items] = await pool.query(
                `SELECT oi.*, p.name FROM order_items oi 
                 JOIN products p ON oi.product_id = p.id 
                 WHERE oi.order_id = ?`, [order.id]
            );
            order.items = items;
        }
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};