from app.extensions import db


class ProductionLine(db.Model):
    __tablename__ = "production_lines"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False)

    factory_id = db.Column(
        db.Integer,
        db.ForeignKey("factories.id"),
        nullable=False
    )

    factory = db.relationship(
        "Factory",
        back_populates="production_lines"
    )

    machines = db.relationship(
        "Machine",
        back_populates="production_line",
        cascade="all, delete-orphan"
    )