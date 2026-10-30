# 🎓 Student Attendance Management System (MERN Stack)

A complete, simple, and beginner-friendly **Student Attendance Management System** built with **MongoDB**, **Express.js**, **React.js (Vite + Tailwind CSS)**, and **Node.js**.

This project provides a full-stack solution featuring persistent database storage, dynamic statistics, student CRUD management, daily class attendance marking with duplicate prevention, and comprehensive attendance reports with percentage calculations.

---

## 🚀 Key Features

### 1. Dynamic Dashboard
- **Total Students**: Real-time count of enrolled students in the database.
- **Present & Absent (Today)**: Real-time count and percentage of students marked for the current day.
- **Overall Attendance Percentage**: All-time cumulative attendance percentage.
- **Recent Records**: Live table of recently logged attendance events.
- **Basic Analytics**:
  - Donut / Pie chart displaying today's Present vs. Absent ratio.
  - Weekly attendance overview bar chart (last 7 days trend).
  - Department distribution breakdown progress bars.

### 2. Student Management (CRUD)
- **Add Student**: Register students with Name, unique Enrollment Number, Email, Phone, Department, and Semester.
- **View All Students**: Clean data table with real-time search by name or enrollment number.
- **Filters**: Filter by Department and Semester.
- **Edit Student**: Modal dialog to modify student details with duplicate enrollment validation.
- **Delete Student**: Delete student record with automatic cascading cleanup of associated attendance logs.
- **Student History Modal**: Quick-view modal showing individual attendance statistics and full date history.

### 3. Attendance Management
- **Date Picker**: Select any date to mark or edit attendance (defaults to today).
- **Filter by Class**: Filter students by department and semester.
- **Mark Status**: Toggle each student as **Present** or **Absent** with instant visual feedback.
- **Bulk Actions**: Single-click **"Mark All Present"** and **"Mark All Absent"** buttons.
- **Duplicate Prevention & Editing**: Uses MongoDB compound unique index and bulk upsert operations. Updating an already-marked date safely edits the record without creating duplicate entries.

### 4. Attendance Reports & Analytics
- **Monthly & All-Time Reports**: Select month or view full academic history.
- **Searchable**: Search reports by student name or enrollment number.
- **Calculated Metrics**:
  - Total Present Days
  - Total Absent Days
  - Total Marked Days
  - **Attendance Percentage Formula**:
    $$\text{Attendance Percentage} = \left(\frac{\text{Total Present Days}}{\text{Total Marked Days}}\right) \times 100$$
- **Color-Coded Badges & Mini Progress Bars**:
  - 🟢 **$\ge 75\%$**: Good standing
  - 🟡 **$60\% - 74\%$**: Warning / Average
  - 🔴 **$< 60\%$**: Low attendance alert
- **Detailed History Modal**: Click any student row to view an itemized log of all marked dates.
- **Export / Print**: Print-ready clean layout.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React.js 19 (scaffolded with Vite) |
| **Styling** | Tailwind CSS v4 & Lucide React icons |
| **Routing** | React Router DOM v7 |
| **HTTP Client** | Axios |
| **Charts & Analytics** | Recharts |
| **Backend Runtime** | Node.js (v20+) |
| **Web Framework** | Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Environment Config** | Dotenv |

---

## 📂 Project Folder Structure

```
MERN_SMS_Project/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection configuration
│   ├── controllers/
│   │   ├── attendanceController.js # Mark, view, daily & monthly attendance handlers
│   │   ├── reportController.js     # Dashboard metrics & student reports
│   │   └── studentController.js    # Student CRUD operations
│   ├── middleware/
│   │   └── errorHandler.js       # Centralized error & validation handler
│   ├── models/
│   │   ├── Attendance.js         # Attendance schema with compound unique index
│   │   └── Student.js            # Student schema with unique enrollmentNo
│   ├── routes/
│   │   ├── attendanceRoutes.js   # /api/attendance routes
│   │   ├── reportRoutes.js       # /api/reports routes
│   │   └── studentRoutes.js      # /api/students routes
│   ├── seeder.js                 # Sample database seeder script
│   ├── test-api.js               # Automated E2E API test suite
│   ├── server.js                 # Express server entry point
│   ├── package.json              # Backend dependencies and scripts
│   └── .env                      # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx        # App layout shell with responsive sidebar
│   │   │   ├── Loader.jsx        # Loading spinner component
│   │   │   ├── Modal.jsx         # Reusable modal dialog
│   │   │   ├── Navbar.jsx        # Top navigation with live DB connection indicator
│   │   │   ├── Notification.jsx  # Toast alert notification component
│   │   │   ├── Sidebar.jsx       # Left sidebar navigation
│   │   │   └── StatCard.jsx      # Clean metric card
│   │   ├── pages/
│   │   │   ├── AddStudent.jsx    # Student registration page
│   │   │   ├── AttendanceReports.jsx # Attendance reporting table & analytics
│   │   │   ├── Dashboard.jsx     # Overview metrics & charts
│   │   │   ├── MarkAttendance.jsx# Daily attendance marking sheet
│   │   │   └── Students.jsx      # Student management & directory
│   │   ├── services/
│   │   │   └── api.js            # Axios client and service methods
│   │   ├── App.jsx               # React Router configuration
│   │   ├── index.css             # Tailwind CSS styles
│   │   └── main.jsx              # React DOM render entry
│   ├── vite.config.js            # Vite configuration with API proxy
│   └── package.json              # Frontend dependencies and scripts
├── package.json                  # Root orchestration package.json
└── README.md                     # Comprehensive project documentation
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`):

Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/attendance_db
NODE_ENV=development
```

*(Optional)* If hosting the frontend on a different origin, set in `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or newer recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port `27017` (or MongoDB Atlas connection string).

---

### Step 1: Install Dependencies

#### Install Backend Dependencies:
```bash
cd backend
npm install
```

#### Install Frontend Dependencies:
```bash
cd ../frontend
npm install
```

---

### Step 2: Seed Sample Data *(Optional but Recommended)*

Populate initial students and 5 days of attendance history into MongoDB:

```bash
cd backend
npm run seed
```

To clear all database records at any time:
```bash
npm run seed:destroy
```

---

### Step 3: Run the Application

#### Option A: Run from Root Directory
From the root project folder (`MERN_SMS_Project/`):

- **Start Backend:**
  ```bash
  npm run dev:backend
  ```
- **Start Frontend (in a second terminal):**
  ```bash
  npm run dev:frontend
  ```

#### Option B: Run from Respective Folders

1. **Start the Backend Server (Port 5000):**
   ```bash
   cd backend
   npm run dev
   ```
   *The backend will be available at:* `http://localhost:5000`

2. **Start the Frontend Application (Port 3000):**
   ```bash
   cd frontend
   npm run dev
   ```
   *The frontend dashboard will be available at:* `http://localhost:3000`

---

## 🧪 Testing Backend APIs

An automated end-to-end verification script is included to test all endpoints:

```bash
node backend/test-api.js
```

This verifies:
1. Health check (`GET /api/health`)
2. Dashboard metrics retrieval (`GET /api/reports/dashboard`)
3. Student registration (`POST /api/students`)
4. Duplicate enrollment rejection with `400 Bad Request`
5. Student search & filtering (`GET /api/students`)
6. Student detail updates (`PUT /api/students/:id`)
7. Batch attendance marking (`POST /api/attendance`)
8. Updating attendance on existing dates without duplicates
9. Daily attendance sheet retrieval (`GET /api/attendance/daily`)
10. Percentage calculation verification (`GET /api/reports/student/:id`)
11. Monthly reports generation (`GET /api/reports/monthly`)
12. Student deletion and cascading attendance cleanup (`DELETE /api/students/:id`)

---

## 🔌 API Endpoints Reference

### Student Routes (`/api/students`)
- `POST /api/students` - Register a new student
- `GET /api/students` - Get all students (supports `?search=`, `?department=`, `?semester=`)
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student details
- `DELETE /api/students/:id` - Delete student & related attendance records

### Attendance Routes (`/api/attendance`)
- `POST /api/attendance` - Save/update attendance (supports batch and single records)
- `GET /api/attendance` - Get attendance records with filters
- `GET /api/attendance/daily` - Get daily attendance sheet for a selected date
- `GET /api/attendance/monthly` - Get monthly attendance breakdown
- `PUT /api/attendance/:id` - Update individual attendance record status

### Report Routes (`/api/reports`)
- `GET /api/reports/dashboard` - Get dashboard KPI statistics and chart series
- `GET /api/reports/student/:id` - Get individual student report and attendance history
- `GET /api/reports/monthly` - Get summary report table with attendance percentages

---

## 🛡️ Database Compound Index

To guarantee data integrity and prevent multiple records for the same student on any single day, the `Attendance` schema applies a compound unique index:

```javascript
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
```

---

## 📄 License
This project is open-source and free to use for educational and personal projects.

