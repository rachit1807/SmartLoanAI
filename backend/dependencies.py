import os
import secrets
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User


SECRET_KEY = os.getenv('JWT_SECRET_KEY')
if not SECRET_KEY:
    if os.getenv('RENDER') == 'true':
        raise RuntimeError('Configure JWT_SECRET_KEY on Render before deployment.')
    SECRET_KEY = secrets.token_urlsafe(48)
if len(SECRET_KEY) < 32:
    raise RuntimeError('JWT_SECRET_KEY must have at least 32 characters.')
ALGORITHM = "HS256"


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/users/login"
)



def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM], options={'require_exp': True, 'require_sub': True}
        )


        user_id = int(payload['sub'])


        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )


    except (JWTError, ValueError, TypeError, KeyError):

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


    user = db.query(User).filter(
        User.id == user_id
    ).first()


    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Session no longer valid. Please sign in again."
        )


    return user


def admin_emails():
    return {email.strip().lower() for email in os.getenv('ADMIN_EMAILS', '').split(',') if email.strip()}


def is_admin(user):
    return user.email.strip().lower() in admin_emails()


def require_admin(user=Depends(get_current_user)):
    if not is_admin(user):
        raise HTTPException(403, 'Administrator access required.')
    return user


def require_owner(user, user_id):
    if user.id != user_id:
        raise HTTPException(403, 'You cannot access another applicant account.')
