from app.extensions import db


class MachinePrediction(db.Model):
    __tablename__ = "machine_predictions"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    machine_id = db.Column(
        db.Integer,
        db.ForeignKey("machines.id"),
        nullable=False
    )

    air_temperature = db.Column(
        db.Float,
        nullable=False
    )

    process_temperature = db.Column(
        db.Float,
        nullable=False
    )

    rotational_speed = db.Column(
        db.Float,
        nullable=False
    )

    torque = db.Column(
        db.Float,
        nullable=False
    )

    tool_wear = db.Column(
        db.Float,
        nullable=False
    )

    failure_prediction = db.Column(
        db.Integer,
        nullable=False
    )

    failure_probability = db.Column(
        db.Float,
        nullable=False
    )

    risk_level = db.Column(
        db.String(30),
        nullable=False
    )

    is_anomaly = db.Column(
        db.Boolean,
        nullable=False
    )

    anomaly_score = db.Column(
        db.Float,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    machine = db.relationship(
        "Machine",
        back_populates="predictions"
    )