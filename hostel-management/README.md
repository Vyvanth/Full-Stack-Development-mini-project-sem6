# 🏨 Hostel Management System
### Full Stack Development - 22AIE457 | Team 11

**Tech Stack:** React + Vite + Tailwind CSS · Node.js + Express · PostgreSQL + Prisma ORM · JWT Auth · Razorpay · Nodemailer

---

## 📁 Project Structure

```
hostel-management/
├── package.json              # Root monorepo scripts
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── api/client.js     # Axios instance with JWT interceptors
│   │   ├── context/          # AuthContext (login/register/logout)
│   │   ├── layouts/          # StudentLayout, AdminLayout (sidebars)
│   │   ├── pages/
│   │   │   ├── public/       # Landing, Login, Register
│   │   │   ├── student/      # Dashboard, Room, Complaints, Payments,
│   │   │   │                 # Profile, FoodMenu, Laundry, OutPass, HomePass
│   │   │   └── admin/        # Dashboard, Students, Rooms, Complaints,
│   │   │                     # Payments, FoodMenu, Laundry, PassApproval
│   │   └── App.jsx           # Router with protected routes
└── server/                   # Express backend
    ├── prisma/
    │   └── schema.prisma     # All database models
    └── src/
        ├── index.js          # Express app entry point
        ├── middleware/        # JWT auth + role authorization
        ├── routes/            # auth, student, room, complaint,
        │                      # payment, food, laundry, pass, admin
        └── prisma/
            ├── client.js     # Prisma singleton
            └── seed.js       # Demo data seeder
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- npm

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd hostel-management
npm install           # installs root deps (concurrently)
cd server && npm install
cd ../client && npm install
```

### 2. Set Up Environment

```bash
cd server
cp .env.example .env
# Edit .env with your PostgreSQL credentials and other settings
```

### 3. Set Up Database

```bash
cd server
npx prisma migrate dev --name init    # creates DB + runs migrations
npm run db:seed                        # seeds admin, demo student, rooms, food menu
```

### 4. Run the App

```bash
# From project root — starts both client and server
cd hostel-management
npm run dev
```

- **Frontend:** http://localhost:5173  
- **Backend:** http://localhost:5000  
- **Prisma Studio:** `cd server && npm run db:studio`

---

## 🔑 Demo Credentials

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@hostel.com       | admin123    |
| Student | student@hostel.com     | student123  |

---

## 🗃️ Database Models

| Model          | Description                              |
|----------------|------------------------------------------|
| User           | Auth credentials + role (STUDENT/ADMIN/WARDEN) |
| Student        | Profile, roll number, guardian info      |
| Admin          | Admin/Warden profile                     |
| Room           | Room details, block, floor, capacity     |
| RoomAllocation | Student ↔ Room assignment                |
| Complaint      | Category, status, priority tracking      |
| Fee            | Fee structure with due dates             |
| Payment        | Razorpay payment records                 |
| FoodMenu       | Daily menu with 4 meal types             |
| FoodFeedback   | Student ratings on meals                 |
| LaundryRequest | Regular/Express laundry tracking         |
| OutPass        | Short-term exit requests                 |
| HomePass       | Multi-day leave requests                 |

---

## 🔌 API Endpoints

| Method | Endpoint                      | Access         | Description            |
|--------|-------------------------------|----------------|------------------------|
| POST   | /api/auth/register            | Public         | Student registration   |
| POST   | /api/auth/login               | Public         | Login (all roles)      |
| GET    | /api/auth/me                  | Auth           | Get current user       |
| POST   | /api/auth/change-password     | Auth           | Change password        |
| GET    | /api/students/profile         | Student        | Own profile            |
| PUT    | /api/students/profile         | Student        | Update profile         |
| GET    | /api/students                 | Admin/Warden   | List all students      |
| DELETE | /api/students/:id             | Admin          | Delete student         |
| GET    | /api/rooms                    | Admin/Warden   | List all rooms         |
| POST   | /api/rooms                    | Admin          | Create room            |
| POST   | /api/rooms/allocate           | Admin/Warden   | Assign room            |
| DELETE | /api/rooms/deallocate/:id     | Admin/Warden   | Unassign room          |
| GET    | /api/complaints               | Auth           | List complaints        |
| POST   | /api/complaints               | Student        | Submit complaint       |
| PATCH  | /api/complaints/:id           | Admin/Warden   | Update status          |
| GET    | /api/payments                 | Auth           | List payments          |
| POST   | /api/payments/fees            | Admin          | Create fee structure   |
| POST   | /api/payments/create-order    | Auth           | Razorpay order         |
| POST   | /api/payments/verify          | Auth           | Verify payment         |
| GET    | /api/food                     | Auth           | Get food menu          |
| POST   | /api/food                     | Admin/Warden   | Create/update menu     |
| GET    | /api/laundry                  | Auth           | List laundry requests  |
| POST   | /api/laundry                  | Student        | Submit request         |
| PATCH  | /api/laundry/:id              | Admin/Warden   | Update status          |
| GET    | /api/passes/out               | Auth           | Out passes             |
| POST   | /api/passes/out               | Student        | Apply out pass         |
| PATCH  | /api/passes/out/:id           | Admin/Warden   | Approve/reject         |
| GET    | /api/passes/home              | Auth           | Home passes            |
| POST   | /api/passes/home              | Student        | Apply home pass        |
| PATCH  | /api/passes/home/:id          | Admin/Warden   | Approve/reject         |
| GET    | /api/admin/dashboard          | Admin/Warden   | Dashboard stats        |

---

## ⚙️ Configuration

### Razorpay (Payment Integration)
1. Create account at [razorpay.com](https://razorpay.com)
2. Get API keys from Dashboard → Settings → API Keys
3. Add to `server/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```

### Nodemailer (Email Notifications)
1. Enable 2FA on Gmail → Generate App Password
2. Add to `server/.env`:
   ```
   EMAIL_USER=your@gmail.com
   EMAIL_PASS=your_app_password
   ```

---

## 👥 Team 11
- **BL.EN.U4AID23019** — Joshika Somisetty
- **BL.EN.U4AID23037** — Padarthi Leela Sabareesh  
- **BL.EN.U4AID23056** — Vobilisetti Vyvanth

GitHub: https://github.com/Vyvanth/Full-Stack-Development-miniproject-sem6
