require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.NEON_DATABASE_URL);

async function verifyCourses() {
  console.log('Verifying courses in database...\n');
  
  const courses = await sql`
    SELECT id, code, title, created_at 
    FROM courses 
    ORDER BY code
  `;
  
  console.log('All Courses:');
  console.log('─────────────────────────────────────────────────────────');
  courses.forEach(course => {
    console.log(`ID: ${course.id}`);
    console.log(`Code: ${course.code}`);
    console.log(`Title: ${course.title}`);
    console.log(`Created: ${new Date(course.created_at).toLocaleString()}`);
    console.log('─────────────────────────────────────────────────────────');
  });
  
  console.log(`\nTotal courses: ${courses.length}`);
  
  // Check for the new courses specifically
  const newCourseCodes = ['CS201', 'CS301', 'CS401', 'CS402'];
  console.log('\nNew Courses Verification:');
  console.log('─────────────────────────────────────────────────────────');
  
  for (const code of newCourseCodes) {
    const course = await sql`SELECT * FROM courses WHERE code = ${code}`;
    if (course.length > 0) {
      console.log(`✅ ${code}: ${course[0].title}`);
    } else {
      console.log(`❌ ${code}: Not found`);
    }
  }
}

verifyCourses().catch(error => { 
  console.error('Error:', error); 
  process.exit(1); 
});
