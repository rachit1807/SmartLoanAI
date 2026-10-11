"""Regression test using an isolated in-memory database, never production data."""
import ast
from pathlib import Path
import unittest
from datetime import datetime
from fastapi import Depends, HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from database import Base
from models import LoanApplication, LoanDocument


def load_function(path, name):
    tree = ast.parse(Path(path).read_text())
    function = next(node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name == name)
    function.decorator_list = []
    namespace = dict(Depends=Depends, HTTPException=HTTPException, Session=Session,
                     get_db=lambda: None, LoanApplication=LoanApplication,
                     LoanDocument=LoanDocument, datetime=datetime, document_response=lambda doc: doc.id)
    exec(compile(ast.Module(body=[function], type_ignores=[]), path, 'exec'), namespace)
    return namespace[name]


class DecisionIsolationTest(unittest.TestCase):
    def test_independent_decisions(self):
        engine = create_engine('sqlite:///:memory:')
        Base.metadata.create_all(engine)
        with Session(engine) as db:
            for identifier in (1, 2):
                db.add(LoanApplication(id=identifier, user_id=identifier, age=25, gender='Male',
                    married='No', education='Graduate', employment_status='Salaried',
                    income=66000, loan_amount=100000, loan_term=12, credit_history='Good', property_area='Urban'))
                db.add(LoanDocument(id=identifier, application_id=identifier, user_id=identifier,
                    document_type='Identity Proof', original_filename='sample.pdf',
                    stored_filename=f'{identifier}.pdf', verification_status='Approved'))
            db.commit()
            reject = load_function('routes/admin.py', 'reject_application')
            approve = load_function('routes/admin.py', 'approve_application')
            review = load_function('routes/documents.py', 'update_document_status')
            reject(2, db)
            self.assertEqual(db.get(LoanApplication, 1).status, 'Pending')
            self.assertEqual(db.get(LoanApplication, 2).review_status, 'Rejected')
            self.assertEqual([db.get(LoanDocument, i).verification_status for i in (1, 2)], ['Approved', 'Approved'])
            review(2, {'verification_status': 'Rejected'}, db)
            self.assertEqual(db.get(LoanDocument, 1).verification_status, 'Approved')
            approve(2, db)
            self.assertEqual(db.get(LoanDocument, 2).verification_status, 'Rejected')
            self.assertEqual(db.get(LoanApplication, 2).status, 'Approved')
            with self.assertRaises(HTTPException):
                reject(999, db)


if __name__ == '__main__':
    unittest.main()
