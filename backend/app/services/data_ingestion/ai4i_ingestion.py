import os
import pandas as pd

from app.extensions import db
from app.models.dataset import Dataset
from app.models.machine import Machine
from app.models.sensor import Sensor
from app.models.sensor_reading import SensorReading


DATASET_PATH = os.path.join(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(
                os.path.dirname(__file__)
            )
        )
    ),
    "datasets",
    "ai4i2020.csv"
)


def load_ai4i_dataset(dataset_id):
    """
    Load AI4I 2020 dataset into the application database.
    """

    dataset = Dataset.query.get(dataset_id)

    if not dataset:
        raise ValueError("Dataset not found")

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(
            f"Dataset file not found: {DATASET_PATH}"
        )

    dataset.status = "PROCESSING"
    db.session.commit()

    try:
        # --------------------------------
        # 1. Read CSV
        # --------------------------------

        df = pd.read_csv(DATASET_PATH)

        # --------------------------------
        # 2. Validate required columns
        # --------------------------------

        required_columns = [
            "Air temperature [K]",
            "Process temperature [K]",
            "Rotational speed [rpm]",
            "Torque [Nm]",
            "Tool wear [min]",
            "Machine failure"
        ]

        missing_columns = [
            column
            for column in required_columns
            if column not in df.columns
        ]

        if missing_columns:
            raise ValueError(
                f"Missing columns: {missing_columns}"
            )

        # --------------------------------
        # 3. Remove invalid rows
        # --------------------------------

        df = df.dropna(
            subset=required_columns
        )

        # --------------------------------
        # 4. Get/create machine
        # --------------------------------

        machine = Machine.query.filter_by(
            machine_code="AI4I-MACHINE-001"
        ).first()

        if not machine:

            machine = Machine(
                machine_code="AI4I-MACHINE-001",
                name="AI4I Simulated Machine",
                machine_type="Predictive Maintenance",
                status="ONLINE",
                factory_id=1
            )

            db.session.add(machine)
            db.session.flush()

        # --------------------------------
        # 5. Create sensors
        # --------------------------------

        sensor_definitions = [
            (
                "AI4I-TEMP-AIR",
                "AIR_TEMPERATURE",
                "K"
            ),
            (
                "AI4I-TEMP-PROCESS",
                "PROCESS_TEMPERATURE",
                "K"
            ),
            (
                "AI4I-RPM",
                "ROTATIONAL_SPEED",
                "rpm"
            ),
            (
                "AI4I-TORQUE",
                "TORQUE",
                "Nm"
            ),
            (
                "AI4I-TOOL-WEAR",
                "TOOL_WEAR",
                "min"
            ),
        ]

        sensors = {}

        for sensor_code, sensor_type, unit in sensor_definitions:

            sensor = Sensor.query.filter_by(
                sensor_code=sensor_code
            ).first()

            if not sensor:

                sensor = Sensor(
                    sensor_code=sensor_code,
                    sensor_type=sensor_type,
                    unit=unit,
                    status="ACTIVE",
                    machine_id=machine.id
                )

                db.session.add(sensor)
                db.session.flush()

            sensors[sensor_type] = sensor

        # --------------------------------
        # 6. Create sensor readings
        # --------------------------------

        readings = []

        for _, row in df.iterrows():

            readings.extend([
                SensorReading(
                    sensor_id=sensors[
                        "AIR_TEMPERATURE"
                    ].id,
                    value=float(
                        row["Air temperature [K]"]
                    )
                ),

                SensorReading(
                    sensor_id=sensors[
                        "PROCESS_TEMPERATURE"
                    ].id,
                    value=float(
                        row["Process temperature [K]"]
                    )
                ),

                SensorReading(
                    sensor_id=sensors[
                        "ROTATIONAL_SPEED"
                    ].id,
                    value=float(
                        row["Rotational speed [rpm]"]
                    )
                ),

                SensorReading(
                    sensor_id=sensors[
                        "TORQUE"
                    ].id,
                    value=float(
                        row["Torque [Nm]"]
                    )
                ),

                SensorReading(
                    sensor_id=sensors[
                        "TOOL_WEAR"
                    ].id,
                    value=float(
                        row["Tool wear [min]"]
                    )
                ),
            ])

        db.session.bulk_save_objects(readings)

        # --------------------------------
        # 7. Update dataset
        # --------------------------------

        dataset.records_count = len(df)
        dataset.status = "COMPLETED"

        db.session.commit()

        return {
            "dataset_id": dataset.id,
            "records_processed": len(df),
            "sensor_readings_created": len(readings),
            "status": dataset.status
        }

    except Exception as error:

        db.session.rollback()

        dataset.status = "FAILED"
        db.session.commit()

        raise error