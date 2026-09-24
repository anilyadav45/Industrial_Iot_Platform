from app.extensions import db


class Dataset(db.Model):
    __tablename__ = "datasets"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(150),
        nullable=False
    )

    source = db.Column(
        db.String(255)
    )

    dataset_type = db.Column(
        db.String(100),
        nullable=False
    )

    file_name = db.Column(
        db.String(255)
    )

    records_count = db.Column(
        db.Integer,
        default=0,
        nullable=False
    )

    status = db.Column(
        db.String(30),
        default="PENDING",
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )