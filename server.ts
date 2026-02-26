import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './server/db';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-123';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  const PORT = 3000;

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
      const stmt = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
      const info = stmt.run(email, hashedPassword, name);
      const userId = info.lastInsertRowid;

      // Initialize stats
      const statsStmt = db.prepare('INSERT INTO stats (user_id, weight, goal_weight, daily_calorie_goal, streak, junk_food_free_days) VALUES (?, ?, ?, ?, ?, ?)');
      statsStmt.run(userId, 78.5, 72.0, 2200, 0, 0);

      const token = jwt.sign({ id: userId, email }, JWT_SECRET);
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none' 
      });
      res.json({ user: { id: userId, email, name } });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const user: any = stmt.get(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none' 
      });
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  // Get User Data (Stats & Logs)
  app.get('/api/user/data', authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    try {
      const statsStmt = db.prepare('SELECT * FROM stats WHERE user_id = ?');
      const stats = statsStmt.get(userId);

      const logsStmt = db.prepare('SELECT * FROM logs WHERE user_id = ? ORDER BY created_at DESC');
      const logs = logsStmt.all(userId);

      // Calculate macros from logs for today
      // In a real app, this would be more complex date filtering
      // For prototype, we just return all logs and let frontend filter or assume all are relevant
      
      res.json({ stats, logs });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Add Log
  app.post('/api/logs', authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const { id, type, name, calories, macros, time, prepMethod } = req.body;
    
    try {
      const stmt = db.prepare(`
        INSERT INTO logs (id, user_id, type, name, calories, protein, carbs, fats, time, prep_method)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
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
  app.post('/api/user/weight', authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const { weight } = req.body;
    try {
      const stmt = db.prepare('UPDATE stats SET weight = ? WHERE user_id = ?');
      stmt.run(weight, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Check Auth Status
  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const stmt = db.prepare('SELECT id, email, name FROM users WHERE id = ?');
    const user = stmt.get(req.user.id);
    res.json({ user });
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
