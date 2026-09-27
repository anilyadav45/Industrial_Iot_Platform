from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.sensor_reading import SensorReading
from app.models.sensor import Sensor
from app.utils.decorators import token_required, role_required
from app.services.alert_service import check_sensor_reading


sensor_reading_bp = Blueprint(
    "sensor_readings",
    __name__,
    url_prefix="/api/readings"
)


# Create sensor reading
@sensor_reading_bp.route("", methods=["POST"])
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER",
    "OPERATOR"
)
def create_reading():

    data = request.get_json()

    sensor_id = data.get("sensor_id")
    value = data.get("value")

    if sensor_id is None or value is None:
        return jsonify({
            "message": "sensor_id and value are required"
        }), 400

    sensor = Sensor.query.get(sensor_id)

    if not sensor:
        return jsonify({
            "message": "Sensor not found"
        }), 404

    reading = SensorReading(
        sensor_id=sensor_id,
        value=float(value)
    )

    db.session.add(reading)
    db.session.commit()

    # Check whether this reading triggers an alert
    alert = check_sensor_reading(
        sensor_id=sensor_id,
        value=float(value)
    )

    reading_response = {
        "id": reading.id,
        "sensor_id": reading.sensor_id,
        "timestamp": reading.timestamp,
        "value": reading.value
    }

    # Add alert information if threshold was exceeded
    if alert:
        reading_response["alert"] = {
            "id": alert.id,
            "alert_type": alert.alert_type,
            "severity": alert.severity,
            "message": alert.message,
            "value": alert.value,
            "threshold": alert.threshold,
            "status": alert.status
        }

    return jsonify({
        "message": "Sensor reading created",
        "reading": reading_response
    }), 201

# Get readings for a specific sensor
@sensor_reading_bp.route("/sensor/<int:sensor_id>", methods=["GET"])
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER",
    "OPERATOR"
)
def get_sensor_readings(sensor_id):

    sensor = Sensor.query.get(sensor_id)

    if not sensor:
        return jsonify({
            "message": "Sensor not found"
        }), 404

    # Optional limit:
    # /api/readings/sensor/10?limit=100
    try:
        limit = int(request.args.get("limit", 100))
    except ValueError:
        limit = 100

    # Protect the API from excessively large requests
    limit = min(max(limit, 1), 1000)

    readings = (
        SensorReading.query
        .filter_by(sensor_id=sensor_id)
        .order_by(SensorReading.timestamp.desc())
        .limit(limit)
        .all()
    )

    return jsonify({
        "sensor_id": sensor_id,
        "sensor_code": sensor.sensor_code,
        "sensor_type": sensor.sensor_type,
        "unit": sensor.unit,
        "count": len(readings),
        "readings": [
            {
                "id": reading.id,
                "sensor_id": reading.sensor_id,
                "timestamp": reading.timestamp,
                "value": reading.value
            }
            for reading in readings
        ]
    }), 200