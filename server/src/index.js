require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');
const s3Service = require('./services/s3.service');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

// Initialize Neon connection
const sql = neon(process.env.NEON_DATABASE_URL);

// Test database connection
app.get('/api/health', async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: result[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Get all tables
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const users = await sql`
      SELECT * FROM users 
      WHERE email = ${email} 
      AND deleted_at IS NULL
    `;
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    // In production, use bcrypt to compare passwords
    // const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    // For now, simple comparison (NOT SECURE - use bcrypt in production)
    if (password !== user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      accessToken: token,
      refreshToken: token, // In production, generate a separate refresh token
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, role, institutionId } = req.body;
    
    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create user
    const newUser = await sql`
      INSERT INTO users (email, password_hash, full_name, role, institution_id)
      VALUES (${email}, ${password}, ${fullName}, ${role}, ${institutionId})
      RETURNING id, email, full_name, role
    `;
    
    res.status(201).json({ user: newUser[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Routes
app.get('/api/users/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const jwt = require('jsonwebtoken');
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const users = await sql`
      SELECT id, email, full_name, role, institution_id 
      FROM users 
      WHERE id = ${decoded.userId}
    `;
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Course Routes
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await sql`SELECT * FROM courses ORDER BY created_at DESC`;
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Question Paper Routes
app.get('/api/question-papers', async (req, res) => {
  try {
    const papers = await sql`
      SELECT qp.*, c.title as course_title, u.full_name as created_by_name
      FROM question_papers qp
      JOIN courses c ON qp.course_id = c.id
      JOIN users u ON qp.created_by = u.id
      ORDER BY qp.created_at DESC
    `;
    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/question-papers', async (req, res) => {
  try {
    const { title, courseId, sourceMethod, sourceFileKey, questions } = req.body;
    
    const newPaper = await sql`
      INSERT INTO question_papers (title, course_id, source_method, source_file_key, created_by)
      VALUES (${title}, ${courseId}, ${sourceMethod}, ${sourceFileKey}, ${req.user?.id || '00000000-0000-0000-0000-000000000000'})
      RETURNING *
    `;
    
    // Add questions if provided
    if (questions && questions.length > 0) {
      for (const question of questions) {
        await sql`
          INSERT INTO questions (question_paper_id, prompt, type, bloom_level, marks, options, correct_answer, order_index)
          VALUES (${newPaper[0].id}, ${question.prompt}, ${question.type}, ${question.bloomLevel}, ${question.marks}, ${JSON.stringify(question.options)}, ${question.correctAnswer}, ${question.orderIndex})
        `;
      }
    }
    
    res.status(201).json(newPaper[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exam Routes
app.get('/api/exams', async (req, res) => {
  try {
    const exams = await sql`
      SELECT e.*, qp.title as question_paper_title
      FROM exams e
      JOIN question_papers qp ON e.question_paper_id = qp.id
      ORDER BY e.scheduled_start DESC
    `;
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submission Routes
app.post('/api/submissions', async (req, res) => {
  try {
    const { examSlotId, studentId } = req.body;
    
    const newSubmission = await sql`
      INSERT INTO submissions (exam_slot_id, status, tab_switch_count)
      VALUES (${examSlotId}, 'in_progress', 0)
      RETURNING *
    `;
    
    res.status(201).json(newSubmission[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/submissions/:id', async (req, res) => {
  try {
    const { status, tabSwitchCount, clientPayloadHash } = req.body;
    
    const updatedSubmission = await sql`
      UPDATE submissions 
      SET status = ${status}, 
          tab_switch_count = ${tabSwitchCount},
          client_payload_hash = ${clientPayloadHash},
          last_sync_at = NOW()
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    
    res.json(updatedSubmission[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proctoring Routes
app.post('/api/proctoring/events', async (req, res) => {
  try {
    const { submissionId, eventType, severity, metadata, snapshotFileKey } = req.body;
    
    const newEvent = await sql`
      INSERT INTO proctoring_logs (submission_id, event_type, severity, metadata, snapshot_file_key)
      VALUES (${submissionId}, ${eventType}, ${severity}, ${JSON.stringify(metadata)}, ${snapshotFileKey})
      RETURNING *
    `;
    
    res.status(201).json(newEvent[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File Upload Routes
app.post('/api/upload/question-paper', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const key = s3Service.generateKey('question-papers', req.file.originalname);
    const { url } = await s3Service.uploadFile(key, req.file.buffer, req.file.mimetype);

    res.json({ key, url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload/proctoring-snapshot', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const key = s3Service.generateKey('proctoring-snapshots', req.file.originalname);
    const { url } = await s3Service.uploadFile(key, req.file.buffer, req.file.mimetype);

    res.json({ key, url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files/presigned-url/:key', async (req, res) => {
  try {
    const url = await s3Service.getPresignedUrl(req.params.key);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 UAMP Server running on port ${PORT}`);
  console.log(`📊 Database: Neon PostgreSQL`);
  console.log(`🌐 CORS: ${process.env.CORS_ORIGIN || 'http://localhost:4200'}`);
});