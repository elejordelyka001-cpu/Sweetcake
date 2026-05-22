const pool = require('../models/db');

exports.listExpenses = async (req, res) => {
  const result = await pool.query(`
    SELECT e.*, u.name as created_by_name FROM expenses e
    LEFT JOIN users u ON e.created_by = u.id ORDER BY e.date DESC, e.created_at DESC
  `);
  const totalRes = await pool.query("SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', NOW())");
  const flash = req.session.flash || null; req.session.flash = null;
  res.render('expenses/list', { title: 'Expenses', expenses: result.rows, monthTotal: parseFloat(totalRes.rows[0].total), user: req.session.user, flash });
};

exports.createExpense = async (req, res) => {
  const { title, amount, category, date, notes } = req.body;
  await pool.query(
    'INSERT INTO expenses (title, amount, category, date, notes, created_by) VALUES ($1,$2,$3,$4,$5,$6)',
    [title, amount, category, date || new Date(), notes, req.session.user.id]
  );
  req.session.flash = { type: 'success', msg: 'Expense recorded!' };
  res.redirect('/expenses');
};

exports.deleteExpense = async (req, res) => {
  await pool.query('DELETE FROM expenses WHERE id = $1', [req.params.id]);
  req.session.flash = { type: 'success', msg: 'Expense deleted.' };
  res.redirect('/expenses');
};
