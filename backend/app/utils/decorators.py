from functools import wraps

from flask import request, jsonify

from app.utils.auth import decode_token


def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({
                "message": "Authorization token required"
            }), 401

        try:
            parts = auth_header.split(" ")

            if len(parts) != 2 or parts[0] != "Bearer":
                return jsonify({
                    "message": "Invalid authorization format"
                }), 401

            token = parts[1]

            payload = decode_token(token)

            request.user_id = payload["user_id"]
            request.user_role = payload["role"]

        except Exception:
            return jsonify({
                "message": "Invalid or expired token"
            }), 401

        return f(*args, **kwargs)

    return decorated


def role_required(*allowed_roles):

    def decorator(f):

        @wraps(f)
        def decorated(*args, **kwargs):

            if request.user_role not in allowed_roles:
                return jsonify({
                    "message": "Access denied",
                    "required_roles": list(allowed_roles),
                    "your_role": request.user_role
                }), 403

            return f(*args, **kwargs)

        return decorated

    return decorator