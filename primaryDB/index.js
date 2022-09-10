const { Pool } = require('pg');

const user = 'ziqianli';
let database;
let pool;

if (process.env.NODE_ENV === 'test') {
  database = 'test';
} else {
  database = 'ziqianli';
}

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    host: 'ec2-107-21-50-206.compute-1.amazonaws.com',
    user,
    password: 'password',
    database,
    port: 5432,
  });
} else {
  pool = new Pool({
    host: 'localhost',
    user,
    database,
    port: 5432,
  });
}

console.log('In', process.env.NODE_ENV, 'mode, connection pool is', pool.options);

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idel client', err);
  process.exit(-1);
});

module.exports = pool;
