from sqlalchemy import inspect, text

from database import Base, engine
from models import LoanApplication, LoanDocument


LOAN_APPLICATION_COLUMNS = {
    "review_status": "VARCHAR DEFAULT 'Submitted'",
    "review_note": "TEXT",
}


def migrate():
    # Creates the new loan_documents table without changing existing data.
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    existing_columns = {
        column["name"]
        for column in inspector.get_columns("loan_applications")
    }

    with engine.begin() as connection:
        for name, column_type in LOAN_APPLICATION_COLUMNS.items():
            if name not in existing_columns:
                connection.execute(
                    text(f"ALTER TABLE loan_applications ADD COLUMN {name} {column_type}")
                )
                print(f"Added column: {name}")

    print("Document-verification migration completed successfully.")


if __name__ == "__main__":
    migrate()
