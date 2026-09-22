from flask import Blueprint, jsonify, request

from app.models.user import User
from app.utils.decorators import token_required

user_bp = Blueprint("users", __name__, url_prefix="/api/users")


@user_bp.route("/me", methods=["GET"])
@token_required
def get_current_user():

    user = User.query.get(request.user_id)

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.name,
        "is_active": user.is_active
    })