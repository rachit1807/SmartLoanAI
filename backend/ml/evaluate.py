"""Synthetic-data benchmark. Does not connect to any application database."""
import hashlib
import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, brier_score_loss
from ml.features import FEATURES, training_frame, preprocessing

HERE = Path(__file__).resolve().parent

def train_and_evaluate(output_dir=HERE):
    dataset = HERE / 'loan_data.csv'
    data = pd.read_csv(dataset)
    y = data['Loan_Status'].map({'Y': 1, 'N': 0})
    if y.isna().any() or y.nunique() != 2:
        raise ValueError('Loan_Status must contain both Y and N without missing labels.')
    X = training_frame(data)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=.2, random_state=42, stratify=y)
    candidates = {
        'Majority baseline': DummyClassifier(strategy='most_frequent'),
        'Logistic Regression': LogisticRegression(max_iter=2000, random_state=42),
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=1),
    }
    report = {'dataset': 'Bundled synthetic demonstration data; rule-generated labels, not observed defaults',
              'sha256': hashlib.sha256(dataset.read_bytes()).hexdigest(), 'records': len(data),
              'class_counts': {str(k): int(v) for k,v in y.value_counts().items()},
              'positive_class': 'Y (synthetic approval), not repayment/default',
              'train_records': len(X_train), 'test_records': len(X_test), 'seed': 42,
              'split': 'Stratified 80/20 holdout; 5-fold CV on training only; no tuning on holdout',
              'sklearn_version': sklearn.__version__, 'features': FEATURES,
              'limitations': ['Synthetic labels follow credit-history/income rules; high scores are expected.',
                'Income and tenure distributions do not represent real lending; high-income inputs may be out of distribution.',
                'No real-world accuracy, fairness, causality or calibrated approval/default probability is established.',
                'Dependents is fixed to zero at inference because the application does not collect it.'], 'models': {}}
    output_dir = Path(output_dir); output_dir.mkdir(parents=True, exist_ok=True)
    for name, classifier in candidates.items():
        pipe = Pipeline([('preprocess', preprocessing()), ('classifier', classifier)])
        cv = cross_validate(pipe, X_train, y_train, cv=StratifiedKFold(5, shuffle=True, random_state=42),
                            scoring={'f1':'f1', 'roc_auc':'roc_auc'})
        pipe.fit(X_train, y_train)
        pred = pipe.predict(X_test); prob = pipe.predict_proba(X_test)[:, list(pipe.classes_).index(1)]
        report['models'][name] = {
            'accuracy': accuracy_score(y_test,pred), 'precision': precision_score(y_test,pred,zero_division=0),
            'recall': recall_score(y_test,pred,zero_division=0), 'f1': f1_score(y_test,pred,zero_division=0),
            'roc_auc': roc_auc_score(y_test,prob), 'brier_score': brier_score_loss(y_test,prob),
            'confusion_matrix_labels': [0,1], 'confusion_matrix': confusion_matrix(y_test,pred,labels=[0,1]).tolist(),
            'test_support': {str(k):int(v) for k,v in y_test.value_counts().items()},
            'training_cv_f1_mean': float(np.mean(cv['test_f1'])), 'training_cv_f1_std': float(np.std(cv['test_f1'])),
            'training_cv_auc_mean': float(np.mean(cv['test_roc_auc'])),
        }
        if name == 'Random Forest':
            joblib.dump(pipe, output_dir / 'loan_pipeline.joblib')
    (output_dir/'evaluation.json').write_text(json.dumps(report,indent=2)+'\n')
    rows = ['# Synthetic-data model evaluation', '', report['dataset'], '',
            'Not evidence of real banking performance. Positive class: synthetic approval (Y).', '',
            '| Model | Accuracy | Precision | Recall | F1 | ROC-AUC |', '|---|---:|---:|---:|---:|---:|']
    for name, m in report['models'].items():
        rows.append('| '+name+' | '+' | '.join(f'{m[k]:.4f}' for k in ['accuracy','precision','recall','f1','roc_auc'])+' |')
    rows += ['', f'Dataset SHA-256: `{report["sha256"]}`', f'Seed 42; {len(X_train)} training / {len(X_test)} test rows.',
             '', 'Confusion matrices, support, CV variability and limitations: evaluation.json.',
             'Preprocessing is fitted inside training folds, never on the holdout.']
    (output_dir/'EVALUATION.md').write_text('\n'.join(rows)+'\n')
    return report
