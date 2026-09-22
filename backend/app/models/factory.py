from app.extensions import db


class Factory(db.Model):
    __tablename__ = "factories"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False)
    location = db.Column(db.String(255))

    organization_id = db.Column(
        db.Integer,
        db.ForeignKey("organizations.id"),
        nullable=False
    )

    is_active = db.Column(db.Boolean, default=True, nullable=False)

    organization = db.relationship(
        "Organization",
        back_populates="factories"
    )

    production_lines = db.relationship(
        "ProductionLine",
        back_populates="factory",
        cascade="all, delete-orphan"
    )

    users = db.relationship("User", back_populates="factory")