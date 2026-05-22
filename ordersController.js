const pool = require('../models/db');

exports.listOrders = async (req, res) => {
  const { status, search } = req.query;
  let query = `
    SELECT o.*, c.name as customer_name, c.phone as customer_phone
    FROM orders o LEFT JOIN customers c ON o.customer_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (status) { params.push(status); query += ` AND o.status = $${params.length}`; }
  if (search) { params.push(`%${search}%`); query += ` AND (c.name ILIKE $${params.length} OR CAST(o.id AS TEXT) ILIKE $${params.length})`; }
  query += ' ORDER BY o.created_at DESC';

  const result = await pool.query(query, params);
  const flash = req.session.flash || null; req.session.flash = null;
  res.render('orders/list', { title: 'Orders', orders: result.rows, user: req.session.user, filter: { status, search }, flash });
};

exports.newOrderForm = async (req, res) => {
  const [customers, products] = await Promise.all([
    pool.query('SELECT * FROM customers ORDER BY name'),
    pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_available = true ORDER BY p.name')
  ]);
  res.render('orders/new', { title: 'New Order', customers: customers.rows, products: products.rows, user: req.session.user, flash: null });
};

exports.createOrder = async (req, res) => {
  const { customer_id, delivery_date, delivery_address, special_notes, product_ids, quantities } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderRes = await client.query(
      `INSERT INTO orders (customer_id, delivery_date, delivery_address, special_notes, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [customer_id || null, delivery_date || null, delivery_address, special_notes, req.session.user.id]
    );
    const orderId = orderRes.rows[0].id;
    let total = 0;
    const ids = Array.isArray(product_ids) ? product_ids : [product_ids];
    const qtys = Array.isArray(quantities) ? quantities : [quantities];
    for (let i = 0; i < ids.length; i++) {
      if (!ids[i]) continue;
      const prod = await client.query('SELECT * FROM products WHERE id = $1', [ids[i]]);
      if (!prod.rows[0]) continue;
      const qty = parseInt(qtys[i]) || 1;
      const subtotal = prod.rows[0].price * qty;
      total += subtotal;
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [orderId, ids[i], prod.rows[0].name, qty, prod.rows[0].price, subtotal]
      );
    }
    await client.query('UPDATE orders SET total_amount = $1 WHERE id = $2', [total, orderId]);
    await client.query('COMMIT');
    req.session.flash = { type: 'success', msg: `Order #${orderId} created successfully!` };
    res.redirect('/orders');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    req.session.flash = { type: 'error', msg: 'Failed to create order.' };
    res.redirect('/orders/new');
  } finally { client.release(); }
};

exports.viewOrder = async (req, res) => {
  const { id } = req.params;
  const [order, items] = await Promise.all([
    pool.query(`SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE o.id = $1`, [id]),
    pool.query('SELECT * FROM order_items WHERE order_id = $1', [id])
  ]);
  if (!order.rows[0]) return res.redirect('/orders');
  const flash = req.session.flash || null; req.session.flash = null;
  res.render('orders/view', { title: `Order #${id}`, order: order.rows[0], items: items.rows, user: req.session.user, flash });
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
  req.session.flash = { type: 'success', msg: 'Order status updated!' };
  res.redirect(`/orders/${id}`);
};

exports.deleteOrder = async (req, res) => {
  await pool.query('DELETE FROM orders WHERE id = $1', [req.params.id]);
  req.session.flash = { type: 'success', msg: 'Order deleted.' };
  res.redirect('/orders');
};
