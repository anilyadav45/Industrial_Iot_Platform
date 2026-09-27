import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  acknowledgeAlert,
  getAlerts,
  resolveAlert,
} from "../../services/alertService";

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
      return "bg-red-50 text-red-700 ring-1 ring-red-200";

    case "WARNING":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

    case "INFO":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";

    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  }
}

function statusClass(status: string) {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "bg-red-50 text-red-700 ring-1 ring-red-200";

    case "ACKNOWLEDGED":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

    case "RESOLVED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  }
}

function severityIcon(severity: string): ReactNode {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return <AlertTriangle size={16} />;

    case "WARNING":
      return <ShieldAlert size={16} />;

    default:
      return <Clock3 size={16} />;
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
        (alert) =>
          alert.status.toUpperCase() === "ACTIVE"
      ).length,

      acknowledged: alerts.filter(
        (alert) =>
          alert.status.toUpperCase() ===
          "ACKNOWLEDGED"
      ).length,

      resolved: alerts.filter(
        (alert) =>
          alert.status.toUpperCase() === "RESOLVED"
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
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <ShieldAlert size={20} />
            </div>

            <div>
              <p className="text-sm font-medium text-blue-600">
                Industrial IQ
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Alerts
              </h1>
            </div>
          </div>

          <p className="max-w-2xl text-sm text-slate-500">
            Monitor machine and sensor alerts generated
            by the IoT and ML systems.
          </p>
        </div>

        <button
          onClick={loadAlerts}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertTriangle size={17} />
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Total */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Alerts
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "—" : statistics.total}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldAlert size={21} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            All recorded alerts
          </p>
        </div>

        {/* Active */}
        <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {loading ? "—" : statistics.active}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={21} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Require attention
          </p>
        </div>

        {/* Acknowledged */}
        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Acknowledged
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {loading
                  ? "—"
                  : statistics.acknowledged}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3 size={21} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Being handled
          </p>
        </div>

        {/* Resolved */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Resolved
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {loading ? "—" : statistics.resolved}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={21} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Completed alerts
          </p>
        </div>
      </div>

      {/* Alert Registry */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Alert Registry
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Real alerts generated by the IoT and ML
              systems.
            </p>
          </div>

          {!loading && (
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
              {statistics.active} active
            </div>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <RefreshCw
                size={18}
                className="animate-spin"
              />
              Loading alerts...
            </div>
          </div>
        ) : alerts.length === 0 ? (
          /* Empty */
          <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={26} />
            </div>

            <h3 className="text-base font-semibold text-slate-900">
              No alerts found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              There are currently no alerts recorded in
              the platform.
            </p>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Alert
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Severity
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Machine
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Reading
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Created
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {alerts.map((alert) => {
                  const isWorking =
                    workingId === alert.id;

                  return (
                    <tr
                      key={alert.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      {/* Alert */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/alerts/${alert.id}`
                            )
                          }
                          className="group flex items-start gap-3 text-left"
                        >
                          <div
                            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              alert.severity.toUpperCase() ===
                              "CRITICAL"
                                ? "bg-red-50 text-red-600"
                                : alert.severity.toUpperCase() ===
                                  "WARNING"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {severityIcon(
                              alert.severity
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900 transition group-hover:text-blue-600">
                              {formatType(
                                alert.alert_type
                              )}
                            </p>

                            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                              {alert.message}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Alert #{alert.id}
                            </p>
                          </div>
                        </button>
                      </td>

                      {/* Severity */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${severityClass(
                            alert.severity
                          )}`}
                        >
                          {severityIcon(
                            alert.severity
                          )}

                          {alert.severity}
                        </span>
                      </td>

                      {/* Machine */}
                      <td className="px-6 py-4">
                        {alert.machine_id ? (
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              Machine #{alert.machine_id}
                            </p>

                            {alert.sensor_id && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                Sensor #{alert.sensor_id}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* Reading */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {alert.value ?? "—"}
                          </p>

                          {alert.threshold !== null &&
                            alert.threshold !==
                              undefined && (
                              <p className="mt-1 text-xs text-slate-500">
                                Threshold:{" "}
                                {alert.threshold}
                              </p>
                            )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(
                            alert.status
                          )}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              alert.status.toUpperCase() ===
                              "ACTIVE"
                                ? "bg-red-500"
                                : alert.status.toUpperCase() ===
                                  "ACKNOWLEDGED"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />

                          {alert.status}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-slate-600">
                          {formatDate(
                            alert.created_at
                          )}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {alert.status.toUpperCase() ===
                            "ACTIVE" && (
                            <button
                              onClick={() =>
                                handleAcknowledge(
                                  alert.id
                                )
                              }
                              disabled={isWorking}
                              className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isWorking
                                ? "Updating..."
                                : "Acknowledge"}
                            </button>
                          )}

                          {alert.status.toUpperCase() ===
                            "ACKNOWLEDGED" && (
                            <button
                              onClick={() =>
                                handleResolve(
                                  alert.id
                                )
                              }
                              disabled={isWorking}
                              className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isWorking
                                ? "Updating..."
                                : "Resolve"}
                            </button>
                          )}

                          {alert.status.toUpperCase() ===
                            "RESOLVED" && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                              <CheckCircle2
                                size={14}
                              />
                              Completed
                            </span>
                          )}

                          <button
                            onClick={() =>
                              navigate(
                                `/admin/alerts/${alert.id}`
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                            title="View alert"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}