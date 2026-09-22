from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.production_line import ProductionLine
from app.models.factory import Factory
from app.utils.decorators import token_required, role_required


production_line_bp = Blueprint(
    "production_lines",
    __name__,
    url_prefix="/api/production-lines"
)


@production_line_bp.route("", methods=["POST"])
@token_required
@role_required("SUPER_ADMIN", "FACTORY_ADMIN")
def create_production_line():

    data = request.get_json() or {}

    name = data.get("name")
    factory_id = data.get("factory_id")

    if not name or not factory_id:
        return jsonify({
            "message": "Name and factory_id are required"
        }), 400

    factory = db.session.get(Factory, factory_id)

    if not factory:
        return jsonify({
            "message": "Factory not found"
        }), 404

    line = ProductionLine(
        name=name,
        factory_id=factory_id
    )

    db.session.add(line)
    db.session.commit()

    return jsonify({
        "message": "Production line created successfully",
        "production_line": {
            "id": line.id,
            "name": line.name,
            "factory_id": line.factory_id
        }
    }), 201


@production_line_bp.route("", methods=["GET"])
@token_required
@role_required("SUPER_ADMIN", "FACTORY_ADMIN", "ENGINEER")
def get_production_lines():

    lines = ProductionLine.query.order_by(
        ProductionLine.id.desc()
    ).all()

    return jsonify([
        {
            "id": line.id,
            "name": line.name,
            "factory_id": line.factory_id
        }
        for line in lines
    ])