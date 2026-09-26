from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models.alert import Alert
from app.utils.decorators import (
    token_required,
    role_required
)


alert_bp = Blueprint(
    "alerts",
    __name__,
    url_prefix="/api/alerts"
)


ALLOWED_ROLES = (
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER",
    "OPERATOR"
)


def serialize_alert(alert):
    return {
        "id": alert.id,
        "sensor_id": alert.sensor_id,
        "machine_id": alert.machine_id,
        "alert_type": alert.alert_type,
        "severity": alert.severity,
        "message": alert.message,
        "value": alert.value,
        "threshold": alert.threshold,
        "status": alert.status,
        "created_at": alert.created_at,
        "acknowledged_by": alert.acknowledged_by,
        "acknowledged_at": alert.acknowledged_at,
        "resolved_by": alert.resolved_by,
        "resolved_at": alert.resolved_at
    }


# Get all alerts
@alert_bp.route("", methods=["GET"])
@token_required
@role_required(*ALLOWED_ROLES)
def get_alerts():

    alerts = (
        Alert.query
        .order_by(Alert.created_at.desc())
        .all()
    )

    return jsonify([
        serialize_alert(alert)
        for alert in alerts
    ]), 200


# Get active alerts
@alert_bp.route("/active", methods=["GET"])
@token_required
@role_required(*ALLOWED_ROLES)
def get_active_alerts():

    alerts = (
        Alert.query
        .filter(
            Alert.status.in_(
                ["ACTIVE", "ACKNOWLEDGED"]
            )
        )
        .order_by(Alert.created_at.desc())
        .all()
    )

    return jsonify([
        serialize_alert(alert)
        for alert in alerts
    ]), 200


# Get single alert
@alert_bp.route("/<int:alert_id>", methods=["GET"])
@token_required
@role_required(*ALLOWED_ROLES)
def get_alert(alert_id):

    alert = Alert.query.get(alert_id)

    if not alert:
        return jsonify({
            "message": "Alert not found"
        }), 404

    return jsonify(
        serialize_alert(alert)
    ), 200


# Acknowledge alert
@alert_bp.route(
    "/<int:alert_id>/acknowledge",
    methods=["PATCH"]
)
@token_required
@role_required(*ALLOWED_ROLES)
def acknowledge_alert(alert_id):

    alert = Alert.query.get(alert_id)

    if not alert:
        return jsonify({
            "message": "Alert not found"
        }), 404

    if alert.status == "RESOLVED":
        return jsonify({
            "message": "Resolved alert cannot be acknowledged"
        }), 400

    if alert.status == "ACKNOWLEDGED":
        return jsonify({
            "message": "Alert is already acknowledged"
        }), 400

    alert.status = "ACKNOWLEDGED"
    alert.acknowledged_by = request.user_id
    alert.acknowledged_at = datetime.now(timezone.utc)

    db.session.commit()

    return jsonify({
        "message": "Alert acknowledged successfully",
        "alert": serialize_alert(alert)
    }), 200


# Resolve alert
@alert_bp.route(
    "/<int:alert_id>/resolve",
    methods=["PATCH"]
)
@token_required
@role_required(*ALLOWED_ROLES)
def resolve_alert(alert_id):

    alert = Alert.query.get(alert_id)

    if not alert:
        return jsonify({
            "message": "Alert not found"
        }), 404

    if alert.status == "RESOLVED":
        return jsonify({
            "message": "Alert is already resolved"
        }), 400

    alert.status = "RESOLVED"
    alert.resolved_by = request.user_id
    alert.resolved_at = datetime.now(timezone.utc)

    db.session.commit()

    return jsonify({
        "message": "Alert resolved successfully",
        "alert": serialize_alert(alert)
    }), 200