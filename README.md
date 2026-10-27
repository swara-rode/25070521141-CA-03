# Expense Tracker - Smart Personal Finance & Budget Management

**Academic Project CA-03 Full-Stack Web Development**  
- **Student Name:** Swara Rode  
- **PRN:** 25070521141  
- **Repository Name:** `25070521141-CA-03`  
- **Project Root Directory:** `25070521141`  
- **Local Project Path:** `/Users/swararode/Desktop/25070521141`

---

## 1. Project Overview

**Expense Tracker** is a full-stack personal finance web application built using the MERN stack (MongoDB, Express.js, React, Node.js). It empowers students, working professionals, and individuals to record, categorize, analyze, and budget their daily finances.

Unlike mockups or static templates, this application is backed by persistent database storage, cryptographic authentication, strictly scoped user data isolation, and real-time aggregation algorithms.

### Key Objectives Achieved
- **Authentic Full-Stack Architecture:** Decoupled React frontend and Express REST API backend in distinct root folders.
- **Persistent Data Storage:** Real MongoDB database managed through Mongoose models with compound unique indexes.
- **Secure Authentication:** Password hashing using bcrypt (salt rounds = 12), signed JWT tokens, and protected routes.
- **Financial Intelligence:** Automated income vs. expense cash flow calculations, category budget progress bars, and spending warnings.
- **Standards-Compliant CSV Export:** User-isolated CSV exports adhering to RFC 4180 with spreadsheet formula injection protection.
- **Responsive UI/UX:** Styled using modern CSS variables, responsive sidebars and drawers, and Recharts data visualizations.

---

## 2. Features

### A. Authentication & Security
- User registration with client & server-side validation (email format, password min 6 chars, confirm password matching).
- Salted password hashing with bcrypt; raw passwords and password hashes are never stored or exposed.
- JWT token authentication for API access; token verification middleware on every private route.
- Per-user data isolation: users can only view, edit, or delete their own transactions and budgets.

### B. Interactive Dashboard
- Monthly financial summary cards: **Total Income**, **Total Expenses**, **Net Cash Flow**, and **Allocated Budget**.
- Lifetime inflow, outflow, and cumulative balance tracking.
- Past 6 months cash flow trend chart (`Recharts` Bar Chart).
- Category expense breakdown donut chart (`Recharts` Pie Chart).
- Recent 5 transactions table with quick actions.
- Dynamic Month & Year selector to examine past and current financial periods.

### C. Transaction Management
- Log income and expenses with amount, category, date, payment method, and optional notes.
- Supported payment methods: Cash, UPI, Debit Card, Credit Card, Bank Transfer, Other.
- Search by transaction title or notes.
- Filter by type (Income vs. Expense), category, payment method, and date ranges.
- Sort by date (newest/oldest) or amount (highest/lowest).
- Modals for adding and editing records, plus confirmation modals for safe deletion.

### D. Category Budgets & Spending Limits
- Set custom monthly spending thresholds for each expense category.
- Compound database index prevents duplicate budgets for the same category in the same month.
- Automatic computation of actual spending directly from transaction records.
- Three visual status stages:
  - **Normal Spending** (< 80% consumed)
  - **Approaching Limit** (80% - 100% consumed)
  - **Budget Exceeded** (> 100% consumed)

### E. Financial Reports & Analytics
- Custom date range analytics (This Month, Last 30 Days, Year to Date, or custom dates).
- Daily cash trajectory area chart.
- Proportional category breakdown bars.
- Payment method distribution list.
- One-click RFC 4180-compliant **CSV download** with escaped cells and formula shielding.

### F. Profile & Currency Customization
- Update profile details and change account passwords.
- Preferred currency switcher: **INR (₹)** [default], **USD ($)**, and **EUR (€)**.
- Note: Changing the display currency changes screen formatting without altering base numbers or assuming live exchange rate conversions.

---

## 3. Technology Stack

### Frontend (`client/`)
- **Framework:** React 18
- **Build Tool:** Vite 5
- **Routing:** React Router DOM 6
- **Data Visualizations:** Recharts 2
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Typography:** Plus Jakarta Sans & JetBrains Mono

### Backend (`server/`)
- **Runtime:** Node.js (v20+)
- **Web Framework:** Express.js 4
- **Database:** MongoDB Community Server (v7.0+)
- **ODM:** Mongoose 8
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Security:** Helmet, CORS, express-rate-limit
- **Logging:** Morgan

### Testing & Quality Assurance
- **Backend Test Runner:** Node.js Native Test Runner (`node --test`)
- **API Assertions:** Supertest & `node:assert/strict`

---

## 4. Project Directory Structure

```
25070521141/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── budgets/
│   │   │   │   ├── BudgetCard.jsx
│   │   │   │   └── BudgetFormModal.jsx
│   │   │   ├── common/
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── ConfirmDialog.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── CashFlowChart.jsx
│   │   │   │   ├── CategoryPieChart.jsx
│   │   │   │   └── StatCard.jsx
│   │   │   └── transactions/
│   │   │       ├── TransactionFormModal.jsx
│   │   │       └── TransactionList.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CurrencyContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useCurrency.js
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── BudgetsPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   └── TransactionsPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── budgetController.js
│   │   ├── dashboardController.js
│   │   ├── reportsController.js
│   │   ├── transactionController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Budget.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── reportsRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── userRoutes.js
│   ├── tests/
│   │   ├── api.test.js
│   │   └── e2e.test.js
│   ├── utils/
│   │   ├── csvExporter.js
│   │   └── seedData.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .gitignore
└── README.md
```

---

## 5. Prerequisites

Before running the application locally, ensure you have:
1. **Node.js** (v18.0.0 or higher, v20+ recommended)
2. **npm** (v9.0.0 or higher)
3. **MongoDB Community Server** (v6.0 or higher running locally on default port 27017) or **MongoDB Compass**

---

## 6. Installation & Setup Instructions

### Step 1: Clone or Navigate to Project Folder
```bash
cd /Users/swararode/Desktop/25070521141
```

### Step 2: Configure Environment Variables

#### macOS / Linux Terminal:
```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```

#### Windows PowerShell:
```powershell
# Server configuration
Copy-Item "server\.env.example" -Destination "server\.env"

# Client configuration
Copy-Item "client\.env.example" -Destination "client\.env"
```

#### Configuration Details:
**Server (`server/.env`):**
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/expense_tracker
JWT_SECRET=dev_jwt_secret_key_expense_tracker_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client (`client/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5001/api
```
*(Note: Port 5001 is used by default to prevent port conflicts with macOS ControlCenter AirPlay Receiver on port 5000.)*

---

## 7. Starting the Database

Make sure MongoDB Community Server is active on your machine:
```bash
# Verify MongoDB port 27017 is listening:
mongod --dbpath /tmp/mongodb_data --bind_ip 127.0.0.1 --logpath /tmp/mongodb.log --fork
```
Or start MongoDB service via system services (e.g. `brew services start mongodb-community` on macOS or Windows Services app on Windows).

You can connect MongoDB Compass to: `mongodb://127.0.0.1:27017`

---

## 8. Running the Application

Open **two separate terminals** to run the backend and frontend simultaneously:

### Terminal 1: Backend API Server

**macOS / Linux:**
```bash
cd /Users/swararode/Desktop/25070521141/server
npm install
npm run dev
```

**Windows PowerShell:**
```powershell
cd "PATH_TO_PROJECT\25070521141\server"
npm.cmd install
npm.cmd run dev
```

Backend will start at: `http://localhost:5001`  
Health check endpoint: `http://localhost:5001/api/health`

---

### Terminal 2: React Frontend Application

**macOS / Linux:**
```bash
cd /Users/swararode/Desktop/25070521141/client
npm install
npm run dev
```

**Windows PowerShell:**
```powershell
cd "PATH_TO_PROJECT\25070521141\client"
npm.cmd install
npm.cmd run dev
```

Vite will serve the frontend at: `http://localhost:5173`

Open your web browser and navigate to: **`http://localhost:5173`**

---

## 9. Optional: Seeding Demonstration Data

To populate sample records for quick grading or demonstration, run the development seed script:

```bash
cd server
npm run seed
```

This will create a dedicated test account:
- **Email:** `demo@expensetracker.local`
- **Password:** `DemoUser123!`
- **Contents:** 10 diverse income/expense transactions and 6 category budgets for the current month.

You can also click the **"Fill Demo Account Credentials"** button on the Login page to pre-populate these credentials.

---

## 10. REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System status & database connectivity |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT token |
| `POST` | `/api/auth/logout` | Public | Log out user session |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated profile |
| `GET` | `/api/transactions` | Private | Query transactions with filters, search & pagination |
| `POST` | `/api/transactions` | Private | Record new income or expense |
| `GET` | `/api/transactions/:id` | Private | Fetch specific transaction by ID |
| `PUT` | `/api/transactions/:id` | Private | Update specific transaction |
| `DELETE` | `/api/transactions/:id` | Private | Delete specific transaction |
| `GET` | `/api/transactions/meta` | Private | Supported categories & payment methods |
| `GET` | `/api/budgets` | Private | Budgets with actual spending vs limit comparisons |
| `POST` | `/api/budgets` | Private | Set monthly category budget |
| `PUT` | `/api/budgets/:id` | Private | Edit category budget limit |
| `DELETE` | `/api/budgets/:id` | Private | Remove category budget |
| `GET` | `/api/dashboard/summary` | Private | Monthly summary cards, lifetime figures & recent transactions |
| `GET` | `/api/dashboard/trends` | Private | 6-month historical income vs expense trends |
| `GET` | `/api/dashboard/category-breakdown` | Private | Proportional expense distribution for selected month |
| `GET` | `/api/reports/summary` | Private | Comprehensive date-range financial summaries |
| `GET` | `/api/reports/export-csv` | Private | Download RFC 4180-compliant CSV export |
| `GET` | `/api/users/me` | Private | View user account settings |
| `PUT` | `/api/users/me` | Private | Update name, currency or change password |

---

## 11. Automated Testing

The project includes unit, security, and end-to-end integration tests using Node's test runner and Supertest.

### Running Backend Tests
```bash
cd server
npm test
```

### Verified Test Cases (30 Tests, 100% Passing):
1. Service health check endpoint returns 200 and live DB status.
2. Root API status check returns 200.
3. Protected routes reject unauthenticated requests with 401.
4. Input validation: registration rejects missing fields with 400.
5. Input validation: registration rejects mismatched passwords with 400.
6. Input validation: login rejects missing credentials with 400.
7. Unregistered routes return standard 404 JSON response.
8. RFC 4180 CSV cell escaping properly quotes commas, quotes, and formula characters.
9. RFC 4180 CSV formatting creates formatted table rows with headers.
10. Registration creates real database user with salted bcrypt hash (no password hash returned).
11. Duplicate email registration is prevented with 400 error.
12. Login verifies credentials against database hash and returns JWT.
13. Login rejects incorrect passwords with 401.
14. Authenticated profile endpoint returns current user data.
15. Multi-user registration for data isolation checks.
16. Income transaction creation (amount 10,000).
17. Expense transaction creation (amount 3,000).
18. Transaction update (amount changed to 3,200).
19. **Per-user security:** User 2 cannot access User 1's transaction.
20. **Per-user security:** User 2 cannot delete User 1's transaction.
21. Category budget creation.
22. Duplicate budget prevention for same user/category/month.
23. Budget calculations accurately aggregate real expense transactions.
24. Dashboard summary calculates exact numbers from database transactions.
25. User 2 dashboard is isolated and empty (0 balance).
26. CSV export downloads only the authenticated user's records.
27. Transaction deletion completes and reflects in database.

### Running Frontend Production Build
```bash
cd client
npm run build
```
Builds the optimized production client bundle in `client/dist/`.

---

## 12. Troubleshooting

| Issue | Cause | Resolution |
|---|---|---|
| `connect ECONNREFUSED 127.0.0.1:27017` | MongoDB service is not started | Start MongoDB server using `mongod` or service manager |
| `listen EADDRINUSE: address already in use :::5000` | macOS ControlCenter AirPlay Receiver uses port 5000 | The project defaults to port 5001 in `.env`. Ensure `PORT=5001` in `server/.env` and `VITE_API_BASE_URL=http://localhost:5001/api` in `client/.env` |
| `Access denied. Please log in to continue.` | Expired or missing token in header | Log in through the login page to acquire a fresh JWT token |
| `Network Error` when submitting forms | Backend server is not running | Ensure Terminal 1 is running `npm run dev` in the `server` folder |

---

## 13. Student Declaration

This project was built for the **CA-03 Full-Stack Web Development Course** by:
- **Student Name:** Swara Rode
- **PRN:** 25070521141
- **Academic Year:** 2026
