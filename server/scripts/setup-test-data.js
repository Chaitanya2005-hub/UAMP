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
    const adminUser = await sql`
      INSERT INTO users (institution_id, email, password_hash, full_name, role, employee_code)
      VALUES (${institutionId}, 'admin@uamp.edu', 'admin123', 'Admin User', 'admin', 'ADM001')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, full_name, role
    `;
    console.log('✅ Admin user created:', adminUser[0]);

    // 3. Create teacher user
    console.log('👤 Creating teacher user...');
    const teacherUser = await sql`
      INSERT INTO users (institution_id, email, password_hash, full_name, role, employee_code)
      VALUES (${institutionId}, 'teacher@uamp.edu', 'teacher123', 'Teacher User', 'teacher', 'TCH001')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, full_name, role
    `;
    console.log('✅ Teacher user created:', teacherUser[0]);

    // 4. Create student user
    console.log('👤 Creating student user...');
    const studentUser = await sql`
      INSERT INTO users (institution_id, email, password_hash, full_name, role, enrollment_number)
      VALUES (${institutionId}, 'student@uamp.edu', 'student123', 'Student User', 'student', 'STU001')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, full_name, role
    `;
    console.log('✅ Student user created:', studentUser[0]);

    // 5. Create a test course
    console.log('📖 Creating test course...');
    const course = await sql`
      INSERT INTO courses (institution_id, code, title)
      VALUES (${institutionId}, 'CS101', 'Introduction to Computer Science')
      ON CONFLICT (institution_id, code) DO NOTHING
      RETURNING id, code, title
    `;
    console.log('✅ Course created:', course[0]);

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
