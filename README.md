# 🎂 Sweet Dreams Cake Shop — Web Management System

Full-stack Node.js + Express web app connected to **Aiven MySQL**.

---

## ⚡ Quick Setup (3 Steps)

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Configure your Aiven MySQL connection

```bash
cp .env.example .env
```

Then open `.env` and fill in your Aiven credentials:

```env
DB_HOST=your-db-host.example.com
DB_PORT=26672
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=cakeshop
DB_SSL=require
SESSION_SECRET=any-random-long-string
SHOP_NAME=Sweet Dreams Cake Shop
PORT=3000
```

> Get these values from your Aiven console → your MySQL service → **Connection info**

### Step 3 — Create database tables

```bash
npm run setup
```

### Run the app

```bash
npm start
or npm.cmd start
```

> If PowerShell blocks `npm` because script execution is disabled, use:
>
> ```powershell
> npm.cmd start
> ```
>
> Or run the command from Windows Command Prompt instead.

Open → **<http://localhost:3000>**
Login → **admin / admin123** (change this after first login!)

---

## 📁 Project Structure

```text
cakeshop-web/
├── app.js              # Express app entry point
├── setup.js            # Database migration script
├── .env.example        # Environment config template
├── config/
│   ├── database.js     # Aiven MySQL pool
│   └── schema.sql      # Database tables + seed data
├── routes/
│   ├── auth.js         # Login / logout
│   ├── dashboard.js    # Dashboard stats
│   ├── products.js     # Product CRUD
│   ├── orders.js       # Order management
│   ├── customers.js    # Customer management
│   ├── reports.js      # Sales & analytics
│   ├── expenses.js     # Expense tracker
│   └── settings.js     # User & password settings
├── views/              # EJS templates
│   ├── partials/       # Header & footer
│   ├── auth/           # Login page
│   ├── dashboard.ejs
│   ├── products/
│   ├── orders/
│   ├── customers/
│   ├── reports/
│   ├── expenses/
│   └── settings/
└── public/
    └── css/style.css   # All styles
```

## ✨ Features

| Module | What it does |
| -------- | ------------- |
| 📊 Dashboard | Live stats, pending orders, low-stock alerts, sales chart |
| 🎂 Products | Full CRUD, profit margin calculator, stock management |
| 📦 Orders | Dynamic cart, discounts, downpayment, status tracking |
| 👥 Customers | Profiles, order history, allergy notes |
| 💸 Expenses | Log costs by category, monthly summaries |
| 📈 Reports | Sales charts, top products, P&L, payment breakdown |
| ⚙️ Settings | Password change, user management |

## 🔐 Security Notes

- Change the default admin password after first login
- Set a strong `SESSION_SECRET` in your `.env`
- Aiven SSL is enabled by default (`DB_SSL=true`)
