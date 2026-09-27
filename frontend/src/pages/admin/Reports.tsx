import { useEffect, useState } from "react";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Cpu,
  DollarSign,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";

import {
  getAlertReport,
  getMachineReport,
  getOptimizationReport,
} from "../../services/reportService";

interface MachineReport {
  alerts?: {
    active?: number;
    resolved?: number;
    total?: number;
  };

  machine?: {
    id?: number;
    name?: string;
  };

  machine_health?: {
    anomaly_score?: number;
    failure_prediction?: number;
    failure_probability?: number;
    is_anomaly?: boolean;
    last_updated?: string;
    risk_level?: string;
  };

  sensors?: {
    average?: number;
    latest_timestamp?: string;
    latest_value?: number;
    maximum?: number;
    minimum?: number;
    sensor_id?: number;
    sensor_type?: string;
    total_readings?: number;
    unit?: string;
  }[];
}

interface AlertReport {
  severity?: {
    critical?: number;
    info?: number;
    warning?: number;
  };

  summary?: {
    acknowledged?: number;
    active?: number;
    resolved?: number;
    total?: number;
  };
}

interface OptimizationReport {
  estimated_monthly_savings?: number;

  recommendations?: {
    acknowledged?: number;
    pending?: number;
    resolved?: number;
    total?: number;
  };

  resources?: {
    active?: number;
    total?: number;
  };
}

const numberValue = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value)
    ? value
    : 0;

const decimalValue = (
  value?: number | null,
  digits = 2
) => numberValue(value).toFixed(digits);

const Reports = () => {
  const [machineReport, setMachineReport] =
    useState<MachineReport | null>(null);

  const [alertReport, setAlertReport] =
    useState<AlertReport | null>(null);

  const [optimizationReport, setOptimizationReport] =
    useState<OptimizationReport | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        machine,
        alerts,
        optimization,
      ] = await Promise.all([
        getMachineReport(2),
        getAlertReport(),
        getOptimizationReport(),
      ]);

      console.log("REPORTS LOADED:", {
        machine,
        alerts,
        optimization,
      });

      setMachineReport(machine);
      setAlertReport(alerts);
      setOptimizationReport(optimization);
    } catch (err) {
      console.error("REPORTS ERROR:", err);
      setError(
        "Failed to load reports. Please try refreshing the page."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-indigo-100 p-4 text-indigo-600">
            <RefreshCw
              size={26}
              className="animate-spin"
            />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  const sensors = Array.isArray(machineReport?.sensors)
    ? machineReport.sensors
    : [];

  const totalReadings = sensors.reduce(
    (sum, sensor) =>
      sum + numberValue(sensor.total_readings),
    0
  );

  const alertSummary = alertReport?.summary;
  const alertSeverity = alertReport?.severity;

  const optimizationResources =
    optimizationReport?.resources;

  const optimizationRecommendations =
    optimizationReport?.recommendations;

  const machineHealth =
    machineReport?.machine_health;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-indigo-100 p-3.5 text-indigo-600">
              <Activity size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Reports
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Platform analytics and operational reports
              </p>
            </div>
          </div>

          <button
            onClick={() => loadReports(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-semibold">
              Reports could not be displayed
            </p>

            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Alert Report */}
      {alertReport && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-2 text-red-600">
              <ShieldAlert size={19} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Alert Report
              </h2>

              <p className="text-sm text-slate-500">
                Alert severity and lifecycle summary
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ReportCard
              label="Total Alerts"
              value={numberValue(alertSummary?.total)}
              icon={<Activity size={20} />}
              iconClass="bg-slate-100 text-slate-600"
            />

            <ReportCard
              label="Critical"
              value={numberValue(alertSeverity?.critical)}
              icon={<AlertTriangle size={20} />}
              iconClass="bg-red-100 text-red-600"
            />

            <ReportCard
              label="Warning"
              value={numberValue(alertSeverity?.warning)}
              icon={<AlertTriangle size={20} />}
              iconClass="bg-amber-100 text-amber-600"
            />

            <ReportCard
              label="Active"
              value={numberValue(alertSummary?.active)}
              icon={<Activity size={20} />}
              iconClass="bg-blue-100 text-blue-600"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MiniCard
              label="Acknowledged"
              value={numberValue(
                alertSummary?.acknowledged
              )}
            />

            <MiniCard
              label="Resolved"
              value={numberValue(
                alertSummary?.resolved
              )}
              valueClass="text-green-600"
            />

            <MiniCard
              label="Info"
              value={numberValue(alertSeverity?.info)}
            />
          </div>
        </section>
      )}

      {/* Machine Report */}
      {machineReport && (
        <section className="space-y-4">
          <div className="flex items-center gap-3 pt-2">
            <div className="rounded-xl bg-purple-100 p-2 text-purple-600">
              <Cpu size={19} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Machine Report
              </h2>

              <p className="text-sm text-slate-500">
                Machine health and sensor statistics
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {machineReport.machine?.name ||
                    "Machine"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Machine ID:{" "}
                  {machineReport.machine?.id ?? "—"}
                </p>
              </div>

              <span
                className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-bold ${
                  machineHealth?.risk_level?.toUpperCase() ===
                  "HIGH"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : machineHealth?.risk_level?.toUpperCase() ===
                        "MEDIUM"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-green-200 bg-green-50 text-green-700"
                }`}
              >
                Risk:{" "}
                {machineHealth?.risk_level || "UNKNOWN"}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Failure Probability"
                value={`${(
                  numberValue(
                    machineHealth?.failure_probability
                  ) * 100
                ).toFixed(1)}%`}
              />

              <MetricCard
                label="Anomaly Score"
                value={decimalValue(
                  machineHealth?.anomaly_score,
                  4
                )}
              />

              <MetricCard
                label="Active Alerts"
                value={numberValue(
                  machineReport.alerts?.active
                )}
                valueClass="text-red-600"
              />

              <MetricCard
                label="Total Readings"
                value={totalReadings.toLocaleString()}
              />
            </div>
          </div>

          {/* Sensor Statistics */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="font-bold text-slate-900">
                Sensor Statistics
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Aggregated readings for the machine sensors
              </p>
            </div>

            {sensors.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Activity
                  size={24}
                  className="mx-auto text-slate-400"
                />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  No sensor statistics available.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4">
                        Sensor
                      </th>

                      <th className="px-6 py-4">
                        Latest
                      </th>

                      <th className="px-6 py-4">
                        Average
                      </th>

                      <th className="px-6 py-4">
                        Minimum
                      </th>

                      <th className="px-6 py-4">
                        Maximum
                      </th>

                      <th className="px-6 py-4">
                        Readings
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {sensors.map((sensor) => (
                      <tr
                        key={sensor.sensor_id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {sensor.sensor_type ||
                              "Unknown Sensor"}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            Sensor #
                            {sensor.sensor_id ?? "—"}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-medium text-slate-700">
                          {numberValue(
                            sensor.latest_value
                          )}{" "}
                          {sensor.unit || ""}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {decimalValue(
                            sensor.average,
                            2
                          )}{" "}
                          {sensor.unit || ""}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {numberValue(
                            sensor.minimum
                          )}{" "}
                          {sensor.unit || ""}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {numberValue(
                            sensor.maximum
                          )}{" "}
                          {sensor.unit || ""}
                        </td>

                        <td className="px-6 py-4 font-medium text-slate-700">
                          {numberValue(
                            sensor.total_readings
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Optimization Report */}
      {optimizationReport && (
        <section className="space-y-4">
          <div className="flex items-center gap-3 pt-2">
            <div className="rounded-xl bg-green-100 p-2 text-green-600">
              <TrendingDown size={19} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Optimization Report
              </h2>

              <p className="text-sm text-slate-500">
                Cloud resources and optimization recommendations
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ReportCard
              label="Cloud Resources"
              value={numberValue(
                optimizationResources?.total
              )}
              subtitle={`${numberValue(
                optimizationResources?.active
              )} active`}
              icon={<Cpu size={20} />}
              iconClass="bg-slate-100 text-slate-600"
            />

            <ReportCard
              label="Recommendations"
              value={numberValue(
                optimizationRecommendations?.total
              )}
              icon={<Activity size={20} />}
              iconClass="bg-blue-100 text-blue-600"
            />

            <ReportCard
              label="Pending"
              value={numberValue(
                optimizationRecommendations?.pending
              )}
              icon={<Clock3 size={20} />}
              iconClass="bg-amber-100 text-amber-600"
            />

            <ReportCard
              label="Monthly Savings"
              value={`$${decimalValue(
                optimizationReport.estimated_monthly_savings,
                2
              )}`}
              icon={<DollarSign size={20} />}
              iconClass="bg-green-100 text-green-600"
              valueClass="text-green-600"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MiniCard
              label="Resolved Recommendations"
              value={numberValue(
                optimizationRecommendations?.resolved
              )}
              valueClass="text-green-600"
              icon={
                <CheckCircle2
                  size={18}
                  className="text-green-500"
                />
              }
            />

            <MiniCard
              label="Pending Recommendations"
              value={numberValue(
                optimizationRecommendations?.pending
              )}
              valueClass="text-amber-600"
              icon={
                <Clock3
                  size={18}
                  className="text-amber-500"
                />
              }
            />
          </div>
        </section>
      )}

      {/* No data fallback */}
      {!machineReport &&
        !alertReport &&
        !optimizationReport &&
        !error && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <Activity
              size={30}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-4 font-bold text-slate-900">
              No report data available
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Try refreshing the reports.
            </p>
          </div>
        )}
    </div>
  );
};

function ReportCard({
  label,
  value,
  subtitle,
  icon,
  iconClass,
  valueClass = "text-slate-900",
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p
            className={`mt-2 text-3xl font-bold tracking-tight ${valueClass}`}
          >
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  valueClass = "text-slate-900",
}: {
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniCard({
  label,
  value,
  valueClass = "text-slate-900",
  icon,
}: {
  label: string;
  value: number;
  valueClass?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-5">
      <div className="flex items-center gap-2">
        {icon}

        <span className="text-sm font-medium text-slate-600">
          {label}
        </span>
      </div>

      <p
        className={`mt-2 text-2xl font-bold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

export default Reports;