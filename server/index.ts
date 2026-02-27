import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { initDB } from './db';
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

// --- AUTH ROUTES ---
app.post('/api/auth/register', (req, res) => {
    const { username, password, name, email } = req.body;
    if (!username || !password || !name || !email) return res.status(400).json({ error: 'Name, Email, Username and password are required' });

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const checkQuery = db.prepare('SELECT COUNT(*) as count FROM users');
        const { count } = checkQuery.get() as { count: number };

        const role = count === 0 ? 'admin' : 'user';

        const insert = db.prepare('INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)');
        insert.run(username, hashedPassword, name, email, role);

        res.status(201).json({ message: 'User created successfully', role });
    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(400).json({ error: 'Username or Email already exists' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    try {
        const query = db.prepare('SELECT * FROM users WHERE username = ?');
        const user = query.get(username) as any;

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
        res.status(500).json({ error: 'Server error' });
    }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/users', authenticateToken, (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    try {
        const users = db.prepare('SELECT id, username, name, email, role, active, expiration_date, created_at FROM users').all();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/update-expiration', authenticateToken, (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    const { id, expiration_date } = req.body;
    if (!id) return res.status(400).json({ error: 'User ID required' });

    try {
        db.prepare('UPDATE users SET expiration_date = ? WHERE id = ?').run(expiration_date || null, id);
        res.json({ message: 'Expiration date updated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/toggle-status', authenticateToken, (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'User ID required' });

    try {
        const user = db.prepare('SELECT active FROM users WHERE id = ?').get(id) as any;
        if (!user) return res.status(404).json({ error: 'User not found' });

        const newStatus = user.active === 1 ? 0 : 1;
        db.prepare('UPDATE users SET active = ? WHERE id = ?').run(newStatus, id);

        res.json({ message: 'User status updated', active: newStatus });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/change-password', authenticateToken, (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    const { id, newPassword } = req.body;
    if (!id || !newPassword) return res.status(400).json({ error: 'User ID and new password required' });

    try {
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        const result = db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, id);

        if (result.changes === 0) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/delete-user', authenticateToken, (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'User ID required' });

    try {
        // Prevent deleting the master user
        const user = db.prepare('SELECT username FROM users WHERE id = ?').get(id) as any;
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.username === 'master') {
            return res.status(400).json({ error: 'Cannot delete the master user' });
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/update-role', authenticateToken, (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    const { id, role } = req.body;
    if (!id || !role) return res.status(400).json({ error: 'User ID and role are required' });
    if (role !== 'admin' && role !== 'user') return res.status(400).json({ error: 'Invalid role' });

    try {
        // Prevent downgrading the master user
        const user = db.prepare('SELECT username FROM users WHERE id = ?').get(id) as any;
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.username === 'master' && role === 'user') {
            return res.status(400).json({ error: 'Cannot downgrade the master user' });
        }

        db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/bulk-create-users', authenticateToken, (req: any, res: any) => {
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

    const insert = db.prepare('INSERT INTO users (username, password, name, email, role, expiration_date) VALUES (?, ?, ?, ?, ?, ?)');

    for (const userData of users) {
        const { username, password, name, email, expirationDate } = userData;
        if (!username || !password || !name || !email) {
            results.failed++;
            results.errors.push(`User ${username || email || 'unknown'}: Missing required fields`);
            continue;
        }

        try {
            const hashedPassword = bcrypt.hashSync(password, 10);
            insert.run(username, hashedPassword, name, email, 'user', expirationDate || null);
            results.success++;
        } catch (error: any) {
            results.failed++;
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                results.errors.push(`User ${username}: Username or Email already exists`);
            } else {
                results.errors.push(`User ${username}: ${error.message}`);
            }
        }
    }

    res.json({ message: 'Bulk processing complete', results });
});

app.post('/api/webhooks/payment', (req, res) => {
    const payload = req.body;
    console.log('Webhook received:', JSON.stringify(payload, null, 2));

    // Kirvano uses 'status' and 'customer.email'
    // Hotmart uses 'status' and 'buyer.email'
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
        console.log('No email found in webhook');
        return res.status(400).json({ error: 'Email not found in payload' });
    }

    try {
        // Expiration: +30 days
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 30);
        const expStr = expiration.toISOString();

        // Check if user exists
        const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;

        if (user) {
            // Activate and extend
            db.prepare('UPDATE users SET active = 1, expiration_date = ? WHERE id = ?').run(expStr, user.id);
            console.log(`User ${email} activated/extended.`);
        } else {
            // Create new user (using email as username)
            const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
            const defaultPassword = bcrypt.hashSync('pente123', 10); // Default pass, user should change
            db.prepare('INSERT INTO users (username, name, email, password, role, active, expiration_date) VALUES (?, ?, ?, ?, ?, ?, ?)')
                .run(username, email.split('@')[0], email, defaultPassword, 'user', 1, expStr);
            console.log(`New user created for ${email}.`);
        }

        res.json({ message: 'User access updated' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Serve static files from the React app
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
