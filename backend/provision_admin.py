"""Run privately on the server ONLY if the configured administrator has no account.

Never accepts passwords as command-line arguments and never changes an existing password.
"""
from getpass import getpass
from sqlalchemy import func
from database import Base, engine, SessionLocal
from models import User
from auth import hash_password
from dependencies import admin_emails

def main():
    email = input('Administrator email: ').strip().lower()
    if email not in admin_emails():
        raise SystemExit('Email is not in the server ADMIN_EMAILS setting.')
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if db.query(User).filter(func.lower(User.email) == email).first():
            raise SystemExit('Account already exists. Use its existing password; no changes made.')
        name = input('Display name: ').strip()
        password = getpass('New project password (not email password): ')
        if not name or not 12 <= len(password) <= 128 or password != getpass('Confirm password: '):
            raise SystemExit('Name required; passwords must match and contain 12-128 characters.')
        db.add(User(name=name, email=email, password=hash_password(password)))
        db.commit()
        print('Administrator account created. Sign in through the existing website.')

if __name__ == '__main__':
    main()
