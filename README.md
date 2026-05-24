# ⚡ 3D Electricity Billing Management System

A modern, premium electricity billing system with 3D UI built with React + Vite + Three.js (frontend) and Node.js + Express + SQLite (backend).

## 🗂 Folder Structure

```
electricity-billing-system/
├── backend/
│   ├── server.js           # Main Express server
│   ├── database.js         # SQLite setup + seeding
│   ├── package.json
│   └── routes/
│       ├── auth.js         # Login route
│       ├── customers.js    # Customer CRUD
│       ├── bills.js        # Bill management
│       └── dashboard.js    # Stats API
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Layout.jsx
        │   ├── ElectricOrb.jsx       # 3D orb for login
        │   └── DashboardBackground.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Customers.jsx
            ├── GenerateBill.jsx
            ├── BillHistory.jsx
            └── Reports.jsx
```

## 🚀 Installation & Running

### Step 1 — Install Backend
```bash
cd electricity-billing-system/backend
npm install
```

### Step 2 — Run Backend
```bash
npm run dev
# Server starts at http://localhost:5000
```

### Step 3 — Install Frontend (new terminal)
```bash
cd electricity-billing-system/frontend
npm install
```

### Step 4 — Run Frontend
```bash
npm run dev
# App opens at http://localhost:5173
```

## 🔑 Default Login
- **Username:** admin
- **Password:** 1234

## 💡 Features
- 3D animated electricity orb on login
- Admin dashboard with live stats
- Customer CRUD management
- Smart bill generation with slab pricing
- Bill history with search & filters
- Reports with multiple charts
- Mark bills as paid / delete
- Responsive glassmorphism dark UI

## 📊 Billing Slabs
| Units | Rate |
|-------|------|
| 0 – 100 | ₹5 / unit |
| 101 – 300 | ₹7 / unit |
| 301+ | ₹10 / unit |
