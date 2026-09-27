import { useEffect, useState } from "react";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Cpu,
  DollarSign,
  RefreshCw,
  Server,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";

import {
  getAlertReport,
  getMachineReport,
  getOptimizationReport,
} from "../../services/reportService";

interface MachineReport {
  alerts: {
    active: number;
    resolved: number;
    total: number;
  };

  machine: {
    id: number;
    name: string;
  };

  machine_health: {
    anomaly_score: number;
    failure_prediction: number;
    failure_probability: number;
    is_anomaly: boolean;
    last_updated: string;
    risk_level: string;
  };

  sensors: {
    average: number;
    latest_timestamp: string;
    latest_value: number;
    maximum: number;
    minimum: number;
    sensor_id: number;
    sensor_type: string;
    total_readings: number;
    unit: string;
  }[];
}

interface AlertReport {
  severity: {
    critical: number;
    info: number;
    warning: number;
  };

  summary: {
    acknowledged: number;
    active: number;
    resolved: number;
    total: number;
  };
}

interface OptimizationReport {
  estimated_monthly_savings: number;

  recommendations: {
    acknowledged: number;
    pending: number;
    resolved: number;
    total: number;
  };

  resources: {
    active: number;
    total: number;
  };
}

const Reports = () => {
  const [machineReport, setMachineReport] =
    useState<MachineReport | null>(null);

  const [alertReport, setAlertReport] =
    useState<AlertReport | null>(null);

  const [optimizationReport, setOptimizationReport] =
    useState<OptimizationReport | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
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

      setMachineReport(machine);
      setAlertReport(alerts);
      setOptimizationReport(optimization);
    } catch (err) {
      console.error(err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <RefreshCw
            size={18}
            className="animate-spin"
          />
          Loading reports...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
              <Activity size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Reports
              </h1>

              <p className="text-sm text-slate-500">
                Platform analytics and operational reports
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadReports}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Alert Summary */}
      {alertReport && (
        <>
          <div className="flex items-center gap-2">
            <ShieldAlert
              size={20}
              className="text-red-500"
            />

            <h2 className="text-lg font-semibold text-slate-900">
              Alert Report
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Alerts
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {alertReport.summary.total}
              </p>
            </div>

            <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Critical
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {alertReport.severity.critical}
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Warning
              </p>

              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {alertReport.severity.warning}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Active
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {alertReport.summary.active}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Acknowledged
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {alertReport.summary.acknowledged}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Resolved
              </p>

              <p className="mt-1 text-xl font-bold text-green-600">
                {alertReport.summary.resolved}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Info
              </p>

              <p className="mt-1 text-xl font-bold text-slate-700">
                {alertReport.severity.info}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Machine Report */}
      {machineReport && (
        <>
          <div className="flex items-center gap-2 pt-4">
            <Cpu
              size={20}
              className="text-purple-500"
            />

            <h2 className="text-lg font-semibold text-slate-900">
              Machine Report
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {machineReport.machine.name}
                </h3>

                <p className="text-sm text-slate-500">
                  Machine ID: {machineReport.machine.id}
                </p>
              </div>

              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                Risk:{" "}
                {machineReport.machine_health.risk_level}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">
                  Failure Probability
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {(
                    machineReport.machine_health
                      .failure_probability * 100
                  ).toFixed(1)}
                  %
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">
                  Anomaly Score
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {machineReport.machine_health.anomaly_score.toFixed(
                    4
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">
                  Active Alerts
                </p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                  {machineReport.alerts.active}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">
                  Total Readings
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {machineReport.sensors.reduce(
                    (sum, sensor) =>
                      sum + sensor.total_readings,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Sensors */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="font-semibold text-slate-900">
                Sensor Statistics
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Aggregated readings for the machine sensors
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">
                      Sensor
                    </th>

                    <th className="px-6 py-3">
                      Latest
                    </th>

                    <th className="px-6 py-3">
                      Average
                    </th>

                    <th className="px-6 py-3">
                      Minimum
                    </th>

                    <th className="px-6 py-3">
                      Maximum
                    </th>

                    <th className="px-6 py-3">
                      Readings
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {machineReport.sensors.map(
                    (sensor) => (
                      <tr
                        key={sensor.sensor_id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {sensor.sensor_type}
                          </div>

                          <div className="text-xs text-slate-500">
                            Sensor #{sensor.sensor_id}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-medium">
                          {sensor.latest_value}{" "}
                          {sensor.unit}
                        </td>

                        <td className="px-6 py-4">
                          {sensor.average.toFixed(2)}{" "}
                          {sensor.unit}
                        </td>

                        <td className="px-6 py-4">
                          {sensor.minimum}{" "}
                          {sensor.unit}
                        </td>

                        <td className="px-6 py-4">
                          {sensor.maximum}{" "}
                          {sensor.unit}
                        </td>

                        <td className="px-6 py-4">
                          {sensor.total_readings.toLocaleString()}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Optimization Report */}
      {optimizationReport && (
        <>
          <div className="flex items-center gap-2 pt-4">
            <TrendingDown
              size={20}
              className="text-green-500"
            />

            <h2 className="text-lg font-semibold text-slate-900">
              Optimization Report
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Cloud Resources
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {optimizationReport.resources.total}
              </p>

              <p className="mt-1 text-xs text-green-600">
                {optimizationReport.resources.active} active
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Recommendations
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {optimizationReport.recommendations.total}
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Pending
              </p>

              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {optimizationReport.recommendations.pending}
              </p>
            </div>

            <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <DollarSign
                  size={18}
                  className="text-green-500"
                />

                <p className="text-sm text-slate-500">
                  Monthly Savings
                </p>
              </div>

              <p className="mt-2 text-3xl font-bold text-green-600">
                $
                {optimizationReport.estimated_monthly_savings.toFixed(
                  2
                )}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={18}
                  className="text-green-500"
                />

                <span className="text-sm font-medium text-slate-600">
                  Resolved Recommendations
                </span>
              </div>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {optimizationReport.recommendations.resolved}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-2">
                <Clock3
                  size={18}
                  className="text-yellow-500"
                />

                <span className="text-sm font-medium text-slate-600">
                  Pending Recommendations
                </span>
              </div>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {optimizationReport.recommendations.pending}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;