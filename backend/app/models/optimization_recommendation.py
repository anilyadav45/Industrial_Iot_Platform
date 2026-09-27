from app.extensions import db


class OptimizationRecommendation(db.Model):
    __tablename__ = "optimization_recommendations"

    id = db.Column(db.Integer, primary_key=True)

    resource_id = db.Column(
        db.Integer,
        db.ForeignKey("cloud_resources.id"),
        nullable=False
    )

    recommendation_type = db.Column(
        db.String(50),
        nullable=False
    )

    severity = db.Column(
        db.String(30),
        nullable=False,
        default="INFO"
    )

    title = db.Column(
        db.String(200),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=False
    )

    current_utilization = db.Column(
        db.Float,
        nullable=False
    )

    recommended_utilization = db.Column(
        db.Float,
        nullable=True
    )

    estimated_monthly_savings = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="PENDING"
    )

    acknowledged_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    acknowledged_at = db.Column(
        db.DateTime,
        nullable=True
    )

    resolved_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    resolved_at = db.Column(
        db.DateTime,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    resource = db.relationship(
        "CloudResource",
        back_populates="recommendations"
    )

    acknowledged_user = db.relationship(
        "User",
        foreign_keys=[acknowledged_by]
    )

    resolved_user = db.relationship(
        "User",
        foreign_keys=[resolved_by]
    )