import { useEffect, useState } from "react";
import { BrainCircuit, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
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

const MLPredictions = () => {
  const navigate = useNavigate();

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPredictions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllPredictions();

      setPredictions(Array.isArray(data) ? data : []);
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

  const getRiskClass = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case "HIGH":
        return "bg-red-100 text-red-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "LOW":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const totalPredictions = predictions.length;

  const anomalies = predictions.filter(
    (prediction) => prediction.is_anomaly
  ).length;

  const failures = predictions.filter(
    (prediction) => prediction.failure_prediction === 1
  ).length;

  const highRisk = predictions.filter(
    (prediction) => prediction.risk_level?.toUpperCase() === "HIGH"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
              <BrainCircuit size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                ML Predictions
              </h1>

              <p className="text-sm text-slate-500">
                Machine learning predictions across the platform
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadPredictions}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
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
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Predictions
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalPredictions}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Anomalies
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-600">
            {anomalies}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Predicted Failures
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {failures}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            High Risk
          </p>

          <p className="mt-2 text-3xl font-bold text-purple-600">
            {highRisk}
          </p>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Prediction History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest machine learning analysis results
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Loading predictions...
          </div>
        ) : predictions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BrainCircuit
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium text-slate-700">
              No ML predictions available
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Run ML analysis on a machine to generate predictions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">
                    Machine
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Risk
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Failure Probability
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Failure
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Anomaly
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Anomaly Score
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Analyzed
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {predictions.map((prediction) => (
                  <tr
                    key={prediction.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/machines/${prediction.machine_id}/ml`
                          )
                        }
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Machine #{prediction.machine_id}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getRiskClass(
                          prediction.risk_level
                        )}`}
                      >
                        {prediction.risk_level}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700">
                      {(
                        prediction.failure_probability * 100
                      ).toFixed(1)}
                      %
                    </td>

                    <td className="px-6 py-4">
                      {prediction.failure_prediction === 1 ? (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <AlertTriangle size={16} />
                          Predicted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle2 size={16} />
                          Normal
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {prediction.is_anomaly ? (
                        <span className="font-medium text-orange-600">
                          Yes
                        </span>
                      ) : (
                        <span className="font-medium text-green-600">
                          No
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {prediction.anomaly_score?.toFixed(4)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                      {new Date(
                        prediction.created_at
                      ).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/machines/${prediction.machine_id}/ml`
                          )
                        }
                        className="text-sm font-semibold text-purple-600 hover:text-purple-800"
                      >
                        View ML
                      </button>
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
};

export default MLPredictions;