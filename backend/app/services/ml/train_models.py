import os
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import IsolationForest

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../../../"
    )
)

DATASET_PATH = os.path.join(
    BASE_DIR,
    "datasets",
    "ai4i2020.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)

FAILURE_MODEL_PATH = os.path.join(
    MODEL_DIR,
    "failure_model.joblib"
)

ANOMALY_MODEL_PATH = os.path.join(
    MODEL_DIR,
    "anomaly_model.joblib"
)


FEATURES = [
    "Air temperature [K]",
    "Process temperature [K]",
    "Rotational speed [rpm]",
    "Torque [Nm]",
    "Tool wear [min]"
]

TARGET = "Machine failure"


def load_dataset():
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    df = pd.read_csv(DATASET_PATH)

    required_columns = FEATURES + [TARGET]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing columns: {missing_columns}"
        )

    df = df[
        required_columns
    ].dropna()

    return df


def train_failure_model(df):
    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )

    model.fit(
        X_train,
        y_train
    )

    predictions = model.predict(
        X_test
    )

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    print("\n===== FAILURE PREDICTION MODEL =====")
    print(f"Accuracy: {accuracy:.4f}")

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0
        )
    )

    print("\nConfusion Matrix:")
    print(
        confusion_matrix(
            y_test,
            predictions
        )
    )

    return model, accuracy


def train_anomaly_model(df):
    X = df[FEATURES]

    model = IsolationForest(
        n_estimators=200,
        contamination=0.05,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X)

    predictions = model.predict(X)

    anomaly_count = (
        predictions == -1
    ).sum()

    print("\n===== ANOMALY DETECTION MODEL =====")
    print(
        f"Detected anomalies: {anomaly_count}"
    )

    return model


def save_models(
    failure_model,
    anomaly_model
):
    os.makedirs(
        MODEL_DIR,
        exist_ok=True
    )

    joblib.dump(
        failure_model,
        FAILURE_MODEL_PATH
    )

    joblib.dump(
        anomaly_model,
        ANOMALY_MODEL_PATH
    )

    print("\nModels saved:")
    print(
        FAILURE_MODEL_PATH
    )
    print(
        ANOMALY_MODEL_PATH
    )


def train_all_models():
    print("Loading AI4I dataset...")

    df = load_dataset()

    print(
        f"Dataset rows: {len(df)}"
    )

    print(
        f"Features: {FEATURES}"
    )

    failure_model, accuracy = train_failure_model(
        df
    )

    anomaly_model = train_anomaly_model(
        df
    )

    save_models(
        failure_model,
        anomaly_model
    )

    return {
        "records": len(df),
        "failure_model_accuracy": round(
            accuracy,
            4
        )
    }


if __name__ == "__main__":
    result = train_all_models()

    print("\n===== TRAINING COMPLETE =====")
    print(result)