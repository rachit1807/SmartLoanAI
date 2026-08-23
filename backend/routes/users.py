from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User
from schemas import UserCreate, UserLogin
from auth import hash_password, verify_password

from jose import jwt
from datetime import datetime, timedelta


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


SECRET_KEY = "smartloan_secret_key"
ALGORITHM = "HS256"



def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



def create_access_token(data: dict):

    expire = datetime.utcnow() + timedelta(minutes=30)

    data.update({
        "exp": expire
    })

    return jwt.encode(
        data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )



# ==========================
# REGISTER USER
# ==========================

@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()


    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    new_user = User(

        name=user.name,

        email=user.email,

        password=hash_password(user.password)

    )


    db.add(new_user)

    db.commit()

    db.refresh(new_user)



    return {

        "message": "User registered successfully",

        "user_id": new_user.id

    }




# ==========================
# LOGIN USER
# ==========================


@router.post("/login")
def login_user(

    login_data: UserLogin,

    db: Session = Depends(get_db)

):


    db_user = db.query(User).filter(

        User.email == login_data.email

    ).first()



    if not db_user:

        raise HTTPException(

            status_code=404,

            detail="User not found"

        )



    if not verify_password(

        login_data.password,

        db_user.password

    ):

        raise HTTPException(

            status_code=401,

            detail="Incorrect password"

        )



    token = create_access_token({

        "user_id": db_user.id,

        "email": db_user.email

    })



    return {

        "access_token": token,

        "token_type": "bearer",

        "user_id": db_user.id,

        "name": db_user.name,

        "email": db_user.email

    }