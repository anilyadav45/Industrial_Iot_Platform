from app.extensions import db


class Alert(db.Model):
    __tablename__ = "alerts"

    id = db.Column(db.Integer, primary_key=True)

    # Sensor-level alert
    sensor_id = db.Column(
        db.Integer,
        db.ForeignKey("sensors.id"),
        nullable=True
    )

    # Machine-level alert
    machine_id = db.Column(
        db.Integer,
        db.ForeignKey("machines.id"),
        nullable=True
    )

    alert_type = db.Column(
        db.String(100),
        nullable=False
    )

    severity = db.Column(
        db.String(30),
        nullable=False,
        default="WARNING"
    )

    message = db.Column(
        db.String(255),
        nullable=False
    )

    value = db.Column(
        db.Float,
        nullable=False
    )

    threshold = db.Column(
        db.Float,
        nullable=False
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="ACTIVE"
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

    sensor = db.relationship(
        "Sensor",
        back_populates="alerts"
    )

    machine = db.relationship(
        "Machine",
        back_populates="alerts"
    )

    acknowledged_user = db.relationship(
        "User",
        foreign_keys=[acknowledged_by]
    )

    resolved_user = db.relationship(
        "User",
        foreign_keys=[resolved_by]
    )