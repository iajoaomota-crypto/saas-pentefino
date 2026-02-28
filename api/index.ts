import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { initDB } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-joaomota-key';

// Init DB tables
initDB();

// Middleware auth
const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// --- HEALTH CHECK ---
app.get('/api/health', async (req, res) => {
    try {
        const dbCheck = await db.query('SELECT NOW()');
        res.json({
            status: 'ok',
            database: 'connected',
            time: dbCheck.rows[0].now,
            env: process.env.NODE_ENV
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            message: error.message,
            code: error.code
        });
    }
});

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    const { username, password, name, email } = req.body;
    if (!username || !password || !name || !email) return res.status(400).json({ error: 'Name, Email, Username and password are required' });

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const checkQuery = await db.query('SELECT COUNT(*) as count FROM users');
        const count = parseInt(checkQuery.rows[0].count);

        const role = count === 0 ? 'admin' : 'user';

        await db.query('INSERT INTO users (username, password, name, email, role) VALUES ($1, $2, $3, $4, $5)',
            [username, hashedPassword, name, email, role]);

        res.status(201).json({ message: 'User created successfully', role });
    } catch (error: any) {
        if (error.code === '23505') { // Postgres UNIQUE_VIOLATION
            res.status(400).json({ error: 'Username or Email already exists' });
        } else {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user || user.active === 0) {
            return res.status(401).json({ error: 'Invalid credentials or inactive user' });
        }

        if (user.expiration_date) {
            const expDate = new Date(user.expiration_date);
            if (expDate < new Date()) {
                return res.status(403).json({ error: 'Account expired. Please contact an administrator.' });
            }
        }

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '12h' });

        res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name, email: user.email, expiration_date: user.expiration_date } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/users', authenticateToken, async (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    try {
        const result = await db.query('SELECT id, username, name, email, role, active, expiration_date, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/update-expiration', authenticateToken, async (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    const { id, expiration_date } = req.body;
    if (!id) return res.status(400).json({ error: 'User ID required' });

    try {
        await db.query('UPDATE users SET expiration_date = $1 WHERE id = $2', [expiration_date || null, id]);
        res.json({ message: 'Expiration date updated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/toggle-status', authenticateToken, async (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'User ID required' });

    try {
        const result = await db.query('SELECT active FROM users WHERE id = $1', [id]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });

        const newStatus = user.active === 1 ? 0 : 1;
        await db.query('UPDATE users SET active = $1 WHERE id = $2', [newStatus, id]);

        res.json({ message: 'User status updated', active: newStatus });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/change-password', authenticateToken, async (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    const { id, newPassword } = req.body;
    if (!id || !newPassword) return res.status(400).json({ error: 'User ID and new password required' });

    try {
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        const result = await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);

        if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/delete-user', authenticateToken, async (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'User ID required' });

    try {
        // Prevent deleting the master user
        const result = await db.query('SELECT username FROM users WHERE id = $1', [id]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.username === 'master') {
            return res.status(400).json({ error: 'Cannot delete the master user' });
        }

        await db.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/update-role', authenticateToken, async (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    const { id, role } = req.body;
    if (!id || !role) return res.status(400).json({ error: 'User ID and role are required' });
    if (role !== 'admin' && role !== 'user') return res.status(400).json({ error: 'Invalid role' });

    try {
        const result = await db.query('SELECT username FROM users WHERE id = $1', [id]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.username === 'master' && role === 'user') {
            return res.status(400).json({ error: 'Cannot downgrade the master user' });
        }

        await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/bulk-create-users', authenticateToken, async (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    const { users } = req.body;
    if (!users || !Array.isArray(users)) {
        return res.status(400).json({ error: 'Users array is required' });
    }

    const results = {
        success: 0,
        failed: 0,
        errors: [] as string[]
    };

    for (const userData of users) {
        const { username, password, name, email, expirationDate } = userData;
        if (!username || !password || !name || !email) {
            results.failed++;
            results.errors.push(`User ${username || email || 'unknown'}: Missing required fields`);
            continue;
        }

        try {
            const hashedPassword = bcrypt.hashSync(password, 10);
            await db.query('INSERT INTO users (username, password, name, email, role, expiration_date) VALUES ($1, $2, $3, $4, $5, $6)',
                [username, hashedPassword, name, email, 'user', expirationDate || null]);
            results.success++;
        } catch (error: any) {
            results.failed++;
            if (error.code === '23505') {
                results.errors.push(`User ${username}: Username or Email already exists`);
            } else {
                results.errors.push(`User ${username}: ${error.message}`);
            }
        }
    }

    res.json({ message: 'Bulk processing complete', results });
});

app.post('/api/webhooks/payment', async (req, res) => {
    const payload = req.body;
    console.log('Webhook received:', JSON.stringify(payload, null, 2));

    const status = payload.status || (payload.data && payload.data.status);
    const email = payload.customer?.email ||
        payload.data?.buyer?.email ||
        payload.buyer?.email ||
        payload.email;

    const isApproved = ['approved', 'paid', 'succeeded', 'compra_aprovada'].includes(status?.toLowerCase());

    if (!isApproved) {
        console.log(`Payment not approved: ${status} for ${email}`);
        return res.json({ message: 'Status ignored' });
    }

    if (!email) {
        return res.status(400).json({ error: 'Email not found in payload' });
    }

    try {
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 30);
        const expStr = expiration.toISOString();

        const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (user) {
            await db.query('UPDATE users SET active = 1, expiration_date = $1 WHERE id = $2', [expStr, user.id]);
        } else {
            const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
            const defaultPassword = bcrypt.hashSync('pente123', 10);
            await db.query('INSERT INTO users (username, name, email, password, role, active, expiration_date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [username, email.split('@')[0], email, defaultPassword, 'user', 1, expStr]);
        }

        res.json({ message: 'User access updated' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve static files managed by Vercel

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
