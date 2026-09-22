from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.organization import Organization
from app.utils.decorators import token_required, role_required


organization_bp = Blueprint(
    "organizations",
    __name__,
    url_prefix="/api/organizations"
)


# ==========================================
# CREATE ORGANIZATION
# POST /api/organizations
# ==========================================

@organization_bp.route("", methods=["POST"])
@token_required
@role_required("SUPER_ADMIN")
def create_organization():

    data = request.get_json() or {}

    name = data.get("name")
    code = data.get("code")

    if not name or not code:
        return jsonify({
            "message": "Name and code are required"
        }), 400

    existing = Organization.query.filter_by(
        code=code
    ).first()

    if existing:
        return jsonify({
            "message": "Organization code already exists"
        }), 409

    organization = Organization(
        name=name,
        code=code
    )

    db.session.add(organization)
    db.session.commit()

    return jsonify({
        "message": "Organization created successfully",
        "organization": {
            "id": organization.id,
            "name": organization.name,
            "code": organization.code,
            "is_active": organization.is_active
        }
    }), 201


# ==========================================
# GET ALL ORGANIZATIONS
# GET /api/organizations
# ==========================================

@organization_bp.route("", methods=["GET"])
@token_required
@role_required("SUPER_ADMIN", "FACTORY_ADMIN")
def get_organizations():

    organizations = Organization.query.order_by(
        Organization.id.desc()
    ).all()

    return jsonify([
        {
            "id": organization.id,
            "name": organization.name,
            "code": organization.code,
            "is_active": organization.is_active
        }
        for organization in organizations
    ]), 200


# ==========================================
# GET ONE ORGANIZATION
# GET /api/organizations/<id>
# ==========================================

@organization_bp.route(
    "/<int:organization_id>",
    methods=["GET"]
)
@token_required
@role_required("SUPER_ADMIN", "FACTORY_ADMIN")
def get_organization(organization_id):

    organization = db.session.get(
        Organization,
        organization_id
    )

    if not organization:
        return jsonify({
            "message": "Organization not found"
        }), 404

    return jsonify({
        "id": organization.id,
        "name": organization.name,
        "code": organization.code,
        "is_active": organization.is_active
    }), 200


# ==========================================
# UPDATE ORGANIZATION
# PUT /api/organizations/<id>
# ==========================================

@organization_bp.route(
    "/<int:organization_id>",
    methods=["PUT"]
)
@token_required
@role_required("SUPER_ADMIN")
def update_organization(organization_id):

    organization = db.session.get(
        Organization,
        organization_id
    )

    if not organization:
        return jsonify({
            "message": "Organization not found"
        }), 404

    data = request.get_json() or {}

    if "name" in data:
        organization.name = data["name"]

    if "is_active" in data:
        organization.is_active = data["is_active"]

    db.session.commit()

    return jsonify({
        "message": "Organization updated successfully"
    }), 200


# ==========================================
# DEACTIVATE ORGANIZATION
# DELETE /api/organizations/<id>
# ==========================================

@organization_bp.route(
    "/<int:organization_id>",
    methods=["DELETE"]
)
@token_required
@role_required("SUPER_ADMIN")
def deactivate_organization(organization_id):

    organization = db.session.get(
        Organization,
        organization_id
    )

    if not organization:
        return jsonify({
            "message": "Organization not found"
        }), 404

    organization.is_active = False

    db.session.commit()

    return jsonify({
        "message": "Organization deactivated successfully"
    }), 200