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
      return "bg-red-100 text-red-700";

    case "MEDIUM":
      return "bg-amber-100 text-amber-700";

    case "LOW":
      return "bg-green-100 text-green-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function MachineML() {
  const { id } = useParams();
  const navigate = useNavigate();

  const machineId = Number(id);

  const [health, setHealth] = useState<Health | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
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

      await loadData();
    } catch (err) {
      console.error(err);
      setError("Machine analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">
          Loading ML analysis...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            onClick={() =>
              navigate(`/admin/machines/${machineId}`)
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Machine
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
              <BrainCircuit size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                ML Machine Health
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Predictive maintenance analysis for Machine #{machineId}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <BrainCircuit size={17} />
            {analyzing ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Health */}
      {health && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Risk Level
              </p>

              <div className="mt-3">
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-lg font-bold ${riskClass(
                    health.risk_level
                  )}`}
                >
                  {health.risk_level}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Failure Probability
                </p>

                <TrendingUp
                  size={19}
                  className="text-red-500"
                />
              </div>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {(health.failure_probability * 100).toFixed(1)}%
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Failure Prediction
                </p>

                {health.failure_prediction ? (
                  <AlertTriangle
                    size={20}
                    className="text-red-500"
                  />
                ) : (
                  <CheckCircle2
                    size={20}
                    className="text-green-500"
                  />
                )}
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {health.failure_prediction
                  ? "Failure Predicted"
                  : "No Failure"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Anomaly Detection
                </p>

                {health.is_anomaly ? (
                  <AlertTriangle
                    size={20}
                    className="text-amber-500"
                  />
                ) : (
                  <ShieldCheck
                    size={20}
                    className="text-green-500"
                  />
                )}
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {health.is_anomaly
                  ? "Anomaly Detected"
                  : "Normal"}
              </p>
            </div>
          </div>

          {/* ML Metrics */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">
              ML Metrics
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Anomaly Score
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {health.anomaly_score.toFixed(4)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Failure Probability
                </p>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{
                      width: `${Math.min(
                        health.failure_probability * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {(health.failure_probability * 100).toFixed(2)}%
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Last Analysis
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <Clock
                    size={17}
                    className="text-slate-400"
                  />

                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(health.last_updated)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Prediction History */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-bold text-slate-900">
            Prediction History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Previous machine health predictions.
          </p>
        </div>

        {predictions.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No predictions available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">
                    Timestamp
                  </th>

                  <th className="px-6 py-4">
                    Failure Probability
                  </th>

                  <th className="px-6 py-4">
                    Failure
                  </th>

                  <th className="px-6 py-4">
                    Anomaly Score
                  </th>

                  <th className="px-6 py-4">
                    Anomaly
                  </th>

                  <th className="px-6 py-4">
                    Risk
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {predictions.map((prediction) => (
                  <tr
                    key={prediction.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(prediction.created_at)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">
                        {(
                          prediction.failure_probability * 100
                        ).toFixed(1)}
                        %
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {prediction.failure_prediction ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          <AlertTriangle size={13} />
                          Predicted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          <CheckCircle2 size={13} />
                          No Failure
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700">
                      {prediction.anomaly_score.toFixed(4)}
                    </td>

                    <td className="px-6 py-4">
                      {prediction.is_anomaly ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          Yes
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          No
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${riskClass(
                          prediction.risk_level
                        )}`}
                      >
                        {prediction.risk_level}
                      </span>
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