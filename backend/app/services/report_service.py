from sqlalchemy import func

from app.extensions import db
from app.models.machine import Machine
from app.models.sensor import Sensor
from app.models.sensor_reading import SensorReading
from app.models.alert import Alert
from app.models.machine_prediction import MachinePrediction
from app.models.cloud_resource import CloudResource
from app.models.optimization_recommendation import (
    OptimizationRecommendation
)


def get_machine_report(machine_id):
    """
    Generate a complete machine report.
    """

    machine = Machine.query.get(machine_id)

    if not machine:
        raise ValueError("Machine not found")

    sensors = (
        Sensor.query
        .filter_by(machine_id=machine_id)
        .all()
    )

    sensor_reports = []

    for sensor in sensors:

        statistics = (
            db.session.query(
                func.count(SensorReading.id),
                func.avg(SensorReading.value),
                func.min(SensorReading.value),
                func.max(SensorReading.value)
            )
            .filter(
                SensorReading.sensor_id == sensor.id
            )
            .first()
        )

        latest = (
            SensorReading.query
            .filter_by(sensor_id=sensor.id)
            .order_by(
                SensorReading.timestamp.desc()
            )
            .first()
        )

        sensor_reports.append({
            "sensor_id": sensor.id,
            "sensor_type": sensor.sensor_type,
            "unit": sensor.unit,
            "total_readings": statistics[0] or 0,
            "average": round(
                float(statistics[1]), 2
            ) if statistics[1] is not None else None,
            "minimum": round(
                float(statistics[2]), 2
            ) if statistics[2] is not None else None,
            "maximum": round(
                float(statistics[3]), 2
            ) if statistics[3] is not None else None,
            "latest_value": (
                float(latest.value)
                if latest
                else None
            ),
            "latest_timestamp": (
                latest.timestamp
                if latest
                else None
            )
        })

    latest_prediction = (
        MachinePrediction.query
        .filter_by(machine_id=machine_id)
        .order_by(
            MachinePrediction.created_at.desc()
        )
        .first()
    )

    alerts = (
        Alert.query
        .filter_by(machine_id=machine_id)
        .order_by(
            Alert.created_at.desc()
        )
        .limit(20)
        .all()
    )

    active_alerts = [
        alert
        for alert in alerts
        if alert.status in [
            "ACTIVE",
            "ACKNOWLEDGED"
        ]
    ]

    return {
        "machine": {
            "id": machine.id,
            "name": machine.name
        },

        "sensors": sensor_reports,

        "machine_health": (
            {
                "failure_prediction":
                    latest_prediction.failure_prediction,

                "failure_probability":
                    latest_prediction.failure_probability,

                "risk_level":
                    latest_prediction.risk_level,

                "is_anomaly":
                    latest_prediction.is_anomaly,

                "anomaly_score":
                    latest_prediction.anomaly_score,

                "last_updated":
                    latest_prediction.created_at
            }
            if latest_prediction
            else None
        ),

        "alerts": {
            "total": len(alerts),
            "active": len(active_alerts),
            "resolved": len([
                alert
                for alert in alerts
                if alert.status == "RESOLVED"
            ])
        }
    }


def get_sensor_report(sensor_id):
    """
    Generate statistics for one sensor.
    """

    sensor = Sensor.query.get(sensor_id)

    if not sensor:
        raise ValueError("Sensor not found")

    statistics = (
        db.session.query(
            func.count(SensorReading.id),
            func.avg(SensorReading.value),
            func.min(SensorReading.value),
            func.max(SensorReading.value)
        )
        .filter(
            SensorReading.sensor_id == sensor_id
        )
        .first()
    )

    latest = (
        SensorReading.query
        .filter_by(sensor_id=sensor_id)
        .order_by(
            SensorReading.timestamp.desc()
        )
        .first()
    )

    return {
        "sensor": {
            "id": sensor.id,
            "sensor_type": sensor.sensor_type,
            "unit": sensor.unit,
            "machine_id": sensor.machine_id
        },

        "statistics": {
            "total_readings": statistics[0] or 0,
            "average": round(
                float(statistics[1]), 2
            ) if statistics[1] is not None else None,
            "minimum": round(
                float(statistics[2]), 2
            ) if statistics[2] is not None else None,
            "maximum": round(
                float(statistics[3]), 2
            ) if statistics[3] is not None else None
        },

        "latest_reading": (
            {
                "value": float(latest.value),
                "timestamp": latest.timestamp
            }
            if latest
            else None
        )
    }


def get_alert_report():
    """
    Generate alert summary.
    """

    total = Alert.query.count()

    active = (
        Alert.query
        .filter(
            Alert.status == "ACTIVE"
        )
        .count()
    )

    acknowledged = (
        Alert.query
        .filter(
            Alert.status == "ACKNOWLEDGED"
        )
        .count()
    )

    resolved = (
        Alert.query
        .filter(
            Alert.status == "RESOLVED"
        )
        .count()
    )

    critical = (
        Alert.query
        .filter(
            Alert.severity == "CRITICAL"
        )
        .count()
    )

    warning = (
        Alert.query
        .filter(
            Alert.severity == "WARNING"
        )
        .count()
    )

    info = (
        Alert.query
        .filter(
            Alert.severity == "INFO"
        )
        .count()
    )

    return {
        "summary": {
            "total": total,
            "active": active,
            "acknowledged": acknowledged,
            "resolved": resolved
        },

        "severity": {
            "critical": critical,
            "warning": warning,
            "info": info
        }
    }


def get_optimization_report():
    """
    Generate cloud resource optimization summary.
    """

    resources = CloudResource.query.all()

    recommendations = (
        OptimizationRecommendation.query
        .order_by(
            OptimizationRecommendation.created_at.desc()
        )
        .all()
    )

    pending = [
        recommendation
        for recommendation in recommendations
        if recommendation.status == "PENDING"
    ]

    acknowledged = [
        recommendation
        for recommendation in recommendations
        if recommendation.status == "ACKNOWLEDGED"
    ]

    resolved = [
        recommendation
        for recommendation in recommendations
        if recommendation.status == "RESOLVED"
    ]

    total_savings = sum(
        float(
            recommendation.estimated_monthly_savings
            or 0
        )
        for recommendation in recommendations
    )

    return {
        "resources": {
            "total": len(resources),
            "active": len([
                resource
                for resource in resources
                if resource.status == "ACTIVE"
            ])
        },

        "recommendations": {
            "total": len(recommendations),
            "pending": len(pending),
            "acknowledged": len(acknowledged),
            "resolved": len(resolved)
        },

        "estimated_monthly_savings": round(
            total_savings,
            2
        )
    }