require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.NEON_DATABASE_URL);

async function seed() {
  const institution = await sql`SELECT id FROM institutions WHERE code = 'TU001' LIMIT 1`;
  if (!institution[0]) throw new Error('Run setup-test-data.js before seeding demo data.');
  const institutionId = institution[0].id;
  const students = [
    ['priya.sharma@uamp.edu', 'priya123', 'Priya Sharma', 'STU002'],
    ['arjun.reddy@uamp.edu', 'arjun123', 'Arjun Reddy', 'STU003'],
    ['fatima.khan@uamp.edu', 'fatima123', 'Fatima Khan', 'STU004']
  ];
  for (const [email, password, name, enrollment] of students) {
    await sql`INSERT INTO users (institution_id, email, password_hash, full_name, role, enrollment_number)
      VALUES (${institutionId}, ${email}, ${password}, ${name}, 'student', ${enrollment}) ON CONFLICT (email) DO NOTHING`;
  }
  const teacher = await sql`SELECT id FROM users WHERE email = 'teacher@uamp.edu' LIMIT 1`;
  const course = await sql`SELECT id FROM courses WHERE institution_id = ${institutionId} AND code = 'CS101' LIMIT 1`;
  if (!teacher[0] || !course[0]) throw new Error('Teacher or CS101 course is missing.');
  let paper = await sql`SELECT id FROM question_papers WHERE title = 'CS101 Live Assessment' LIMIT 1`;
  if (!paper[0]) paper = await sql`INSERT INTO question_papers (course_id, created_by, title, source_method, status)
    VALUES (${course[0].id}, ${teacher[0].id}, 'CS101 Live Assessment', 'manual_builder', 'approved') RETURNING id`;
  let exam = await sql`SELECT id FROM exams WHERE title = 'CS101 Live Assessment' LIMIT 1`;
  if (!exam[0]) exam = await sql`INSERT INTO exams (question_paper_id, title, duration_minutes, scheduled_start, scheduled_end, status, created_by)
    VALUES (${paper[0].id}, 'CS101 Live Assessment', 90, NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '75 minutes', 'live', ${teacher[0].id}) RETURNING id`;
  const allStudents = await sql`SELECT id FROM users WHERE institution_id = ${institutionId} AND role = 'student' AND deleted_at IS NULL`;
  for (const student of allStudents) {
    await sql`INSERT INTO exam_slots (exam_id, student_id, registration_status, approved_by, approved_at)
      VALUES (${exam[0].id}, ${student.id}, 'approved', ${teacher[0].id}, NOW()) ON CONFLICT (exam_id, student_id) DO NOTHING`;
  }
  const slots = await sql`SELECT id FROM exam_slots WHERE exam_id = ${exam[0].id}`;
  for (const slot of slots) await sql`INSERT INTO submissions (exam_slot_id, started_at, status, last_sync_at)
    VALUES (${slot.id}, NOW() - INTERVAL '10 minutes', 'in_progress', NOW()) ON CONFLICT (exam_slot_id) DO NOTHING`;
  const submission = await sql`SELECT s.id FROM submissions s JOIN exam_slots es ON es.id = s.exam_slot_id WHERE es.exam_id = ${exam[0].id} LIMIT 1`;
  if (submission[0]) await sql`INSERT INTO proctoring_logs (submission_id, event_type, severity, metadata)
    SELECT ${submission[0].id}, 'tab_switch', 'warning', ${JSON.stringify({ message: 'Window focus changed' })}::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM proctoring_logs WHERE submission_id = ${submission[0].id} AND event_type = 'tab_switch')`;
  console.log('Demo data ready.');
}
seed().catch(error => { console.error(error); process.exit(1); });
