const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_bookstore'
});

connection.connect((err) => {
  if (err) {
    console.log(`Error: ${err.message}`);
  } else {
    console.log('Connected to the MySQL server.');
  }
});

// connection.end();

module.exports = connection;