from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.sensor_reading import SensorReading
from app.models.sensor import Sensor
from app.utils.decorators import token_required, role_required


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

    return jsonify({
        "message": "Sensor reading created",
        "reading": {
            "id": reading.id,
            "sensor_id": reading.sensor_id,
            "timestamp": reading.timestamp,
            "value": reading.value
        }
    }), 201


# Get readings
@sensor_reading_bp.route("", methods=["GET"])
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER",
    "OPERATOR"
)
def get_readings():

    readings = (
        SensorReading.query
        .order_by(SensorReading.timestamp.desc())
        .all()
    )

    return jsonify([
        {
            "id": reading.id,
            "sensor_id": reading.sensor_id,
            "timestamp": reading.timestamp,
            "value": reading.value
        }
        for reading in readings
    ]), 200


# Get readings for specific sensor
@sensor_reading_bp.route(
    "/sensor/<int:sensor_id>",
    methods=["GET"]
)
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

    readings = (
        SensorReading.query
        .filter_by(sensor_id=sensor_id)
        .order_by(SensorReading.timestamp.desc())
        .all()
    )

    return jsonify([
        {
            "id": reading.id,
            "sensor_id": reading.sensor_id,
            "timestamp": reading.timestamp,
            "value": reading.value
        }
        for reading in readings
    ]), 200