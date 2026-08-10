require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.NEON_DATABASE_URL);

async function addNewCourses() {
  const institution = await sql`SELECT id FROM institutions WHERE code = 'TU001' LIMIT 1`;
  if (!institution[0]) throw new Error('Institution not found.');
  const institutionId = institution[0].id;

  const newCourses = [
    {
      code: 'CS201',
      title: 'Data Structures and Analysis'
    },
    {
      code: 'CS301',
      title: 'Theory of Computation'
    },
    {
      code: 'CS401',
      title: 'Angular Framework'
    },
    {
      code: 'CS402',
      title: 'Advanced Java Programming'
    }
  ];

  for (const course of newCourses) {
    try {
      const existing = await sql`
        SELECT id FROM courses 
        WHERE institution_id = ${institutionId} AND code = ${course.code}
        LIMIT 1
      `;
      
      if (existing.length > 0) {
        console.log(`Course ${course.code} already exists, skipping...`);
        continue;
      }

      await sql`
        INSERT INTO courses (institution_id, code, title)
        VALUES (${institutionId}, ${course.code}, ${course.title})
      `;
      console.log(`✅ Added course: ${course.code} - ${course.title}`);
    } catch (error) {
      console.error(`❌ Failed to add course ${course.code}:`, error.message);
    }
  }

  console.log('New courses added successfully!');
}

addNewCourses().catch(error => { console.error(error); process.exit(1); });
