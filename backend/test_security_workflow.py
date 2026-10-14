"""Integration checks on a disposable database; never imports production credentials."""
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from datetime import datetime, timedelta, timezone

_temp = tempfile.TemporaryDirectory()
os.environ['DATABASE_URL'] = 'sqlite:///' + str(Path(_temp.name) / 'test.db')
os.environ['ADMIN_EMAILS'] = 'admin@example.com'
os.environ['JWT_SECRET_KEY'] = 'isolated-test-key-not-for-deployment-' * 2

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from jose import jwt
from main import app
from database import Base, engine, SessionLocal
from models import User, LoanApplication, LoanDocument, DocumentContent
from auth import hash_password
from dependencies import SECRET_KEY, ALGORITHM
from ml.features import application_frame

class SecurityWorkflowTest(unittest.TestCase):
    def setUp(self):
        Base.metadata.drop_all(engine); Base.metadata.create_all(engine)
        with SessionLocal() as db:
            for name,email in [('Applicant','first@example.com'),('Other','other@example.com'),('Admin','admin@example.com')]:
                db.add(User(name=name,email=email,password=hash_password('test-password-123')))
            db.commit()
        self.client=TestClient(app)
        self.a=self.login('first@example.com'); self.b=self.login('other@example.com'); self.admin=self.login('admin@example.com')
        self.data={'user_id':1,'age':25,'gender':'Male','married':'No','education':'Graduate',
          'employment_status':'Employed','income':65000,'coapplicant_income':0,'loan_amount':150000,
          'loan_term':24,'credit_history':'Good','property_area':'Urban'}

    def login(self,email):
        r=self.client.post('/users/login',json={'email':email,'password':'test-password-123'})
        self.assertEqual(r.status_code,200,r.text)
        return {'Authorization':'Bearer '+r.json()['access_token']}

    def apply(self,headers=None,data=None):
        r=self.client.post('/loans/apply',json=data or self.data,headers=headers or self.a)
        self.assertEqual(r.status_code,200,r.text);return r.json()['application_id']

    def upload(self,case,headers=None,user=1,content=b'%PDF-1.4\nDemo only'):
        return self.client.post('/documents/upload',data={'application_id':case,'user_id':user,'document_type':'Identity Proof'},
              files={'file':('sample.pdf',content,'application/pdf')},headers=headers or self.a)

    def test_authentication_roles_and_owner_checks(self):
        case=self.apply()
        self.assertEqual(self.client.get('/admin/applications').status_code,401)
        self.assertEqual(self.client.get('/admin/applications',headers=self.a).status_code,403)
        self.assertEqual(self.client.get('/admin/applications',headers=self.admin).status_code,200)
        for path in ['/loans/history/1','/loans/dashboard/1','/loans/recent/1','/documents/user/1']:
            self.assertEqual(self.client.get(path,headers=self.b).status_code,403,path)
        self.assertEqual(self.client.post('/loans/apply',json=self.data,headers=self.b).status_code,403)
        self.assertEqual(self.upload(case,headers=self.b).status_code,403)
        forged=jwt.encode({'sub':'1','role':'admin','exp':datetime.now(timezone.utc)+timedelta(hours=1)},'wrong-key',algorithm=ALGORITHM)
        self.assertEqual(self.client.get('/users/me',headers={'Authorization':'Bearer '+forged}).status_code,401)
        expired=jwt.encode({'sub':'1','exp':datetime.now(timezone.utc)-timedelta(seconds=1)},SECRET_KEY,algorithm=ALGORITHM)
        self.assertEqual(self.client.get('/users/me',headers={'Authorization':'Bearer '+expired}).status_code,401)
        self.assertEqual(self.client.post('/users/register',json={'name':'Takeover','email':'admin@example.com','password':'test-password-123'}).status_code,403)

    def test_decisions_survive_opposite_reassessment(self):
        first=self.apply(); second=self.apply()
        d1=self.upload(first).json()['document']['id'];d2=self.upload(first).json()['document']['id']
        for doc,status in [(d1,'Approved'),(d2,'Rejected')]:
            path=f'/documents/{doc}/status'
            self.assertEqual(self.client.patch(path,json={'verification_status':status},headers=self.a).status_code,403)
            self.assertEqual(self.client.patch(path,json={'verification_status':status},headers=self.admin).status_code,200)
        from prediction import predict_loan
        for decision,opposite in [('approve','Rejected'),('reject','Approved')]:
            self.client.post(f'/admin/{decision}/{first}',headers=self.admin)
            advisory=predict_loan(self.data);advisory['status']=opposite
            with patch('routes.admin.predict_loan',return_value=advisory):
                r=self.client.post(f'/admin/verify/{first}',headers=self.admin)
            self.assertEqual(r.status_code,200,r.text)
            result=self.client.get(f'/admin/application/{first}',headers=self.admin).json()
            expected='Approved' if decision=='approve' else 'Rejected'
            self.assertEqual(result['status'],expected);self.assertEqual(result['review_status'],expected)
            self.assertEqual({d['id']:d['verification_status'] for d in result['documents']},{d1:'Approved',d2:'Rejected'})
        with SessionLocal() as db:self.assertEqual(db.get(LoanApplication,second).status,'Pending Documents')

    def test_upload_persistence_and_download_authorization(self):
        case=self.apply();uploaded=self.upload(case)
        self.assertEqual(uploaded.status_code,200,uploaded.text)
        doc=uploaded.json()['document']['id']
        self.assertEqual(self.client.get(f'/documents/{doc}/download').status_code,401)
        self.assertEqual(self.client.get(f'/documents/{doc}/download',headers=self.b).status_code,403)
        for headers in [self.a,self.admin]:
            r=self.client.get(f'/documents/{doc}/download',headers=headers)
            self.assertEqual(r.status_code,200);self.assertEqual(r.content,b'%PDF-1.4\nDemo only')
        engine.dispose()
        reopened=create_engine(os.environ['DATABASE_URL'])
        with Session(reopened) as db:self.assertEqual(bytes(db.get(DocumentContent,doc).content),b'%PDF-1.4\nDemo only')
        reopened.dispose()
        self.assertEqual(self.upload(case,content=b'not a PDF').status_code,400)
        self.assertEqual(self.upload(case,content=b'%PDF-'+b'a'*(5*1024*1024)).status_code,400)
        with patch('storage.GLOBAL_LIMIT',1):self.assertEqual(self.upload(case).status_code,413)
        with SessionLocal() as db:self.assertEqual(db.query(LoanDocument).count(),1)

    def test_preview_validation_and_feature_contract(self):
        before=self.client.get('/loans/history/1',headers=self.a).json()
        self.assertEqual(self.client.post('/loans/simulate',json=self.data).status_code,200)
        self.assertEqual(self.client.get('/loans/history/1',headers=self.a).json(),before)
        self.assertEqual(self.client.post('/loans/apply',json={**self.data,'loan_amount':-1},headers=self.a).status_code,422)
        frame=application_frame(self.data)
        self.assertEqual(frame.iloc[0]['Education'],'Graduate')
        self.assertEqual(frame.iloc[0]['LoanAmount'],150)
        self.assertEqual(frame.iloc[0]['ApplicantIncome'],65000)
        self.assertEqual(self.client.post('/loans/simulate',json={**self.data,'credit_history':'Bad'}).status_code,200)

    def test_private_admin_setup_expires_and_never_resets_accounts(self):
        import hashlib, time
        payload={'name':'New Admin','email':'newadmin@example.com','password':'new-password-123'}
        config={'ADMIN_EMAILS':'newadmin@example.com', 'ADMIN_SETUP_TOKEN_SHA256':hashlib.sha256(b'test-private-setup').hexdigest(),
                'ADMIN_SETUP_EXPIRES':str(time.time()+300)}
        with patch.dict(os.environ,config):
            self.assertEqual(self.client.post('/users/register',json=payload).status_code,403)
            with patch.dict(os.environ,{'ADMIN_SETUP_EXPIRES':'1'}):
                self.assertEqual(self.client.post('/users/register',json=payload,headers={'X-Admin-Setup-Token':'test-private-setup'}).status_code,403)
            response=self.client.post('/users/register',json=payload,headers={'X-Admin-Setup-Token':'test-private-setup'})
            self.assertEqual(response.status_code,200,response.text)
            self.assertEqual(self.client.post('/users/register',json={**payload,'password':'changed-password-123'},headers={'X-Admin-Setup-Token':'test-private-setup'}).status_code,400)
            self.assertEqual(self.client.post('/users/login',json={'email':payload['email'],'password':payload['password']}).status_code,200)

if __name__=='__main__':unittest.main()
