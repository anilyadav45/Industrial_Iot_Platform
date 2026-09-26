from app.extensions import db


class Machine(db.Model):
    __tablename__ = "machines"

    id = db.Column(db.Integer, primary_key=True)

    machine_code = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    name = db.Column(
        db.String(150),
        nullable=False
    )

    machine_type = db.Column(db.String(100))

    status = db.Column(
        db.String(30),
        default="OFFLINE",
        nullable=False
    )

    factory_id = db.Column(
        db.Integer,
        db.ForeignKey("factories.id"),
        nullable=False
    )

    production_line_id = db.Column(
        db.Integer,
        db.ForeignKey("production_lines.id"),
        nullable=True
    )

    factory = db.relationship("Factory")

    production_line = db.relationship(
        "ProductionLine",
        back_populates="machines"
    )

    sensors = db.relationship(
        "Sensor",
        back_populates="machine",
        cascade="all, delete-orphan"
    )

    alerts = db.relationship(
    "Alert",
    back_populates="machine",
    cascade="all, delete-orphan"
    )

    predictions = db.relationship(
    "MachinePrediction",
    back_populates="machine",
    cascade="all, delete-orphan"
    )