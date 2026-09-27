from flask import Blueprint, jsonify, request

from app.models.audit_log import AuditLog
from app.utils.decorators import (
    token_required,
    role_required
)


audit_bp = Blueprint(
    "audit",
    __name__,
    url_prefix="/api/audit-logs"
)


@audit_bp.route(
    "",
    methods=["GET"]
)
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN"
)
def get_audit_logs():

    limit = request.args.get(
        "limit",
        100,
        type=int
    )

    if limit < 1:
        limit = 1

    if limit > 500:
        limit = 500

    logs = (
        AuditLog.query
        .order_by(
            AuditLog.created_at.desc()
        )
        .limit(limit)
        .all()
    )

    return jsonify([
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "description": log.description,
            "ip_address": log.ip_address,
            "created_at": log.created_at
        }
        for log in logs
    ]), 200