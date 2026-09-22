from flask import Blueprint, jsonify
from app.extensions import db

health_bp = Blueprint("health", __name__)


@health_bp.route("/api/health", methods=["GET"])
def health_check():

    try:
        db.session.execute(db.text("SELECT 1"))

        return jsonify({
            "status": "ok",
            "database": "connected",
            "message": "Industrial IoT Platform API is running"
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "database": "disconnected",
            "error": str(e)
        }), 500