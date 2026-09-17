# SmartLoanAI

SmartLoanAI is an AI-powered loan approval and financial health analysis web application. It predicts loan eligibility, explains the decision, calculates repayment estimates, and stores loan application history for users.

## Features

- User registration and login
- Loan application form
- Machine learning based loan approval prediction
- Approval probability and risk level
- Financial health score and category
- Explainable AI reasons for the decision
- Personalised suggestions to improve a loan profile
- Backend EMI calculation
- Monthly EMI, total interest, and total payment
- Local EMI calculator
- Dashboard analytics
- Recent loan applications
- Complete loan history with detailed AI results
- SQLite database storage

## Technology Stack

### Frontend

- React.js
- Vite
- Axios
- Recharts
- Lucide React
- CSS

### Backend

- FastAPI
- Python
- Scikit-learn
- Pandas
- Joblib
- SQLAlchemy
- SQLite

## Project Structure

```text
SmartLoanAI/
│
├── backend/
│   ├── routes/
│   │   ├── loans.py
│   │   └── users.py
│   ├── ml/
│   │   ├── loan_data.csv
│   │   ├── loan_model.pkl
│   │   └── train_model.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── prediction.py
│   ├── migrate_db.py
│   └── smartloan.db
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   │   ├── ApplyLoan.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── LoanHistory.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   └── App.jsx
    └── package.json
```

## Application Flow

1. User registers or logs in.
2. User enters personal and financial loan details.
3. The backend sends the data to the trained machine learning model.
4. SmartLoanAI generates approval status, probability, and risk level.
5. The financial health engine generates a score, reasons, and suggestions.
6. The EMI engine calculates monthly EMI, total interest, and total payment.
7. The application and AI results are saved in SQLite.
8. Users can view results on the Dashboard and Loan History pages.

## Run the Backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

The FastAPI API will usually run at:

```text
http://127.0.0.1:8000
```

## Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The React application will usually run at:

```text
http://localhost:5173
```

## Database Migration

Run this once after adding the enhanced AI result fields:

```bash
cd backend
python migrate_db.py
```

This adds fields for approval probability, financial score, financial health, AI reasons, AI suggestions, EMI, interest, and total payment without deleting existing application records.

## Output

For every loan application, SmartLoanAI provides:

- Loan approval status
- Approval probability
- Risk level
- Financial score
- Financial health category
- Decision reasons
- Suggestions for improvement
- Monthly EMI
- Total interest
- Total payment

## Future Scope

- Admin portal for monitoring all applications
- Credit score and credit bureau integration
- Document verification
- Interest rate comparison
- Loan recommendation system
- Email and SMS notifications
- Cloud deployment
- Mobile application

## Developed By

Rachit Tripathi  
Department of Information Technology  
Babu Banarasi Das Northern India Institute of Technology