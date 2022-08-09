const { Pool } = require('pg');

const pool = new Pool({
  user: 'ziqianli',
  host: 'localhost',
  database: 'ziqianli',
  port: 5432,
});

// pool.on('connect', (client) => {
//   console.log('connected to database!');
// });

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idel client', err);
  process.exit(-1);
});

module.exports = pool;
