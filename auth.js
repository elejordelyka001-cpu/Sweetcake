function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect('/login');
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') return next();
  req.session.flash = { type: 'error', msg: 'Admin access required.' };
  res.redirect('/dashboard');
}

module.exports = { requireAuth, requireAdmin };
