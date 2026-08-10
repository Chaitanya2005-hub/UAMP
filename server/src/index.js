require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');
const s3Service = require('./services/s3.service');
const mammoth = require('mammoth');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
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

function authenticatedUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    return require('jsonwebtoken').verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function requireRole(req, res, roles) {
  const user = authenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication is required.' });
    return null;
  }
  if (roles && !roles.includes(user.role)) {
    res.status(403).json({ error: 'You do not have permission to perform this action.' });
    return null;
  }
  return user;
}

async function canManageExam(examId, user) {
  const rows = await sql`SELECT created_by FROM exams WHERE id = ${examId}`;
  return rows.length > 0 && (user.role === 'admin' || rows[0].created_by === user.userId);
}

async function closeExpiredExams() {
  const closed = await sql`UPDATE exams SET status = 'completed' WHERE status = 'live' AND scheduled_end <= NOW() RETURNING id`;
  for (const exam of closed) {
    await sql`UPDATE submissions s SET status = 'expired', submitted_at = NOW() FROM exam_slots es WHERE s.exam_slot_id = es.id AND es.exam_id = ${exam.id} AND s.status = 'in_progress'`;
  }
}

async function notifyExamStudents(examId, title, message, type = 'info') {
  await sql`
    INSERT INTO notifications (user_id, title, message, type)
    SELECT student_id, ${title}, ${message}, ${type}
    FROM exam_slots WHERE exam_id = ${examId} AND registration_status = 'approved'
  `;
}

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

setInterval(() => closeExpiredExams().catch(error => console.error('Automatic exam closure failed:', error.message)), 60_000);

app.get('/api/server-time', (req, res) => {
  res.json({ serverTime: new Date().toISOString() });
});

app.get('/api/notifications', async (req, res) => {
  const user = requireRole(req, res);
  if (!user) return;
  try {
    res.json(await sql`SELECT id, title, message, type, read_at AS "readAt", created_at AS "createdAt" FROM notifications WHERE user_id = ${user.userId} ORDER BY created_at DESC LIMIT 30`);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/notifications/:id/read', async (req, res) => {
  const user = requireRole(req, res);
  if (!user) return;
  try {
    await sql`UPDATE notifications SET read_at = NOW() WHERE id = ${req.params.id} AND user_id = ${user.userId}`;
    res.json({ read: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
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
app.get('/api/question-papers/mine', async (req, res) => {
  const user = requireRole(req, res, ['teacher', 'admin']);
  if (!user) return;
  try {
    const papers = await sql`
      SELECT qp.id, qp.title, qp.course_id AS "courseId", c.code AS "courseCode", c.title AS "courseTitle",
        qp.source_method AS "sourceMethod", qp.status, qp.source_file_key AS "sourceFileKey",
        qp.created_at AS "createdAt", COUNT(q.id)::int AS "questionCount"
      FROM question_papers qp
      JOIN courses c ON c.id = qp.course_id
      LEFT JOIN questions q ON q.question_paper_id = qp.id
      WHERE qp.created_by = ${user.userId}
      GROUP BY qp.id, c.code, c.title
      ORDER BY qp.created_at DESC
    `;
    res.json(papers);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

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
  const user = requireRole(req, res, ['teacher', 'admin']);
  if (!user) return;
  try {
    const { title, courseId, sourceMethod, sourceFileKey, questions } = req.body;
    
    const newPaper = await sql`
      INSERT INTO question_papers (title, course_id, source_method, source_file_key, created_by, status)
      VALUES (${title}, ${courseId}, ${sourceMethod}, ${sourceFileKey}, ${user.userId}, 'pending_approval')
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

app.patch('/api/question-papers/:id', async (req, res) => {
  const user = requireRole(req, res, ['admin']);
  if (!user) return;
  try {
    const { id } = req.params;
    const { status, rejectionReason, reviewedBy, reviewedAt } = req.body;
    
    const updated = await sql`
      UPDATE question_papers 
      SET status = ${status},
          rejection_reason = ${rejectionReason || null},
          reviewed_by = ${reviewedBy || user.userId},
          reviewed_at = ${reviewedAt || new Date().toISOString()}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Question paper not found' });
    }
    
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function parseQuestionsFromText(text) {
  const questions = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let currentQuestion = null;
  
  for (const line of lines) {
    // Detect question start: "1. ", "Q1.", "1)", etc.
    const qMatch = line.match(/^([Q]*\d+[\.\)])\s*(.+)/i);
    if (qMatch) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        type: 'mcq_single',
        prompt: qMatch[2].trim(),
        marks: 1, // Default marks
        options: []
      };
      
      // Try to extract marks if specified like "[2 marks]"
      const markMatch = line.match(/\[(\d+)\s*marks?\]/i) || line.match(/\((\d+)\s*marks?\)/i);
      if (markMatch) {
         currentQuestion.marks = parseInt(markMatch[1], 10);
         currentQuestion.prompt = currentQuestion.prompt.replace(markMatch[0], '').trim();
      }

      // Check if it's a coding question
      if (currentQuestion.prompt.includes('[CODING]')) {
        currentQuestion.type = 'essay';
        currentQuestion.prompt = currentQuestion.prompt.replace('[CODING]', '').trim();
      }
      
      continue;
    }
    
    // Detect options: "A) ", "a. ", "(A) ", "*A) ", "[CORRECT] A)"
    const optMatch = line.match(/^(\*|\[CORRECT\]\s*)?[\(]?([a-d])[\.\)]\s*(.+)/i);
    if (optMatch && currentQuestion && currentQuestion.type === 'mcq_single') {
      const isCorrect = !!optMatch[1]; // True if it has '*' or '[CORRECT]'
      currentQuestion.options.push({
        text: optMatch[3].trim(),
        isCorrect: isCorrect
      });
      continue;
    }
    
    // If it's just text and we have a current question without options (or it's a coding question), append to prompt
    if (currentQuestion && (currentQuestion.options.length === 0 || currentQuestion.type === 'essay')) {
      currentQuestion.prompt += ' ' + line;
    }
  }
  
  if (currentQuestion) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

function parseCSV(text) {
  const rows = [];
  let row = [""];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push("");
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      rows.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    rows.push(row);
  }
  return rows;
}

function parseQuestionsFromCSV(text) {
  const questions = [];
  const rows = parseCSV(text);
  if (rows.length <= 1) return [];
  
  const headers = rows[0].map(h => h.trim().toLowerCase());
  const firstHeader = headers[0];
  
  // Detect format mode: 'mcq' | 'written' | 'coding' | 'legacy'
  let mode = 'legacy';
  if (firstHeader === 'question' && headers.includes('option a')) {
    mode = 'mcq';
  } else if (firstHeader === 'written question') {
    mode = 'written';
  } else if (firstHeader === 'coding question') {
    mode = 'coding';
  }
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || (row.length === 1 && row[0] === "")) continue;
    
    if (mode === 'mcq') {
      const prompt = row[0]?.trim();
      const marks = parseInt(row[1]?.trim() || "1", 10);
      const optA = row[2]?.trim();
      const optB = row[3]?.trim();
      const optC = row[4]?.trim();
      const optD = row[5]?.trim();
      const correctOptLetter = row[6]?.trim().toUpperCase();
      
      if (!prompt) continue;
      
      const options = [];
      if (optA) options.push({ text: optA, isCorrect: correctOptLetter === 'A' });
      if (optB) options.push({ text: optB, isCorrect: correctOptLetter === 'B' });
      if (optC) options.push({ text: optC, isCorrect: correctOptLetter === 'C' });
      if (optD) options.push({ text: optD, isCorrect: correctOptLetter === 'D' });
      
      questions.push({
        type: 'mcq_single',
        prompt: prompt,
        marks: marks,
        options: options
      });
    } else if (mode === 'written') {
      const prompt = row[0]?.trim();
      const marks = parseInt(row[1]?.trim() || "1", 10);
      if (!prompt) continue;
      
      questions.push({
        type: 'short_answer',
        prompt: prompt,
        marks: marks,
        options: []
      });
    } else if (mode === 'coding') {
      const prompt = row[0]?.trim();
      const marks = parseInt(row[1]?.trim() || "1", 10);
      if (!prompt) continue;
      
      questions.push({
        type: 'essay', // Coding maps to essay type in database
        prompt: prompt,
        marks: marks,
        options: []
      });
    } else {
      // Legacy multi-column CSV support
      const type = row[0]?.trim().toLowerCase();
      const prompt = row[1]?.trim();
      const marks = parseInt(row[2]?.trim() || "1", 10);
      
      if (!prompt) continue;
      
      if (type === 'coding') {
        questions.push({
          type: 'essay',
          prompt: prompt,
          marks: marks,
          options: []
        });
      } else if (type === 'mcq_single') {
        const optA = row[3]?.trim();
        const optB = row[4]?.trim();
        const optC = row[5]?.trim();
        const optD = row[6]?.trim();
        const correctOptLetter = row[7]?.trim().toUpperCase();
        
        const options = [];
        if (optA) options.push({ text: optA, isCorrect: correctOptLetter === 'A' });
        if (optB) options.push({ text: optB, isCorrect: correctOptLetter === 'B' });
        if (optC) options.push({ text: optC, isCorrect: correctOptLetter === 'C' });
        if (optD) options.push({ text: optD, isCorrect: correctOptLetter === 'D' });
        
        questions.push({
          type: 'mcq_single',
          prompt: prompt,
          marks: marks,
          options: options
        });
      } else {
        questions.push({
          type: 'short_answer',
          prompt: prompt,
          marks: marks,
          options: []
        });
      }
    }
  }
  return questions;
}

app.post('/api/question-papers/upload-parse', upload.single('file'), async (req, res) => {
  const user = requireRole(req, res, ['teacher', 'admin']);
  if (!user) return;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let parsedQuestions = [];
    const originalName = req.file.originalname.toLowerCase();
    const courseId = req.body.courseId;
    const title = req.body.title || 'Uploaded Question Paper';

    if (originalName.endsWith('.csv') || req.file.mimetype === 'text/csv' || req.file.mimetype === 'application/vnd.ms-excel') {
      const text = req.file.buffer.toString('utf-8');
      parsedQuestions = parseQuestionsFromCSV(text);
    } else if (originalName.endsWith('.docx') || req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      const text = result.value;
      parsedQuestions = parseQuestionsFromText(text);
    } else {
      return res.status(400).json({ error: 'Only CSV and DOCX files are currently supported for parsing.' });
    }

    if (parsedQuestions.length === 0) {
      parsedQuestions = [{
        type: 'mcq_single',
        prompt: 'Could not parse any questions from the document. Please ensure it follows standard template layout.',
        marks: 0,
        options: []
      }];
    }

    // Save the file to S3
    const key = s3Service.generateKey('question-papers', req.file.originalname);
    const { url } = await s3Service.uploadFile(key, req.file.buffer, req.file.mimetype);

    // Create question paper record
    const questionPaperResult = await sql`
      INSERT INTO question_papers (course_id, title, source_method, source_file_key, status, created_by)
      VALUES (${courseId}, ${title}, 'docx_upload', ${key}, 'draft', ${user.userId})
      RETURNING id
    `;

    const questionPaperId = questionPaperResult[0].id;

    // Insert parsed questions
    for (const question of parsedQuestions) {
      await sql`
        INSERT INTO questions (question_paper_id, prompt, type, options, correct_answer, order_index, marks)
        VALUES (
          ${questionPaperId},
          ${question.prompt},
          ${question.type},
          ${JSON.stringify(question.options)},
          ${question.correctAnswer},
          ${question.orderIndex || 1},
          ${question.marks || 1}
        )
      `;
    }

    res.json({
      questionPaperId,
      questions: parsedQuestions,
      sourceFileKey: key,
      sourceFileUrl: url,
      parsedQuestionsCount: parsedQuestions.length,
      title,
      status: 'draft'
    });
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

app.get('/api/student/exams', async (req, res) => {
  const user = requireRole(req, res, ['student']);
  if (!user) return;
  try {
    const slots = await sql`
      SELECT es.id, es.exam_id AS "examId", es.student_id AS "studentId",
        es.registration_status AS "registrationStatus", e.id AS "exam_id_value",
        e.question_paper_id AS "questionPaperId", e.title AS "examTitle",
        e.duration_minutes AS "durationMinutes", e.scheduled_start AS "scheduledStart",
        e.scheduled_end AS "scheduledEnd", e.status AS "examStatus",
        e.proctoring_enabled AS "proctoringEnabled", e.tab_switch_limit AS "tabSwitchLimit"
      FROM exam_slots es JOIN exams e ON e.id = es.exam_id
      WHERE es.student_id = ${user.userId} AND es.registration_status = 'approved'
        AND e.status IN ('scheduled', 'live')
      ORDER BY e.scheduled_start ASC
    `;
    res.json(slots.map(slot => ({
      id: slot.id, examId: slot.examId, studentId: slot.studentId,
      registrationStatus: slot.registrationStatus,
      exam: {
        id: slot.exam_id_value, questionPaperId: slot.questionPaperId, title: slot.examTitle,
        durationMinutes: slot.durationMinutes, scheduledStart: slot.scheduledStart,
        scheduledEnd: slot.scheduledEnd, status: slot.examStatus,
        proctoringEnabled: slot.proctoringEnabled, tabSwitchLimit: slot.tabSwitchLimit
      }
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/student/submissions', async (req, res) => {
  const user = requireRole(req, res, ['student']);
  if (!user) return;
  try {
    const submissions = await sql`
      SELECT s.id, s.exam_slot_id AS "examSlotId", s.status, s.tab_switch_count AS "tabSwitchCount",
        s.submitted_at AS "submittedAt", s.created_at AS "createdAt",
        e.title AS "examTitle", e.scheduled_start AS "scheduledStart"
      FROM submissions s
      JOIN exam_slots es ON es.id = s.exam_slot_id
      JOIN exams e ON e.id = es.exam_id
      WHERE es.student_id = ${user.userId}
      ORDER BY s.created_at DESC
    `;
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/exams/active', async (req, res) => {
  try {
    const exams = await sql`
      SELECT e.id, e.title, e.duration_minutes, e.scheduled_start, e.scheduled_end,
             e.status, e.proctoring_enabled, e.tab_switch_limit,
             c.code AS course,
             COUNT(DISTINCT es.student_id) AS student_count
      FROM exams e
      JOIN question_papers qp ON qp.id = e.question_paper_id
      JOIN courses c ON c.id = qp.course_id
      LEFT JOIN exam_slots es ON es.exam_id = e.id AND es.registration_status = 'approved'
      WHERE e.status IN ('live', 'scheduled')
      GROUP BY e.id, e.title, e.duration_minutes, e.scheduled_start, e.scheduled_end,
               e.status, e.proctoring_enabled, e.tab_switch_limit, c.code
      ORDER BY e.scheduled_start DESC
    `;
    res.json(exams);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/exams/:examId', async (req, res) => {
  try {
    const exams = await sql`
      SELECT e.id, e.question_paper_id AS "questionPaperId", e.title,
        e.duration_minutes AS "durationMinutes", e.scheduled_start AS "scheduledStart",
        e.scheduled_end AS "scheduledEnd", e.status, e.proctoring_enabled AS "proctoringEnabled",
        e.tab_switch_limit AS "tabSwitchLimit", e.created_by AS "createdBy", e.created_at AS "createdAt"
      FROM exams e WHERE e.id = ${req.params.examId}
    `;
    if (!exams.length) return res.status(404).json({ error: 'Exam not found' });

    const exam = exams[0];
    const now = new Date();
    const startTime = new Date(exam.scheduledStart);
    const endTime = new Date(exam.scheduledEnd);

    // Add debug info
    exam._debug = {
      currentTime: now.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      isLive: exam.status === 'live',
      withinTimeWindow: now >= startTime && now < endTime,
      timeComparison: {
        now_vs_start: now - startTime,
        now_vs_end: now - endTime
      }
    };

    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/scheduling/courses', async (req, res) => {
  try { res.json(await sql`SELECT id, code, title FROM courses ORDER BY code`); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/scheduling/students', async (req, res) => {
  try { res.json(await sql`SELECT id, full_name AS "fullName", email, enrollment_number AS "enrollmentNumber" FROM users WHERE role = 'student' AND is_active = true AND deleted_at IS NULL ORDER BY full_name`); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/scheduling/exams', async (req, res) => {
  const user = requireRole(req, res, ['admin', 'teacher']);
  if (!user) return;
  try {
    const { title, courseId, durationMinutes, scheduledStart, scheduledEnd, questionPaperDeadline, tabSwitchLimit, proctoringEnabled, studentIds } = req.body;
    if (!title || !courseId || !scheduledStart || !scheduledEnd || !questionPaperDeadline || !Array.isArray(studentIds) || !studentIds.length) return res.status(400).json({ error: 'Schedule details, a paper deadline, and at least one student are required.' });
    const paper = await sql`INSERT INTO question_papers (course_id, created_by, title, source_method, status) VALUES (${courseId}, ${user.userId}, ${title + ' Question Paper'}, 'manual_builder', 'draft') RETURNING id`;
    const exam = await sql`INSERT INTO exams (question_paper_id, title, duration_minutes, scheduled_start, scheduled_end, tab_switch_limit, proctoring_enabled, status, created_by)
      VALUES (${paper[0].id}, ${title}, ${durationMinutes}, ${scheduledStart}, ${scheduledEnd}, ${tabSwitchLimit}, ${proctoringEnabled}, 'scheduled', ${user.userId}) RETURNING id`;
    await sql`UPDATE exams SET question_paper_deadline = ${questionPaperDeadline} WHERE id = ${exam[0].id}`;
    await sql`
      INSERT INTO exam_slots (exam_id, student_id, registration_status)
      SELECT ${exam[0].id}, student_id::uuid, 'approved'
      FROM jsonb_array_elements_text(${JSON.stringify(studentIds)}::jsonb) AS student_id
      ON CONFLICT (exam_id, student_id) DO NOTHING
    `;
    await notifyExamStudents(exam[0].id, 'New exam scheduled', `${title} has been added to your timetable.`, 'schedule');
    res.status(201).json({ id: exam[0].id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/exams/:examId/schedule', async (req, res) => {
  const user = requireRole(req, res, ['admin', 'teacher']);
  if (!user) return;
  try {
    if (!(await canManageExam(req.params.examId, user))) return res.status(403).json({ error: 'You cannot edit this exam.' });
    const { scheduledStart, scheduledEnd, durationMinutes } = req.body;
    if (!scheduledStart || !scheduledEnd || new Date(scheduledEnd) <= new Date(scheduledStart)) return res.status(400).json({ error: 'A valid start and end time are required.' });
    const updated = await sql`UPDATE exams SET scheduled_start = ${scheduledStart}, scheduled_end = ${scheduledEnd}, duration_minutes = ${durationMinutes} WHERE id = ${req.params.examId} AND status = 'scheduled' RETURNING *`;
    if (!updated.length) return res.status(409).json({ error: 'Only scheduled exams can be rescheduled.' });
    await notifyExamStudents(req.params.examId, 'Exam timetable updated', 'Your exam timetable has been updated. Please review the new start time.', 'schedule');
    res.json(updated[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/exams/:examId/cancel', async (req, res) => {
  const user = requireRole(req, res, ['admin', 'teacher']);
  if (!user) return;
  try {
    if (!(await canManageExam(req.params.examId, user))) return res.status(403).json({ error: 'You cannot cancel this exam.' });
    const updated = await sql`UPDATE exams SET status = 'cancelled' WHERE id = ${req.params.examId} AND status = 'scheduled' RETURNING id, status`;
    if (!updated.length) return res.status(409).json({ error: 'Only scheduled exams can be cancelled.' });
    await notifyExamStudents(req.params.examId, 'Exam cancelled', 'This exam has been cancelled.', 'warning');
    res.json(updated[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/exams/:examId/attendance', async (req, res) => {
  const user = requireRole(req, res, ['admin', 'teacher']);
  if (!user) return;
  try {
    if (!(await canManageExam(req.params.examId, user))) return res.status(403).json({ error: 'You cannot view this exam.' });
    const rows = await sql`SELECT es.id, u.full_name AS name, u.enrollment_number AS "enrollmentNumber", es.registration_status AS "registrationStatus", s.status AS "submissionStatus", s.started_at AS "startedAt", s.submitted_at AS "submittedAt" FROM exam_slots es JOIN users u ON u.id = es.student_id LEFT JOIN submissions s ON s.exam_slot_id = es.id WHERE es.exam_id = ${req.params.examId} ORDER BY u.full_name`;
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/exams/:examId/students', async (req, res) => {
  try {
    const students = await sql`SELECT s.id AS "submissionId", u.id, u.full_name AS name, u.enrollment_number AS "enrollmentNumber", s.status,
      COALESCE(s.tab_switch_count, 0) AS "tabSwitches", s.last_sync_at AS "lastActivity"
      FROM exam_slots es JOIN users u ON u.id = es.student_id LEFT JOIN submissions s ON s.exam_slot_id = es.id
      WHERE es.exam_id = ${req.params.examId} ORDER BY u.full_name`;
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/exams/:examId/start', async (req, res) => {
  const user = requireRole(req, res, ['admin', 'teacher']);
  if (!user) return;
  try {
    const { examId } = req.params;
    if (!(await canManageExam(examId, user))) return res.status(403).json({ error: 'You cannot start this exam.' });
    const exam = await sql`SELECT duration_minutes FROM exams WHERE id = ${examId}`;
    if (!exam.length) return res.status(404).json({ error: 'Exam not found' });
    const updated = await sql`
      UPDATE exams 
      SET status = 'live', 
          scheduled_start = NOW(),
          scheduled_end = NOW() + (${exam[0].duration_minutes} * INTERVAL '1 minute')
      WHERE id = ${examId} AND status = 'scheduled'
      RETURNING id, status, scheduled_start, scheduled_end
    `;
    if (updated.length === 0) {
      return res.status(409).json({ error: 'Only scheduled exams can be started.' });
    }
    await notifyExamStudents(examId, 'Exam is now live', 'Your exam has started. Enter the lobby to begin.', 'success');
    res.json({ message: 'Exam started successfully', exam: updated[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/exams/:examId/end', async (req, res) => {
  const user = requireRole(req, res, ['admin', 'teacher']);
  if (!user) return;
  try {
    const { examId } = req.params;
    if (!(await canManageExam(examId, user))) return res.status(403).json({ error: 'You cannot end this exam.' });
    const updated = await sql`
      UPDATE exams 
      SET status = 'completed', 
          scheduled_end = NOW()
      WHERE id = ${examId} AND status = 'live'
      RETURNING id, status, scheduled_end
    `;
    if (updated.length === 0) {
      const exam = await sql`SELECT id FROM exams WHERE id = ${examId}`;
      return res.status(exam.length ? 409 : 404).json({
        error: exam.length ? 'Only live exams can be ended.' : 'Exam not found'
      });
    }
    await notifyExamStudents(examId, 'Exam ended', 'This exam has been ended by the administrator.', 'warning');
    res.json({ message: 'Exam ended successfully', exam: updated[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/exams/:examId/attempt', async (req, res) => {
  const user = requireRole(req, res, ['student']);
  if (!user) return;
  try {
    const examRows = await sql`
      SELECT id, question_paper_id, scheduled_end FROM exams
      WHERE id = ${req.params.examId} AND status = 'live'
        AND scheduled_start <= NOW() AND scheduled_end > NOW()
    `;
    if (!examRows.length) return res.status(409).json({ error: 'This exam is not currently available.' });

    const slotRows = await sql`
      SELECT id FROM exam_slots
      WHERE exam_id = ${req.params.examId} AND student_id = ${user.userId}
        AND registration_status = 'approved'
    `;
    if (!slotRows.length) return res.status(403).json({ error: 'You are not assigned to this exam.' });

    const submissions = await sql`
      INSERT INTO submissions (exam_slot_id, status, tab_switch_count, started_at)
      VALUES (${slotRows[0].id}, 'in_progress', 0, NOW())
      ON CONFLICT (exam_slot_id) DO UPDATE SET
        started_at = COALESCE(submissions.started_at, NOW())
      RETURNING id
    `;
    const questions = await sql`
      SELECT id, question_paper_id AS "questionPaperId", prompt, type,
        bloom_level AS "bloomLevel", marks, options, correct_answer AS "correctAnswer",
        order_index AS "orderIndex"
      FROM questions WHERE question_paper_id = ${examRows[0].question_paper_id}
      ORDER BY order_index
    `;
    res.json({ submissionId: submissions[0].id, sessionSecret: require('crypto').randomUUID(), questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/submissions/:submissionId/sync', async (req, res) => {
  const user = requireRole(req, res, ['student']);
  if (!user) return;
  try {
    const owned = await sql`
      SELECT s.id FROM submissions s JOIN exam_slots es ON es.id = s.exam_slot_id
      WHERE s.id = ${req.params.submissionId} AND es.student_id = ${user.userId}
        AND s.status = 'in_progress'
    `;
    if (!owned.length) return res.status(404).json({ error: 'Active submission not found.' });
    for (const [questionId, answer] of Object.entries(req.body.answers || {})) {
      await sql`
        INSERT INTO submission_answers (submission_id, question_id, answer_value, answered_at, synced_at)
        VALUES (${owned[0].id}, ${questionId}, ${JSON.stringify(answer)}::jsonb, NOW(), NOW())
        ON CONFLICT (submission_id, question_id) DO UPDATE SET
          answer_value = EXCLUDED.answer_value, answered_at = NOW(), synced_at = NOW()
      `;
    }
    await sql`UPDATE submissions SET last_sync_at = NOW() WHERE id = ${owned[0].id}`;
    res.json({ synced: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/submissions/:submissionId/submit', async (req, res) => {
  const user = requireRole(req, res, ['student']);
  if (!user) return;
  try {
    const status = req.body.reason === 'expired' ? 'expired' : 'submitted';
    const updated = await sql`
      UPDATE submissions s SET status = ${status}, submitted_at = NOW(), last_sync_at = NOW()
      FROM exam_slots es WHERE s.exam_slot_id = es.id
        AND s.id = ${req.params.submissionId} AND es.student_id = ${user.userId}
        AND s.status = 'in_progress'
      RETURNING s.status
    `;
    if (!updated.length) return res.status(404).json({ error: 'Active submission not found.' });
    res.json({ status: updated[0].status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/dashboard/stats', async (req, res) => {
  try {
    const result = await sql`SELECT
      COUNT(*) FILTER (WHERE s.status = 'in_progress')::int AS "activeStudents",
      COUNT(*) FILTER (WHERE p.severity = 'warning')::int AS warnings,
      COUNT(*) FILTER (WHERE p.severity = 'critical')::int AS critical,
      COUNT(*) FILTER (WHERE s.status IN ('submitted', 'auto_submitted', 'force_submitted'))::int AS completed
      FROM submissions s JOIN exam_slots es ON es.id = s.exam_slot_id JOIN exams e ON e.id = es.exam_id
      LEFT JOIN proctoring_logs p ON p.submission_id = s.id WHERE e.status IN ('live', 'scheduled')`;
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/admin/dashboard/activity', async (req, res) => {
  try {
    const rows = await sql`SELECT p.incident_timestamp AS timestamp, p.event_type AS type, p.severity, u.full_name AS "studentName",
      COALESCE(p.metadata->>'message', p.event_type) AS description
      FROM proctoring_logs p JOIN submissions s ON s.id = p.submission_id JOIN exam_slots es ON es.id = s.exam_slot_id
      JOIN users u ON u.id = es.student_id JOIN exams e ON e.id = es.exam_id
      WHERE e.status IN ('live', 'scheduled') ORDER BY p.incident_timestamp DESC LIMIT 20`;
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/submissions/:id/warn', async (req, res) => {
  try { await sql`INSERT INTO proctoring_logs (submission_id, event_type, severity, metadata) VALUES (${req.params.id}, 'admin_warning', 'warning', ${JSON.stringify({ message: req.body.message || 'Warning issued' })}::jsonb)`; res.status(201).json({ message: 'Warning sent' }); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/submissions/:id/force-submit', async (req, res) => {
  try { await sql`UPDATE submissions SET status = 'force_submitted', submitted_at = NOW() WHERE id = ${req.params.id}`; res.json({ message: 'Submission force-submitted' }); }
  catch (error) { res.status(500).json({ error: error.message }); }
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

// Hall Ticket Routes
app.get('/api/hall-tickets/:examId/pdf', async (req, res) => {
  const user = requireRole(req, res, ['student', 'teacher', 'admin']);
  if (!user) return;
  try {
    const examId = req.params.examId;

    // For students, only allow their own hall tickets
    // For teachers and admins, allow viewing hall tickets for the exam
    let examData;
    if (user.role === 'student') {
      examData = await sql`
        SELECT e.id, e.title, e.duration_minutes, e.scheduled_start, e.scheduled_end,
               e.proctoring_enabled, e.tab_switch_limit,
               c.code AS course_code, c.title AS course_title,
               u.full_name, u.enrollment_number, u.email
        FROM exams e
        JOIN question_papers qp ON qp.id = e.question_paper_id
        JOIN courses c ON c.id = qp.course_id
        JOIN exam_slots es ON es.exam_id = e.id
        JOIN users u ON u.id = es.student_id
        WHERE e.id = ${examId} AND es.student_id = ${user.userId} AND es.registration_status = 'approved'
      `;
    } else {
      // For teachers and admins, get the exam details (first student's info as example)
      examData = await sql`
        SELECT e.id, e.title, e.duration_minutes, e.scheduled_start, e.scheduled_end,
               e.proctoring_enabled, e.tab_switch_limit,
               c.code AS course_code, c.title AS course_title,
               u.full_name, u.enrollment_number, u.email
        FROM exams e
        JOIN question_papers qp ON qp.id = e.question_paper_id
        JOIN courses c ON c.id = qp.course_id
        JOIN exam_slots es ON es.exam_id = e.id
        JOIN users u ON u.id = es.student_id
        WHERE e.id = ${examId} AND es.registration_status = 'approved'
        LIMIT 1
      `;
    }

    if (!examData.length) {
      return res.status(404).json({ error: 'Exam slot not found or not approved' });
    }

    const exam = examData[0];

    // Generate QR code with verification URL
    const qrData = JSON.stringify({
      examId: exam.id,
      enrollmentNumber: exam.enrollment_number,
      scheduledStart: exam.scheduled_start
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    // Generate PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="hall-ticket-' + examId + '.pdf"');
      res.send(pdfBuffer);
    });

    // PDF Content
    doc.fontSize(24).font('Helvetica-Bold').text('EXAMINATION HALL TICKET', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text('University Assessment and Mastery Portal', { align: 'center' });
    doc.moveDown(2);

    // Border
    doc.rect(40, 40, 515, 757).stroke();

    // Student Information
    doc.fontSize(16).font('Helvetica-Bold').text('Student Information', 50, 120);
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text('Name: ' + exam.full_name, 50, 150);
    doc.text('Enrollment No: ' + exam.enrollment_number, 50, 170);
    doc.text('Email: ' + exam.email, 50, 190);

    // Exam Information
    doc.fontSize(16).font('Helvetica-Bold').text('Exam Information', 300, 120);
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text('Exam Title: ' + exam.title, 300, 150);
    doc.text('Course: ' + exam.course_code + ' - ' + exam.course_title, 300, 170);
    doc.text('Duration: ' + exam.duration_minutes + ' minutes', 300, 190);

    // Exam Schedule
    doc.fontSize(16).font('Helvetica-Bold').text('Exam Schedule', 50, 230);
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text('Start Time: ' + new Date(exam.scheduled_start).toLocaleString(), 50, 260);
    doc.text('End Time: ' + new Date(exam.scheduled_end).toLocaleString(), 50, 280);
    doc.text('Proctoring: ' + (exam.proctoring_enabled ? 'Enabled' : 'Disabled'), 50, 300);
    doc.text('Tab Switch Limit: ' + exam.tab_switch_limit, 50, 320);

    // QR Code
    doc.fontSize(16).font('Helvetica-Bold').text('Verification QR Code', 300, 230);
    doc.moveDown();
    try {
      const qrImage = doc.openImage(qrCodeDataUrl);
      doc.image(qrImage, 350, 260, { width: 100, height: 100 });
    } catch (err) {
      console.error('Error embedding QR code:', err);
      doc.fontSize(10).text('QR Code generation failed', 350, 260);
    }

    // Instructions
    doc.fontSize(16).font('Helvetica-Bold').text('Instructions', 50, 380);
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text('• Bring this hall ticket and a valid ID proof to the examination center', 50, 410);
    doc.text('• Report to the examination hall at least 15 minutes before the scheduled time', 50, 430);
    doc.text('• Electronic devices (phones, smartwatches, etc.) are strictly prohibited', 50, 450);
    doc.text('• Use of unauthorized materials will result in immediate disqualification', 50, 470);
    doc.text('• Follow all instructions from the examination invigilators', 50, 490);
    if (exam.proctoring_enabled) {
      doc.text('• Camera access and proctoring monitoring will be active during the exam', 50, 510);
    }

    // Footer
    doc.fontSize(10).font('Helvetica').text('This is a computer-generated hall ticket. No signature required.', 50, 750);
    doc.text('Generated on: ' + new Date().toLocaleString(), 50, 770);

    doc.end();

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

// Notifications System
app.get('/api/notifications', async (req, res) => {
  const user = requireRole(req, res, ['student', 'teacher', 'admin']);
  if (!user) return;
  try {
    const notifications = await sql`
      SELECT id, notification_type, payload, read, read_at, created_at
      FROM notifications
      WHERE recipient_id = ${user.userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/:id/read', async (req, res) => {
  const user = requireRole(req, res, ['student', 'teacher', 'admin']);
  if (!user) return;
  try {
    await sql`
      UPDATE notifications
      SET read = true, read_at = NOW()
      WHERE id = ${req.params.id} AND recipient_id = ${user.userId}
    `;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/mark-all-read', async (req, res) => {
  const user = requireRole(req, res, ['student', 'teacher', 'admin']);
  if (!user) return;
  try {
    await sql`
      UPDATE notifications
      SET read = true, read_at = NOW()
      WHERE recipient_id = ${user.userId} AND read = false
    `;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create notification helper function
async function createNotification(recipientId, type, payload) {
  try {
    await sql`
      INSERT INTO notifications (recipient_id, notification_type, payload)
      VALUES (${recipientId}, ${type}, ${JSON.stringify(payload)})
    `;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

// Advanced Exam Configuration
app.get('/api/exams/:examId/config', async (req, res) => {
  const user = requireRole(req, res, ['teacher', 'admin']);
  if (!user) return;
  try {
    const examConfig = await sql`
      SELECT config
      FROM exams
      WHERE id = ${req.params.examId}
    `;
    if (examConfig.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    res.json(examConfig[0].config || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/exams/:examId/config', async (req, res) => {
  const user = requireRole(req, res, ['teacher', 'admin']);
  if (!user) return;
  try {
    const config = req.body;
    await sql`
      UPDATE exams
      SET config = ${JSON.stringify(config)}
      WHERE id = ${req.params.examId}
    `;
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bloom's Taxonomy Endpoints
app.get('/api/student/bloom-mastery', async (req, res) => {
  const user = requireRole(req, res, ['student']);
  if (!user) return;
  try {
    const masteryData = await sql`
      SELECT bloom_level, avg_score, question_count
      FROM student_bloom_mastery
      WHERE student_id = ${user.userId}
      ORDER BY bloom_level
    `;
    res.json(masteryData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/questions/:questionId/bloom-level', async (req, res) => {
  const user = requireRole(req, res, ['teacher', 'admin']);
  if (!user) return;
  try {
    const question = await sql`
      SELECT bloom_level
      FROM questions
      WHERE id = ${req.params.questionId}
    `;
    if (question.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ bloom_level: question[0].bloom_level });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/questions/:questionId/bloom-level', async (req, res) => {
  const user = requireRole(req, res, ['teacher', 'admin']);
  if (!user) return;
  try {
    const { bloom_level } = req.body;
    await sql`
      UPDATE questions
      SET bloom_level = ${bloom_level}
      WHERE id = ${req.params.questionId}
    `;
    res.json({ success: true, bloom_level });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proctoring API endpoints
app.get('/api/proctoring/active-exams', async (req, res) => {
  const user = requireRole(req, res, ['admin', 'teacher']);
  if (!user) return;
  try {
    const exams = await sql`
      SELECT e.id, e.title, c.code as course
      FROM exams e
      JOIN courses c ON c.id = (
        SELECT course_id FROM question_papers WHERE id = e.question_paper_id
      )
      WHERE e.status = 'live' AND e.scheduled_end > NOW()
      ORDER BY e.scheduled_start
    `;
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/proctoring/exam/:examId/stats', async (req, res) => {
  const user = requireRole(req, res, ['admin', 'teacher']);
  if (!user) return;
  try {
    const stats = await sql`
      SELECT
        COUNT(*) as total_students,
        COUNT(CASE WHEN s.status = 'in_progress' THEN 1 END) as active_students,
        COUNT(CASE WHEN s.status = 'in_progress' AND p.severity = 'warning' THEN 1 END) as warning_count,
        COUNT(CASE WHEN s.status = 'in_progress' AND p.severity = 'critical' THEN 1 END) as critical_count,
        COUNT(CASE WHEN s.status = 'submitted' THEN 1 END) as completed_count
      FROM exam_slots es
      LEFT JOIN submissions s ON s.exam_slot_id = es.id
      LEFT JOIN proctoring_logs p ON p.submission_id = s.id
      WHERE es.exam_id = ${req.params.examId} AND es.registration_status = 'approved'
    `;
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/proctoring/exam/:examId/students', async (req, res) => {
  const user = requireRole(req, res, ['admin', 'teacher']);
  if (!user) return;
  try {
    const students = await sql`
      SELECT
        s.id as submission_id,
        u.id as student_id,
        u.full_name as student_name,
        u.enrollment_number,
        es.exam_id,
        s.status,
        s.tab_switch_count,
        s.started_at,
        s.started_at > NOW() - INTERVAL '5 minutes' as is_live,
        COALESCE(p.camera_connected, false) as camera_connected,
        COALESCE(p.microphone_connected, false) as microphone_connected,
        COUNT(CASE WHEN p.severity = 'warning' THEN 1 END) as gaze_alerts,
        COUNT(CASE WHEN p.event_type = 'fullscreen_exit' THEN 1 END) as fullscreen_exits
      FROM exam_slots es
      JOIN users u ON u.id = es.student_id
      LEFT JOIN submissions s ON s.exam_slot_id = es.id
      LEFT JOIN proctoring_logs p ON p.submission_id = s.id
      WHERE es.exam_id = ${req.params.examId} AND es.registration_status = 'approved'
      GROUP BY s.id, u.id, u.full_name, u.enrollment_number, es.exam_id, s.status, s.tab_switch_count, s.started_at
    `;

    const formattedStudents = students.map(student => ({
      submissionId: student.submission_id,
      studentId: student.student_id,
      studentName: student.student_name,
      enrollmentNumber: student.enrollment_number,
      examId: student.exam_id,
      status: student.status === 'in_progress' ? 'active' : student.status,
      isLive: student.is_live,
      tabSwitches: student.tab_switch_count || 0,
      fullscreenExits: student.fullscreen_exits || 0,
      gazeAlerts: student.gaze_alerts || 0,
      lastActivity: student.started_at || new Date(),
      cameraConnected: student.camera_connected,
      microphoneConnected: student.microphone_connected
    }));

    res.json(formattedStudents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/proctoring/submission/:submissionId/events', async (req, res) => {
  const user = requireRole(req, res, ['student']);
  if (!user) return;
  try {
    const { incident_type, severity, metadata } = req.body;
    await sql`
      INSERT INTO proctoring_logs (submission_id, event_type, severity, metadata, timestamp)
      VALUES (${req.params.submissionId}, ${incident_type}, ${severity}, ${JSON.stringify(metadata)}, NOW())
    `;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/proctoring/submission/:submissionId/warn', async (req, res) => {
  const user = requireRole(req, res, ['admin', 'teacher']);
  if (!user) return;
  try {
    const { message } = req.body;
    // In a real implementation, this would send a WebSocket message to the student
    // For now, just log it
    console.log(`Warning sent to submission ${req.params.submissionId}: ${message}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/proctoring/submission/:submissionId/force-submit', async (req, res) => {
  const user = requireRole(req, res, ['admin', 'teacher']);
  if (!user) return;
  try {
    const { reason } = req.body;
    await sql`
      UPDATE submissions
      SET status = 'force_submitted', submitted_at = NOW()
      WHERE id = ${req.params.submissionId} AND status = 'in_progress'
    `;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Permission Overrides
app.get('/api/users', async (req, res) => {
  const user = requireRole(req, res, ['admin']);
  if (!user) return;
  try {
    const users = await sql`
      SELECT id, full_name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `;
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:userId/permissions', async (req, res) => {
  const user = requireRole(req, res, ['admin']);
  if (!user) return;
  try {
    const permissions = await sql`
      SELECT permission_code, granted_by, created_at
      FROM user_permission_overrides
      WHERE user_id = ${req.params.userId}
    `;
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/:userId/permissions', async (req, res) => {
  const user = requireRole(req, res, ['admin']);
  if (!user) return;
  try {
    const { permission_code } = req.body;
    await sql`
      INSERT INTO user_permission_overrides (user_id, permission_code, granted_by)
      VALUES (${req.params.userId}, ${permission_code}, ${user.userId})
      ON CONFLICT (user_id, permission_code) DO NOTHING
    `;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:userId/permissions/:permissionCode', async (req, res) => {
  const user = requireRole(req, res, ['admin']);
  if (!user) return;
  try {
    await sql`
      DELETE FROM user_permission_overrides
      WHERE user_id = ${req.params.userId} AND permission_code = ${req.params.permissionCode}
    `;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Additional Question Types Support
app.get('/api/question-types', async (req, res) => {
  const user = requireRole(req, res, ['teacher', 'admin']);
  if (!user) return;
  try {
    const questionTypes = [
      { type: 'mcq_single', label: 'Single Choice MCQ', autoGradeable: true },
      { type: 'mcq_multi', label: 'Multiple Choice MCQ', autoGradeable: true },
      { type: 'true_false', label: 'True/False', autoGradeable: true },
      { type: 'short_answer', label: 'Short Answer', autoGradeable: false },
      { type: 'numeric', label: 'Numeric Answer', autoGradeable: true },
      { type: 'essay', label: 'Essay Question', autoGradeable: false },
      { type: 'matching', label: 'Matching Items', autoGradeable: true },
      { type: 'ordering', label: 'Ordering/Sequence', autoGradeable: true },
      { type: 'fill_blank', label: 'Fill in the Blanks', autoGradeable: true },
      { type: 'code', label: 'Code Answer', autoGradeable: false }
    ];
    res.json(questionTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Structured Approval Workflow
app.post('/api/question-papers/:id/submit-for-approval', async (req, res) => {
  const user = requireRole(req, res, ['teacher']);
  if (!user) return;
  try {
    await sql`
      UPDATE question_papers
      SET status = 'pending_approval', submitted_at = NOW()
      WHERE id = ${req.params.id} AND created_by = ${user.userId}
    `;

    // Notify admins
    const admins = await sql`
      SELECT id FROM users WHERE role = 'admin'
    `;

    for (const admin of admins) {
      await createNotification(admin.id, 'approval_needed', {
        message: 'New question paper requires approval',
        questionPaperId: req.params.id
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/question-papers/:id/approve', async (req, res) => {
  const user = requireRole(req, res, ['admin']);
  if (!user) return;
  try {
    const { feedback } = req.body;

    const paper = await sql`
      SELECT created_by FROM question_papers WHERE id = ${req.params.id}
    `;

    if (paper.length === 0) {
      return res.status(404).json({ error: 'Question paper not found' });
    }

    await sql`
      UPDATE question_papers
      SET status = 'approved', reviewed_by = ${user.userId}, reviewed_at = NOW(), feedback = ${feedback || null}
      WHERE id = ${req.params.id}
    `;

    // Notify the faculty member
    await createNotification(paper[0].created_by, 'approval_granted', {
      message: 'Your question paper has been approved',
      questionPaperId: req.params.id
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/question-papers/:id/reject', async (req, res) => {
  const user = requireRole(req, res, ['admin']);
  if (!user) return;
  try {
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const paper = await sql`
      SELECT created_by FROM question_papers WHERE id = ${req.params.id}
    `;

    if (paper.length === 0) {
      return res.status(404).json({ error: 'Question paper not found' });
    }

    await sql`
      UPDATE question_papers
      SET status = 'rejected', reviewed_by = ${user.userId}, reviewed_at = NOW(), rejection_reason = ${rejection_reason}
      WHERE id = ${req.params.id}
    `;

    // Notify the faculty member
    await createNotification(paper[0].created_by, 'approval_rejected', {
      message: 'Your question paper was rejected',
      questionPaperId: req.params.id,
      reason: rejection_reason
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/question-papers/pending-approval', async (req, res) => {
  const user = requireRole(req, res, ['admin']);
  if (!user) return;
  try {
    const papers = await sql`
      SELECT qp.*, u.full_name as author_name, c.code as course_code
      FROM question_papers qp
      JOIN users u ON u.id = qp.created_by
      JOIN courses c ON c.id = qp.course_id
      WHERE qp.status = 'pending_approval'
      ORDER BY qp.submitted_at DESC
    `;
    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Advanced Proctoring Endpoints
app.post('/api/proctoring/incident', async (req, res) => {
  const user = requireRole(req, res, ['student']);
  if (!user) return;
  try {
    const { attempt_id, incident_type, severity, metadata, snapshot_url } = req.body;
    await sql`
      INSERT INTO integrity_events (attempt_id, event_type, severity, metadata, snapshot_url)
      VALUES (${attempt_id}, ${incident_type}, ${severity}, ${JSON.stringify(metadata)}, ${snapshot_url})
    `;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/attempts/:attemptId/proctoring-events', async (req, res) => {
  const user = requireRole(req, res, ['teacher', 'admin']);
  if (!user) return;
  try {
    const events = await sql`
      SELECT id, event_type, severity, metadata, snapshot_url, created_at
      FROM integrity_events
      WHERE attempt_id = ${req.params.attemptId}
      ORDER BY created_at DESC
    `;
    res.json(events);
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
