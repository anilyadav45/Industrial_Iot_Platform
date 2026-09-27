import random

from app.extensions import db
from app.models.machine import Machine
from app.models.sensor import Sensor
from app.models.sensor_reading import SensorReading
from app.services.alert_service import check_sensor_reading


SIMULATION_SENSOR_TYPES = {
    "AIR_TEMPERATURE": {
        "base": 300.0,
        "variation": 2.0,
        "unit": "K"
    },
    "PROCESS_TEMPERATURE": {
        "base": 310.0,
        "variation": 2.0,
        "unit": "K"
    },
    "ROTATIONAL_SPEED": {
        "base": 1500.0,
        "variation": 150.0,
        "unit": "rpm"
    },
    "TORQUE": {
        "base": 40.0,
        "variation": 5.0,
        "unit": "Nm"
    },
    "TOOL_WEAR": {
        "base": 100.0,
        "variation": 20.0,
        "unit": "min"
    }
}


def get_simulation_machine(machine_id=None):
    """
    Get the machine used for simulation.

    If machine_id is provided, use that machine.
    Otherwise use the AI4I simulated machine.
    """

    if machine_id is not None:
        machine = Machine.query.get(machine_id)

        if not machine:
            raise ValueError("Machine not found")

        return machine

    machine = (
        Machine.query
        .filter(
            Machine.name == "AI4I Simulated Machine"
        )
        .first()
    )

    if not machine:
        raise ValueError(
            "AI4I Simulated Machine not found"
        )

    return machine


def get_simulation_sensors(machine_id):
    """
    Return the five AI4I sensor types attached
    to the selected machine.
    """

    sensors = (
        Sensor.query
        .filter(
            Sensor.machine_id == machine_id,
            Sensor.sensor_type.in_(
                list(SIMULATION_SENSOR_TYPES.keys())
            )
        )
        .all()
    )

    sensor_map = {
        sensor.sensor_type: sensor
        for sensor in sensors
    }

    required_types = list(
        SIMULATION_SENSOR_TYPES.keys()
    )

    missing = [
        sensor_type
        for sensor_type in required_types
        if sensor_type not in sensor_map
    ]

    if missing:
        raise ValueError(
            "Missing simulation sensors: "
            + ", ".join(missing)
        )

    return sensor_map


def generate_sensor_value(sensor_type):
    """
    Generate a realistic simulated sensor value.
    """

    config = SIMULATION_SENSOR_TYPES.get(
        sensor_type
    )

    if not config:
        raise ValueError(
            f"Unsupported sensor type: {sensor_type}"
        )

    value = random.gauss(
        config["base"],
        config["variation"]
    )

    return round(
        max(value, 0),
        2
    )


def generate_abnormal_value(sensor_type):
    """
    Generate an intentionally abnormal value.

    Used for demonstrations and alert testing.
    """

    abnormal_values = {
        "AIR_TEMPERATURE": 305.5,
        "PROCESS_TEMPERATURE": 314.0,
        "ROTATIONAL_SPEED": 2800.0,
        "TORQUE": 75.0,
        "TOOL_WEAR": 220.0
    }

    if sensor_type not in abnormal_values:
        raise ValueError(
            f"Unsupported sensor type: {sensor_type}"
        )

    return abnormal_values[sensor_type]


def generate_simulated_readings(
    machine_id=None,
    abnormal=False
):
    """
    Generate one reading for each AI4I sensor.

    Returns the generated readings and any alerts.
    """

    machine = get_simulation_machine(
        machine_id
    )

    sensors = get_simulation_sensors(
        machine.id
    )

    generated_readings = []
    generated_alerts = []

    for sensor_type, sensor in sensors.items():

        if abnormal:
            value = generate_abnormal_value(
                sensor_type
            )
        else:
            value = generate_sensor_value(
                sensor_type
            )

        reading = SensorReading(
            sensor_id=sensor.id,
            value=value
        )

        db.session.add(reading)

        db.session.flush()

        alert = check_sensor_reading(
            sensor_id=sensor.id,
            value=value
        )

        generated_readings.append({
            "sensor_id": sensor.id,
            "sensor_type": sensor_type,
            "value": value,
            "unit": sensor.unit
        })

        if alert:
            generated_alerts.append({
                "id": alert.id,
                "alert_type": alert.alert_type,
                "severity": alert.severity,
                "status": alert.status,
                "sensor_id": alert.sensor_id,
                "value": alert.value,
                "threshold": alert.threshold
            })

    db.session.commit()

    return {
        "machine_id": machine.id,
        "machine_name": machine.name,
        "abnormal": abnormal,
        "readings": generated_readings,
        "alerts": generated_alerts
    }