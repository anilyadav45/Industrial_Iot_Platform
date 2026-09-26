from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models.cloud_resource import CloudResource
from app.utils.decorators import (
    token_required,
    role_required
)


cloud_resource_bp = Blueprint(
    "cloud_resources",
    __name__,
    url_prefix="/api/cloud-resources"
)


ALLOWED_ROLES = (
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER"
)


def serialize_resource(resource):
    return {
        "id": resource.id,
        "resource_name": resource.resource_name,
        "resource_type": resource.resource_type,
        "provider": resource.provider,
        "region": resource.region,

        "cpu_capacity": resource.cpu_capacity,
        "memory_capacity": resource.memory_capacity,
        "storage_capacity": resource.storage_capacity,
        "network_capacity": resource.network_capacity,

        "current_cpu_usage": resource.current_cpu_usage,
        "current_memory_usage": resource.current_memory_usage,
        "current_storage_usage": resource.current_storage_usage,
        "current_network_usage": resource.current_network_usage,

        "status": resource.status,
        "created_at": resource.created_at,
        "updated_at": resource.updated_at
    }


@cloud_resource_bp.route("", methods=["POST"])
@token_required
@role_required(*ALLOWED_ROLES)
def create_resource():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    required_fields = [
        "resource_name",
        "resource_type",
        "cpu_capacity",
        "memory_capacity",
        "storage_capacity",
        "network_capacity"
    ]

    missing_fields = [
        field
        for field in required_fields
        if field not in data
    ]

    if missing_fields:
        return jsonify({
            "message": "Missing required fields",
            "fields": missing_fields
        }), 400

    try:
        resource = CloudResource(
            resource_name=data["resource_name"],
            resource_type=data["resource_type"],
            provider=data.get(
                "provider",
                "SIMULATED"
            ),
            region=data.get("region"),

            cpu_capacity=float(
                data["cpu_capacity"]
            ),

            memory_capacity=float(
                data["memory_capacity"]
            ),

            storage_capacity=float(
                data["storage_capacity"]
            ),

            network_capacity=float(
                data["network_capacity"]
            ),

            current_cpu_usage=float(
                data.get(
                    "current_cpu_usage",
                    0
                )
            ),

            current_memory_usage=float(
                data.get(
                    "current_memory_usage",
                    0
                )
            ),

            current_storage_usage=float(
                data.get(
                    "current_storage_usage",
                    0
                )
            ),

            current_network_usage=float(
                data.get(
                    "current_network_usage",
                    0
                )
            ),

            status=data.get(
                "status",
                "ACTIVE"
            )
        )

        db.session.add(resource)
        db.session.commit()

        return jsonify({
            "message": "Cloud resource created successfully",
            "resource": serialize_resource(resource)
        }), 201

    except (TypeError, ValueError):
        db.session.rollback()

        return jsonify({
            "message": "Capacity and usage values must be numbers"
        }), 400

    except Exception as error:
        db.session.rollback()

        return jsonify({
            "message": "Failed to create cloud resource",
            "error": str(error)
        }), 500


@cloud_resource_bp.route("", methods=["GET"])
@token_required
@role_required(*ALLOWED_ROLES)
def get_resources():

    resources = (
        CloudResource.query
        .order_by(CloudResource.created_at.desc())
        .all()
    )

    return jsonify([
        serialize_resource(resource)
        for resource in resources
    ]), 200


@cloud_resource_bp.route(
    "/<int:resource_id>",
    methods=["GET"]
)
@token_required
@role_required(*ALLOWED_ROLES)
def get_resource(resource_id):

    resource = CloudResource.query.get(
        resource_id
    )

    if not resource:
        return jsonify({
            "message": "Cloud resource not found"
        }), 404

    return jsonify(
        serialize_resource(resource)
    ), 200


@cloud_resource_bp.route(
    "/<int:resource_id>",
    methods=["PATCH"]
)
@token_required
@role_required(*ALLOWED_ROLES)
def update_resource(resource_id):

    resource = CloudResource.query.get(
        resource_id
    )

    if not resource:
        return jsonify({
            "message": "Cloud resource not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    numeric_fields = [
        "cpu_capacity",
        "memory_capacity",
        "storage_capacity",
        "network_capacity",
        "current_cpu_usage",
        "current_memory_usage",
        "current_storage_usage",
        "current_network_usage"
    ]

    try:

        for field in [
            "resource_name",
            "resource_type",
            "provider",
            "region",
            "status"
        ]:
            if field in data:
                setattr(
                    resource,
                    field,
                    data[field]
                )

        for field in numeric_fields:
            if field in data:
                setattr(
                    resource,
                    field,
                    float(data[field])
                )

        db.session.commit()

        return jsonify({
            "message": "Cloud resource updated successfully",
            "resource": serialize_resource(resource)
        }), 200

    except (TypeError, ValueError):

        db.session.rollback()

        return jsonify({
            "message": "Numeric fields must contain numbers"
        }), 400

    except Exception as error:

        db.session.rollback()

        return jsonify({
            "message": "Failed to update cloud resource",
            "error": str(error)
        }), 500


@cloud_resource_bp.route(
    "/<int:resource_id>",
    methods=["DELETE"]
)
@token_required
@role_required(*ALLOWED_ROLES)
def delete_resource(resource_id):

    resource = CloudResource.query.get(
        resource_id
    )

    if not resource:
        return jsonify({
            "message": "Cloud resource not found"
        }), 404

    try:

        db.session.delete(resource)
        db.session.commit()

        return jsonify({
            "message": "Cloud resource deleted successfully"
        }), 200

    except Exception as error:

        db.session.rollback()

        return jsonify({
            "message": "Failed to delete cloud resource",
            "error": str(error)
        }), 500