from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.machine import Machine
from app.models.factory import Factory
from app.models.production_line import ProductionLine
from app.utils.decorators import token_required, role_required


machine_bp = Blueprint(
    "machines",
    __name__,
    url_prefix="/api/machines"
)


@machine_bp.route("", methods=["POST"])
@token_required
@role_required("SUPER_ADMIN", "FACTORY_ADMIN")
def create_machine():

    data = request.get_json() or {}

    machine_code = data.get("machine_code")
    name = data.get("name")
    machine_type = data.get("machine_type")
    factory_id = data.get("factory_id")
    production_line_id = data.get("production_line_id")

    if not machine_code or not name or not factory_id:
        return jsonify({
            "message": "machine_code, name and factory_id are required"
        }), 400

    existing = Machine.query.filter_by(
        machine_code=machine_code
    ).first()

    if existing:
        return jsonify({
            "message": "Machine code already exists"
        }), 409

    factory = db.session.get(Factory, factory_id)

    if not factory:
        return jsonify({
            "message": "Factory not found"
        }), 404

    if production_line_id:

        line = db.session.get(
            ProductionLine,
            production_line_id
        )

        if not line:
            return jsonify({
                "message": "Production line not found"
            }), 404

    machine = Machine(
        machine_code=machine_code,
        name=name,
        machine_type=machine_type,
        factory_id=factory_id,
        production_line_id=production_line_id
    )

    db.session.add(machine)
    db.session.commit()

    return jsonify({
        "message": "Machine created successfully",
        "machine": {
            "id": machine.id,
            "machine_code": machine.machine_code,
            "name": machine.name,
            "machine_type": machine.machine_type,
            "status": machine.status,
            "factory_id": machine.factory_id,
            "production_line_id": machine.production_line_id
        }
    }), 201


@machine_bp.route("", methods=["GET"])
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER",
    "OPERATOR"
)
def get_machines():

    machines = Machine.query.order_by(
        Machine.id.desc()
    ).all()

    return jsonify([
        {
            "id": machine.id,
            "machine_code": machine.machine_code,
            "name": machine.name,
            "machine_type": machine.machine_type,
            "status": machine.status,
            "factory_id": machine.factory_id,
            "production_line_id": machine.production_line_id
        }
        for machine in machines
    ])