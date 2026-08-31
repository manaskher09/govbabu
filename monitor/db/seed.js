// Seeds the MVP's 2 sources. Run once via `npm run init-db`. Re-running is
// safe (INSERT OR IGNORE keyed on unique columns).
const { getDb } = require('./db');

function seed() {
  const db = getDb();

  const insertOrg = db.prepare(
    `INSERT OR IGNORE INTO organizations (name, short_code, website_url) VALUES (?, ?, ?)`
  );
  insertOrg.run('Staff Selection Commission', 'SSC', 'https://ssc.gov.in');
  insertOrg.run('Bihar Public Service Commission', 'BPSC', 'https://bpsc.bihar.gov.in');

  const orgId = (shortCode) =>
    db.prepare('SELECT id FROM organizations WHERE short_code = ?').get(shortCode).id;

  const insertExam = db.prepare(
    `INSERT OR IGNORE INTO exams (org_id, code, external_code, name, category)
     VALUES (?, ?, ?, ?, ?)`
  );
  insertExam.run(orgId('SSC'), 'SSC-CGL', 'SSC-CGL', 'SSC CGL', 'Central Govt');
  insertExam.run(orgId('BPSC'), 'BPSC-72-CCE', 'BPSC', 'BPSC 72nd CCE', 'State PSC');

  const examId = (code) => db.prepare('SELECT id FROM exams WHERE code = ?').get(code).id;

  const insertSource = db.prepare(
    `INSERT OR IGNORE INTO sources
       (exam_id, label, url, source_type, role, extract_keywords, monitoring_frequency_minutes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  insertSource.run(
    examId('SSC-CGL'),
    'SSC CGL 2026 official notification PDF',
    'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf',
    'pdf',
    'notification',
    JSON.stringify(['exam date', 'last date', 'vacanc', 'age limit', 'fee']),
    720
  );
  insertSource.run(
    examId('BPSC-72-CCE'),
    'BPSC 72nd CCE official notification PDF',
    'https://bpsc.bihar.gov.in/wp-content/uploads/BPSC_content/Notices/Advertisement-Integrated-72th-CCE-PT_BPSC-20260505-p1euvo.pdf',
    'pdf',
    'notification',
    JSON.stringify(['exam date', 'last date', 'vacanc', 'age limit', 'fee']),
    720
  );

  db.prepare(
    `INSERT OR IGNORE INTO admin_users (username, display_name) VALUES (?, ?)`
  ).run('founder', 'GovBabu Founder');

  console.log('Seed complete:', {
    organizations: db.prepare('SELECT COUNT(*) c FROM organizations').get().c,
    exams: db.prepare('SELECT COUNT(*) c FROM exams').get().c,
    sources: db.prepare('SELECT COUNT(*) c FROM sources').get().c,
  });
}

if (require.main === module) seed();
module.exports = { seed };
