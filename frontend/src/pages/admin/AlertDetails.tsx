import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import {
  acknowledgeAlert,
  getAlert,
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
  if (!date) return "Not yet";

  return new Date(date).toLocaleString();
}

export default function AlertDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const alertId = Number(id);

  const loadAlert = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAlert(alertId);

      setAlert(data.alert || data);
    } catch (err) {
      console.error(err);
      setError("Failed to load alert details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (alertId) {
      loadAlert();
    }
  }, [alertId]);

  const handleAcknowledge = async () => {
    try {
      setWorking(true);
      setError("");

      await acknowledgeAlert(alertId);

      await loadAlert();
    } catch (err) {
      console.error(err);
      setError("Failed to acknowledge alert.");
    } finally {
      setWorking(false);
    }
  };

  const handleResolve = async () => {
    try {
      setWorking(true);
      setError("");

      await resolveAlert(alertId);

      await loadAlert();
    } catch (err) {
      console.error(err);
      setError("Failed to resolve alert.");
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">
          Loading alert details...
        </p>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || "Alert not found."}
        </div>

        <button
          onClick={() => navigate("/admin/alerts")}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} />
          Back to Alerts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            onClick={() => navigate("/admin/alerts")}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Alerts
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-3 text-red-600">
              <ShieldAlert size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Alert #{alert.id}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {formatType(alert.alert_type)}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadAlert}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Current Status
            </p>

            <div className="mt-2 flex items-center gap-3">
              {alert.status === "RESOLVED" ? (
                <CheckCircle2
                  size={25}
                  className="text-green-500"
                />
              ) : (
                <AlertTriangle
                  size={25}
                  className="text-amber-500"
                />
              )}

              <span className="text-2xl font-bold text-slate-900">
                {alert.status}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {alert.status === "ACTIVE" && (
              <button
                onClick={handleAcknowledge}
                disabled={working}
                className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {working ? "Updating..." : "Acknowledge"}
              </button>
            )}

            {alert.status === "ACKNOWLEDGED" && (
              <button
                onClick={handleResolve}
                disabled={working}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {working ? "Updating..." : "Resolve Alert"}
              </button>
            )}

            {alert.status === "RESOLVED" && (
              <span className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-5 py-2.5 text-sm font-semibold text-green-700">
                <CheckCircle2 size={17} />
                Resolved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Alert Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">
          Alert Information
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Alert Type
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {formatType(alert.alert_type)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Severity
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {alert.severity}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Machine
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {alert.machine_id
                ? `Machine #${alert.machine_id}`
                : "—"}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Sensor
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {alert.sensor_id
                ? `Sensor #${alert.sensor_id}`
                : "—"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Message
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {alert.message}
          </p>
        </div>
      </div>

      {/* Trigger Data */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <ActivityIcon />
            <span className="text-sm">Triggered Value</span>
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {alert.value ?? "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Cpu size={18} />
            <span className="text-sm">Threshold</span>
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {alert.threshold ?? "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock size={18} />
            <span className="text-sm">Created</span>
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-900">
            {formatDate(alert.created_at)}
          </p>
        </div>
      </div>

      {/* Lifecycle */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">
          Alert Lifecycle
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <LifecycleStep
            title="Created"
            date={alert.created_at}
            active
          />

          <LifecycleStep
            title="Acknowledged"
            date={alert.acknowledged_at}
            active={Boolean(alert.acknowledged_at)}
          />

          <LifecycleStep
            title="Resolved"
            date={alert.resolved_at}
            active={Boolean(alert.resolved_at)}
          />
        </div>
      </div>
    </div>
  );
}

function LifecycleStep({
  title,
  date,
  active,
}: {
  title: string;
  date?: string | null;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        active
          ? "border-green-200 bg-green-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3">
        {active ? (
          <CheckCircle2
            size={20}
            className="text-green-600"
          />
        ) : (
          <Clock
            size={20}
            className="text-slate-400"
          />
        )}

        <p
          className={`font-semibold ${
            active
              ? "text-green-700"
              : "text-slate-500"
          }`}
        >
          {title}
        </p>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {formatDate(date)}
      </p>
    </div>
  );
}

function ActivityIcon() {
  return <AlertTriangle size={18} />;
}