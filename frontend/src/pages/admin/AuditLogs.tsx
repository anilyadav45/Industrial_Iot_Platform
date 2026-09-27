import { useEffect, useState } from "react";
import {
  Activity,
  Clock,
  Database,
  Globe,
  RefreshCw,
  User,
} from "lucide-react";

import { getAuditLogs } from "../../services/auditService";

interface AuditLog {
  id: number;
  action: string;
  created_at: string;
  description: string;
  ip_address: string;
  resource_id: number | null;
  resource_type: string | null;
  user_id: number;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAuditLogs();

      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-200 p-3 text-slate-700">
            <Activity size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Audit Logs
            </h1>

            <p className="text-sm text-slate-500">
              Track important platform activities and system actions
            </p>
          </div>
        </div>

        <button
          onClick={loadLogs}
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

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Events
            </p>

            <Activity
              size={20}
              className="text-blue-500"
            />
          </div>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {logs.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Users
            </p>

            <User
              size={20}
              className="text-purple-500"
            />
          </div>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {new Set(logs.map((log) => log.user_id)).size}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Resource Types
            </p>

            <Database
              size={20}
              className="text-green-500"
            />
          </div>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {
              new Set(
                logs
                  .map((log) => log.resource_type)
                  .filter(Boolean)
              ).size
            }
          </p>
        </div>
      </div>

      {/* Audit Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Activity History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Recent actions recorded by the platform
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No audit logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">
                    Event
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    User
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Resource
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    IP Address
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {log.action}
                      </div>

                      <div className="mt-1 max-w-md text-xs text-slate-500">
                        {log.description}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User
                          size={15}
                          className="text-slate-400"
                        />

                        <span className="font-medium text-slate-700">
                          User #{log.user_id}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {log.resource_type ? (
                        <div>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            {log.resource_type}
                          </span>

                          {log.resource_id !== null && (
                            <div className="mt-1 text-xs text-slate-500">
                              ID: {log.resource_id}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Globe
                          size={15}
                          className="text-slate-400"
                        />

                        {log.ip_address}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock
                          size={15}
                          className="text-slate-400"
                        />

                        {new Date(
                          log.created_at
                        ).toLocaleString()}
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

export default AuditLogs;