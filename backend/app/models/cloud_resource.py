from app.extensions import db


class CloudResource(db.Model):
    __tablename__ = "cloud_resources"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    resource_name = db.Column(
        db.String(150),
        nullable=False
    )

    resource_type = db.Column(
        db.String(50),
        nullable=False
    )

    provider = db.Column(
        db.String(50),
        nullable=False,
        default="SIMULATED"
    )

    region = db.Column(
        db.String(100),
        nullable=True
    )

    cpu_capacity = db.Column(
        db.Float,
        nullable=False
    )

    memory_capacity = db.Column(
        db.Float,
        nullable=False
    )

    storage_capacity = db.Column(
        db.Float,
        nullable=False
    )

    network_capacity = db.Column(
        db.Float,
        nullable=False
    )

    current_cpu_usage = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    current_memory_usage = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    current_storage_usage = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    current_network_usage = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="ACTIVE"
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
        nullable=False
    )

    recommendations = db.relationship(
        "OptimizationRecommendation",
        back_populates="resource",
        cascade="all, delete-orphan"
    )