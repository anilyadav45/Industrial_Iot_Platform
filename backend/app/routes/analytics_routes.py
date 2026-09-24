from flask import Blueprint, jsonify, request

from app.services.analytics_service import (
    get_overview,
    get_sensor_statistics,
    get_recent_readings,
)

from app.utils.decorators import (
    token_required,
    role_required,
)


analytics_bp = Blueprint(
    "analytics",
    __name__,
    url_prefix="/api/analytics"
)


@analytics_bp.route("/overview", methods=["GET"])
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER",
    "OPERATOR"
)
def overview():

    return jsonify(
        get_overview()
    ), 200


@analytics_bp.route("/sensors", methods=["GET"])
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER",
    "OPERATOR"
)
def sensor_statistics():

    return jsonify(
        get_sensor_statistics()
    ), 200


@analytics_bp.route("/recent-readings", methods=["GET"])
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER",
    "OPERATOR"
)
def recent_readings():

    limit = request.args.get(
        "limit",
        default=20,
        type=int
    )

    # Prevent excessively large requests
    limit = min(max(limit, 1), 100)

    return jsonify(
        get_recent_readings(limit)
    ), 200