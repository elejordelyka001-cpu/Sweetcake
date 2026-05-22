const pool = require('../models/db');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  const flash = req.session.flash || null;
  req.session.flash = null;
  res.render('auth/login', { flash, title: 'Login' });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.session.flash = { type: 'error', msg: 'Invalid email or password.' };
      return res.redirect('/login');
    }
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.session.flash = { type: 'error', msg: 'Server error. Try again.' };
    res.redirect('/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
