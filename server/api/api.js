module.exports = (app, connection) => {
  app.post('/api/auth/login', (req, res) => {
    const { data } = req.body;
  
    connection.query('SELECT * FROM tbl_users WHERE username = ? AND password = ?', [data.username, data.password], (err, results, fields) => {
      if (err) {
        console.log(err);
      } else {
        if (results.length > 0) {
          req.session.loginData = results[0];
          req.session.cookie.maxAge = 3600 * 1000;
          res.json(results[0]);
        } else {
          res.send(undefined);
        }
      }
    });
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.send({ ok: true });
  });
  
  app.get('/api/auth/session-checker', (req, res) => {
    res.send({ ok: true, body: req.session });
  });
  
  app.get('/api/books/fetch/all', (req, res) => {
    connection.query('SELECT * FROM tbl_books', (err, results, fields) => {
      if (err) {
        console.log(err);
      } else {
        res.json(results);
      }
    });
  });
  
  app.post('/api/books/save', (req, res) => {
    let { data } = req.body;
  
    let query;
    if (data.id) {
      query = 'UPDATE tbl_books SET title = ?, author = ?, price = ?, stock = ? WHERE id = ?';
      data = [ data.title, data.author, data.price, data.stock, data.id ];
    } else {
      query = 'INSERT INTO tbl_books SET ?';
      data = { title: data.title, author: data.author, price: data.price, stock: data.stock };
    }
  
    connection.query(query, data, (err, results, fields) => {
      if (err) {
        console.log(err);
      } else {
        res.json(results);
      }
    });
  });
  
  app.post('/api/books/delete', (req, res) => {
    const { multi, data } = req.body;
  
    let query;
    let params;
  
    if (multi) {
      query = 'DELETE FROM tbl_books WHERE id IN (?)';
      params = [data];
    } else {
      query = 'DELETE FROM tbl_books WHERE id = ?';
      params = [ data.id ];
    }
  
    connection.query(query, params, (err, results, fields) => {
      if (err) {
        console.log(err);
      } else {
        res.json(results);
      }
    });
  });
};