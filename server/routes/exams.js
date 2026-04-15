const express = require('express');
const router = express.Router();
const { client } = require('../db');
const { authenticate } = require('../middlewares/auth');

// Get all published exams (for students)
router.get('/published', authenticate, async (req, res) => {
  try {
    const result = await client.execute(`
      SELECT e.*, 
      (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as question_count,
      (SELECT status FROM attempts a WHERE a.exam_id = e.id AND a.user_id = ?) as user_attempt_status
      FROM exams e 
      WHERE published = 1
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific exam details (without answers)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const examResult = await client.execute({
      sql: 'SELECT * FROM exams WHERE id = ?',
      args: [req.params.id]
    });
    
    if (examResult.rows.length === 0) return res.status(404).json({ error: 'Exam not found' });

    res.json(examResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
