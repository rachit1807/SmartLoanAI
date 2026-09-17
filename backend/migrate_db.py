from sqlalchemy import inspect, text

from database import Base, engine
from models import LoanApplication


NEW_COLUMNS = {
    "approval_probability": "FLOAT",
    "risk_level": "VARCHAR",
    "financial_score": "FLOAT",
    "financial_health": "VARCHAR",
    "ai_reasons": "TEXT",
    "ai_suggestions": "TEXT",
    "monthly_emi": "FLOAT",
    "total_interest": "FLOAT",
    "total_payment": "FLOAT",
}


def migrate():
    inspector = inspect(engine)

    if "loan_applications" not in inspector.get_table_names():
        Base.metadata.create_all(bind=engine)
        print("Database created successfully.")
        return

    existing_columns = {
        column["name"]
        for column in inspector.get_columns("loan_applications")
    }

    with engine.begin() as connection:
        for name, column_type in NEW_COLUMNS.items():
            if name not in existing_columns:
                connection.execute(
                    text(
                        f"ALTER TABLE loan_applications "
                        f"ADD COLUMN {name} {column_type}"
                    )
                )
                print(f"Added column: {name}")

    print("Database migration completed successfully.")


if __name__ == "__main__":
    migrate()