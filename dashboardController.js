const pool = require('../models/db');

exports.getDashboard = async (req, res) => {
  try {
    const [ordersRes, revenueRes, productsRes, customersRes, recentOrders, statusRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE"),
      pool.query("SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE status != 'cancelled' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())"),
      pool.query("SELECT COUNT(*) FROM products WHERE is_available = true"),
      pool.query("SELECT COUNT(*) FROM customers"),
      pool.query(`
        SELECT o.id, c.name as customer_name, o.total_amount, o.status, o.created_at
        FROM orders o LEFT JOIN customers c ON o.customer_id = c.id
        ORDER BY o.created_at DESC LIMIT 5
      `),
      pool.query(`
        SELECT status, COUNT(*) as count FROM orders GROUP BY status
      `)
    ]);

    const statusCounts = {};
    statusRes.rows.forEach(r => statusCounts[r.status] = parseInt(r.count));

    const flash = req.session.flash || null;
    req.session.flash = null;

    res.render('dashboard', {
      title: 'Dashboard',
      user: req.session.user,
      stats: {
        todayOrders: parseInt(ordersRes.rows[0].count),
        monthRevenue: parseFloat(revenueRes.rows[0].total),
        activeProducts: parseInt(productsRes.rows[0].count),
        totalCustomers: parseInt(customersRes.rows[0].count),
      },
      recentOrders: recentOrders.rows,
      statusCounts,
      flash
    });
  } catch (err) {
    console.error(err);
    res.render('dashboard', { title: 'Dashboard', user: req.session.user, stats: {}, recentOrders: [], statusCounts: {}, flash: null });
  }
};
