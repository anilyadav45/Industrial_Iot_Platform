from flask import Blueprint, jsonify, request


from app.services.optimization.optimization_service import (
    analyze_resource
)

from app.utils.decorators import (
    token_required,
    role_required
)

from datetime import datetime, timezone

from app.extensions import db
from app.models.optimization_recommendation import (
    OptimizationRecommendation
)

optimization_bp = Blueprint(
    "optimization",
    __name__,
    url_prefix="/api/optimization"
)


ALLOWED_ROLES = (
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER"
)


def serialize_recommendation(recommendation):
    return {
        "id": recommendation.id,
        "resource_id": recommendation.resource_id,
        "recommendation_type": recommendation.recommendation_type,
        "severity": recommendation.severity,
        "title": recommendation.title,
        "description": recommendation.description,
        "current_utilization": recommendation.current_utilization,
        "recommended_utilization": recommendation.recommended_utilization,
        "estimated_monthly_savings": recommendation.estimated_monthly_savings,
        "status": recommendation.status,
        "acknowledged_by": recommendation.acknowledged_by,
        "acknowledged_at": recommendation.acknowledged_at,
        "resolved_by": recommendation.resolved_by,
        "resolved_at": recommendation.resolved_at,
        "created_at": recommendation.created_at
    }


@optimization_bp.route(
    "/resources/<int:resource_id>/analyze",
    methods=["POST"]
)
@token_required
@role_required(*ALLOWED_ROLES)
def analyze_cloud_resource(resource_id):

    try:
        result = analyze_resource(
            resource_id
        )

        return jsonify({
            "message": (
                "Cloud resource analysis completed"
            ),

            "resource_id": resource_id,

            "metrics": result["metrics"],

            "classifications": (
                result["classifications"]
            ),

            "estimated_monthly_savings": (
                result[
                    "estimated_monthly_savings"
                ]
            ),

            "recommendations": [
                serialize_recommendation(
                    recommendation
                )
                for recommendation
                in result["recommendations"]
            ]
        }), 201

    except ValueError as error:

        return jsonify({
            "message": str(error)
        }), 404

    except Exception as error:

        return jsonify({
            "message": (
                "Cloud resource analysis failed"
            ),
            "error": str(error)
        }), 500


@optimization_bp.route(
    "/recommendations",
    methods=["GET"]
)
@token_required
@role_required(*ALLOWED_ROLES)
def get_recommendations():

    recommendations = (
        OptimizationRecommendation.query
        .order_by(
            OptimizationRecommendation
            .created_at.desc()
        )
        .all()
    )

    return jsonify([
        serialize_recommendation(
            recommendation
        )
        for recommendation
        in recommendations
    ]), 200


@optimization_bp.route(
    "/resources/<int:resource_id>/recommendations",
    methods=["GET"]
)
@token_required
@role_required(*ALLOWED_ROLES)
def get_resource_recommendations(
    resource_id
):

    recommendations = (
        OptimizationRecommendation.query
        .filter_by(
            resource_id=resource_id
        )
        .order_by(
            OptimizationRecommendation
            .created_at.desc()
        )
        .all()
    )

    return jsonify([
        serialize_recommendation(
            recommendation
        )
        for recommendation
        in recommendations
    ]), 200

@optimization_bp.route(
    "/recommendations/<int:recommendation_id>/acknowledge",
    methods=["PATCH"]
)
@token_required
@role_required(*ALLOWED_ROLES)
def acknowledge_recommendation(recommendation_id):

    recommendation = OptimizationRecommendation.query.get(
        recommendation_id
    )

    if not recommendation:
        return jsonify({
            "message": "Recommendation not found"
        }), 404

    if recommendation.status == "RESOLVED":
        return jsonify({
            "message": "Resolved recommendation cannot be acknowledged"
        }), 400

    if recommendation.status == "ACKNOWLEDGED":
        return jsonify({
            "message": "Recommendation is already acknowledged"
        }), 400

    recommendation.status = "ACKNOWLEDGED"

    recommendation.acknowledged_by = request.user_id

    recommendation.acknowledged_at = datetime.now(
        timezone.utc
    )

    db.session.commit()

    return jsonify({
        "message": "Recommendation acknowledged successfully",
        "recommendation": serialize_recommendation(
            recommendation
        )
    }), 200


@optimization_bp.route(
    "/recommendations/<int:recommendation_id>/resolve",
    methods=["PATCH"]
)
@token_required
@role_required(*ALLOWED_ROLES)
def resolve_recommendation(recommendation_id):

    recommendation = OptimizationRecommendation.query.get(
        recommendation_id
    )

    if not recommendation:
        return jsonify({
            "message": "Recommendation not found"
        }), 404

    if recommendation.status == "PENDING":
        return jsonify({
            "message": (
                "Recommendation must be acknowledged "
                "before it can be resolved"
            )
        }), 400

    if recommendation.status == "RESOLVED":
        return jsonify({
            "message": "Recommendation is already resolved"
        }), 400

    recommendation.status = "RESOLVED"

    recommendation.resolved_by = request.user_id

    recommendation.resolved_at = datetime.now(
        timezone.utc
    )

    db.session.commit()

    return jsonify({
        "message": "Recommendation resolved successfully",
        "recommendation": serialize_recommendation(
            recommendation
        )
    }), 200