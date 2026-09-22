import os
from datetime import datetime, timedelta, timezone

import jwt
from werkzeug.security import generate_password_hash, check_password_hash


def hash_password(password):
    return generate_password_hash(password)


def verify_password(password, password_hash):
    return check_password_hash(password_hash, password)


def generate_token(user):
    payload = {
        "user_id": user.id,
        "role": user.role.name,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)
    }

    return jwt.encode(
        payload,
        os.getenv("JWT_SECRET"),
        algorithm="HS256"
    )


def decode_token(token):
    return jwt.decode(
        token,
        os.getenv("JWT_SECRET"),
        algorithms=["HS256"]
    )