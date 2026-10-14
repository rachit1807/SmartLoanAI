# Synthetic-data model evaluation

Bundled synthetic demonstration data; rule-generated labels, not observed defaults

Not evidence of real banking performance. Positive class: synthetic approval (Y).

| Model | Accuracy | Precision | Recall | F1 | ROC-AUC |
|---|---:|---:|---:|---:|---:|
| Majority baseline | 0.5429 | 0.0000 | 0.0000 | 0.0000 | 0.5000 |
| Logistic Regression | 0.9929 | 0.9846 | 1.0000 | 0.9922 | 1.0000 |
| Decision Tree | 0.9786 | 0.9692 | 0.9844 | 0.9767 | 0.9790 |
| Random Forest | 0.9857 | 0.9697 | 1.0000 | 0.9846 | 0.9990 |

Dataset SHA-256: `3812031d5737e1cafa16bfa795000c2c5be92badcfffbf5d0bf5580649910cb3`
Seed 42; 560 training / 140 test rows.

Confusion matrices, support, CV variability and limitations: evaluation.json.
Preprocessing is fitted inside training folds, never on the holdout.
