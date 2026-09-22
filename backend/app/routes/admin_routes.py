from flask import Blueprint, jsonify

from app.utils.decorators import token_required, role_required

admin_bp = Blueprint(
    "admin",
    __name__,
    url_prefix="/api/admin"
)


@admin_bp.route("/dashboard", methods=["GET"])
@token_required
@role_required("SUPER_ADMIN", "FACTORY_ADMIN")
def admin_dashboard():

    return jsonify({
        "message": "Welcome to the admin dashboard",
        "role": "admin"
    })