from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.factory import Factory
from app.models.organization import Organization
from app.utils.decorators import token_required, role_required


factory_bp = Blueprint(
    "factories",
    __name__,
    url_prefix="/api/factories"
)


@factory_bp.route("", methods=["POST"])
@token_required
@role_required("SUPER_ADMIN", "FACTORY_ADMIN")
def create_factory():

    data = request.get_json() or {}

    name = data.get("name")
    location = data.get("location")
    organization_id = data.get("organization_id")

    if not name or not organization_id:
        return jsonify({
            "message": "Name and organization_id are required"
        }), 400

    organization = db.session.get(
        Organization,
        organization_id
    )

    if not organization:
        return jsonify({
            "message": "Organization not found"
        }), 404

    factory = Factory(
        name=name,
        location=location,
        organization_id=organization_id
    )

    db.session.add(factory)
    db.session.commit()

    return jsonify({
        "message": "Factory created successfully",
        "factory": {
            "id": factory.id,
            "name": factory.name,
            "location": factory.location,
            "organization_id": factory.organization_id
        }
    }), 201


@factory_bp.route("", methods=["GET"])
@token_required
@role_required("SUPER_ADMIN", "FACTORY_ADMIN")
def get_factories():

    factories = Factory.query.order_by(
        Factory.id.desc()
    ).all()

    return jsonify([
        {
            "id": factory.id,
            "name": factory.name,
            "location": factory.location,
            "organization_id": factory.organization_id,
            "is_active": factory.is_active
        }
        for factory in factories
    ])