from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.dataset import Dataset
from app.utils.decorators import token_required, role_required
from app.services.data_ingestion.ai4i_ingestion import (
    load_ai4i_dataset
)


dataset_bp = Blueprint(
    "datasets",
    __name__,
    url_prefix="/api/datasets"
)


@dataset_bp.route("", methods=["POST"])
@token_required
@role_required("SUPER_ADMIN", "FACTORY_ADMIN", "ENGINEER")
def create_dataset():

    data = request.get_json()

    name = data.get("name")
    source = data.get("source")
    dataset_type = data.get("dataset_type")
    file_name = data.get("file_name")

    if not name or not dataset_type:
        return jsonify({
            "message": "name and dataset_type are required"
        }), 400

    dataset = Dataset(
        name=name,
        source=source,
        dataset_type=dataset_type,
        file_name=file_name,
        status="PENDING"
    )

    db.session.add(dataset)
    db.session.commit()

    return jsonify({
        "message": "Dataset created",
        "dataset": {
            "id": dataset.id,
            "name": dataset.name,
            "source": dataset.source,
            "dataset_type": dataset.dataset_type,
            "file_name": dataset.file_name,
            "records_count": dataset.records_count,
            "status": dataset.status,
            "created_at": dataset.created_at
        }
    }), 201


@dataset_bp.route("", methods=["GET"])
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER",
    "OPERATOR"
)
def get_datasets():

    datasets = (
        Dataset.query
        .order_by(Dataset.created_at.desc())
        .all()
    )

    return jsonify([
        {
            "id": dataset.id,
            "name": dataset.name,
            "source": dataset.source,
            "dataset_type": dataset.dataset_type,
            "file_name": dataset.file_name,
            "records_count": dataset.records_count,
            "status": dataset.status,
            "created_at": dataset.created_at
        }
        for dataset in datasets
    ]), 200


@dataset_bp.route("/<int:dataset_id>", methods=["GET"])
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER",
    "OPERATOR"
)
def get_dataset(dataset_id):

    dataset = Dataset.query.get(dataset_id)

    if not dataset:
        return jsonify({
            "message": "Dataset not found"
        }), 404

    return jsonify({
        "id": dataset.id,
        "name": dataset.name,
        "source": dataset.source,
        "dataset_type": dataset.dataset_type,
        "file_name": dataset.file_name,
        "records_count": dataset.records_count,
        "status": dataset.status,
        "created_at": dataset.created_at
    }), 200


@dataset_bp.route(
    "/<int:dataset_id>/ingest",
    methods=["POST"]
)
@token_required
@role_required(
    "SUPER_ADMIN",
    "FACTORY_ADMIN",
    "ENGINEER"
)
def ingest_dataset(dataset_id):

    try:

        result = load_ai4i_dataset(
            dataset_id
        )

        return jsonify({
            "message": "Dataset ingestion completed",
            "result": result
        }), 200

    except FileNotFoundError as error:

        return jsonify({
            "message": str(error)
        }), 404

    except ValueError as error:

        return jsonify({
            "message": str(error)
        }), 400

    except Exception as error:

        return jsonify({
            "message": "Dataset ingestion failed",
            "error": str(error)
        }), 500