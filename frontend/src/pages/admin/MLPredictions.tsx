import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getAllPredictions } from "../../services/mlService";

interface Prediction {
  id: number;
  machine_id: number;
  anomaly_score: number;
  failure_prediction: number;
  failure_probability: number;
  is_anomaly: boolean;
  risk_level: string;
  rotational_speed?: number;
  torque?: number;
  tool_wear?: number;
  air_temperature?: number;
  process_temperature?: number;
  created_at: string;
}

function riskClass(risk: string) {
  switch (risk?.toUpperCase()) {
    case "HIGH":
      return "bg-red-50 text-red-700 ring-1 ring-red-200";

    case "MEDIUM":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

    case "LOW":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  }
}

function riskIconClass(risk: string) {
  switch (risk?.toUpperCase()) {
    case "HIGH":
      return "bg-red-50 text-red-600";

    case "MEDIUM":
      return "bg-amber-50 text-amber-600";

    case "LOW":
      return "bg-emerald-50 text-emerald-600";

    default:
      return "bg-slate-50 text-slate-500";
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

const MLPredictions = () => {
  const navigate = useNavigate();

  const [predictions, setPredictions] = useState<
    Prediction[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPredictions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllPredictions();

      setPredictions(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load ML predictions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  const totalPredictions = predictions.length;

  const anomalies = predictions.filter(
    (prediction) => prediction.is_anomaly
  ).length;

  const failures = predictions.filter(
    (prediction) =>
      prediction.failure_prediction === 1
  ).length;

  const highRisk = predictions.filter(
    (prediction) =>
      prediction.risk_level?.toUpperCase() === "HIGH"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <BrainCircuit size={21} />
            </div>

            <div>
              <p className="text-sm font-medium text-purple-600">
                Machine Intelligence
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                ML Predictions
              </h1>
            </div>
          </div>

          <p className="max-w-2xl text-sm text-slate-500">
            Monitor anomaly detection and failure
            predictions across industrial machines.
          </p>
        </div>

        <button
          onClick={loadPredictions}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Total */}
        <SummaryCard
          label="Total Predictions"
          value={totalPredictions}
          description="ML analyses recorded"
          icon={<BrainCircuit size={21} />}
          iconClass="bg-purple-50 text-purple-600"
        />

        {/* Anomalies */}
        <SummaryCard
          label="Anomalies"
          value={anomalies}
          description="Detected abnormal patterns"
          icon={<Activity size={21} />}
          iconClass="bg-orange-50 text-orange-600"
          valueClass="text-orange-600"
        />

        {/* Failures */}
        <SummaryCard
          label="Predicted Failures"
          value={failures}
          description="Potential machine failures"
          icon={<AlertTriangle size={21} />}
          iconClass="bg-red-50 text-red-600"
          valueClass="text-red-600"
        />

        {/* High Risk */}
        <SummaryCard
          label="High Risk"
          value={highRisk}
          description="Machines requiring attention"
          icon={<ShieldAlert size={21} />}
          iconClass="bg-red-50 text-red-600"
          valueClass="text-red-600"
        />
      </div>

      {/* Prediction Registry */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Prediction History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest machine learning analysis results.
            </p>
          </div>

          {!loading && (
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
              {totalPredictions} prediction
              {totalPredictions === 1 ? "" : "s"}
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
              Loading predictions...
            </div>
          </div>
        ) : predictions.length === 0 ? (
          /* Empty */
          <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
              <BrainCircuit size={27} />
            </div>

            <h3 className="text-base font-semibold text-slate-900">
              No ML predictions available
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Run ML analysis on a machine to generate
              predictions.
            </p>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Machine
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Risk
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Failure Probability
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Failure
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Anomaly
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Anomaly Score
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Analyzed
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {predictions.map((prediction) => {
                  const failureProbability =
                    prediction.failure_probability *
                    100;

                  return (
                    <tr
                      key={prediction.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      {/* Machine */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/machines/${prediction.machine_id}/ml`
                            )
                          }
                          className="group flex items-center gap-3 text-left"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <BrainCircuit
                              size={18}
                            />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-purple-600">
                              Machine #
                              {prediction.machine_id}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Prediction #
                              {prediction.id}
                            </p>
                          </div>
                        </button>
                      </td>

                      {/* Risk */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${riskClass(
                            prediction.risk_level
                          )}`}
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full ${riskIconClass(
                              prediction.risk_level
                            )}`}
                          >
                            <ShieldAlert size={12} />
                          </span>

                          {prediction.risk_level}
                        </span>
                      </td>

                      {/* Failure Probability */}
                      <td className="px-6 py-4">
                        <div className="min-w-[120px]">
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">
                              {failureProbability.toFixed(
                                1
                              )}
                              %
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${
                                failureProbability >=
                                70
                                  ? "bg-red-500"
                                  : failureProbability >=
                                    30
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  failureProbability,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Failure */}
                      <td className="px-6 py-4">
                        {prediction.failure_prediction ===
                        1 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                            <AlertTriangle
                              size={14}
                            />
                            Predicted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            <CheckCircle2
                              size={14}
                            />
                            Normal
                          </span>
                        )}
                      </td>

                      {/* Anomaly */}
                      <td className="px-6 py-4">
                        {prediction.is_anomaly ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
                            <AlertTriangle
                              size={14}
                            />
                            Detected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            <CheckCircle2
                              size={14}
                            />
                            Normal
                          </span>
                        )}
                      </td>

                      {/* Anomaly Score */}
                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-700">
                          {prediction.anomaly_score?.toFixed(
                            4
                          )}
                        </span>
                      </td>

                      {/* Analyzed */}
                      <td className="px-6 py-4">
                        <p className="whitespace-nowrap text-xs font-medium text-slate-600">
                          {formatDate(
                            prediction.created_at
                          )}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/machines/${prediction.machine_id}/ml`
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
                        >
                          View ML
                        </button>
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
};

function SummaryCard({
  label,
  value,
  description,
  icon,
  iconClass,
  valueClass = "text-slate-900",
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${valueClass}`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default MLPredictions;