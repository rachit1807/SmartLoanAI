# 🏦 SmartLoan AI

<div align="center">

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11-yellow?logo=python)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)
![Machine Learning](https://img.shields.io/badge/AI-Machine%20Learning-success)
![License](https://img.shields.io/badge/License-MIT-green)

### AI Powered Loan Approval & Financial Risk Assessment Platform

A modern **Full Stack AI-powered Loan Approval System** built using **React**, **FastAPI**, **SQLite**, and **Machine Learning**.

The system allows users to apply for loans online while providing administrators with an intelligent dashboard to review applications, verify uploaded documents, analyze AI predictions, and approve or reject loan requests.

---

### 👨‍💻 Developed By

**Rachit Tripathi**

Bachelor of Technology (Information Technology)

Babu Banarasi Das Northern India Institute of Technology

</div>

---

# 📚 Table of Contents

- Overview
- Features
- Technology Stack
- System Architecture
- Application Workflow
- Project Structure
- Installation
- API Endpoints
- Database
- AI Prediction Engine
- Admin Dashboard
- Screenshots
- Future Enhancements
- Author
- License

---

# 📖 Overview

SmartLoan AI is an intelligent loan approval platform designed to automate the loan evaluation process using Machine Learning.

Instead of relying solely on manual verification, the system evaluates financial information, predicts loan approval probability, calculates financial health, estimates EMI, and assists administrators in making informed approval decisions.

The platform consists of two major modules:

- 👤 User Portal
- 👨‍💼 Admin Portal

Users can securely register, submit loan applications, upload required documents, and track their application history.

Administrators can review every application, verify uploaded documents, analyze AI-generated financial reports, and approve or reject loans from a professional dashboard.

# ✨ Features

## 👤 User Module

- 🔐 Secure User Registration & Login
- 📝 Apply for Loan Online
- 📄 Upload Required Documents
- 🤖 AI-Based Loan Approval Prediction
- 📊 Approval Probability Analysis
- ⚠️ Risk Level Detection
- 💰 Financial Health Score
- 📈 Monthly EMI Calculator
- 💵 Total Interest Calculation
- 💳 Total Repayment Estimation
- 📚 View Loan History
- 📋 Dashboard with Recent Applications

---

## 👨‍💼 Admin Module

- 📊 Professional Admin Dashboard
- 📈 Application Statistics
- 🔍 Search Loan Applications
- 👀 Review Individual Applications
- 📄 Verify Uploaded Documents
- 🤖 View Complete AI Prediction Report
- ✅ Approve Loan Applications
- ❌ Reject Loan Applications
- 📂 Manage All Loan Requests

---

## 🤖 AI Prediction Engine

The Machine Learning engine analyzes multiple financial parameters to generate:

- Approval Probability
- Loan Approval Prediction
- Financial Risk Level
- Financial Health Category
- Financial Score
- Monthly EMI
- Total Interest
- Total Repayment Amount

---

# 🛠 Technology Stack

| Category | Technologies |
|-----------|--------------|
| Frontend | React.js, Vite, Axios, React Router |
| Backend | FastAPI, Python |
| Database | SQLite, SQLAlchemy |
| Machine Learning | Scikit-learn, Pandas, Joblib |
| Authentication | JWT Authentication |
| File Upload | FastAPI UploadFile |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | CSS3 |

---

# ⭐ Key Highlights

- ✅ Full Stack Web Application
- ✅ AI Powered Loan Prediction
- ✅ Financial Health Analysis
- ✅ Admin Dashboard
- ✅ Document Verification
- ✅ Responsive User Interface
- ✅ REST API Architecture
- ✅ SQLite Database
- ✅ Machine Learning Integration
- ✅ Role-Based Workflow (User & Admin)

---

# 📊 Project Statistics

| Feature | Status |
|----------|--------|
| User Authentication | ✅ Completed |
| Loan Application | ✅ Completed |
| AI Prediction | ✅ Completed |
| EMI Calculation | ✅ Completed |
| Financial Health Analysis | ✅ Completed |
| Loan History | ✅ Completed |
| Document Upload | ✅ Completed |
| Admin Dashboard | ✅ Completed |
| Document Verification | ✅ Completed |
| Loan Approval Workflow | ✅ Completed |
| Search Functionality | ✅ Completed |
| Database Integration | ✅ Completed |
# 🏗️ System Architecture

```text
                        ┌────────────────────┐
                        │     React Frontend │
                        │  (Vite + Axios)    │
                        └─────────┬──────────┘
                                  │
                         REST API Requests
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │     FastAPI Backend     │
                     │ Authentication          │
                     │ Loan APIs              │
                     │ Admin APIs             │
                     │ Document Upload APIs   │
                     └─────────┬──────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Machine Learning│    │ SQLite Database │    │ Uploaded Files  │
│ Loan Prediction │    │ SQLAlchemy ORM  │    │ Documents/PDFs  │
└────────────────┘    └─────────────────┘    └─────────────────┘
```

---

# 🔄 Application Workflow

```text
        User Registration/Login
                  │
                  ▼
        Fill Loan Application
                  │
                  ▼
        Upload Required Documents
                  │
                  ▼
        FastAPI Backend Validation
                  │
                  ▼
      Machine Learning Prediction
                  │
                  ▼
      Financial Health Analysis
                  │
                  ▼
        EMI Calculation Engine
                  │
                  ▼
     Store Data into SQLite Database
                  │
                  ▼
        Admin Dashboard Review
                  │
                  ▼
      Document Verification Process
                  │
                  ▼
        Loan Approved / Rejected
                  │
                  ▼
        User Can View Loan History
```

---

# 🤖 AI Prediction Workflow

```text
Applicant Details
        │
        ▼
Income Analysis
        │
        ▼
Credit History Evaluation
        │
        ▼
Loan Amount Assessment
        │
        ▼
Machine Learning Model
        │
        ▼
───────────────────────────────────
Approval Probability
Risk Level
Financial Score
Financial Health
Monthly EMI
Total Interest
Total Repayment
───────────────────────────────────
        │
        ▼
Displayed on User Dashboard
&
Admin Dashboard
```

---

# 📂 Project Structure

```text
SmartLoanAI
│
├── backend
│   │
│   ├── routes
│   │      ├── users.py
│   │      ├── loans.py
│   │      ├── documents.py
│   │      └── admin.py
│   │
│   ├── ml
│   │      ├── loan_model.pkl
│   │      ├── loan_data.csv
│   │      └── train_model.py
│   │
│   ├── uploads
│   │
│   ├── database.py
│   ├── models.py
│   ├── prediction.py
│   ├── main.py
│   ├── migrate_db.py
│   └── smartloan.db
│
├── frontend
│   │
│   ├── src
│   │
│   ├── api
│   │      └── axios.js
│   │
│   ├── components
│   │
│   ├── pages
│   │      ├── Login.jsx
│   │      ├── Register.jsx
│   │      ├── Dashboard.jsx
│   │      ├── ApplyLoan.jsx
│   │      ├── UploadDocuments.jsx
│   │      ├── LoanHistory.jsx
│   │      ├── AdminDashboard.jsx
│   │      └── AdminApplication.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── README.md
└── requirements.txt
```

---

# 🏦 Complete Loan Approval Lifecycle

```text
User
 │
 │ Register/Login
 ▼
Loan Application
 │
 ▼
Document Upload
 │
 ▼
AI Prediction
 │
 ▼
Financial Analysis
 │
 ▼
Application Stored
 │
 ▼
────────────────────────────────────
        ADMIN PORTAL
────────────────────────────────────
 │
 ▼
Review Application
 │
 ▼
Verify Documents
 │
 ▼
Approve / Reject Loan
 │
 ▼
Status Updated
 │
 ▼
Visible in User Dashboard
```
# ⚙️ Installation Guide

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/rachit1807/SmartLoanAI.git
```

```bash
cd SmartLoanAI
```

---

## 2️⃣ Backend Setup

Navigate to the backend directory.

```bash
cd backend
```

### Create Virtual Environment

**Windows**

```bash
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux**

```bash
python3 -m venv venv
source venv/bin/activate
```

---

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

### Start FastAPI Server

```bash
uvicorn main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

Swagger Documentation:

```
http://127.0.0.1:8000/docs
```

---

## 3️⃣ Frontend Setup

Open another terminal.

```bash
cd frontend
```

Install packages

```bash
npm install
```

Run React App

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🔌 REST API Endpoints

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | User Login |

---

## Loan APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/loan/apply` | Submit Loan Application |
| GET | `/loan/history/{user_id}` | View Loan History |
| GET | `/loan/{id}` | View Loan Details |

---

## Document APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/documents/upload` | Upload Documents |
| GET | `/documents/{application_id}` | View Uploaded Documents |

---

## Admin APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/admin/applications` | Get All Applications |
| GET | `/admin/application/{id}` | View Single Application |
| POST | `/admin/verify/{id}` | Verify Documents |
| POST | `/admin/approve/{id}` | Approve Loan |
| POST | `/admin/reject/{id}` | Reject Loan |

---

# 🗄️ Database Schema

## Users Table

| Field | Type |
|--------|------|
| id | Integer |
| name | String |
| email | String |
| password | String |

---

## Loan Applications Table

| Field | Type |
|--------|------|
| id | Integer |
| user_id | Integer |
| income | Float |
| loan_amount | Float |
| loan_term | Integer |
| credit_history | String |
| property_area | String |
| approval_probability | Float |
| risk_level | String |
| financial_score | Float |
| financial_health | String |
| monthly_emi | Float |
| total_interest | Float |
| total_payment | Float |
| status | String |

---

## Loan Documents Table

| Field | Type |
|--------|------|
| id | Integer |
| application_id | Integer |
| user_id | Integer |
| document_type | String |
| stored_filename | String |
| verification_status | String |
| uploaded_at | DateTime |

---

# 🔐 Authentication Flow

```text
User
 │
 ▼
Register
 │
 ▼
Login
 │
 ▼
Backend Authentication
 │
 ▼
User Dashboard
 │
 ▼
Loan Application
```

---

# 🚀 Deployment

This project can be deployed using the following platforms:

| Service | Purpose |
|----------|---------|
| Vercel | React Frontend |
| Render | FastAPI Backend |
| Railway | Full Stack Deployment |
| Docker | Containerized Deployment |
| GitHub | Source Code Management |

---

# 🧪 Testing Checklist

- ✅ User Registration
- ✅ User Login
- ✅ Loan Application Submission
- ✅ Document Upload
- ✅ AI Prediction Generation
- ✅ EMI Calculation
- ✅ Loan History
- ✅ Admin Dashboard
- ✅ Application Review
- ✅ Document Verification
- ✅ Loan Approval
- ✅ Loan Rejection
- ✅ Database Storage
- ✅ REST APIs
# 🎯 Project Highlights

SmartLoan AI is designed to streamline the loan approval process by combining Machine Learning with a modern full-stack web application.

## Key Capabilities

### 👤 User Portal

- Secure User Registration & Login
- Apply for Loan Online
- Upload Required Documents
- AI-Based Loan Prediction
- Financial Health Analysis
- EMI Calculation
- Loan History Tracking

---

### 👨‍💼 Admin Portal

- Professional Admin Dashboard
- Search Applications
- Review Individual Applications
- View Complete AI Prediction
- Verify Uploaded Documents
- Approve / Reject Loan Applications

---

### 🤖 AI Decision Engine

The Machine Learning model analyzes multiple financial parameters to assist loan officers in making informed decisions.

The prediction engine generates:

- Loan Approval Probability
- Financial Score
- Financial Health Category
- Risk Level
- Monthly EMI
- Total Interest
- Total Repayment Amount

---

# 📊 Core Functionalities

| Module | Status |
|----------|:------:|
| User Authentication | ✅ |
| Loan Application | ✅ |
| AI Prediction | ✅ |
| Financial Health Analysis | ✅ |
| EMI Calculator | ✅ |
| Loan History | ✅ |
| Document Upload | ✅ |
| Admin Dashboard | ✅ |
| Document Verification | ✅ |
| Loan Approval Workflow | ✅ |
| REST APIs | ✅ |
| Database Integration | ✅ |

---

# 🧠 AI Prediction Parameters

The Machine Learning model evaluates the following parameters before generating a prediction:

- Age
- Gender
- Marital Status
- Education
- Employment Status
- Monthly Income
- Co-applicant Income
- Loan Amount
- Loan Term
- Credit History
- Property Area

Based on these inputs, the system predicts:

- Loan Approval Status
- Approval Probability
- Risk Level
- Financial Score
- Financial Health
- Monthly EMI
- Total Interest
- Total Repayment Amount

---

# 💼 Skills Demonstrated

This project demonstrates practical knowledge of:

- Full Stack Web Development
- REST API Development
- Machine Learning Integration
- Database Design
- Authentication
- File Upload Handling
- Financial Data Processing
- AI Explainability
- Dashboard Development
- Role-Based Workflow
- CRUD Operations
- Professional UI Design

---

# 🚀 Future Enhancements

- Credit Score Integration
- OCR-Based Document Verification
- Cloud Deployment (AWS / Azure)
- Docker Support
- Role-Based Access Control (RBAC)
- Email & SMS Notifications
- Export Reports to PDF / Excel
- Business Analytics Dashboard
- Chatbot-Based Loan Assistance
- Multi-Bank Integration
---

# 🤝 Contributing

Contributions are welcome!

If you'd like to improve SmartLoan AI, feel free to:

1. Fork the repository
2. Create a new feature branch

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes

```bash
git commit -m "Add: your feature description"
```

4. Push the branch

```bash
git push origin feature/your-feature-name
```

5. Open a Pull Request

Please ensure your code follows the existing project structure and coding style.

---

# 📜 License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this project for educational and personal purposes.

---

# 🙏 Acknowledgements

Special thanks to the following technologies and open-source communities:

- React.js
- FastAPI
- Python
- Scikit-learn
- SQLAlchemy
- SQLite
- Pandas
- Joblib
- Vite
- Axios

Their excellent documentation and community support made this project possible.

---

# 👨‍💻 Author

## Rachit Tripathi

**Bachelor of Technology (Information Technology)**

Babu Banarasi Das Northern India Institute of Technology

### Connect with me

- **GitHub:** https://github.com/rachit1807
- **LinkedIn:** https://linkedin.com/in/rachittripathi2509

---

# ⭐ Support the Project

If you found this project useful or interesting:

⭐ Star this repository

🍴 Fork the repository

🛠️ Suggest improvements

🐞 Report bugs

Your support helps improve the project and motivates future development.

---

# 📬 Contact

For feedback, suggestions, or collaboration opportunities, feel free to connect through GitHub or LinkedIn.

I'm always open to learning, collaborating, and building impactful software projects.

---

<div align="center">

## 🏦 SmartLoan AI

### AI-Powered Loan Approval & Financial Risk Assessment Platform

**Built with ❤️ using React • FastAPI • Python • Machine Learning**

---

⭐ **If you like this project, don't forget to give it a Star!**

</div>