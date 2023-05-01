const db = require('./db');

db.query('SELECT * FROM yourtable', (err, rows) => {
  if (err) throw err;

  console.log('Data received from MySQL:');
  console.log(rows);

  db.end(() => {
    console.log('Connection closed.');
  });
});
