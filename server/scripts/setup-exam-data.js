require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.NEON_DATABASE_URL);

async function setupExamData() {
  try {
    console.log('🚀 Setting up exam data...');

    // Get institution
    const institution = await sql`SELECT id FROM institutions WHERE code = 'TU001' LIMIT 1`;
    if (!institution[0]) throw new Error('Institution not found. Run setup-test-data.js first.');
    const institutionId = institution[0].id;

    // Get users
    const admin = await sql`SELECT id FROM users WHERE email = 'admin@uamp.edu' LIMIT 1`;
    const teacher = await sql`SELECT id FROM users WHERE email = 'teacher@uamp.edu' LIMIT 1`;

    if (!admin[0] || !teacher[0]) {
      throw new Error('Admin or teacher not found. Run setup-test-data.js first.');
    }

    // Get all real students from database
    console.log('👥 Getting real students from database...');
    const students = await sql`
      SELECT id, full_name, email, enrollment_number
      FROM users
      WHERE role = 'student' AND is_active = true AND deleted_at IS NULL
    `;

    if (!students.length) {
      throw new Error('No students found in database. Please register students first.');
    }

    console.log(`✅ Found ${students.length} real students:`);
    students.forEach(student => {
      console.log(`   - ${student.full_name} (${student.email}) - ${student.enrollment_number}`);
    });

    // Get course
    const course = await sql`SELECT id FROM courses WHERE code = 'CS101' LIMIT 1`;
    if (!course[0]) throw new Error('Course not found. Run setup-test-data.js first.');

    // Create question paper
    console.log('📝 Creating question paper...');
    const questionPaper = await sql`
      INSERT INTO question_papers (course_id, title, source_method, status, created_by)
      VALUES (${course[0].id}, 'CS101 Final Exam', 'manual_builder', 'approved', ${teacher[0].id})
      RETURNING id
    `;
    console.log('✅ Question paper created:', questionPaper[0].id);

    // Add sample questions
    console.log('❓ Adding sample questions...');
    await sql`
      INSERT INTO questions (question_paper_id, prompt, type, options, correct_answer, order_index, marks, bloom_level)
      VALUES
        (${questionPaper[0].id}, 'What is the time complexity of binary search?', 'mcq_single',
         '[{"id":"a","text":"O(1)","isCorrect":false},{"id":"b","text":"O(log n)","isCorrect":true},{"id":"c","text":"O(n)","isCorrect":false},{"id":"d","text":"O(n²)","isCorrect":false}]',
         'b', 1, 5, 'analyze'),
        (${questionPaper[0].id}, 'Which data structure uses LIFO principle?', 'mcq_single',
         '[{"id":"a","text":"Queue","isCorrect":false},{"id":"b","text":"Stack","isCorrect":true},{"id":"c","text":"Array","isCorrect":false},{"id":"d","text":"Linked List","isCorrect":false}]',
         'b', 2, 5, 'understand'),
        (${questionPaper[0].id}, 'Arrays are best suited for?', 'mcq_single',
         '[{"id":"a","text":"Searching large datasets","isCorrect":false},{"id":"b","text":"Random access operations","isCorrect":true},{"id":"c","text":"Dynamic sizing","isCorrect":false},{"id":"d","text":"Complex relationships","isCorrect":false}]',
         'b', 3, 5, 'apply'),
        (${questionPaper[0].id}, 'A recursive function must have:', 'mcq_single',
         '[{"id":"a","text":"A return statement","isCorrect":false},{"id":"b","text":"A base case","isCorrect":true},{"id":"c","text":"Global variables","isCorrect":false},{"id":"d","text":"Parameters","isCorrect":false}]',
         'b', 4, 5, 'analyze'),
        (${questionPaper[0].id}, 'True or False: A linked list has contiguous memory allocation.', 'true_false',
         '[]', 'false', 5, 5, 'remember')
    `;
    console.log('✅ Sample questions added');

    // Create exam with current/future time so it's immediately available
    const now = new Date();
    const startTime = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
    const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    console.log('📅 Creating exam...');
    const exam = await sql`
      INSERT INTO exams (question_paper_id, title, duration_minutes, scheduled_start, scheduled_end, tab_switch_limit, proctoring_enabled, status, created_by)
      VALUES (${questionPaper[0].id}, 'CS101 Final Exam', 60, ${startTime.toISOString()}, ${endTime.toISOString()}, 3, true, 'live', ${admin[0].id})
      RETURNING id
    `;
    console.log('✅ Exam created:', exam[0].id);

    // Create exam slots for all students
    console.log('🎫 Creating exam slots for all students...');
    const studentIds = students.map(s => s.id);
    const examSlots = await sql`
      INSERT INTO exam_slots (exam_id, student_id, registration_status)
      SELECT ${exam[0].id}, student_id::uuid, 'approved'
      FROM jsonb_array_elements_text(${JSON.stringify(studentIds)}::jsonb) AS student_id
      ON CONFLICT (exam_id, student_id) DO NOTHING
      RETURNING id, student_id
    `;
    console.log(`✅ Created ${examSlots.length} exam slots for students:`);
    examSlots.forEach(slot => {
      const student = students.find(s => s.id === slot.student_id);
      console.log(`   - ${student.full_name} (${student.enrollment_number}) - Slot ID: ${slot.id}`);
    });

    console.log('\n🎉 Exam data setup complete!');
    console.log('\n📋 Exam Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Exam ID:', exam[0].id);
    console.log('📚 Exam Title: CS101 Final Exam');
    console.log('⏱ Duration: 60 minutes');
    console.log('🎫 Exam Slots Created:', examSlots.length);
    console.log('� Registered Students:', students.length);
    console.log('⏰ Start Time:', startTime.toISOString());
    console.log('⏰ End Time:', endTime.toISOString());
    console.log('⏰ Current Time:', now.toISOString());
    console.log('🔴 Status: live (immediately available)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔐 Students can now:');
    console.log('  1. Login with their registered credentials');
    console.log('  2. See the exam in their dashboard');
    console.log('  3. Enter the exam lobby');
    console.log('  4. Start the exam immediately (exam is already live)\n');

    console.log('📝 Registered Students:');
    students.forEach(student => {
      console.log(`   - ${student.full_name} (${student.email}) - ${student.enrollment_number}`);
    });

  } catch (error) {
    console.error('❌ Error setting up exam data:', error);
    process.exit(1);
  }
}

setupExamData();