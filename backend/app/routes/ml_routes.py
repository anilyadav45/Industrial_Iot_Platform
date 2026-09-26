from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.machine import Machine
from app.models.machine_prediction import MachinePrediction

from app.services.ml.prediction_service import (
    predict_machine_status
)

from app.services.ml.machine_health_service import (
    analyze_machine
)

from app.utils.decorators import (
    token_required,
    role_required
)


ml_bp = Blueprint(
    "ml",
    __name__,
    url_prefix="/api/ml"
)


ALLOWED_ROLES = (
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER",
    "OPERATOR"
)


@ml_bp.route(
    "/predict",
    methods=["POST"]
)
@token_required
@role_required(*ALLOWED_ROLES)
def predict():

    data = request.get_json()

    required_fields = [
        "machine_id",
        "air_temperature",
        "process_temperature",
        "rotational_speed",
        "torque",
        "tool_wear"
    ]

    missing_fields = [
        field
        for field in required_fields
        if field not in data
    ]

    if missing_fields:
        return jsonify({
            "message": "Missing required fields",
            "missing_fields": missing_fields
        }), 400

    try:

        machine_id = int(
            data["machine_id"]
        )

        machine = Machine.query.get(
            machine_id
        )

        if not machine:
            return jsonify({
                "message": "Machine not found"
            }), 404

        air_temperature = float(
            data["air_temperature"]
        )

        process_temperature = float(
            data["process_temperature"]
        )

        rotational_speed = float(
            data["rotational_speed"]
        )

        torque = float(
            data["torque"]
        )

        tool_wear = float(
            data["tool_wear"]
        )

        result = predict_machine_status(
            air_temperature=air_temperature,
            process_temperature=process_temperature,
            rotational_speed=rotational_speed,
            torque=torque,
            tool_wear=tool_wear
        )

        prediction = MachinePrediction(
            machine_id=machine_id,

            air_temperature=air_temperature,

            process_temperature=process_temperature,

            rotational_speed=rotational_speed,

            torque=torque,

            tool_wear=tool_wear,

            failure_prediction=result[
                "failure_prediction"
            ],

            failure_probability=result[
                "failure_probability"
            ],

            risk_level=result[
                "risk_level"
            ],

            is_anomaly=result[
                "is_anomaly"
            ],

            anomaly_score=result[
                "anomaly_score"
            ]
        )

        db.session.add(prediction)

        db.session.commit()

        return jsonify({
            "message": "ML prediction completed",
            "prediction": {
                "id": prediction.id,
                "machine_id": prediction.machine_id,

                "air_temperature":
                    prediction.air_temperature,

                "process_temperature":
                    prediction.process_temperature,

                "rotational_speed":
                    prediction.rotational_speed,

                "torque":
                    prediction.torque,

                "tool_wear":
                    prediction.tool_wear,

                "failure_prediction":
                    prediction.failure_prediction,

                "failure_probability":
                    prediction.failure_probability,

                "risk_level":
                    prediction.risk_level,

                "is_anomaly":
                    prediction.is_anomaly,

                "anomaly_score":
                    prediction.anomaly_score,

                "created_at":
                    prediction.created_at
            }
        }), 201

    except (TypeError, ValueError) as error:

        return jsonify({
            "message": "Invalid machine or sensor values",
            "error": str(error)
        }), 400

    except FileNotFoundError as error:

        return jsonify({
            "message": str(error)
        }), 500

    except Exception as error:

        db.session.rollback()

        return jsonify({
            "message": "ML prediction failed",
            "error": str(error)
        }), 500


@ml_bp.route(
    "/predictions",
    methods=["GET"]
)
@token_required
@role_required(*ALLOWED_ROLES)
def get_predictions():

    predictions = (
        MachinePrediction.query
        .order_by(
            MachinePrediction.created_at.desc()
        )
        .all()
    )

    return jsonify([
        {
            "id": prediction.id,
            "machine_id": prediction.machine_id,
            "failure_prediction":
                prediction.failure_prediction,
            "failure_probability":
                prediction.failure_probability,
            "risk_level":
                prediction.risk_level,
            "is_anomaly":
                prediction.is_anomaly,
            "anomaly_score":
                prediction.anomaly_score,
            "created_at":
                prediction.created_at
        }
        for prediction in predictions
    ]), 200


@ml_bp.route(
    "/machines/<int:machine_id>/predictions",
    methods=["GET"]
)
@token_required
@role_required(*ALLOWED_ROLES)
def get_machine_predictions(machine_id):

    machine = Machine.query.get(
        machine_id
    )

    if not machine:
        return jsonify({
            "message": "Machine not found"
        }), 404

    predictions = (
        MachinePrediction.query
        .filter_by(
            machine_id=machine_id
        )
        .order_by(
            MachinePrediction.created_at.desc()
        )
        .all()
    )

    return jsonify([
        {
            "id": prediction.id,

            "machine_id":
                prediction.machine_id,

            "air_temperature":
                prediction.air_temperature,

            "process_temperature":
                prediction.process_temperature,

            "rotational_speed":
                prediction.rotational_speed,

            "torque":
                prediction.torque,

            "tool_wear":
                prediction.tool_wear,

            "failure_prediction":
                prediction.failure_prediction,

            "failure_probability":
                prediction.failure_probability,

            "risk_level":
                prediction.risk_level,

            "is_anomaly":
                prediction.is_anomaly,

            "anomaly_score":
                prediction.anomaly_score,

            "created_at":
                prediction.created_at
        }
        for prediction in predictions
    ]), 200


@ml_bp.route(
    "/machines/<int:machine_id>/health",
    methods=["GET"]
)
@token_required
@role_required(*ALLOWED_ROLES)
def get_machine_health(machine_id):

    machine = Machine.query.get(
        machine_id
    )

    if not machine:
        return jsonify({
            "message": "Machine not found"
        }), 404

    prediction = (
        MachinePrediction.query
        .filter_by(
            machine_id=machine_id
        )
        .order_by(
            MachinePrediction.created_at.desc()
        )
        .first()
    )

    if not prediction:
        return jsonify({
            "message": "No ML prediction available for this machine"
        }), 404

    return jsonify({
        "machine_id": machine_id,

        "machine_name": machine.name,

        "health": {
            "failure_prediction":
                prediction.failure_prediction,

            "failure_probability":
                prediction.failure_probability,

            "risk_level":
                prediction.risk_level,

            "is_anomaly":
                prediction.is_anomaly,

            "anomaly_score":
                prediction.anomaly_score,

            "last_updated":
                prediction.created_at
        }
    }), 200


@ml_bp.route(
    "/machines/<int:machine_id>/analyze",
    methods=["POST"]
)
@token_required
@role_required(*ALLOWED_ROLES)
def analyze_machine_route(machine_id):

    try:

        result = analyze_machine(
            machine_id
        )

        prediction = result[
            "prediction"
        ]

        alert = result[
            "alert"
        ]

        response = {
            "message": (
                "Machine health analysis completed"
            ),

            "machine_id": machine_id,

            "features": result[
                "features"
            ],

            "prediction": {
                "id": prediction.id,

                "failure_prediction":
                    prediction.failure_prediction,

                "failure_probability":
                    prediction.failure_probability,

                "risk_level":
                    prediction.risk_level,

                "is_anomaly":
                    prediction.is_anomaly,

                "anomaly_score":
                    prediction.anomaly_score,

                "created_at":
                    prediction.created_at
            }
        }

        if alert:

            response["alert"] = {
                "id": alert.id,

                "alert_type":
                    alert.alert_type,

                "severity":
                    alert.severity,

                "message":
                    alert.message,

                "value":
                    alert.value,

                "threshold":
                    alert.threshold,

                "status":
                    alert.status
            }

        else:

            response["alert"] = None

        return jsonify(response), 201

    except ValueError as error:

        return jsonify({
            "message": str(error)
        }), 400

    except FileNotFoundError as error:

        return jsonify({
            "message": str(error)
        }), 500

    except Exception as error:

        db.session.rollback()

        return jsonify({
            "message": (
                "Machine health analysis failed"
            ),
            "error": str(error)
        }), 500