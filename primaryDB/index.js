const { Pool } = require('pg');

let database;
if (process.env.NODE_ENV === 'development') {
  database = 'test';
} else {
  database = 'ziqianli';
}

console.log('In', process.env.NODE_ENV, 'mode, connected to', database, 'db');

const pool = new Pool({
  user: 'ziqianli',
  host: 'localhost',
  database,
  port: 5432,
});

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idel client', err);
  process.exit(-1);
});

module.exports = pool;
