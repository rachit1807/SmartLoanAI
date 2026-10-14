from fastapi import APIRouter, Depends, HTTPException, Header
import hashlib
import os
import secrets
import time
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models import User
from schemas import UserCreate, UserLogin
from auth import hash_password, verify_password

from jose import jwt
from datetime import datetime, timedelta, timezone
from dependencies import SECRET_KEY, ALGORITHM, admin_emails, get_current_user, is_admin


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)





def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



def create_access_token(data: dict):

    expire = datetime.now(timezone.utc) + timedelta(hours=8)

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
    db: Session = Depends(get_db),
    x_admin_setup_token: str = Header(default='')
):

    email = str(user.email).strip().lower()
    if email in admin_emails():
        expected = os.getenv('ADMIN_SETUP_TOKEN_SHA256', '')
        try:
            expires = float(os.getenv('ADMIN_SETUP_EXPIRES', '0'))
        except ValueError:
            expires = 0
        supplied = hashlib.sha256(x_admin_setup_token.encode()).hexdigest()
        if not expected or time.time() >= expires or not secrets.compare_digest(supplied, expected):
            raise HTTPException(403, 'Use your private administrator setup link, or sign in if your account already exists.')
        if len(user.password) < 12:
            raise HTTPException(422, 'Administrator password must contain at least 12 characters.')
    if not user.name.strip() or not 8 <= len(user.password) <= 128:
        raise HTTPException(422, 'Enter a name and a password between 8 and 128 characters.')

    existing_user = db.query(User).filter(
        func.lower(User.email) == email
    ).first()


    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    new_user = User(

        name=user.name.strip(),

        email=email,

        password=hash_password(user.password)

    )


    db.add(new_user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(400, 'Email already registered')

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

        func.lower(User.email) == str(login_data.email).lower()

    ).first()



    if not db_user:

        raise HTTPException(

            status_code=401,

            detail="Email or password is incorrect."

        )



    if not verify_password(

        login_data.password,

        db_user.password

    ):

        raise HTTPException(

            status_code=401,

            detail="Email or password is incorrect."

        )



    token = create_access_token({

        "sub": str(db_user.id),

        "email": db_user.email

    })



    return {

        "access_token": token,

        "token_type": "bearer",

        "user_id": db_user.id,

        "name": db_user.name,

        "email": db_user.email,
        "role": 'admin' if is_admin(db_user) else 'applicant'

    }


@router.get('/me')
def current_account(user=Depends(get_current_user)):
    return {'user_id': user.id, 'name': user.name, 'email': user.email,
            'role': 'admin' if is_admin(user) else 'applicant'}
