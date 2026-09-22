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
            token = auth_header.split(" ")[1]

            payload = decode_token(token)

            request.user_id = payload["user_id"]
            request.user_role = payload["role"]

        except Exception:
            return jsonify({
                "message": "Invalid or expired token"
            }), 401

        return f(*args, **kwargs)

    return decorated