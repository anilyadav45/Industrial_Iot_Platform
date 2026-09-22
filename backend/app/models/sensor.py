from app.extensions import db


class Sensor(db.Model):
    __tablename__ = "sensors"

    id = db.Column(db.Integer, primary_key=True)

    sensor_code = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    sensor_type = db.Column(
        db.String(100),
        nullable=False
    )

    unit = db.Column(db.String(50))

    status = db.Column(
        db.String(30),
        default="ACTIVE",
        nullable=False
    )

    machine_id = db.Column(
        db.Integer,
        db.ForeignKey("machines.id"),
        nullable=False
    )

    machine = db.relationship(
        "Machine",
        back_populates="sensors"
    )