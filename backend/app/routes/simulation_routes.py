from app.extensions import db
from flask import Blueprint, jsonify, request

from app.services.simulation.sensor_simulation_service import (
    generate_simulated_readings
)


from app.utils.decorators import (
    token_required,
    role_required
)

from app.services.audit_service import create_audit_log

simulation_bp = Blueprint(
    "simulation",
    __name__,
    url_prefix="/api/simulation"
)


@simulation_bp.route(
    "/generate",
    methods=["POST"]
)
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER",
    "OPERATOR"
)
def generate():

    data = request.get_json(
        silent=True
    ) or {}

    machine_id = data.get(
        "machine_id"
    )

    abnormal = data.get("abnormal", False)

    if not isinstance(abnormal, bool):
        return jsonify({
            "message": "abnormal must be a boolean"
        }), 400

    try:

        result = generate_simulated_readings(
            machine_id=machine_id,
            abnormal=abnormal
        )
        
        create_audit_log(
            user_id=request.user_id,
            action="SIMULATION_GENERATED",
            resource_type="MACHINE",
            resource_id=result["machine_id"],
            description=(
                "Generated simulated sensor readings "
                f"for machine {result['machine_name']}."
            ),
            ip_address=request.remote_addr
        )
        db.session.commit()

        return jsonify(result), 201

    except ValueError as error:

        return jsonify({
            "message": str(error)
        }), 400

    except Exception as error:

        return jsonify({
            "message": "Simulation failed",
            "error": str(error)
        }), 500