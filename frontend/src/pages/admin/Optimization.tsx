import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  DollarSign,
  RefreshCw,
  Server,
  Sparkles,
  XCircle,
} from "lucide-react";

import {
  acknowledgeRecommendation,
  getRecommendations,
  resolveRecommendation,
} from "../../services/optimizationService";

interface Recommendation {
  id: number;
  resource_id: number;
  recommendation_type: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  current_utilization: number;
  recommended_utilization: number;
  estimated_monthly_savings: number;
  created_at: string;
  acknowledged_at: string | null;
  acknowledged_by: number | null;
  resolved_at: string | null;
  resolved_by: number | null;
}

const Optimization = () => {
  const [recommendations, setRecommendations] = useState<
    Recommendation[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState<number | null>(
    null
  );

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getRecommendations();

      setRecommendations(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load optimization recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleAcknowledge = async (id: number) => {
    try {
      setActionLoading(id);

      await acknowledgeRecommendation(id);

      await loadRecommendations();
    } catch (err) {
      console.error(err);
      setError("Failed to acknowledge recommendation.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      setActionLoading(id);

      await resolveRecommendation(id);

      await loadRecommendations();
    } catch (err) {
      console.error(err);
      setError("Failed to resolve recommendation.");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = recommendations.filter(
    (recommendation) =>
      recommendation.status === "PENDING"
  ).length;

  const acknowledgedCount = recommendations.filter(
    (recommendation) =>
      recommendation.status === "ACKNOWLEDGED"
  ).length;

  const resolvedCount = recommendations.filter(
    (recommendation) =>
      recommendation.status === "RESOLVED"
  ).length;

  const totalSavings = recommendations.reduce(
    (sum, recommendation) =>
      sum +
      (recommendation.estimated_monthly_savings || 0),
    0
  );

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "ACKNOWLEDGED":
        return "bg-blue-100 text-blue-700";

      case "RESOLVED":
        return "bg-green-100 text-green-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-700";

      case "WARNING":
        return "bg-orange-100 text-orange-700";

      case "INFO":
        return "bg-slate-100 text-slate-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
            <Sparkles size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Optimization
            </h1>

            <p className="text-sm text-slate-500">
              Cloud resource optimization recommendations
            </p>
          </div>
        </div>

        <button
          onClick={loadRecommendations}
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
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Recommendations
            </p>

            <Sparkles
              size={20}
              className="text-purple-500"
            />
          </div>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {recommendations.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Pending
            </p>

            <Clock3
              size={20}
              className="text-yellow-500"
            />
          </div>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Resolved
            </p>

            <CheckCircle2
              size={20}
              className="text-green-500"
            />
          </div>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {resolvedCount}
          </p>

          {acknowledgedCount > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              {acknowledgedCount} acknowledged
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Estimated Monthly Savings
            </p>

            <DollarSign
              size={20}
              className="text-green-500"
            />
          </div>

          <p className="mt-2 text-3xl font-bold text-green-600">
            ${totalSavings.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Optimization Recommendations
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Resource optimization opportunities detected by the platform
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Loading recommendations...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle2
              size={40}
              className="mx-auto text-green-400"
            />

            <p className="mt-3 font-medium text-slate-700">
              No optimization recommendations
            </p>

            <p className="mt-1 text-sm text-slate-500">
              All cloud resources are currently optimized.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">
                    Recommendation
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Resource
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Utilization
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Savings
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Severity
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recommendations.map((recommendation) => (
                  <tr
                    key={recommendation.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="max-w-sm px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {recommendation.title}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {recommendation.description}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        {recommendation.recommendation_type}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Server
                          size={16}
                          className="text-slate-400"
                        />

                        <span className="font-medium text-slate-700">
                          Resource #{recommendation.resource_id}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">
                        {recommendation.current_utilization}%
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        Target:{" "}
                        {recommendation.recommended_utilization}%
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">
                        $
                        {recommendation.estimated_monthly_savings.toFixed(
                          2
                        )}
                      </span>

                      <div className="text-xs text-slate-400">
                        / month
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getSeverityClass(
                          recommendation.severity
                        )}`}
                      >
                        {recommendation.severity}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          recommendation.status
                        )}`}
                      >
                        {recommendation.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {recommendation.status === "PENDING" && (
                          <button
                            onClick={() =>
                              handleAcknowledge(
                                recommendation.id
                              )
                            }
                            disabled={
                              actionLoading === recommendation.id
                            }
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            Acknowledge
                          </button>
                        )}

                        {recommendation.status !== "RESOLVED" && (
                          <button
                            onClick={() =>
                              handleResolve(
                                recommendation.id
                              )
                            }
                            disabled={
                              actionLoading === recommendation.id
                            }
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            Resolve
                          </button>
                        )}

                        {recommendation.status === "RESOLVED" && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                            <CheckCircle2 size={14} />
                            Completed
                          </span>
                        )}
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
};

export default Optimization;