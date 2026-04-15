const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');
dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const initDb = async () => {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('ADMIN', 'STUDENT')) NOT NULL,
      profile_photo TEXT
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      duration INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      passing_score INTEGER DEFAULT 0,
      published BOOLEAN DEFAULT FALSE,
      created_by TEXT,
      FOREIGN KEY(created_by) REFERENCES users(id)
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      exam_id TEXT NOT NULL,
      type TEXT CHECK(type IN ('MCQ', 'SHORT_ANSWER', 'CODING')) NOT NULL,
      text TEXT NOT NULL,
      options TEXT, -- JSON string for MCQ
      correct_answer TEXT,
      explanation TEXT,
      marks INTEGER DEFAULT 1,
      FOREIGN KEY(exam_id) REFERENCES exams(id) ON DELETE CASCADE
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS attempts (
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
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS answers (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      student_answer TEXT,
      marks_awarded REAL DEFAULT 0,
      is_correct BOOLEAN DEFAULT FALSE,
      FOREIGN KEY(attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
      FOREIGN KEY(question_id) REFERENCES questions(id)
    )
  `);

  console.log('Database initialized successfully');
};

module.exports = { client, initDb };
