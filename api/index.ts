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
        payload.email ||
        payload.payer?.email ||
        payload.data?.object?.customer_email ||
        payload.user_email;

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
// --- DATA ROUTES (TRANSACTIONS, ACCOUNTS, CLOSINGS) ---

app.get('/api/data', authenticateToken, async (req: any, res: any) => {
    try {
        const userId = req.user.id;
        const transactions = await db.query(
            'SELECT id, user_id, type, "desc", amount, category, date, barber, revenue_type as "revenueType", expense_type as "expenseType" FROM transactions WHERE user_id = $1 ORDER BY date DESC, id DESC',
            [userId]
        );
        const accounts = await db.query(
            'SELECT id, user_id, type, name, amount, due_date as "dueDate", status, paid_at as "paidAt", recurrence, variable_type as "variableType", reference_month as "referenceMonth" FROM accounts WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        const closings = await db.query('SELECT * FROM closings WHERE user_id = $1 ORDER BY date DESC', [userId]);

        res.json({
            transactions: transactions.rows,
            accounts: accounts.rows,
            closings: closings.rows
        });
    } catch (error) {
        console.error('Fetch data error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Transactions CRUD
app.post('/api/transactions', authenticateToken, async (req: any, res: any) => {
    const { type, desc, amount, category, date, barber, revenueType, expenseType } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO transactions (user_id, type, "desc", amount, category, date, barber, revenue_type, expense_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [req.user.id, type, desc, amount, category, date, barber, revenueType, expenseType]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/transactions/:id', authenticateToken, async (req: any, res: any) => {
    const { type, desc, amount, category, date, barber, revenueType, expenseType } = req.body;
    try {
        const result = await db.query(
            'UPDATE transactions SET type = $1, "desc" = $2, amount = $3, category = $4, date = $5, barber = $6, revenue_type = $7, expense_type = $8 WHERE id = $9 AND user_id = $10 RETURNING *',
            [type, desc, amount, category, date, barber, revenueType, expenseType, req.params.id, req.user.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/transactions/:id', authenticateToken, async (req: any, res: any) => {
    try {
        await db.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Accounts CRUD
app.post('/api/accounts', authenticateToken, async (req: any, res: any) => {
    const { type, name, amount, dueDate, status, paidAt, recurrence, variableType, referenceMonth } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO accounts (user_id, type, name, amount, due_date, status, paid_at, recurrence, variable_type, reference_month) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [req.user.id, type, name, amount, dueDate, status, paidAt, recurrence, variableType, referenceMonth]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/accounts/:id', authenticateToken, async (req: any, res: any) => {
    const { type, name, amount, dueDate, status, paidAt, recurrence, variableType, referenceMonth } = req.body;
    try {
        const result = await db.query(
            'UPDATE accounts SET type = $1, name = $2, amount = $3, due_date = $4, status = $5, paid_at = $6, recurrence = $7, variable_type = $8, reference_month = $9 WHERE id = $10 AND user_id = $11 RETURNING *',
            [type, name, amount, dueDate, status, paidAt, recurrence, variableType, referenceMonth, req.params.id, req.user.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/accounts/:id', authenticateToken, async (req: any, res: any) => {
    try {
        await db.query('DELETE FROM accounts WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Closings CRUD
app.post('/api/closings', authenticateToken, async (req: any, res: any) => {
    const { date, totalAmount, notes } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO closings (user_id, date, total_amount, notes) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, date, totalAmount, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default app;
