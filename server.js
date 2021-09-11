// If not in production require env variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  console.log("Secret:", process.env.SESSION_SECRET)
}

//Place holder user list till database setup
const users = [];

// Requirments
const express = require('express'); 
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

// Init passport with config file
const initializePassport = require('./passport-config');
// Call the initialize passport function from passport-config.js
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



let db = new sqlite3.Database('./db/example1.db', (err) => {
  if (err) {
    return console.error(err.message);
  };
  console.log('Connected to the in-memory SQlite database.');
});


app.post('/api/:grantid', (req, res) => {
  const params = req.params
  console.log(params);
  const data = req.body;
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
  res.status(200).send();  
});


app.get('/', (req, res) => {
  res.render('index');
});


app.get('/options', (req, res) => {
  sql = `SELECT * FROM status ORDER BY status`;
  db.all(sql, {}, (err, data) => {
    if (err) {
    res.end();
    console.log("Error!");
    return;
  } else {
    res.json(data);
    console.log(data);
    };
  });
});

app.get('/grants', (req, res) => {
  res.render('table');
});


app.get('/grants/data/:sortBy', (req, res) => {
  const sorter = req.params;
  let sql;
  if (sorter.sortBy === "received"){ 
    sql = `SELECT rowid,
      COALESCE(title, "") AS grant,
      COALESCE(status, "") AS status,
      COALESCE(due_date, "") AS due_date,
      COALESCE(amount_requested, "") AS amount_requested,
      COALESCE(amount_recieved, "") AS amount_received,
      COALESCE(duration, "") AS duration,
      COALESCE(interim_report, "") AS interim_report,
      COALESCE(final_report, "") AS final_report
      FROM grants
      WHERE status='Recieved'`;
  }
  else {
    sql = `SELECT rowid,
      COALESCE(title, "") AS grant,
      COALESCE(status, "") AS status,
      COALESCE(due_date, "") AS due_date,
      COALESCE(amount_requested, "") AS amount_requested,
      COALESCE(amount_recieved, "") AS amount_received,
      COALESCE(duration, "") AS duration,
      COALESCE(interim_report, "") AS interim_report,
      COALESCE(final_report, "") AS final_report
      FROM grants`;
  };
  console.log(sql)
  db.all(sql, {}, (err, data) => {
    if (err) {
      res.end();
      console.log("Error retrieving table data.");
      return;
    } else {
      // res.json(data);
      res.json(data);
      console.log(data);
    };
  });
});


app.get(`/grant/:grantid`, (req, res) => {
  const data = req.params;
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
      res.end();
      console.log("Error retrieving table data.");
      return;
    } else {
      res.json(data);
      console.log(data);
    };
  });
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.get('/register', (req, res) => {
  res.render("register.ejs");

});

// TODO: Make login work with DB
app.post('/login', passport.authenticate('local', {
  successRedirect: '/grants',
  failureRedirect:'/login',
  failureFlash: true
}))

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const uniqueId = new Date()
    let data = [uniqueId, req.body.email, hashedPassword] 
    console.log(data)
    let sql = `INSERT INTO users(user_id, email, password) VALUES(?, ?, ?)`;
    db.run(sql, data, (err) => {
      if (err) {
        return console.error(err.message);
      }
    });
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
  console.log(users)
});

app.listen(3000, () => console.log('listening at 3000'))

app.use("/public", express.static('public'));
app.use(express.json({ limit: '1mb' }));

