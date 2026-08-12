require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.NEON_DATABASE_URL);

async function setupTestData() {
  try {
    console.log('🚀 Setting up test data...');

    // 1. Create institution
    console.log('📚 Creating institution...');
    await sql`
      INSERT INTO institutions (name, code)
      VALUES ('Test University', 'TU001')
      ON CONFLICT (code) DO NOTHING
    `;
    const institution = await sql`SELECT id FROM institutions WHERE code = 'TU001' LIMIT 1`;
    if (!institution[0]) throw new Error('Unable to locate the Test University institution.');
    const institutionId = institution[0].id;
    console.log('✅ Institution created:', institutionId);

    // 2. Create admin user
    console.log('👤 Creating admin user...');
    await sql`
      INSERT INTO users (institution_id, email, password_hash, full_name, role, employee_code)
      VALUES (${institutionId}, 'admin@uamp.edu', 'admin123', 'Admin User', 'admin', 'ADM001')
      ON CONFLICT (email) DO NOTHING
    `;
    const adminUser = await sql`SELECT id, email, full_name, role FROM users WHERE email = 'admin@uamp.edu' LIMIT 1`;
    console.log('✅ Admin user created:', adminUser[0]);

    // 3. Create teacher user
    console.log('👤 Creating teacher user...');
    await sql`
      INSERT INTO users (institution_id, email, password_hash, full_name, role, employee_code)
      VALUES (${institutionId}, 'teacher@uamp.edu', 'teacher123', 'Teacher User', 'teacher', 'TCH001')
      ON CONFLICT (email) DO NOTHING
    `;
    const teacherUser = await sql`SELECT id, email, full_name, role FROM users WHERE email = 'teacher@uamp.edu' LIMIT 1`;
    console.log('✅ Teacher user created:', teacherUser[0]);

    // 4. Create student user
    console.log('👤 Creating student user...');
    await sql`
      INSERT INTO users (institution_id, email, password_hash, full_name, role, enrollment_number)
      VALUES (${institutionId}, 'student@uamp.edu', 'student123', 'Student User', 'student', 'STU001')
      ON CONFLICT (email) DO NOTHING
    `;
    const studentUser = await sql`SELECT id, email, full_name, role FROM users WHERE email = 'student@uamp.edu' LIMIT 1`;
    console.log('✅ Student user created:', studentUser[0]);

    // 5. Create a test course
    console.log('📖 Creating test course...');
    await sql`
      INSERT INTO courses (institution_id, code, title)
      VALUES (${institutionId}, 'CS101', 'Introduction to Computer Science')
      ON CONFLICT (institution_id, code) DO NOTHING
    `;
    const course = await sql`
      SELECT id, code, title FROM courses WHERE institution_id = ${institutionId} AND code = 'CS101' LIMIT 1
    `;
    if (!course[0]) throw new Error('Unable to locate the CS101 course.');
    console.log('✅ Course created:', course[0]);

    // 6. Create question paper
    console.log('📝 Creating question paper...');
    const questionPaper = await sql`
      INSERT INTO question_papers (course_id, title, source_method, created_by, status)
      VALUES (${course[0].id}, 'CS101 Final Exam', 'manual_builder', ${teacherUser[0].id}, 'approved')
      RETURNING id, title
    `;
    console.log('✅ Question paper created:', questionPaper[0]);

    // 7. Add questions to the question paper
    console.log('❓ Adding questions...');
    const questions = await sql`
      INSERT INTO questions (question_paper_id, prompt, type, bloom_level, marks, options, correct_answer, order_index)
      VALUES
        (${questionPaper[0].id}, 'What is the time complexity of binary search?', 'mcq_single', 'understand', 10, '[{"id":"opt1","text":"O(1)"},{"id":"opt2","text":"O(n)"},{"id":"opt3","text":"O(log n)"},{"id":"opt4","text":"O(n²)"}]', 'opt3', 1),
        (${questionPaper[0].id}, 'True or False: Arrays are fixed-size data structures.', 'true_false', 'remember', 5, '[{"id":"true","text":"True"},{"id":"false","text":"False"}]', 'true', 2),
        (${questionPaper[0].id}, 'Explain the difference between a stack and a queue.', 'short_answer', 'understand', 15, 'null', 'null', 3),
        (${questionPaper[0].id}, 'Which of the following are primitive data types in JavaScript? (Select all that apply)', 'mcq_multi', 'remember', 10, '[{"id":"opt1","text":"String"},{"id":"opt2","text":"Array"},{"id":"opt3","text":"Number"},{"id":"opt4","text":"Object"}]', '["opt1","opt3"]', 4),
        (${questionPaper[0].id}, 'What is the purpose of a primary key in a database?', 'mcq_single', 'understand', 10, '[{"id":"opt1","text":"To encrypt data"},{"id":"opt2","text":"To uniquely identify records"},{"id":"opt3","text":"To improve query performance"},{"id":"opt4","text":"To store foreign keys"}]', 'opt2', 5),
        (${questionPaper[0].id}, 'True or False: A linked list allows O(1) access to any element by index.', 'true_false', 'understand', 5, '[{"id":"true","text":"True"},{"id":"false","text":"False"}]', 'false', 6),
        (${questionPaper[0].id}, 'Describe the concept of recursion in programming.', 'short_answer', 'understand', 15, 'null', 'null', 7),
        (${questionPaper[0].id}, 'What is the output of 2 plus 2 in JavaScript?', 'mcq_single', 'apply', 10, '[{"id":"opt1","text":"4"},{"id":"opt2","text":"22"},{"id":"opt3","text":"NaN"},{"id":"opt4","text":"Error"}]', 'opt2', 8),
        (${questionPaper[0].id}, 'True or False: HTTP is a stateless protocol.', 'true_false', 'remember', 5, '[{"id":"true","text":"True"},{"id":"false","text":"False"}]', 'true', 9),
        (${questionPaper[0].id}, 'Explain the concept of Big O notation in algorithm analysis.', 'essay', 'analyze', 15, 'null', 'null', 10)
      RETURNING id, prompt
    `;
    console.log('✅ Questions added:', questions.length);

    // 8. Create exam scheduled for now
    console.log('📅 Creating exam scheduled for now...');
    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    const exam = await sql`
      INSERT INTO exams (question_paper_id, title, duration_minutes, scheduled_start, scheduled_end, status, proctoring_enabled, tab_switch_limit, created_by)
      VALUES (${questionPaper[0].id}, 'CS101 Final Exam', 60, ${now}, ${endTime}, 'live', true, 3, ${teacherUser[0].id})
      RETURNING id, title, scheduled_start, scheduled_end
    `;
    console.log('✅ Exam created:', exam[0]);

    // 9. Register student for the exam
    console.log('📋 Registering student for exam...');
    const examSlot = await sql`
      INSERT INTO exam_slots (exam_id, student_id, registration_status)
      VALUES (${exam[0].id}, ${studentUser[0].id}, 'approved')
      RETURNING id, registration_status
    `;
    console.log('✅ Student registered for exam:', examSlot[0]);

    console.log('\n🎉 Test data setup complete!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Admin:  admin@uamp.edu / admin123');
    console.log('🔐 Teacher: teacher@uamp.edu / teacher123');
    console.log('🔐 Student: student@uamp.edu / student123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    process.exit(1);
  }
}

setupTestData();
