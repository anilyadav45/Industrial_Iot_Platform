import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldCheck,
  Activity,
  TrendingUp,
} from "lucide-react";

import {
  analyzeMachine,
  getMachineHealth,
  getMachinePredictions,
} from "../../services/mlService";

interface Health {
  anomaly_score: number;
  failure_prediction: number;
  failure_probability: number;
  is_anomaly: boolean;
  last_updated: string;
  risk_level: string;
}

interface Prediction {
  id: number;
  machine_id: number;
  air_temperature?: number;
  process_temperature?: number;
  rotational_speed?: number;
  torque?: number;
  tool_wear?: number;
  anomaly_score: number;
  failure_prediction: number;
  failure_probability: number;
  is_anomaly: boolean;
  risk_level: string;
  created_at: string;
}

function formatDate(date?: string) {
  if (!date) return "—";

  return new Date(date).toLocaleString();
}

function riskClass(risk?: string) {
  switch (risk?.toUpperCase()) {
    case "HIGH":
      return "bg-red-100 text-red-700 border-red-200";

    case "MEDIUM":
      return "bg-amber-100 text-amber-700 border-amber-200";

    case "LOW":
      return "bg-green-100 text-green-700 border-green-200";

    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function riskDotClass(risk?: string) {
  switch (risk?.toUpperCase()) {
    case "HIGH":
      return "bg-red-500";

    case "MEDIUM":
      return "bg-amber-500";

    case "LOW":
      return "bg-green-500";

    default:
      return "bg-slate-400";
  }
}

function SummaryCard({
  label,
  value,
  description,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
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

export default function MachineML() {
  const { id } = useParams();
  const navigate = useNavigate();

  const machineId = Number(id);

  const [health, setHealth] = useState<Health | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const loadData = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [healthData, predictionData] =
        await Promise.all([
          getMachineHealth(machineId),
          getMachinePredictions(machineId),
        ]);

      setHealth(
        healthData?.health ||
          healthData?.machine_health ||
          healthData
      );

      const actualPredictions = Array.isArray(predictionData)
        ? predictionData
        : predictionData?.predictions || [];

      setPredictions(actualPredictions);
    } catch (err) {
      console.error(err);
      setError("Failed to load ML data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (machineId) {
      loadData();
    }
  }, [machineId]);

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setError("");

      await analyzeMachine(machineId);
      await loadData(true);
    } catch (err) {
      console.error(err);
      setError(
        "Machine analysis failed. Make sure the required sensor readings are available."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-purple-100 p-4 text-purple-600">
            <BrainCircuit
              size={28}
              className="animate-pulse"
            />
          </div>

          <p className="text-sm font-medium text-slate-600">
            Loading ML analysis...
          </p>
        </div>
      </div>
    );
  }

  const failurePercentage = health
    ? Math.min(
        Math.max(health.failure_probability * 100, 0),
        100
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 via-white to-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              onClick={() =>
                navigate(`/admin/machines/${machineId}`)
              }
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to Machine
            </button>

            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-purple-100 p-3.5 text-purple-600">
                <BrainCircuit size={28} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    ML Machine Health
                  </h1>

                  <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                    Predictive ML
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Predictive maintenance analysis for Machine #
                  {machineId}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing || analyzing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              onClick={handleAnalyze}
              disabled={analyzing || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BrainCircuit
                size={17}
                className={analyzing ? "animate-pulse" : ""}
              />
              {analyzing ? "Analyzing..." : "Run Analysis"}
            </button>
          </div>
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
              ML analysis unavailable
            </p>

            <p className="mt-1 text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Health */}
      {health ? (
        <>
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Current Machine Health
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest prediction and anomaly assessment.
                </p>
              </div>

              <span className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                ML data available
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Risk Level"
                value={health.risk_level || "UNKNOWN"}
                description="Current ML risk classification"
                icon={
                  <Activity
                    size={21}
                  />
                }
                iconClass="bg-purple-100 text-purple-600"
              />

              <SummaryCard
                label="Failure Probability"
                value={`${failurePercentage.toFixed(1)}%`}
                description="Estimated failure probability"
                icon={
                  <TrendingUp
                    size={21}
                  />
                }
                iconClass="bg-red-100 text-red-600"
              />

              <SummaryCard
                label="Failure Prediction"
                value={
                  health.failure_prediction
                    ? "Failure Predicted"
                    : "No Failure"
                }
                description={
                  health.failure_prediction
                    ? "Potential failure detected"
                    : "No failure predicted"
                }
                icon={
                  health.failure_prediction ? (
                    <AlertTriangle size={21} />
                  ) : (
                    <CheckCircle2 size={21} />
                  )
                }
                iconClass={
                  health.failure_prediction
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }
              />

              <SummaryCard
                label="Anomaly Detection"
                value={
                  health.is_anomaly
                    ? "Anomaly Detected"
                    : "Normal"
                }
                description={
                  health.is_anomaly
                    ? "Abnormal machine behavior"
                    : "No anomaly detected"
                }
                icon={
                  health.is_anomaly ? (
                    <AlertTriangle size={21} />
                  ) : (
                    <ShieldCheck size={21} />
                  )
                }
                iconClass={
                  health.is_anomaly
                    ? "bg-amber-100 text-amber-600"
                    : "bg-green-100 text-green-600"
                }
              />
            </div>
          </div>

          {/* ML Metrics */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <h2 className="font-bold text-slate-900">
                ML Metrics
              </h2>

              <p className="text-sm text-slate-500">
                Detailed values from the latest machine analysis.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Anomaly Score */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Anomaly Score
                  </p>

                  <div className="rounded-lg bg-white p-2 text-purple-600 shadow-sm">
                    <Activity size={17} />
                  </div>
                </div>

                <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                  {health.anomaly_score.toFixed(4)}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Lower values indicate less anomalous behavior.
                </p>
              </div>

              {/* Failure Probability */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Failure Probability
                  </p>

                  <span className="text-sm font-bold text-slate-700">
                    {failurePercentage.toFixed(2)}%
                  </span>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all duration-500"
                    style={{
                      width: `${failurePercentage}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Estimated probability of machine failure.
                </p>
              </div>

              {/* Last Analysis */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Last Analysis
                  </p>

                  <div className="rounded-lg bg-white p-2 text-slate-500 shadow-sm">
                    <Clock size={17} />
                  </div>
                </div>

                <p className="mt-4 text-lg font-bold leading-7 text-slate-900">
                  {formatDate(health.last_updated)}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Most recent ML health calculation.
                </p>
              </div>
            </div>

            {/* Risk Status */}
            <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${riskDotClass(
                    health.risk_level
                  )}`}
                />

                <span className="text-sm font-medium text-slate-700">
                  Current risk classification
                </span>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${riskClass(
                  health.risk_level
                )}`}
              >
                {health.risk_level || "UNKNOWN"}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
            <BrainCircuit size={26} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No ML health data
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Run an analysis when the required sensor readings are
            available for this machine.
          </p>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            <BrainCircuit size={17} />
            {analyzing ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>
      )}

      {/* Prediction History */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Prediction History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Previous machine health predictions and anomaly
                results.
              </p>
            </div>

            <div className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
              {predictions.length} prediction
              {predictions.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        {predictions.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <BrainCircuit size={23} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No predictions available
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              This machine does not have prediction history yet.
              Run an analysis once the required sensor readings
              are available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Timestamp
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Failure Probability
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Failure
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Anomaly Score
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Anomaly
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Risk
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {predictions.map((prediction) => {
                  const predictionFailurePercentage =
                    Math.min(
                      Math.max(
                        prediction.failure_probability * 100,
                        0
                      ),
                      100
                    );

                  return (
                    <tr
                      key={prediction.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock
                            size={15}
                            className="text-slate-400"
                          />

                          {formatDate(prediction.created_at)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="w-40">
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900">
                              {predictionFailurePercentage.toFixed(
                                1
                              )}
                              %
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-red-500"
                              style={{
                                width: `${predictionFailurePercentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {prediction.failure_prediction ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                            <AlertTriangle size={13} />
                            Predicted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                            <CheckCircle2 size={13} />
                            No Failure
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-700">
                          {prediction.anomaly_score.toFixed(4)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {prediction.is_anomaly ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                            No
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${riskClass(
                            prediction.risk_level
                          )}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${riskDotClass(
                              prediction.risk_level
                            )}`}
                          />

                          {prediction.risk_level || "UNKNOWN"}
                        </span>
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