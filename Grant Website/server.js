
const express = require('express'); 
const { Database } = require('sqlite3');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());

let db = new sqlite3.Database('./db/grantstest.db', (err) => {
  if (err) {
    return console.error(err.message);
  };
  console.log('Connected to the in-memory SQlite database.');
});


app.post('/api/:grantid', (request, response) => {
  const params = request.params
  console.log(params);
  const data = request.body;
  console.log(data);
  let sql;
  if (params.grantid != 'null') {
    sql = `UPDATE grants SET title = ?, status = ?, due_date = ?, amount_requested = ?, amount_recieved = ?, duration = ?, final_report = ?, interim_report = ? WHERE rowid = ${params.grantid}`;
  } else {
    console.log("Inserting new grant...")
    sql = `INSERT INTO grants(title, status, due_date, amount_requested, amount_recieved, duration, final_report, interim_report) VALUES(?, ? ,? ,? ,? ,?, ?, ?)`;
  };
  console.log(sql);
  db.run(sql, data, function(err) {
    if (err) {
      return console.log(err.message);
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);
  });
  //db.close();
  console.log('The database has been closed.');
  response.status(200).send();  
});



app.get('/api', (request, response) => {
  sql = `SELECT * FROM status ORDER BY status`;
  db.all(sql, {}, (err, data) => {
    if (err) {
    response.end();
    console.log("Error!");
    return;
  } else {
    response.json(data);
    console.log(data);
    };
  });
});


app.get('/table', (request, response) => {
  const sql = `SELECT rowid,
        COALESCE(title, "") AS grant,
        COALESCE(status, "") AS status,
        COALESCE(due_date, "") AS due_date,
        COALESCE(amount_requested, "") AS amount_requested,
        COALESCE(amount_recieved, "") AS amount_received,
        COALESCE(duration, "") AS duration,
        COALESCE(interim_report, "") AS interim_report,
        COALESCE(final_report, "") AS final_report
        FROM grants`;
  db.all(sql, {}, (err, data) => {
    if (err) {
      response.end();
      console.log("Error retrieving table data.");
      return;
    } else {
      response.json(data);
      console.log(data);
    };
  });
});


app.get(`/grant/:grantid`, (request, response) => {
  const data = request.params;
  const sql = `SELECT COALESCE(title, "") AS grant,
        COALESCE(status, "") AS status,
        COALESCE(due_date, "") AS due_date,
        COALESCE(amount_requested, "") AS amount_requested,
        COALESCE(amount_recieved, "") AS amount_received,
        COALESCE(duration, "") AS duration,
        COALESCE(interim_report, "") AS interim_report,
        COALESCE(final_report, "") AS final_report
        FROM grants
        WHERE rowid = ${data.grantid}`;
  db.get(sql, (err, data) => {
    if (err) {
      response.end();
      console.log("Error retrieving table data.");
      return;
    } else {
      response.json(data);
      console.log(data);
    };
  });
});



app.listen(3000, () => console.log('listening at 3000'))

app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

