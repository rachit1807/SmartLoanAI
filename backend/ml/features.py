"""Shared feature contract. LoanAmount is thousands INR, income INR/month."""
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

CATEGORICAL = ['Gender', 'Married', 'Education', 'Self_Employed', 'Property_Area']
NUMERIC = ['Dependents', 'ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term', 'Credit_History']
FEATURES = CATEGORICAL + NUMERIC

def training_frame(data):
    frame = data.reindex(columns=FEATURES).copy()
    frame['Dependents'] = frame['Dependents'].replace('3+', 3)
    for column in NUMERIC:
        frame[column] = pd.to_numeric(frame[column], errors='coerce')
    for column in CATEGORICAL:
        frame[column] = frame[column].replace('', np.nan).where(frame[column].notna(), np.nan)
    return frame

def application_frame(data):
    return training_frame(pd.DataFrame([{
        'Gender': data['gender'], 'Married': data['married'], 'Dependents': 0,
        'Education': data['education'],
        'Self_Employed': 'Yes' if data['employment_status'] == 'Self Employed' else 'No',
        'ApplicantIncome': float(data['income']), 'CoapplicantIncome': float(data['coapplicant_income']),
        'LoanAmount': float(data['loan_amount']) / 1000, 'Loan_Amount_Term': int(data['loan_term']),
        'Credit_History': 1 if data['credit_history'] == 'Good' else 0, 'Property_Area': data['property_area'],
    }]))

def preprocessing():
    return ColumnTransformer([
        ('categories', Pipeline([('impute', SimpleImputer(strategy='most_frequent')),
                                 ('encode', OneHotEncoder(handle_unknown='ignore', sparse_output=False))]), CATEGORICAL),
        ('numbers', Pipeline([('impute', SimpleImputer(strategy='median')), ('scale', StandardScaler())]), NUMERIC),
    ])
