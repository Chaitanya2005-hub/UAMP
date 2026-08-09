require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.NEON_DATABASE_URL);
sql`ALTER TABLE exams ADD COLUMN IF NOT EXISTS question_paper_deadline TIMESTAMPTZ`
  .then(() => console.log('Question-paper deadline column is ready.'))
  .catch(error => { console.error(error); process.exit(1); });
