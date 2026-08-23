from pydantic import BaseModel, EmailStr


# User Registration
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


# User Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# User Response
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True



# Loan Application Schema
class LoanCreate(BaseModel):

    user_id: int

    age: int

    gender: str

    married: str

    education: str

    employment_status: str

    income: int

    coapplicant_income: int

    loan_amount: int

    loan_term: int

    credit_history: int

    property_area: str