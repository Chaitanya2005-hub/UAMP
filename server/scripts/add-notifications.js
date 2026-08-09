require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.NEON_DATABASE_URL);

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(180) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(30) NOT NULL DEFAULT 'info',
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Support the earlier payload-based notification table used by this project.
  await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id UUID`;
  await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title VARCHAR(180)`;
  await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT`;
  await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type VARCHAR(30)`;
  await sql`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'recipient_id') THEN
        UPDATE notifications
        SET user_id = recipient_id,
            title = COALESCE(title, payload->>'title', 'Notification'),
            message = COALESCE(message, payload->>'message', ''),
            type = COALESCE(type, notification_type, 'info')
        WHERE user_id IS NULL OR title IS NULL OR message IS NULL OR type IS NULL;
      END IF;
    END $$
  `;
  await sql`ALTER TABLE notifications ALTER COLUMN user_id SET NOT NULL`;
  await sql`ALTER TABLE notifications ALTER COLUMN title SET NOT NULL`;
  await sql`ALTER TABLE notifications ALTER COLUMN message SET NOT NULL`;
  await sql`ALTER TABLE notifications ALTER COLUMN type SET NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC)`;
  console.log('Notifications table is ready.');
}

migrate().catch(error => { console.error(error); process.exitCode = 1; });
