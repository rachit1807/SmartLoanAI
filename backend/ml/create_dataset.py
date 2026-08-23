import pandas as pd
import random


data = []

genders = ["Male", "Female"]
married = ["Yes", "No"]
education = ["Graduate", "Not Graduate"]
employment = ["Yes", "No"]
property_area = ["Urban", "Semiurban", "Rural"]


for i in range(700):

    income = random.randint(1500, 10000)
    co_income = random.randint(0, 4000)

    loan_amount = random.randint(50, 300)

    credit_history = random.choice([0, 1])

    status = "Y" if (
        credit_history == 1 and income + co_income > 4000
    ) else "N"


    data.append({

        "Loan_ID": f"LP{i}",

        "Gender": random.choice(genders),

        "Married": random.choice(married),

        "Dependents": random.choice(
            ["0", "1", "2", "3+"]
        ),

        "Education": random.choice(education),

        "Self_Employed": random.choice(employment),

        "ApplicantIncome": income,

        "CoapplicantIncome": co_income,

        "LoanAmount": loan_amount,

        "Loan_Amount_Term": 360,

        "Credit_History": credit_history,

        "Property_Area": random.choice(property_area),

        "Loan_Status": status

    })


df = pd.DataFrame(data)

df.to_csv(
    "loan_data.csv",
    index=False
)


print("Dataset created successfully!")
print(df.head())