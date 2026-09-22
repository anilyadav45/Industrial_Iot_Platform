from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.user import User
from app.models.role import Role
from app.utils.auth import hash_password, verify_password, generate_token

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({
            "message": "Name, email and password are required"
        }), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "message": "Email already registered"
        }), 409

    role = Role.query.filter_by(name="USER").first()

    if not role:
        return jsonify({
            "message": "Default USER role not found"
        }), 500

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role_id=role.id
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": role.name
        }
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({
            "message": "Invalid credentials"
        }), 401

    if not verify_password(password, user.password_hash):
        return jsonify({
            "message": "Invalid credentials"
        }), 401

    if not user.is_active:
        return jsonify({
            "message": "User account is inactive"
        }), 403

    token = generate_token(user)

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.name
        }
    })