from app.extensions import db

from app.models.machine import Machine
from app.models.sensor import Sensor
from app.models.sensor_reading import SensorReading
from app.models.machine_prediction import MachinePrediction
from app.models.alert import Alert

from app.services.ml.prediction_service import (
    predict_machine_status
)


SENSOR_TYPE_MAP = {
    "AIR_TEMPERATURE": "air_temperature",
    "PROCESS_TEMPERATURE": "process_temperature",
    "ROTATIONAL_SPEED": "rotational_speed",
    "TORQUE": "torque",
    "TOOL_WEAR": "tool_wear"
}


def get_latest_sensor_value(sensor):

    reading = (
        SensorReading.query
        .filter_by(sensor_id=sensor.id)
        .order_by(
            SensorReading.timestamp.desc()
        )
        .first()
    )

    if not reading:
        return None

    return float(reading.value)


def get_machine_features(machine_id):

    machine = Machine.query.get(machine_id)

    if not machine:
        raise ValueError("Machine not found")

    sensors = (
        Sensor.query
        .filter_by(machine_id=machine_id)
        .all()
    )

    features = {}

    for sensor in sensors:

        feature_name = SENSOR_TYPE_MAP.get(
            sensor.sensor_type
        )

        if not feature_name:
            continue

        value = get_latest_sensor_value(
            sensor
        )

        if value is not None:
            features[feature_name] = value

    required_features = [
        "air_temperature",
        "process_temperature",
        "rotational_speed",
        "torque",
        "tool_wear"
    ]

    missing_features = [
        feature
        for feature in required_features
        if feature not in features
    ]

    if missing_features:

        raise ValueError(
            "Missing latest sensor readings: "
            + ", ".join(missing_features)
        )

    return machine, features


def create_ml_alert(machine, prediction):

    existing_alert = (
        Alert.query
        .filter(
            Alert.machine_id == machine.id,
            Alert.alert_type.in_([
                "ML_FAILURE_RISK",
                "ML_ANOMALY"
            ]),
            Alert.status.in_([
                "ACTIVE",
                "ACKNOWLEDGED"
            ])
        )
        .order_by(Alert.created_at.desc())
        .first()
    )

    if existing_alert:
        return existing_alert

    alert = None

    if prediction["failure_probability"] >= 0.70:
        alert = Alert(
            machine_id=machine.id,
            alert_type="ML_FAILURE_RISK",
            severity="CRITICAL",
            message=(
                "ML model detected a high machine "
                "failure risk."
            ),
            value=prediction["failure_probability"],
            threshold=0.70,
            status="ACTIVE"
        )

    elif prediction["is_anomaly"]:
        alert = Alert(
            machine_id=machine.id,
            alert_type="ML_ANOMALY",
            severity="WARNING",
            message=(
                "ML anomaly detection identified "
                "an unusual machine state."
            ),
            value=prediction["anomaly_score"],
            threshold=0.0,
            status="ACTIVE"
        )

    if alert:
        db.session.add(alert)

    return alert


def analyze_machine(machine_id):

    machine, features = get_machine_features(
        machine_id
    )

    prediction_result = predict_machine_status(
        air_temperature=features[
            "air_temperature"
        ],
        process_temperature=features[
            "process_temperature"
        ],
        rotational_speed=features[
            "rotational_speed"
        ],
        torque=features[
            "torque"
        ],
        tool_wear=features[
            "tool_wear"
        ]
    )

    prediction = MachinePrediction(
        machine_id=machine_id,

        air_temperature=features[
            "air_temperature"
        ],

        process_temperature=features[
            "process_temperature"
        ],

        rotational_speed=features[
            "rotational_speed"
        ],

        torque=features[
            "torque"
        ],

        tool_wear=features[
            "tool_wear"
        ],

        failure_prediction=prediction_result[
            "failure_prediction"
        ],

        failure_probability=prediction_result[
            "failure_probability"
        ],

        risk_level=prediction_result[
            "risk_level"
        ],

        is_anomaly=prediction_result[
            "is_anomaly"
        ],

        anomaly_score=prediction_result[
            "anomaly_score"
        ]
    )

    db.session.add(prediction)

    db.session.flush()

    alert = create_ml_alert(
        machine,
        prediction_result
    )

    db.session.commit()

    return {
        "prediction": prediction,
        "alert": alert,
        "features": features
    }