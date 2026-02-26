import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query, initDb } from './server/db';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-123';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  const PORT = 3000;

  // Initialize DB
  await initDb();

  app.use(express.json());
  app.use(cookieParser());

  // --- Socket.io ---
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Register
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
        [email, hashedPassword, name]
      );
      const userId = result.rows[0].id;

      // Initialize stats
      await query(
        'INSERT INTO stats (user_id, weight, goal_weight, daily_calorie_goal, streak, junk_food_free_days) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, 78.5, 72.0, 2200, 0, 0]
      );

      const token = jwt.sign({ id: userId, email }, JWT_SECRET);
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none' 
      });
      res.json({ user: { id: userId, email, name }, token });
    } catch (error: any) {
      if (error.code === '23505') { // Postgres unique violation code
        return res.status(400).json({ error: 'Email already exists' });
      }
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none' 
      });
      res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  // Get User Data (Stats & Logs)
  app.get('/api/user/data', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    try {
      const statsResult = await query('SELECT * FROM stats WHERE user_id = $1', [userId]);
      const stats = statsResult.rows[0];

      const logsResult = await query('SELECT * FROM logs WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      const logs = logsResult.rows;
      
      res.json({ stats, logs });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Add Log
  app.post('/api/logs', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    const { id, type, name, calories, macros, time, prepMethod } = req.body;
    
    try {
      await query(
        `INSERT INTO logs (id, user_id, type, name, calories, protein, carbs, fats, time, prep_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          id, 
          userId, 
          type, 
          name, 
          calories, 
          macros?.protein || 0, 
          macros?.carbs || 0, 
          macros?.fats || 0, 
          time, 
          prepMethod || null
        ]
      );

      // Emit real-time update
      io.to(`user_${userId}`).emit('log_added', req.body);
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Update Weight
  app.post('/api/user/weight', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    const { weight } = req.body;
    try {
      await query('UPDATE stats SET weight = $1 WHERE user_id = $2', [weight, userId]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Check Auth Status
  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const result = await query('SELECT id, email, name FROM users WHERE id = $1', [req.user.id]);
      const user = result.rows[0];
      res.json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
