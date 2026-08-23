import pandas as pd
import pickle

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score


# Load dataset
data = pd.read_csv("ml/loan_data.csv")

print("Dataset Loaded")
print(data.head())


# Remove Loan ID
if "Loan_ID" in data.columns:
    data.drop(
        "Loan_ID",
        axis=1,
        inplace=True
    )


# Fill missing values
for column in data.columns:

    if data[column].isnull().sum() > 0:

        if data[column].dtype == "object":

            data[column] = data[column].fillna(
                data[column].mode()[0]
            )

        else:

            data[column] = data[column].fillna(
                data[column].median()
            )


# Encode target
data["Loan_Status"] = data["Loan_Status"].map(
    {
        "Y": 1,
        "N": 0
    }
)


# Encode Gender
data["Gender"] = data["Gender"].map(
    {
        "Male": 1,
        "Female": 0
    }
)


# Encode Married
data["Married"] = data["Married"].map(
    {
        "Yes": 1,
        "No": 0
    }
)


# Encode Dependents
data["Dependents"] = data["Dependents"].replace(
    "3+",
    3
)

data["Dependents"] = data["Dependents"].astype(int)


# Encode Education
data["Education"] = data["Education"].map(
    {
        "Graduate": 1,
        "Not Graduate": 0
    }
)


# Encode Self Employed
data["Self_Employed"] = data["Self_Employed"].map(
    {
        "Yes": 1,
        "No": 0
    }
)


# Encode Property Area
data["Property_Area"] = data["Property_Area"].map(
    {
        "Urban": 2,
        "Semiurban": 1,
        "Rural": 0
    }
)


# Features and Target

X = data.drop(
    "Loan_Status",
    axis=1
)

y = data["Loan_Status"]


print("\nFeatures:")
print(X.dtypes)



# Split data

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)



# Train model

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)


model.fit(
    X_train,
    y_train
)



# Accuracy

prediction = model.predict(
    X_test
)


accuracy = accuracy_score(
    y_test,
    prediction
)


print(
    f"Model Accuracy: {accuracy*100:.2f}%"
)



# Save model

with open(
    "loan_model.pkl",
    "wb"
) as file:

    pickle.dump(
        model,
        file
    )


print("loan_model.pkl updated successfully!")