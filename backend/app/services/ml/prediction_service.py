import os
import joblib
import pandas as pd


BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../../../"
    )
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


def load_models():

    if not os.path.exists(
        FAILURE_MODEL_PATH
    ):
        raise FileNotFoundError(
            "Failure prediction model not found. "
            "Train the model first."
        )

    if not os.path.exists(
        ANOMALY_MODEL_PATH
    ):
        raise FileNotFoundError(
            "Anomaly detection model not found. "
            "Train the model first."
        )

    failure_model = joblib.load(
        FAILURE_MODEL_PATH
    )

    anomaly_model = joblib.load(
        ANOMALY_MODEL_PATH
    )

    return (
        failure_model,
        anomaly_model
    )


def calculate_risk_level(probability):

    if probability >= 0.70:
        return "HIGH"

    if probability >= 0.40:
        return "MEDIUM"

    return "LOW"


def predict_machine_status(
    air_temperature,
    process_temperature,
    rotational_speed,
    torque,
    tool_wear
):

    failure_model, anomaly_model = load_models()

    data = pd.DataFrame(
        [[
            air_temperature,
            process_temperature,
            rotational_speed,
            torque,
            tool_wear
        ]],
        columns=FEATURES
    )

    failure_prediction = int(
        failure_model.predict(data)[0]
    )

    probabilities = (
        failure_model.predict_proba(data)[0]
    )

    classes = (
        failure_model.classes_
    )

    failure_probability = 0.0

    for index, class_value in enumerate(classes):

        if int(class_value) == 1:
            failure_probability = float(
                probabilities[index]
            )

    anomaly_prediction = int(
        anomaly_model.predict(data)[0]
    )

    anomaly_score = float(
        anomaly_model.decision_function(data)[0]
    )

    is_anomaly = (
        anomaly_prediction == -1
    )

    risk_level = calculate_risk_level(
        failure_probability
    )

    return {
        "failure_prediction": failure_prediction,
        "failure_probability": round(
            failure_probability,
            4
        ),
        "risk_level": risk_level,
        "is_anomaly": is_anomaly,
        "anomaly_score": round(
            anomaly_score,
            4
        )
    }