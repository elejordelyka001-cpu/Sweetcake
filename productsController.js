const pool = require('../models/db');

exports.listProducts = async (req, res) => {
  const result = await pool.query(`
    SELECT p.*, c.name as category_name FROM products p
    LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC
  `);
  const cats = await pool.query('SELECT * FROM categories ORDER BY name');
  const flash = req.session.flash || null; req.session.flash = null;
  res.render('products/list', { title: 'Products', products: result.rows, categories: cats.rows, user: req.session.user, flash });
};

exports.newProductForm = async (req, res) => {
  const cats = await pool.query('SELECT * FROM categories ORDER BY name');
  res.render('products/form', { title: 'Add Product', product: null, categories: cats.rows, user: req.session.user, flash: null });
};

exports.createProduct = async (req, res) => {
  const { name, description, price, category_id, stock, is_available } = req.body;
  await pool.query(
    `INSERT INTO products (name, description, price, category_id, stock, is_available) VALUES ($1,$2,$3,$4,$5,$6)`,
    [name, description, price, category_id || null, stock || 0, is_available === 'on']
  );
  req.session.flash = { type: 'success', msg: 'Product added!' };
  res.redirect('/products');
};

exports.editProductForm = async (req, res) => {
  const product = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  const cats = await pool.query('SELECT * FROM categories ORDER BY name');
  if (!product.rows[0]) return res.redirect('/products');
  res.render('products/form', { title: 'Edit Product', product: product.rows[0], categories: cats.rows, user: req.session.user, flash: null });
};

exports.updateProduct = async (req, res) => {
  const { name, description, price, category_id, stock, is_available } = req.body;
  await pool.query(
    `UPDATE products SET name=$1, description=$2, price=$3, category_id=$4, stock=$5, is_available=$6 WHERE id=$7`,
    [name, description, price, category_id || null, stock || 0, is_available === 'on', req.params.id]
  );
  req.session.flash = { type: 'success', msg: 'Product updated!' };
  res.redirect('/products');
};

exports.deleteProduct = async (req, res) => {
  await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  req.session.flash = { type: 'success', msg: 'Product deleted.' };
  res.redirect('/products');
};
