import joblib
import pandas as pd
import os


# ==========================
# LOAD ML MODEL
# ==========================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "ml",
    "loan_model.pkl"
)


model = joblib.load(MODEL_PATH)



# ==========================
# LOAN PREDICTION
# ==========================

def predict_loan(data):


    # Convert frontend data into ML features

    input_data = {


        "Gender":
            1 if data["gender"] == "Male" else 0,


        "Married":
            1 if data["married"] == "Yes" else 0,


        "Dependents":
            0,


        "Education":
            0 if data["education"] == "Graduate" else 1,


        "Self_Employed":
            1 if data["employment_status"] == "Self Employed" else 0,


        "ApplicantIncome":
            int(data["income"]),


        "CoapplicantIncome":
            int(data["coapplicant_income"]),


        "LoanAmount":
            int(data["loan_amount"]),


        "Loan_Amount_Term":
            int(data["loan_term"]),


        "Credit_History":
            1 if data["credit_history"] == "Good" else 0,


        "Property_Area":
            (
                2
                if data["property_area"] == "Urban"
                else
                1
                if data["property_area"] == "Semiurban"
                else
                0
            )

    }




    # Convert into dataframe

    df = pd.DataFrame(
        [input_data]
    )





    # ==========================
    # MODEL PREDICTION
    # ==========================

    prediction = model.predict(df)[0]



    probability = model.predict_proba(df)[0]


    confidence = round(
        max(probability) * 100
    )





    # ==========================
    # RESULT PROCESSING
    # ==========================

    if prediction == "Y":


        status = "Approved"

        approval_probability = confidence

        risk_level = "Low"



    else:


        status = "Rejected"

        approval_probability = 100 - confidence


        if approval_probability < 40:

            risk_level = "High"

        elif approval_probability < 70:

            risk_level = "Medium"

        else:

            risk_level = "Low"






    return {


        "status": status,


        "approval_probability": approval_probability,


        "risk_level": risk_level

    }