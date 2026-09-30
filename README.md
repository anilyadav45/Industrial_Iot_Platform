# Industrial IoT & Cloud Resource Optimization Platform

> A full-stack platform for industrial asset management, sensor monitoring, predictive maintenance, alert management, and simulated cloud-resource optimization.

## Overview

The **Industrial IoT & Cloud Resource Optimization Platform** brings industrial data, machine monitoring, analytics, machine learning, alerts, and resource optimization into one web-based system.

The current implementation is a **dataset-driven and simulated prototype** using the **AI4I 2020 Predictive Maintenance Dataset**, simulated sensor readings, and simulated cloud resources.

## Goals

- Centralize organization, factory, production-line, machine, and sensor management
- Ingest and analyze industrial datasets and sensor readings
- Detect abnormal machine behavior and predict potential failures
- Manage operational alerts and their lifecycle
- Monitor and optimize simulated cloud resources
- Provide reports and audit logs
- Implement secure authentication and role-based access control

## Key Features

### Industrial Asset Management

```text
Organization
  └── Factory
       └── Production Line
            └── Machine
                 └── Sensor
                      └── Sensor Readings
```

### Sensor Monitoring & Analytics

- Sensor data ingestion
- Latest, minimum, maximum, and average readings
- Machine and sensor analytics
- Threshold-based alerts

### Machine Learning

Uses industrial features including:

- Air Temperature
- Process Temperature
- Rotational Speed
- Torque
- Tool Wear

Provides:

- Failure prediction
- Failure probability
- Anomaly score
- Anomaly status
- Risk level

### Alert Management

```text
ACTIVE → ACKNOWLEDGED → RESOLVED
```

Supports `INFO`, `WARNING`, and `CRITICAL` severity levels.

### Cloud Resource Optimization

Simulates monitoring of:

- CPU
- Memory
- Storage
- Network

Generates optimization recommendations and estimated monthly savings.

> The current version does not connect to live AWS, Azure, or GCP infrastructure.

### Authentication & RBAC

- JWT authentication
- Password hashing
- Protected APIs
- Role-based authorization

Roles:

```text
SUPER_ADMIN
FACTORY_ADMIN
ENGINEER
OPERATOR
USER
```

### Reports & Audit Logs

Provides machine, alert, and optimization reports together with audit records for important system activities.

## Architecture

```text
Industrial Data
(AI4I / Sensor Data)
        ↓
Data Ingestion / ETL
        ↓
PostgreSQL
        ↓
 ┌──────┼────────┐
 ↓      ↓        ↓
Analytics  ML   Cloud Analytics
 └──────┼────────┘
        ↓
Alerts & Optimization
        ↓
Flask REST API
        ↓
React Dashboard
```

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide React

**Backend**
- Python
- Flask
- REST APIs
- SQLAlchemy
- Flask-Migrate / Alembic
- JWT
- Werkzeug

**Data & ML**
- PostgreSQL
- Pandas
- NumPy
- Scikit-learn
- AI4I 2020 Predictive Maintenance Dataset

**Development**
- Git / GitHub
- VS Code
- Postman
- Pytest

## Project Structure

```text
industrial-iot-platform/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   ├── migrations/
│   ├── app.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── context/
│   │   └── services/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## Core Modules

| Module | Purpose |
|---|---|
| Authentication | Login and JWT authentication |
| RBAC | Role-based authorization |
| Organizations | Organization management |
| Factories | Factory management |
| Production Lines | Production-line management |
| Machines | Machine management |
| Sensors | Sensor management |
| Sensor Readings | Sensor data storage and analysis |
| Datasets | Dataset management and ingestion |
| Analytics | Machine and sensor analytics |
| ML | Failure prediction and anomaly detection |
| Alerts | Alert lifecycle management |
| Cloud Resources | Simulated resource monitoring |
| Optimization | Resource recommendations |
| Reports | Machine, alert and optimization reports |
| Audit Logs | Activity tracking |

## Data & ML Flow

```text
Dataset / Sensor Data
        ↓
ETL / Data Ingestion
        ↓
PostgreSQL
        ↓
Analytics / ML
        ↓
Prediction & Anomaly Detection
        ↓
Alerts / Recommendations
        ↓
Flask API
        ↓
React Dashboard
```

## API

The backend provides REST endpoints for:

```text
/api/auth
/api/users
/api/organizations
/api/factories
/api/production-lines
/api/machines
/api/sensors
/api/readings
/api/datasets
/api/analytics
/api/alerts
/api/ml
/api/cloud-resources
/api/optimization
/api/reports
/api/audit-logs
/api/health
```

## Testing

The project has been tested across:

- Unit testing
- Integration testing
- Functional testing
- System testing
- White-box testing
- Black-box testing
- API testing
- Frontend integration testing
- Database integrity testing

Major workflows were tested from authentication through monitoring, ML, alerts, optimization, reports, and audit logs.

## Local Setup

### Prerequisites

- Node.js
- npm
- Python 3.x
- PostgreSQL
- Git

### Backend

**Terminal — `backend`**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend:

```text
http://127.0.0.1:5000
```

### Frontend

**Terminal — `frontend`**

```bash
cd frontend
npm install
npm run dev
```

Configure the required PostgreSQL and JWT environment variables before running the backend.

## Current Status

**Feature-complete academic/portfolio prototype.**

Implemented:

- [x] Authentication & RBAC
- [x] Industrial asset management
- [x] Sensor monitoring
- [x] Dataset ingestion
- [x] Analytics
- [x] ML predictions
- [x] Anomaly detection
- [x] Alert lifecycle
- [x] Cloud-resource simulation
- [x] Optimization recommendations
- [x] Reports
- [x] Audit logs
- [x] React dashboard
- [x] Backend API integration
- [x] Database integrity testing

## Limitations

- Sensor data is simulated
- Cloud resources are simulated
- Uses the AI4I 2020 dataset
- No physical industrial sensors yet
- No MQTT / OPC-UA integration yet
- No live AWS/Azure/GCP resource management
- Not intended as a production factory-control system

## Future Development

- Real-time IoT sensor integration
- MQTT / OPC-UA connectivity
- Improved ML models and evaluation
- Model monitoring and retraining
- Real AWS/Azure/GCP integration
- Automated cloud scaling
- Advanced visualization
- Docker / Docker Compose
- CI/CD
- Cloud deployment
- Improved security and scalability

## What I Explored

Working on this project helped me explore how different parts of a software system connect:

**Datasets → ETL → PostgreSQL → REST APIs → Authentication/RBAC → ML → Optimization → React**

It also provided practical experience with Flask, React, PostgreSQL, REST APIs, machine-learning integration, system design, database relationships, and frontend-backend communication.

## Author

**Anil Yadav**  
B.Tech — Computer Science and Engineering

Interested in Software Development, Backend Engineering, Machine Learning, Cloud, and System Design.

## License

Academic and portfolio project.
