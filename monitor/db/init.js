const { getDb } = require('./db');
const { seed } = require('./seed');

getDb();
seed();
console.log('Database initialized.');
