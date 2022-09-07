const { Pool } = require('pg');

let host;
let database;
if (process.env.NODE_ENV === 'development') {
  database = 'test';
} else {
  database = 'ziqianli';
}

if (process.env.NODE_ENV === 'etl') {
  host = 'ec2-3-84-145-249.compute-1.amazonaws.com';
} else {
  host = 'localhost';
}

const pool = new Pool({
  user: 'ziqianli',
  host,
  database,
  port: 5432,
});

console.log('In', process.env.NODE_ENV, 'mode, host is:', host, 'connected to', database, 'db');

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idel client', err);
  process.exit(-1);
});

module.exports = pool;
