from flask import Blueprint, jsonify

from app.services.report_service import (
    get_machine_report,
    get_sensor_report,
    get_alert_report,
    get_optimization_report
)

from app.utils.decorators import (
    token_required,
    role_required
)


report_bp = Blueprint(
    "reports",
    __name__,
    url_prefix="/api/reports"
)


@report_bp.route(
    "/machines/<int:machine_id>",
    methods=["GET"]
)
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER",
    "OPERATOR",
    "USER"
)
def machine_report(machine_id):

    try:

        report = get_machine_report(
            machine_id
        )

        return jsonify(report), 200

    except ValueError as error:

        return jsonify({
            "message": str(error)
        }), 404

    except Exception as error:

        return jsonify({
            "message": "Failed to generate machine report",
            "error": str(error)
        }), 500


@report_bp.route(
    "/sensors/<int:sensor_id>",
    methods=["GET"]
)
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER",
    "OPERATOR",
    "USER"
)
def sensor_report(sensor_id):

    try:

        report = get_sensor_report(
            sensor_id
        )

        return jsonify(report), 200

    except ValueError as error:

        return jsonify({
            "message": str(error)
        }), 404

    except Exception as error:

        return jsonify({
            "message": "Failed to generate sensor report",
            "error": str(error)
        }), 500


@report_bp.route(
    "/alerts",
    methods=["GET"]
)
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER"
)
def alert_report():

    try:

        report = get_alert_report()

        return jsonify(report), 200

    except Exception as error:

        return jsonify({
            "message": "Failed to generate alert report",
            "error": str(error)
        }), 500


@report_bp.route(
    "/optimization",
    methods=["GET"]
)
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER"
)
def optimization_report():

    try:

        report = get_optimization_report()

        return jsonify(report), 200

    except Exception as error:

        return jsonify({
            "message": "Failed to generate optimization report",
            "error": str(error)
        }), 500