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

// Establish the DB
let db = new sqlite3.Database('./db/example1.db', (err) => {
  if (err) {
    return console.error(err.message);
  };
  console.log('Connected to the in-memory SQlite database.');
});


const app = express();
// Set view engine to ejs 
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile);

//Use Statements
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


// Init passport with config file
const initializePassport = require('./passport-config');
// Call the initialize passport function from passport-config.js

async function getUser(email = null, id = null) {
  let sql;
  try {
    email ? sql = `SELECT user_id, email, password FROM users WHERE email = "${email}"`
    : sql = `SELECT user_id WHERE user_id = "${id}"`;
  } catch {
    return null;
  }
  return new Promise(function(res, rej) {
    db.get(sql, [], (err, row) => {
      if (err) {
        return rej(err);
      }
      console.log(row)
      db.close();
      res(row);
    });
  });
};
 
   
initializePassport(passport, 
  email => getUser(email),
  id => getUser(id));

app.post('/auth/google',
passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


// If new grant, insert it into the table, if editing a current grant, update that grant
app.post('/api/:grantid', (req, res) => {
  const params = req.params
  const data = req.body;
  let sql;
  params.grantid != 'null' ?
    sql = `UPDATE grants SET grant = ?, status = ?, due_date = ?, amount_req = ?, amount_rec = ?, duration = ?, final_report = ?, interim_report = ? WHERE rowid = ${params.grantid}`
    : sql = `INSERT INTO grants(grant, status, due_date, amount_req, amount_rec, duration, final_report, interim_report) VALUES(?, ? ,? ,? ,? ,?, ?, ?)`;
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

// Render the dropdown option on the grant form 
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
  console.log(sorter.sortBy);
  let sql;
  if (sorter.sortBy != "all"){ 
    sql = `SELECT rowid,
      COALESCE(grant, "") AS grant,
      COALESCE(status, "") AS status,
      COALESCE(due_date, "") AS due_date,
      COALESCE(amount_req, "") AS amount_requested,
      COALESCE(amount_rec, "") AS amount_received,
      COALESCE(duration, "") AS duration,
      COALESCE(interim_report, "") AS interim_report,
      COALESCE(final_report, "") AS final_report
      FROM grants
      WHERE status= "${sorter.sortBy}"`;
  }
  else {
    sql = `SELECT rowid,
      COALESCE(grant, "") AS grant,
      COALESCE(status, "") AS status,
      COALESCE(due_date, "") AS due_date,
      COALESCE(amount_req, "") AS amount_requested,
      COALESCE(amount_rec, "") AS amount_received,
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
  const sql = `SELECT COALESCE(grant, "") AS grant,
        COALESCE(status, "") AS status,
        COALESCE(due_date, "") AS due_date,
        COALESCE(amount_req, "") AS amount_requested,
        COALESCE(amount_rec, "") AS amount_received,
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


app.get(`/delete/:grantid`, (req, res) => {
  const data = req.params
  db.run(`DELETE FROM grants WHERE rowid = ${data.grantid}`, (err) => {
    if (err) {
      return console.log("Error deleting grant");
    };
  });
  res.redirect('/grants');
});


app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.get('/register', (req, res) => {
  res.render("register.ejs");

});

// If login successful redirect to grant table, otherwise redirect back to login
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

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/grants');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.end()
});


app.listen(3000, () => console.log('listening at 3000'))

app.use("/public", express.static('public'));
app.use(express.json({ limit: '1mb' }));

