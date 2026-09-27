import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  Eye,
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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <RefreshCw
            size={18}
            className="animate-spin"
          />
          Loading alert details...
        </div>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <span>
            {error || "Alert not found."}
          </span>
        </div>

        <button
          onClick={() => navigate("/admin/alerts")}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <ArrowLeft size={16} />
          Back to Alerts
        </button>
      </div>
    );
  }

  const isResolved =
    alert.status.toUpperCase() === "RESOLVED";

  const isAcknowledged =
    alert.status.toUpperCase() ===
    "ACKNOWLEDGED";

  const isActive =
    alert.status.toUpperCase() === "ACTIVE";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            onClick={() => navigate("/admin/alerts")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Alerts
          </button>

          <div className="flex items-start gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                alert.severity.toUpperCase() ===
                "CRITICAL"
                  ? "bg-red-50 text-red-600"
                  : alert.severity.toUpperCase() ===
                    "WARNING"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              <ShieldAlert size={23} />
            </div>

            <div>
              <p className="text-sm font-medium text-blue-600">
                Alert Management
              </p>

              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
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

      {/* Status Banner */}
      <div
        className={`rounded-2xl border p-6 shadow-sm ${
          isResolved
            ? "border-emerald-200 bg-emerald-50/50"
            : isAcknowledged
            ? "border-amber-200 bg-amber-50/50"
            : "border-red-200 bg-red-50/50"
        }`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                isResolved
                  ? "bg-emerald-100 text-emerald-600"
                  : isAcknowledged
                  ? "bg-amber-100 text-amber-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {isResolved ? (
                <CheckCircle2 size={25} />
              ) : isAcknowledged ? (
                <Clock size={25} />
              ) : (
                <AlertTriangle size={25} />
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Current Status
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-bold ${statusClass(
                    alert.status
                  )}`}
                >
                  {alert.status}
                </span>

                <span
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${severityClass(
                    alert.severity
                  )}`}
                >
                  {alert.severity}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isActive && (
              <button
                onClick={handleAcknowledge}
                disabled={working}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {working ? (
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Clock size={16} />
                )}

                {working
                  ? "Updating..."
                  : "Acknowledge"}
              </button>
            )}

            {isAcknowledged && (
              <button
                onClick={handleResolve}
                disabled={working}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {working ? (
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <CheckCircle2 size={16} />
                )}

                {working
                  ? "Updating..."
                  : "Resolve Alert"}
              </button>
            )}

            {isResolved && (
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200">
                <CheckCircle2 size={17} />
                Resolved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Alert Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Alert Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Details about the event that generated this
            alert.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            label="Alert Type"
            value={formatType(alert.alert_type)}
          />

          <InfoCard
            label="Severity"
            value={alert.severity}
            badge
            badgeClass={severityClass(alert.severity)}
          />

          <InfoCard
            label="Machine"
            value={
              alert.machine_id
                ? `Machine #${alert.machine_id}`
                : "—"
            }
          />

          <InfoCard
            label="Sensor"
            value={
              alert.sensor_id
                ? `Sensor #${alert.sensor_id}`
                : "—"
            }
          />
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Alert Message
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {alert.message}
          </p>
        </div>
      </div>

      {/* Trigger Data */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Trigger Data
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Values recorded when the alert was generated.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            icon={<AlertTriangle size={19} />}
            label="Triggered Value"
            value={
              alert.value !== null &&
              alert.value !== undefined
                ? String(alert.value)
                : "—"
            }
            iconClass="bg-red-50 text-red-600"
          />

          <MetricCard
            icon={<Cpu size={19} />}
            label="Threshold"
            value={
              alert.threshold !== null &&
              alert.threshold !== undefined
                ? String(alert.threshold)
                : "—"
            }
            iconClass="bg-blue-50 text-blue-600"
          />

          <MetricCard
            icon={<Clock size={19} />}
            label="Created"
            value={formatDate(alert.created_at)}
            iconClass="bg-slate-100 text-slate-600"
            smallValue
          />
        </div>
      </div>

      {/* Lifecycle */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Alert Lifecycle
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track the alert from creation through
            resolution.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <LifecycleStep
            title="Created"
            description="Alert generated"
            date={alert.created_at}
            active
          />

          <LifecycleStep
            title="Acknowledged"
            description="Alert reviewed"
            date={alert.acknowledged_at}
            active={Boolean(alert.acknowledged_at)}
          />

          <LifecycleStep
            title="Resolved"
            description="Alert completed"
            date={alert.resolved_at}
            active={Boolean(alert.resolved_at)}
          />
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-start">
        <button
          onClick={() => navigate("/admin/alerts")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back to Alerts
        </button>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  badge = false,
  badgeClass = "",
}: {
  label: string;
  value: string;
  badge?: boolean;
  badgeClass?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      {badge ? (
        <span
          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
        >
          {value}
        </span>
      ) : (
        <p className="mt-2 font-semibold text-slate-900">
          {value}
        </p>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  iconClass,
  smallValue = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconClass: string;
  smallValue?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-sm font-medium text-slate-500">
          {label}
        </span>
      </div>

      <p
        className={`mt-4 font-bold text-slate-900 ${
          smallValue
            ? "text-sm leading-6"
            : "text-3xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function LifecycleStep({
  title,
  description,
  date,
  active,
}: {
  title: string;
  description: string;
  date?: string | null;
  active: boolean;
}) {
  return (
    <div
      className={`relative rounded-xl border p-5 ${
        active
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            active
              ? "bg-emerald-100 text-emerald-600"
              : "bg-slate-200 text-slate-400"
          }`}
        >
          {active ? (
            <CheckCircle2 size={18} />
          ) : (
            <Clock size={18} />
          )}
        </div>

        <div>
          <p
            className={`font-semibold ${
              active
                ? "text-emerald-700"
                : "text-slate-500"
            }`}
          >
            {title}
          </p>

          <p className="text-xs text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-200/70 pt-3">
        <p className="text-xs text-slate-500">
          {formatDate(date)}
        </p>
      </div>
    </div>
  );
}