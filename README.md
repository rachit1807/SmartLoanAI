# SmartLoan AI

An educational loan decision-support prototype combining applicant tracking, repayment scenarios, machine-learning assessment, sample-document consistency checks and human review. It does not issue loans, authenticate identity documents, detect fraud or provide validated default-risk predictions.

## Live links

- [Applicant portal](https://smart-loan-ai-one.vercel.app/)
- [Admin Portal](https://smart-loan-ai-one.vercel.app/admin-dashboard) (administrator login required)
- [Backend API](https://smartloanai-api.onrender.com)
- [GitHub repository](https://github.com/rachit1807/SmartLoanAI)

URLs are unchanged. Administrator pages now require an authorised account; knowing the URL does not grant permission. Existing sessions issued by the old insecure signing key must sign in again. Existing account passwords are not reset by this upgrade.

## Features

- Banking-style registration, sign-in, applicant dashboard, loan entry, history and document screens.
- Responsive applicant and operations navigation with persistent light/dark preferences.
- Non-persistent affordability preview, scenario adjustments, EMI, total interest and repayment estimates, and printable assessment receipt.
- Applicant-owned applications and case-linked sample PDFs/images.
- Separate file decisions, loan decisions and advisory assessment refresh. Refreshing AI assessment cannot overwrite an administrator's decision, and one file decision cannot change its siblings.
- Backend bearer-token verification, applicant ownership checks and administrator-only review routes. Frontend route checks supplement, not replace, backend enforcement.
- Authenticated sample-file download by its owner or an administrator.
- New upload contents stored transactionally with metadata in SQL (Neon PostgreSQL live, SQLite locally), not the ephemeral Render filesystem.
- A shared preprocessing/model pipeline plus reproducible baseline comparisons and saved metrics.

Only use fictional, conspicuously marked sample documents. Do not upload genuine Aadhaar, PAN, bank statements or confidential financial information to this public academic demo.

## Architecture

React/Vite on Vercel -> FastAPI on Render -> SQLAlchemy and Neon PostgreSQL.

The backend loads `backend/ml/loan_pipeline.joblib`. Its preprocessing is the same object used during training. `loan_applications` stores case information; `loan_documents` stores file metadata; the additive `document_contents` table stores bounded file bytes, media type, checksum and size. The new table is created without dropping accounts, applications or document decisions. No database URL or paid plan is changed by this code.

## Security and administrator setup

Set these environment variables on the API host, never in committed source:

| Setting | Purpose |
|---|---|
| `DATABASE_URL` | Existing persistent Neon SQLAlchemy URL, including required SSL parameters. Preserve its value. |
| `JWT_SECRET_KEY` | Random secret with at least 32 characters. Render startup fails closed if absent. |
| `ADMIN_EMAILS` | Comma-separated authorised existing-account emails. No default public administrator. |
| `ALLOWED_ORIGINS` | Existing frontend origin and optional local development origins. |

Roles are evaluated on the server for each request, not trusted from JWT role claims or local storage. Tokens expire after eight hours. With no configured local secret, a temporary process-only key is used and local sessions expire on restart. Passwords remain hashed with the existing password scheme.

The public registration route refuses reserved administrator emails to prevent someone claiming an unregistered privileged address. If the administrator already has an account, use that account's existing project password. Do not use or share an email-provider password.

An operator may issue a private, expiring first-account setup link: set a SHA-256 digest in `ADMIN_SETUP_TOKEN_SHA256` and a Unix expiry in `ADMIN_SETUP_EXPIRES`, then privately deliver `/admin-setup#setup=<random-token>`. Use a cryptographically random token with at least 32 bytes of entropy. Only the digest is stored on the server. The fragment is not sent in navigation/referrer requests and is removed from the address bar on load; the form sends the token in a request header. Creation still requires an email in `ADMIN_EMAILS`, a 12-character password and a nonexistent account. Existing accounts cannot be reset or replaced by this link. Expired links must be reissued by an operator. Never commit or publish a real setup token.

If the reserved administrator does not yet have an account, a trusted operator must run `python provision_admin.py` privately in the backend environment connected to the intended database. It prompts for a new project password without echoing it, refuses to change existing accounts and does not accept passwords as command-line arguments. Never put credentials in the README, screenshots or a chat.

This is still not bank-grade security: email verification, password recovery, shared rate limiting, comprehensive audit events, malware scanning and an independent security review remain future work.

## Document persistence and limits

New files persist in the configured database and survive API restarts/redeployments if the same persistent `DATABASE_URL` remains configured. An authenticated download endpoint serves them with attachment and no-store headers. Signature checks require PDF/PNG/JPEG content matching the extension; this is not antivirus scanning or authenticity verification.

- Maximum file size: 5 MiB, read with a bounded upload operation.
- Demo-wide database file capacity: 100 MiB; further uploads are rejected when full.
- PostgreSQL quota checks use a transaction-level advisory lock. Metadata and bytes commit together; failure rolls back both.
- This deliberately bounded approach uses the existing database rather than a paid Render disk. Provider storage quotas still apply. Private object storage is recommended for larger systems.
- Existing metadata is retained. Legacy files still present under `backend/uploads` can be read. Run `python migrate_file_storage.py` on the original host **before redeployment** to copy available legacy files into SQL without changing review statuses. Files already erased from Render cannot be recovered by this upgrade and require a new sample upload.

Text-based PDF comparison checks whether a name and declared income appear in extracted text. It does not validate signatures, issuing authorities, document authenticity or labelled income periods. Scanned PDFs/images require manual review; OCR and LayoutLM are not implemented. A text match never automatically approves a document or a loan.

## Model pipeline and actual evaluation

The bundled `backend/ml/loan_data.csv` contains **700 synthetic rows** generated using credit-history/income rules. Approval labels are not observed repayment outcomes. The evaluation is educational, not a validated measure of real lending accuracy or fairness.

Training uses a stratified 80/20 split (560 training / 140 test rows), seed 42, and five-fold stratified cross-validation on the training partition only. Imputation, one-hot encoding and scaling are fitted inside each training fold; the test partition is not used to fit preprocessing or select hyperparameters. All candidates use identical splits.

| Model | Test accuracy | Precision | Recall | F1 | ROC-AUC |
|---|---:|---:|---:|---:|---:|
| Majority baseline | 0.5429 | 0.0000 | 0.0000 | 0.0000 | 0.5000 |
| Logistic Regression | 0.9929 | 0.9846 | 1.0000 | 0.9922 | 1.0000 |
| Decision Tree | 0.9786 | 0.9692 | 0.9844 | 0.9767 | 0.9790 |
| Random Forest | 0.9857 | 0.9697 | 1.0000 | 0.9846 | 0.9990 |

Random Forest is retained for continuity, not because it wins this benchmark. Logistic Regression has higher F1 on this split. High scores are unsurprising for rule-generated labels and must not be presented as real-world approval/default performance.

- [Readable evaluation](backend/ml/EVALUATION.md)
- [Full metrics, confusion matrices, class support, CV variability, dataset checksum and limitations](backend/ml/evaluation.json)
- Shared feature contract: `backend/ml/features.py`.
- Pipeline artifact: `backend/ml/loan_pipeline.joblib`; load only trusted project artifacts.

Inputs use income in INR/month, requested principal in INR and term in months. Principal is converted once to the dataset's thousands-INR unit. Education and all other categories use the same learned encoding in training/inference, fixing the previous reversed education mapping. Dependents remains zero at inference because the current form does not collect it. The synthetic income/tenure distribution limits extrapolation, particularly for high-income scenarios.

The API's legacy `approval_probability` field is retained for response compatibility, but UI labels identify it as an **uncalibrated demo model score**. Financial-health reasons are hand-written rules, not SHAP/LIME explanations, causal claims or bank policy.

Reproduce from the backend directory:

```bash
python -m ml.train_model
python -m unittest test_security_workflow test_decision_isolation -v
```

Training writes only model/evaluation artifacts and never reads the application database. Changing the saved model only affects future assessments or explicit reassessments; it does not rewrite historical reviewer decisions.

## Local development

Use a supported Python runtime (Render is configured for Python 3.12) and a Node version supported by Vite. Create an isolated virtual environment and install `backend/requirements.txt`. The model's scikit-learn version is pinned for artifact compatibility.

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

On Windows use `venv\Scripts\activate`. Without `DATABASE_URL`, local SQLite is used; it is not a persistent deployment database. Configure administrator variables separately if testing operations access.

In another terminal:

```bash
cd frontend
npm ci
npm run dev
```

Set frontend `VITE_API_BASE_URL` to the backend URL (default `http://127.0.0.1:8000`). Local frontend: `http://localhost:5173`. Build check: `npm run build`.

## API access

| Endpoints | Access |
|---|---|
| `POST /users/register`, `POST /users/login` | Public; reserved administrator registration is blocked |
| `GET /users/me` | Authenticated account |
| `POST /loans/simulate` | Public, non-persistent scenario; no stored user records |
| `POST /loans/apply` | Authenticated applicant; submitted user ID must match identity |
| `GET /loans/history/{user_id}`, `/dashboard/{user_id}`, `/recent/{user_id}` | Matching authenticated applicant |
| `POST /documents/upload`, `GET /documents/user/{user_id}` | Matching authenticated applicant |
| `GET /documents/{document_id}/download` | Owner or administrator |
| `PATCH /documents/{document_id}/status` | Administrator only; one file |
| `PATCH /documents/applications/{application_id}/review-status` | Administrator only; one case |
| All `/admin/*` routes | Administrator only |

`/admin/verify/{id}` refreshes advisory assessment fields only. `/admin/approve/{id}` and `/admin/reject/{id}` set the selected case decision without changing files. Both approved and rejected manual decisions survive reassessment.

## Verification and rollout

The integration suite uses a disposable SQLite database, not production data. It covers denied anonymous/admin access, cross-user isolation, invalid/expired tokens, reserved admin registration, document decision isolation, opposite reassessment after manual approval/rejection, bounded and type-checked uploads, quota rollback, authorised download, file persistence after reopening a database, input validation and preview without saving.

Local SQLite reopening is not a claim that a production Neon restart was tested. Perform a controlled live sign-in/upload/download check using sample data after deployment. Retain the same Vercel project, domain, Render service and Neon connection. Existing data is not reset or replaced. A deployment can have brief startup delay; zero downtime cannot be guaranteed.

## Research basis and next work

Literature motivates benchmarking, transparent assessment and future document understanding; the project does not reproduce all cited methods or borrow their experimental results.

- Gawande et al. (2026), [explainable ensemble loan approval](https://doi.org/10.1007/s44163-026-01569-6).
- Lessmann et al. (2015), [classification benchmarking for credit scoring](https://doi.org/10.1016/j.ejor.2015.05.030).
- Bussmann et al. (2020), [Explainable AI in Fintech Risk Management](https://doi.org/10.3389/frai.2020.00026).
- Demajo et al. (2020), [Explainable AI for Interpretable Credit Scoring](https://arxiv.org/abs/2012.03749).
- Xu et al. (KDD 2020), [LayoutLM](https://arxiv.org/abs/1912.13318), a future direction only.

Priorities: verified real-world evaluation data, calibration and subgroup analysis, verified email/recovery and shared rate limiting, complete review audit history, robust labelled income extraction, malware scanning, private object storage at scale, and optional SHAP/LIME or OCR after validation. No claims of regulatory certification or production banking readiness are made.

## Author

Rachit Tripathi - B.Tech Information Technology, Babu Banarasi Das Northern India Institute of Technology.

[GitHub](https://github.com/rachit1807) | [LinkedIn](https://linkedin.com/in/rachittripathi2509)
