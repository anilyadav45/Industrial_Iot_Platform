from app.extensions import db


class Organization(db.Model):
    __tablename__ = "organizations"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False)
    code = db.Column(db.String(50), unique=True, nullable=False)

    is_active = db.Column(db.Boolean, default=True, nullable=False)

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    users = db.relationship("User", back_populates="organization")
    factories = db.relationship(
        "Factory",
        back_populates="organization",
        cascade="all, delete-orphan"
    )