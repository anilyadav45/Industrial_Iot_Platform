from sqlalchemy import func

from app.extensions import db
from app.models.sensor import Sensor
from app.models.sensor_reading import SensorReading


def get_overview():

    total_readings = SensorReading.query.count()

    total_sensors = Sensor.query.count()

    average_value = (
        db.session.query(
            func.avg(SensorReading.value)
        ).scalar()
    )

    minimum_value = (
        db.session.query(
            func.min(SensorReading.value)
        ).scalar()
    )

    maximum_value = (
        db.session.query(
            func.max(SensorReading.value)
        ).scalar()
    )

    return {
        "total_readings": total_readings,
        "total_sensors": total_sensors,
        "average_value": (
            round(float(average_value), 2)
            if average_value is not None
            else 0
        ),
        "minimum_value": (
            round(float(minimum_value), 2)
            if minimum_value is not None
            else 0
        ),
        "maximum_value": (
            round(float(maximum_value), 2)
            if maximum_value is not None
            else 0
        ),
    }


def get_sensor_statistics():

    sensors = Sensor.query.all()

    results = []

    for sensor in sensors:

        stats = db.session.query(
            func.count(SensorReading.id),
            func.avg(SensorReading.value),
            func.min(SensorReading.value),
            func.max(SensorReading.value),
        ).filter(
            SensorReading.sensor_id == sensor.id
        ).first()

        results.append({
            "sensor_id": sensor.id,
            "sensor_code": sensor.sensor_code,
            "sensor_type": sensor.sensor_type,
            "unit": sensor.unit,
            "reading_count": stats[0] or 0,
            "average": (
                round(float(stats[1]), 2)
                if stats[1] is not None
                else 0
            ),
            "minimum": (
                round(float(stats[2]), 2)
                if stats[2] is not None
                else 0
            ),
            "maximum": (
                round(float(stats[3]), 2)
                if stats[3] is not None
                else 0
            ),
        })

    return results


def get_recent_readings(limit=20):

    readings = (
        SensorReading.query
        .order_by(
            SensorReading.timestamp.desc()
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "id": reading.id,
            "sensor_id": reading.sensor_id,
            "value": reading.value,
            "timestamp": reading.timestamp,
        }
        for reading in readings
    ]