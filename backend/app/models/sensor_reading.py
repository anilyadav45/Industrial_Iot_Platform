from app.extensions import db


class SensorReading(db.Model):
    __tablename__ = "sensor_readings"

    id = db.Column(db.Integer, primary_key=True)

    sensor_id = db.Column(
        db.Integer,
        db.ForeignKey("sensors.id"),
        nullable=False
    )

    timestamp = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    value = db.Column(
        db.Float,
        nullable=False
    )

    sensor = db.relationship(
        "Sensor",
        back_populates="readings"
    )