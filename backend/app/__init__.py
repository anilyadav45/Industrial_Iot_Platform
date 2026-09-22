from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, migrate
from app.routes.health_routes import health_bp
from app.routes.auth_routes import auth_bp
from app.routes.user_routes import user_bp

import app.models


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)

    return app