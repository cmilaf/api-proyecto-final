import pool from '../config/db.js';

export const getAllProducts = async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const searchProducts = async (req, res) => {
    const { q } = req.query;
    try {
        const [products] = await pool.query(
            'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?',
            [`%${q}%`, `%${q}%`]
        );
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req, res) => {
    const { name, description, price, stock } = req.body;
    if (price < 0 || stock < 0) return res.status(400).json({ message: 'Values cannot be negative' });

    try {
        await pool.query('INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)', [name, description, price, stock]);
        res.status(201).json({ message: 'Product created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;
    if (price < 0 || stock < 0) return res.status(400).json({ message: 'Values cannot be negative' });

    try {
        const [result] = await pool.query(
            'UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
            [name, description, price, stock, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};