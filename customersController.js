const pool = require('../models/db');

exports.listCustomers = async (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM customers WHERE 1=1';
  const params = [];
  if (search) { params.push(`%${search}%`); query += ` AND (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)`; }
  query += ' ORDER BY created_at DESC';
  const result = await pool.query(query, params);
  const flash = req.session.flash || null; req.session.flash = null;
  res.render('customers/list', { title: 'Customers', customers: result.rows, user: req.session.user, search, flash });
};

exports.newCustomerForm = (req, res) => {
  res.render('customers/form', { title: 'Add Customer', customer: null, user: req.session.user, flash: null });
};

exports.createCustomer = async (req, res) => {
  const { name, email, phone, address, notes } = req.body;
  await pool.query('INSERT INTO customers (name, email, phone, address, notes) VALUES ($1,$2,$3,$4,$5)', [name, email, phone, address, notes]);
  req.session.flash = { type: 'success', msg: 'Customer added!' };
  res.redirect('/customers');
};

exports.editCustomerForm = async (req, res) => {
  const result = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
  if (!result.rows[0]) return res.redirect('/customers');
  res.render('customers/form', { title: 'Edit Customer', customer: result.rows[0], user: req.session.user, flash: null });
};

exports.updateCustomer = async (req, res) => {
  const { name, email, phone, address, notes } = req.body;
  await pool.query('UPDATE customers SET name=$1,email=$2,phone=$3,address=$4,notes=$5 WHERE id=$6', [name, email, phone, address, notes, req.params.id]);
  req.session.flash = { type: 'success', msg: 'Customer updated!' };
  res.redirect('/customers');
};

exports.deleteCustomer = async (req, res) => {
  await pool.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
  req.session.flash = { type: 'success', msg: 'Customer deleted.' };
  res.redirect('/customers');
};

exports.viewCustomer = async (req, res) => {
  const [cust, orders] = await Promise.all([
    pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]),
    pool.query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [req.params.id])
  ]);
  if (!cust.rows[0]) return res.redirect('/customers');
  res.render('customers/view', { title: cust.rows[0].name, customer: cust.rows[0], orders: orders.rows, user: req.session.user, flash: null });
};
