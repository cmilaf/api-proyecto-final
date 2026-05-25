import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'All fields are required' });

    try {
        const [existing] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existing.length > 0) return res.status(400).json({ message: 'Username already taken' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, "customer")', [username, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

        await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, role: user.role, username: user.username });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllCustomers = async (req, res) => {
    try {
        const [customers] = await pool.query('SELECT id, username, role, last_login FROM users WHERE role = "customer"');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};