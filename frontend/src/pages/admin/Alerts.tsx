import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Eye,
    RefreshCw,
    ShieldAlert,
} from "lucide-react";

import {
    acknowledgeAlert,
    getAlerts,
    resolveAlert,
} from "../../services/alertService";

import { useNavigate } from "react-router-dom";

interface Alert {
    id: number;
    alert_type: string;
    severity: string;
    message: string;
    value: number | null;
    threshold: number | null;
    status: string;
    machine_id: number | null;
    sensor_id: number | null;
    created_at: string;
    acknowledged_at?: string | null;
    resolved_at?: string | null;
}

function formatType(type: string) {
    return type
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date?: string | null) {
    if (!date) return "—";

    return new Date(date).toLocaleString();
}

function severityClass(severity: string) {
    switch (severity.toUpperCase()) {
        case "CRITICAL":
            return "bg-red-100 text-red-700";

        case "WARNING":
            return "bg-amber-100 text-amber-700";

        case "INFO":
            return "bg-blue-100 text-blue-700";

        default:
            return "bg-slate-100 text-slate-700";
    }
}

function statusClass(status: string) {
    switch (status.toUpperCase()) {
        case "ACTIVE":
            return "bg-red-100 text-red-700";

        case "ACKNOWLEDGED":
            return "bg-amber-100 text-amber-700";

        case "RESOLVED":
            return "bg-green-100 text-green-700";

        default:
            return "bg-slate-100 text-slate-700";
    }
}

export default function Alerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [workingId, setWorkingId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const loadAlerts = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAlerts();

            const actualAlerts = Array.isArray(data)
                ? data
                : data?.alerts || [];

            setAlerts(actualAlerts);
        } catch (err) {
            console.error(err);
            setError("Failed to load alerts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlerts();
    }, []);

    const statistics = useMemo(() => {
        return {
            total: alerts.length,
            active: alerts.filter(
                (alert) => alert.status === "ACTIVE"
            ).length,
            acknowledged: alerts.filter(
                (alert) => alert.status === "ACKNOWLEDGED"
            ).length,
            resolved: alerts.filter(
                (alert) => alert.status === "RESOLVED"
            ).length,
        };
    }, [alerts]);

    const handleAcknowledge = async (alertId: number) => {
        try {
            setWorkingId(alertId);
            setError("");

            await acknowledgeAlert(alertId);

            await loadAlerts();
        } catch (err) {
            console.error(err);
            setError("Failed to acknowledge alert.");
        } finally {
            setWorkingId(null);
        }
    };

    const handleResolve = async (alertId: number) => {
        try {
            setWorkingId(alertId);
            setError("");

            await resolveAlert(alertId);

            await loadAlerts();
        } catch (err) {
            console.error(err);
            setError("Failed to resolve alert.");
        } finally {
            setWorkingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Industrial IQ
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-slate-900">
                        Alerts
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Monitor machine and sensor alerts.
                    </p>
                </div>

                <button
                    onClick={loadAlerts}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Total Alerts
                        </p>

                        <ShieldAlert className="text-blue-600" size={21} />
                    </div>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                        {statistics.total}
                    </p>
                </div>

                <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Active
                        </p>

                        <AlertTriangle className="text-red-500" size={21} />
                    </div>

                    <p className="mt-3 text-3xl font-bold text-red-600">
                        {statistics.active}
                    </p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Acknowledged
                        </p>

                        <Clock3 className="text-amber-500" size={21} />
                    </div>

                    <p className="mt-3 text-3xl font-bold text-amber-600">
                        {statistics.acknowledged}
                    </p>
                </div>

                <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Resolved
                        </p>

                        <CheckCircle2 className="text-green-500" size={21} />
                    </div>

                    <p className="mt-3 text-3xl font-bold text-green-600">
                        {statistics.resolved}
                    </p>
                </div>
            </div>

            {/* Alerts Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                    <h2 className="font-bold text-slate-900">
                        Alert Registry
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Real alerts generated by the IoT and ML systems.
                    </p>
                </div>

                {loading ? (
                    <div className="px-6 py-12 text-center text-sm text-slate-500">
                        Loading alerts...
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-slate-500">
                        No alerts found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Alert</th>
                                    <th className="px-6 py-4">Severity</th>
                                    <th className="px-6 py-4">Machine</th>
                                    <th className="px-6 py-4">Value</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Created</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {alerts.map((alert) => (
                                    <tr
                                        key={alert.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    {formatType(alert.alert_type)}
                                                </p>

                                                <p className="mt-1 max-w-xs text-xs text-slate-500">
                                                    {alert.message}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    Alert #{alert.id}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${severityClass(
                                                    alert.severity
                                                )}`}
                                            >
                                                {alert.severity}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-700">
                                            {alert.machine_id
                                                ? `Machine #${alert.machine_id}`
                                                : "—"}
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {alert.value ?? "—"}
                                            </p>

                                            {alert.threshold !== null &&
                                                alert.threshold !== undefined && (
                                                    <p className="text-xs text-slate-500">
                                                        Threshold: {alert.threshold}
                                                    </p>
                                                )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                                                    alert.status
                                                )}`}
                                            >
                                                {alert.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {formatDate(alert.created_at)}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {alert.status === "ACTIVE" && (
                                                    <button
                                                        onClick={() =>
                                                            handleAcknowledge(alert.id)
                                                        }
                                                        disabled={workingId === alert.id}
                                                        className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                                                    >
                                                        {workingId === alert.id
                                                            ? "Updating..."
                                                            : "Acknowledge"}
                                                    </button>
                                                )}

                                                {alert.status === "ACKNOWLEDGED" && (
                                                    <button
                                                        onClick={() =>
                                                            handleResolve(alert.id)
                                                        }
                                                        disabled={workingId === alert.id}
                                                        className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
                                                    >
                                                        {workingId === alert.id
                                                            ? "Updating..."
                                                            : "Resolve"}
                                                    </button>
                                                )}

                                                {alert.status === "RESOLVED" && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                                                        <CheckCircle2 size={14} />
                                                        Completed
                                                    </span>
                                                )}


                                                <button
                                                    onClick={() => navigate(`/admin/alerts/${alert.id}`)}
                                                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                                    title="View alert"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}