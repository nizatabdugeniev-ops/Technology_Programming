const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'data.json');

function loadDB() {
  if (!fs.existsSync(DB_PATH)) return { users: [], sessions: [], grades: [], rateLimits: [] };
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function generatePassword() {
  return crypto.randomBytes(12).toString('base64url');
}

async function seed() {
  const db = { users: [], sessions: [], grades: [], rateLimits: [] };

  const subjects = ['Технология программирования', 'Основы ИИ', 'Базы данных', 'Веб-разработка'];
  const dates = ['2026-10-14', '2026-10-21', '2026-10-28', '2026-11-04', '2026-11-09'];

  const passwords = {
    student: process.env.SEED_PASSWORD_STUDENT || generatePassword(),
    student2: process.env.SEED_PASSWORD_STUDENT2 || generatePassword(),
    teacher: process.env.SEED_PASSWORD_TEACHER || generatePassword()
  };

  if (!process.env.SEED_PASSWORD_STUDENT) console.log('SEED_PASSWORD_STUDENT=', passwords.student);
  if (!process.env.SEED_PASSWORD_STUDENT2) console.log('SEED_PASSWORD_STUDENT2=', passwords.student2);
  if (!process.env.SEED_PASSWORD_TEACHER) console.log('SEED_PASSWORD_TEACHER=', passwords.teacher);

  const usersData = [
    { login: 'student', name: 'Fohl Salmon', group: 'ИС 25-21', role: 'student', password: passwords.student },
    { login: 'student2', name: 'Test Student', group: 'ИС 25-21', role: 'student', password: passwords.student2 },
    { login: 'teacher', name: 'Doctor Fohl', group: null, role: 'teacher', password: passwords.teacher }
  ];

  for (const u of usersData) {
    const { salt, hash } = hashPassword(u.password);
    db.users.push({
      id: db.users.length + 1,
      login: u.login.toLowerCase(),
      name: u.name,
      group: u.group,
      role: u.role,
      salt,
      hash
    });
  }

  const student1Id = 1;
  const student2Id = 2;
  const grades1 = [5, 4, 5, 4];
  const grades2 = [4, 3, 4, 5];

  for (let i = 0; i < subjects.length; i++) {
    db.grades.push({ student_id: student1Id, subject: subjects[i], grade: grades1[i], date: dates[i % dates.length] });
    db.grades.push({ student_id: student2Id, subject: subjects[i], grade: grades2[i], date: dates[(i + 1) % dates.length] });
  }

  saveDB(db);
  console.log('Seed completed. DB:', DB_PATH);
}

if (require.main === module || process.env.FORCE_SEED) {
  if (fs.existsSync('.env')) {
    const env = fs.readFileSync('.env', 'utf8');
    env.split('\n').forEach(line => {
      const [k, ...v] = line.split('=');
      if (k && v.length) process.env[k.trim()] = v.join('=').trim();
    });
  }
  seed();
}

module.exports = { seed, loadDB, saveDB, hashPassword };
