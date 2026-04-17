const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

if (!process.env.DATABASE_URL) {
  console.error('FATAL SYSTEM ERROR: DATABASE_URL is missing in .env. Cannot connect to Turso.');
  process.exit(1);
}

console.log('Connecting to LibSQL at:', process.env.DATABASE_URL);
const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const initDb = async () => {
  console.log('Starting Optimized Database Initialization (Batch Mode)...');
  
  try {
    await client.batch([
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('ADMIN', 'STUDENT')) NOT NULL,
        profile_photo TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS exams (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        subject TEXT,
        date TEXT,
        duration INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        total_marks INTEGER DEFAULT 0,
        passing_score INTEGER DEFAULT 0,
        status TEXT CHECK(status IN ('published', 'draft')) DEFAULT 'published',
        assigned_to TEXT DEFAULT 'all',
        created_by TEXT,
        FOREIGN KEY(created_by) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        exam_id TEXT NOT NULL,
        type TEXT CHECK(type IN ('MCQ', 'SHORT_ANSWER', 'CODING')) NOT NULL,
        text TEXT NOT NULL,
        options TEXT,
        correct_answer TEXT,
        explanation TEXT,
        marks INTEGER DEFAULT 1,
        FOREIGN KEY(exam_id) REFERENCES exams(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS attempts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        exam_id TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        submit_time TEXT,
        auto_submitted BOOLEAN DEFAULT FALSE,
        status TEXT CHECK(status IN ('ACTIVE', 'SUBMITTED')) DEFAULT 'ACTIVE',
        score REAL DEFAULT 0,
        retake_allowed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(exam_id) REFERENCES exams(id)
      )`,
      `CREATE TABLE IF NOT EXISTS answers (
        id TEXT PRIMARY KEY,
        attempt_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        student_answer TEXT,
        marks_awarded REAL DEFAULT 0,
        is_correct BOOLEAN DEFAULT FALSE,
        FOREIGN KEY(attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
        FOREIGN KEY(question_id) REFERENCES questions(id)
      )`,
      `CREATE TABLE IF NOT EXISTS exam_assignments (
        exam_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        PRIMARY KEY (exam_id, student_id),
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    ], 'write');

    // Add missing subject/date columns via batch (individual try-catch handled by batch 'write' mode or separate commands)
    const columns = [
      'ALTER TABLE exams ADD COLUMN subject TEXT',
      'ALTER TABLE exams ADD COLUMN date TEXT',
      'ALTER TABLE exams ADD COLUMN total_marks INTEGER DEFAULT 0',
      'ALTER TABLE exams ADD COLUMN status TEXT CHECK(status IN ("published", "draft")) DEFAULT "published"'
    ];

    for (const col of columns) {
      try { await client.execute(col); } catch (e) {} // Column might exist
    }

    // Seed logic
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');
    const existingUsers = await client.execute('SELECT COUNT(*) as count FROM users');
    
    if (existingUsers.rows[0].count === 0) {
      const adminHashed = await bcrypt.hash('admin123', 10);
      const studentHashed = await bcrypt.hash('student123', 10);
      
      await client.batch([
        {
          sql: 'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
          args: [uuidv4(), 'Admin User', 'admin@exampro.com', adminHashed, 'ADMIN']
        },
        {
          sql: 'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
          args: [uuidv4(), 'Student User', 'student@exampro.com', studentHashed, 'STUDENT']
        }
      ], 'write');
      console.log('Seed users created successfully');
    }

    console.log('Database initialized successfully (Optimized)');
  } catch (err) {
    console.error('Database Initialization Failed:', err.message);
  }
};

module.exports = { client, initDb };

// Recalibrated schema sync
// Switched to production Turso instance