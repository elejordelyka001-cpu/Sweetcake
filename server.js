require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const methodOverride = require('method-override');
const path = require('path');
const pool = require('./models/db');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session
app.use(session({
  store: new pgSession({ pool, tableName: 'session', createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'sweetbake-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8 hours
}));

// Locals
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.appName = process.env.APP_NAME || 'SweetBake';
  next();
});

// Routes
app.use('/', require('./routes/index'));

// 404
app.use((req, res) => res.status(404).render('404', { title: '404', user: req.session.user }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Error', error: err.message, user: req.session.user });
});

app.listen(PORT, () => {
  console.log(`🍰 SweetBake running on http://localhost:${PORT}`);
});
