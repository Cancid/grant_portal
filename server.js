if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  console.log("Secret:", process.env.SESSION_SECRET)
}


const users = [];


const { request, response } = require('express');
const express = require('express'); 
const { Database } = require('sqlite3');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

const initializePassport = require('./passport-config')
initializePassport(passport, 
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id))

const app = express();
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile);
app.use(express.json());
app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())




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


app.get('/', (request, response) => {
  response.render('index');
});


app.get('/options', (request, response) => {
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


// app.get(function getTable(request, response, next) {
//   const sql = `SELECT rowid,
//   COALESCE(title, "") AS grant,
//   COALESCE(status, "") AS status,
//   COALESCE(due_date, "") AS due_date,
//   COALESCE(amount_requested, "") AS amount_requested,
//   COALESCE(amount_recieved, "") AS amount_received,
//   COALESCE(duration, "") AS duration,
//   COALESCE(interim_report, "") AS interim_report,
//   COALESCE(final_report, "") AS final_report
//   FROM grants`;
//   db.all(sql, {}, (err, data) => {
//     if (err) {
//     response.end();
//     console.log("Error retrieving table data.");
//     return;
//     } else {
//     response.json(data);
//     console.log(data);
//     };
//   });
//   next();
// });


app.get('/grants', (request, response) => {
  response.render('table');
});


app.get('/grants/data', (request, response) => {
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
      // response.json(data);
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

app.get('/login', (request, response) => {
  response.render('login.ejs');
});

app.get('/register', (request, response) => {
  response.render("register.ejs");

});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/table',
  failureRedirect:'/login',
  failureFlash: true
},
console.log("Authenticating...")))

app.post('/register', async (request, response) => {
  try {
    const hashedPassword = await bcrypt.hash(request.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: request.body.name,
      email: request.body.email,
      password: hashedPassword
    })  
    response.redirect('/login')
  } catch {
    response.redirect('/register')
  }
  console.log(users)
});


app.listen(3000, () => console.log('listening at 3000'))

app.use("/public", express.static('public'));
app.use(express.json({ limit: '1mb' }));

