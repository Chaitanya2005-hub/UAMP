require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.NEON_DATABASE_URL);

async function verifyStudents() {
  console.log('Verifying student accounts...\n');
  
  const students = await sql`
    SELECT id, email, full_name, enrollment_number, is_active, created_at 
    FROM users 
    WHERE role = 'student' AND deleted_at IS NULL
    ORDER BY enrollment_number
  `;
  
  console.log('All Student Accounts:');
  console.log('════════════════════════════════════════════════════════════════════════════════');
  
  students.forEach(student => {
    console.log(`🎓 ${student.enrollment_number} - ${student.full_name}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Status: ${student.is_active ? '✅ Active' : '❌ Inactive'}`);
    console.log(`   Created: ${new Date(student.created_at).toLocaleString()}`);
    console.log('─────────────────────────────────────────────────────────────────────────────────');
  });
  
  console.log(`\nTotal student accounts: ${students.length}`);
  
  // Show login credentials summary
  console.log('\n📋 Student Login Credentials:');
  console.log('════════════════════════════════════════════════════════════════════════════════');
  
  const passwordMap = {
    'STU001': 'student123',
    'STU002': 'priya123', 
    'STU003': 'arjun123',
    'STU004': 'fatima123',
    'STU005': 'rahul123',
    'STU006': 'priya123',
    'STU007': 'amit123',
    'STU008': 'sneha123',
    'STU009': 'vikram123',
    'STU010': 'nisha123',
    'STU011': 'rohit123',
    'STU012': 'kavita123',
    'STU013': 'deepak123',
    'STU014': 'pooja123'
  };
  
  students.forEach(student => {
    const password = passwordMap[student.enrollment_number] || 'Check setup script';
    console.log(`${student.enrollment_number} | ${student.email} | Password: ${password}`);
  });
  
  console.log('\n⚠️  Note: For security, passwords should be changed after first login.');
}

verifyStudents().catch(error => { 
  console.error('Error:', error); 
  process.exit(1); 
});
