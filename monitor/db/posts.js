// Shared posts query, used by both admin/server.js (admin CRUD views) and
// db/currentExam.js (the public read path, via getCurrentExam) — one query,
// one source of truth for post ordering, so the two consumers can never
// silently diverge.
function listPostsForExam(db, examId) {
  return db.prepare('SELECT * FROM posts WHERE exam_id = ? ORDER BY display_order, id').all(examId);
}

module.exports = { listPostsForExam };
