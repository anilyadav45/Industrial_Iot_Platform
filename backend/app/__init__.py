from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, migrate
from app.routes.health_routes import health_bp
from app.routes.auth_routes import auth_bp
from app.routes.user_routes import user_bp
from app.routes.admin_routes import admin_bp
from app.routes.organization_routes import organization_bp
from app.routes.factory_routes import factory_bp
from app.routes.production_line_routes import production_line_bp
from app.routes.machine_routes import machine_bp
from app.routes.sensor_routes import sensor_bp
from app.routes.sensor_reading_routes import sensor_reading_bp
from app.routes.dataset_routes import dataset_bp
from app.routes.analytics_routes import analytics_bp


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
    app.register_blueprint(admin_bp)
    app.register_blueprint(organization_bp)
    app.register_blueprint(factory_bp)
    app.register_blueprint(production_line_bp)
    app.register_blueprint(machine_bp)
    app.register_blueprint(sensor_bp)
    app.register_blueprint(sensor_reading_bp)
    app.register_blueprint(dataset_bp)
    app.register_blueprint(analytics_bp)

    return app