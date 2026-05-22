const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');

const auth = require('../controllers/authController');
const dash = require('../controllers/dashboardController');
const orders = require('../controllers/ordersController');
const products = require('../controllers/productsController');
const customers = require('../controllers/customersController');
const expenses = require('../controllers/expensesController');

// Auth
router.get('/login', auth.getLogin);
router.post('/login', auth.postLogin);
router.get('/logout', auth.logout);

// Dashboard
router.get('/', requireAuth, (req, res) => res.redirect('/dashboard'));
router.get('/dashboard', requireAuth, dash.getDashboard);

// Orders
router.get('/orders', requireAuth, orders.listOrders);
router.get('/orders/new', requireAuth, orders.newOrderForm);
router.post('/orders', requireAuth, orders.createOrder);
router.get('/orders/:id', requireAuth, orders.viewOrder);
router.post('/orders/:id/status', requireAuth, orders.updateStatus);
router.post('/orders/:id/delete', requireAuth, requireAdmin, orders.deleteOrder);

// Products
router.get('/products', requireAuth, products.listProducts);
router.get('/products/new', requireAuth, requireAdmin, products.newProductForm);
router.post('/products', requireAuth, requireAdmin, products.createProduct);
router.get('/products/:id/edit', requireAuth, requireAdmin, products.editProductForm);
router.post('/products/:id', requireAuth, requireAdmin, products.updateProduct);
router.post('/products/:id/delete', requireAuth, requireAdmin, products.deleteProduct);

// Customers
router.get('/customers', requireAuth, customers.listCustomers);
router.get('/customers/new', requireAuth, customers.newCustomerForm);
router.post('/customers', requireAuth, customers.createCustomer);
router.get('/customers/:id', requireAuth, customers.viewCustomer);
router.get('/customers/:id/edit', requireAuth, customers.editCustomerForm);
router.post('/customers/:id', requireAuth, customers.updateCustomer);
router.post('/customers/:id/delete', requireAuth, requireAdmin, customers.deleteCustomer);

// Expenses
router.get('/expenses', requireAuth, expenses.listExpenses);
router.post('/expenses', requireAuth, expenses.createExpense);
router.post('/expenses/:id/delete', requireAuth, requireAdmin, expenses.deleteExpense);

module.exports = router;
