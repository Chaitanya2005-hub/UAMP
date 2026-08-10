require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.NEON_DATABASE_URL);

async function createStudents() {
  const institution = await sql`SELECT id FROM institutions WHERE code = 'TU001' LIMIT 1`;
  if (!institution[0]) throw new Error('Institution not found. Run setup-test-data.js first.');
  const institutionId = institution[0].id;

  const students = [
    {
      email: 'rahul.kumar@uamp.edu',
      password: 'rahul123',
      fullName: 'Rahul Kumar',
      enrollmentNumber: 'STU005',
      courses: ['CS201', 'CS301']
    },
    {
      email: 'priya.singh@uamp.edu',
      password: 'priya123',
      fullName: 'Priya Singh',
      enrollmentNumber: 'STU006',
      courses: ['CS201', 'CS401']
    },
    {
      email: 'amit.patel@uamp.edu',
      password: 'amit123',
      fullName: 'Amit Patel',
      enrollmentNumber: 'STU007',
      courses: ['CS301', 'CS402']
    },
    {
      email: 'sneha.gupta@uamp.edu',
      password: 'sneha123',
      fullName: 'Sneha Gupta',
      enrollmentNumber: 'STU008',
      courses: ['CS401', 'CS402']
    },
    {
      email: 'vikram.sharma@uamp.edu',
      password: 'vikram123',
      fullName: 'Vikram Sharma',
      enrollmentNumber: 'STU009',
      courses: ['CS201', 'CS402']
    },
    {
      email: 'nisha.verma@uamp.edu',
      password: 'nisha123',
      fullName: 'Nisha Verma',
      enrollmentNumber: 'STU010',
      courses: ['CS301', 'CS401']
    },
    {
      email: 'rohit.mehta@uamp.edu',
      password: 'rohit123',
      fullName: 'Rohit Mehta',
      enrollmentNumber: 'STU011',
      courses: ['CS201', 'CS301', 'CS401']
    },
    {
      email: 'kavita.rani@uamp.edu',
      password: 'kavita123',
      fullName: 'Kavita Rani',
      enrollmentNumber: 'STU012',
      courses: ['CS401', 'CS402']
    },
    {
      email: 'deepak.joshi@uamp.edu',
      password: 'deepak123',
      fullName: 'Deepak Joshi',
      enrollmentNumber: 'STU013',
      courses: ['CS201', 'CS402']
    },
    {
      email: 'pooja.kumari@uamp.edu',
      password: 'pooja123',
      fullName: 'Pooja Kumari',
      enrollmentNumber: 'STU014',
      courses: ['CS301', 'CS401', 'CS402']
    }
  ];

  console.log('Creating student accounts...\n');

  for (const student of students) {
    try {
      // Check if student already exists
      const existing = await sql`
        SELECT id FROM users 
        WHERE email = ${student.email} OR enrollment_number = ${student.enrollmentNumber}
      `;
      
      if (existing.length > 0) {
        console.log(`⏭️  Student ${student.enrollmentNumber} (${student.email}) already exists, skipping...`);
        continue;
      }

      // Create student account
      const newUser = await sql`
        INSERT INTO users (institution_id, email, password_hash, full_name, role, enrollment_number, is_active)
        VALUES (${institutionId}, ${student.email}, ${student.password}, ${student.fullName}, 'student', ${student.enrollmentNumber}, true)
        RETURNING id, email, full_name, enrollment_number
      `;
      
      console.log(`✅ Created student: ${student.enrollmentNumber} - ${student.fullName} (${student.email})`);
      console.log(`   📚 Courses: ${student.courses.join(', ')}`);
      
    } catch (error) {
      console.error(`❌ Failed to create student ${student.enrollmentNumber}:`, error.message);
    }
  }

  console.log('\n✨ Student account creation completed!');
}

createStudents().catch(error => { 
  console.error('Error:', error); 
  process.exit(1); 
});
