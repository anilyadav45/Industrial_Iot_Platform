from app.extensions import db
from app.models.sensor import Sensor
from app.models.sensor_reading import SensorReading
from app.models.alert import Alert


ALERT_RULES = {
    "AIR_TEMPERATURE": {
        "threshold": 304.0,
        "severity": "WARNING",
        "message": "Air temperature is above the configured threshold."
    },

    "PROCESS_TEMPERATURE": {
        "threshold": 313.0,
        "severity": "WARNING",
        "message": "Process temperature is above the configured threshold."
    },

    "ROTATIONAL_SPEED": {
        "threshold": 2500.0,
        "severity": "CRITICAL",
        "message": "Rotational speed is above the configured threshold."
    },

    "TORQUE": {
        "threshold": 70.0,
        "severity": "CRITICAL",
        "message": "Torque is above the configured threshold."
    },

    "TOOL_WEAR": {
        "threshold": 200.0,
        "severity": "WARNING",
        "message": "Tool wear is above the configured threshold."
    }
}


def check_sensor_reading(sensor_id, value):
    sensor = Sensor.query.get(sensor_id)

    if not sensor:
        return None

    rule = ALERT_RULES.get(sensor.sensor_type)

    if not rule:
        return None

    if value <= rule["threshold"]:
        return None

    alert = Alert(
        sensor_id=sensor.id,
        alert_type=f"{sensor.sensor_type}_THRESHOLD",
        severity=rule["severity"],
        message=rule["message"],
        value=float(value),
        threshold=rule["threshold"],
        status="ACTIVE"
    )

    db.session.add(alert)
    db.session.commit()

    return alert