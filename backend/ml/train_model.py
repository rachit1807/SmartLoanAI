"""From backend: python -m ml.train_model. Only writes model/evaluation artifacts."""
from ml.evaluate import train_and_evaluate

if __name__ == '__main__':
    result = train_and_evaluate()
    print('Saved shared pipeline and synthetic-data evaluation.')
    for name, values in result['models'].items():
        print(f'{name}: F1={values["f1"]:.4f}; ROC-AUC={values["roc_auc"]:.4f}')
