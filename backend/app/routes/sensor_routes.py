from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.sensor import Sensor
from app.models.machine import Machine
from app.utils.decorators import token_required, role_required


sensor_bp = Blueprint(
    "sensors",
    __name__,
    url_prefix="/api/sensors"
)


@sensor_bp.route("", methods=["POST"])
@token_required
@role_required("SUPER_ADMIN", "FACTORY_ADMIN", "ENGINEER")
def create_sensor():

    data = request.get_json() or {}

    sensor_code = data.get("sensor_code")
    sensor_type = data.get("sensor_type")
    unit = data.get("unit")
    machine_id = data.get("machine_id")

    if not sensor_code or not sensor_type or not machine_id:
        return jsonify({
            "message": "sensor_code, sensor_type and machine_id are required"
        }), 400

    existing = Sensor.query.filter_by(
        sensor_code=sensor_code
    ).first()

    if existing:
        return jsonify({
            "message": "Sensor code already exists"
        }), 409

    machine = db.session.get(Machine, machine_id)

    if not machine:
        return jsonify({
            "message": "Machine not found"
        }), 404

    sensor = Sensor(
        sensor_code=sensor_code,
        sensor_type=sensor_type,
        unit=unit,
        machine_id=machine_id
    )

    db.session.add(sensor)
    db.session.commit()

    return jsonify({
        "message": "Sensor created successfully",
        "sensor": {
            "id": sensor.id,
            "sensor_code": sensor.sensor_code,
            "sensor_type": sensor.sensor_type,
            "unit": sensor.unit,
            "machine_id": sensor.machine_id,
            "status": sensor.status
        }
    }), 201


@sensor_bp.route("", methods=["GET"])
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER",
    "OPERATOR"
)
def get_sensors():

    sensors = Sensor.query.order_by(
        Sensor.id.desc()
    ).all()

    return jsonify([
        {
            "id": sensor.id,
            "sensor_code": sensor.sensor_code,
            "sensor_type": sensor.sensor_type,
            "unit": sensor.unit,
            "machine_id": sensor.machine_id,
            "status": sensor.status
        }
        for sensor in sensors
    ])