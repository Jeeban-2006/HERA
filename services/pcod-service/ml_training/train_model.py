import pandas as pd
import numpy as np
import joblib
from pathlib import Path
import xgboost as xgb
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import sys

# Add app to path
sys.path.append(str(Path(__file__).parent.parent))

DATA_DIR = Path(__file__).parent / "data"
MODELS_DIR = Path(__file__).parent / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

CSV_PATH = DATA_DIR / "pcod_synthetic.csv"

def train():
    if not CSV_PATH.exists():
        print("Dataset not found. Run generate_dataset.py first.")
        return

    print("Loading dataset...")
    df = pd.read_csv(CSV_PATH)
    
    # Target and features
    X = df.drop(columns=["subtype"])
    y = df["subtype"]
    
    # Encode target
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Split 80/20 manually or use CV
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, stratify=y_encoded, random_state=42)
    
    # Scale last 9 columns (lifestyle + labs)
    scaler = StandardScaler()
    
    # Columns 0-15 are symptoms, 16-24 are lifestyle+labs
    # We only fit scaler on continuous features
    continuous_cols = X.columns[16:]
    
    X_train_cont = scaler.fit_transform(X_train[continuous_cols])
    X_test_cont = scaler.transform(X_test[continuous_cols])
    
    # Reconstruct
    X_train_scaled = np.hstack((X_train.iloc[:, :16].values, X_train_cont))
    X_test_scaled = np.hstack((X_test.iloc[:, :16].values, X_test_cont))
    
    # XGBoost classifier
    model = xgb.XGBClassifier(
        n_estimators=200, 
        max_depth=5, 
        learning_rate=0.08,
        objective="multi:softprob", 
        num_class=4,
        eval_metric="mlogloss", 
        random_state=42
    )
    
    # Cross validation
    print("Running Cross Validation...")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = []
    
    X_full_cont = scaler.fit_transform(X[continuous_cols])
    X_full_scaled = np.hstack((X.iloc[:, :16].values, X_full_cont))
    
    for train_idx, test_idx in skf.split(X_full_scaled, y_encoded):
        X_tr, X_te = X_full_scaled[train_idx], X_full_scaled[test_idx]
        y_tr, y_te = y_encoded[train_idx], y_encoded[test_idx]
        
        cv_model = xgb.XGBClassifier(n_estimators=200, max_depth=5, learning_rate=0.08, random_state=42)
        cv_model.fit(X_tr, y_tr)
        preds = cv_model.predict(X_te)
        cv_scores.append(accuracy_score(y_te, preds))
        
    print(f"Cross-val accuracy: {np.mean(cv_scores):.4f} (+/- {np.std(cv_scores):.4f})")
    
    # Train final model on 80% train set
    print("\nTraining final model...")
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    preds = model.predict(X_test_scaled)
    acc = accuracy_score(y_test, preds)
    print(f"Test accuracy: {acc:.4f}")
    print("\nClassification Report:")
    target_names = label_encoder.classes_
    print(classification_report(y_test, preds, target_names=target_names))
    
    # Feature importances
    print("\nFeature Importances:")
    importances = model.feature_importances_
    feat_imp = pd.DataFrame({
        'Feature': X.columns,
        'Importance': importances
    }).sort_values('Importance', ascending=False)
    print(feat_imp.head(10))
    
    # Save artifacts
    print("\nSaving artifacts...")
    joblib.dump(model, MODELS_DIR / "model.joblib")
    joblib.dump(scaler, MODELS_DIR / "scaler.joblib")
    joblib.dump(label_encoder, MODELS_DIR / "label_encoder.joblib")
    print(f"Saved to {MODELS_DIR}")

if __name__ == "__main__":
    train()
