import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    BrainCircuit,
    CheckCircle2,
    Cpu,
    Gauge,
    Thermometer,
    Wrench,
} from "lucide-react";

import { getMachineReport } from "../../services/reportService";

interface Sensor {
    sensor_id: number;
    sensor_type: string;
    unit: string;
    average: number;
    minimum: number;
    maximum: number;
    latest_value: number;
    latest_timestamp: string;
    total_readings: number;
}

interface MachineHealth {
    anomaly_score: number;
    failure_prediction: number;
    failure_probability: number;
    is_anomaly: boolean;
    last_updated: string;
    risk_level: string;
}

interface MachineReport {
    machine: {
        id: number;
        name: string;
    };
    alerts: {
        active: number;
        resolved: number;
        total: number;
    };
    machine_health: MachineHealth | null;
    sensors: Sensor[];
}

function formatSensorName(type: string) {
    return type
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date: string) {
    if (!date) return "—";

    return new Date(date).toLocaleString();
}

export default function MachineDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [report, setReport] = useState<MachineReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadMachineReport = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMachineReport(Number(id));
                setReport(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load machine details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadMachineReport();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-slate-500">Loading machine details...</div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <p className="font-semibold text-red-700">
                    {error || "Machine not found."}
                </p>

                <button
                    onClick={() => navigate("/admin/machines")}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                    <ArrowLeft size={16} />
                    Back to Machines
                </button>
            </div>
        );
    }

    const health = report.machine_health;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <button
                        onClick={() => navigate("/admin/machines")}
                        className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
                    >
                        <ArrowLeft size={16} />
                        Back to Machines
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                            <Cpu size={24} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {report.machine.name}
                            </h1>

                            <p className="text-sm text-slate-500">
                                Machine ID: {report.machine.id}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ML Health Button */}
                <button
                    onClick={() =>
                        navigate(`/admin/machines/${report.machine.id}/ml`)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700"
                >
                    <BrainCircuit size={17} />
                    ML Health
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Active Alerts
                        </p>

                        <AlertTriangle className="text-amber-500" size={20} />
                    </div>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                        {report.alerts.active}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {report.alerts.total} total alerts
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Sensors
                        </p>

                        <Activity className="text-blue-500" size={20} />
                    </div>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                        {report.sensors.length}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Connected sensor streams
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Risk Level
                        </p>

                        <BrainCircuit className="text-purple-500" size={20} />
                    </div>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                        {health?.risk_level || "N/A"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Based on latest ML prediction
                    </p>
                </div>
            </div>

            {/* Machine Health */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                        <BrainCircuit size={20} />
                    </div>

                    <div>
                        <h2 className="font-bold text-slate-900">
                            Machine Health
                        </h2>

                        <p className="text-sm text-slate-500">
                            Latest predictive maintenance analysis
                        </p>
                    </div>
                </div>

                {health ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Failure Probability
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {(health.failure_probability * 100).toFixed(1)}%
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Anomaly Score
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {health.anomaly_score.toFixed(4)}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Anomaly Detected
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                                {health.is_anomaly ? (
                                    <>
                                        <AlertTriangle size={20} className="text-amber-500" />
                                        <span className="font-bold text-amber-600">
                                            Yes
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={20} className="text-green-500" />
                                        <span className="font-bold text-green-600">
                                            No
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Last Analysis
                            </p>

                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                {formatDate(health.last_updated)}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">
                        No ML health data available.
                    </p>
                )}
            </div>

            {/* Sensors */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-6">
                    <div className="flex items-center gap-3">
                        <Gauge className="text-blue-600" size={21} />

                        <div>
                            <h2 className="font-bold text-slate-900">
                                Sensor Statistics
                            </h2>

                            <p className="text-sm text-slate-500">
                                Latest readings and historical statistics
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Sensor</th>
                                <th className="px-6 py-4">Latest</th>
                                <th className="px-6 py-4">Average</th>
                                <th className="px-6 py-4">Minimum</th>
                                <th className="px-6 py-4">Maximum</th>
                                <th className="px-6 py-4">Readings</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {report.sensors.map((sensor) => (
                                <tr
                                    key={sensor.sensor_id}
                                    className="hover:bg-slate-50"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-slate-100 p-2">
                                                {sensor.sensor_type.includes("TEMPERATURE") ? (
                                                    <Thermometer size={17} />
                                                ) : sensor.sensor_type === "TOOL_WEAR" ? (
                                                    <Wrench size={17} />
                                                ) : (
                                                    <Activity size={17} />
                                                )}
                                            </div>

                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {formatSensorName(sensor.sensor_type)}
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    Sensor #{sensor.sensor_id}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 font-semibold text-slate-900">
                                        {sensor.latest_value?.toFixed(2)} {sensor.unit}
                                    </td>

                                    <td className="px-6 py-4 text-slate-600">
                                        {sensor.average?.toFixed(2)}
                                    </td>

                                    <td className="px-6 py-4 text-slate-600">
                                        {sensor.minimum?.toFixed(2)}
                                    </td>

                                    <td className="px-6 py-4 text-slate-600">
                                        {sensor.maximum?.toFixed(2)}
                                    </td>

                                    <td className="px-6 py-4 text-slate-600">
                                        {sensor.total_readings?.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Alert Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                    <AlertTriangle className="text-amber-500" size={21} />

                    <div>
                        <h2 className="font-bold text-slate-900">
                            Alert Summary
                        </h2>

                        <p className="text-sm text-slate-500">
                            Current alert lifecycle status
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                        <p className="text-sm text-red-600">
                            Active
                        </p>

                        <p className="mt-1 text-2xl font-bold text-red-700">
                            {report.alerts.active}
                        </p>
                    </div>

                    <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                        <p className="text-sm text-green-600">
                            Resolved
                        </p>

                        <p className="mt-1 text-2xl font-bold text-green-700">
                            {report.alerts.resolved}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-slate-600">
                            Total
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {report.alerts.total}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}