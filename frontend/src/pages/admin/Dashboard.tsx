import { useEffect, useState } from "react";

import {
  getOrganizations,
  getFactories,
  getProductionLines,
  getMachines,
  getSensors,
} from "../../services/adminService";

import {
  getAnalyticsOverview,
  getSensorStatistics,
  getRecentReadings,
} from "../../services/analyticsService";

interface AnalyticsOverview {
  total_readings: number;
  total_sensors: number;
  average_value: number;
  minimum_value: number;
  maximum_value: number;
}

interface SensorStatistic {
  sensor_id: number;
  sensor_code: string;
  sensor_type: string;
  unit: string;
  reading_count: number;
  average: number;
  minimum: number;
  maximum: number;
}

interface RecentReading {
  id: number;
  sensor_id: number;
  value: number;
  timestamp: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    organizations: 0,
    factories: 0,
    productionLines: 0,
    machines: 0,
    sensors: 0,
  });

  const [analytics, setAnalytics] =
    useState<AnalyticsOverview | null>(null);

  const [sensorStats, setSensorStats] = useState<SensorStatistic[]>([]);
  const [recentReadings, setRecentReadings] = useState<RecentReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          organizations,
          factories,
          productionLines,
          machines,
          sensors,
          overview,
          sensorStatistics,
          readings,
        ] = await Promise.all([
          getOrganizations(),
          getFactories(),
          getProductionLines(),
          getMachines(),
          getSensors(),
          getAnalyticsOverview(),
          getSensorStatistics(),
          getRecentReadings(10),
        ]);

        setStats({
          organizations: organizations.length,
          factories: factories.length,
          productionLines: productionLines.length,
          machines: machines.length,
          sensors: sensors.length,
        });

        setAnalytics(overview);
        setSensorStats(sensorStatistics);
        setRecentReadings(readings);
      } catch (error) {
        console.error("Dashboard loading failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-slate-500">
            Loading Industrial IQ...
          </p>
        </div>
      </div>
    );
  }

  const infrastructureCards = [
    {
      label: "Organizations",
      value: stats.organizations,
      icon: "▤",
    },
    {
      label: "Factories",
      value: stats.factories,
      icon: "⌂",
    },
    {
      label: "Production Lines",
      value: stats.productionLines,
      icon: "≡",
    },
    {
      label: "Machines",
      value: stats.machines,
      icon: "⚙",
    },
    {
      label: "Sensors",
      value: stats.sensors,
      icon: "◉",
    },
  ];

  const analyticsCards = [
    {
      label: "Total Readings",
      value: analytics?.total_readings.toLocaleString() ?? "0",
      description: "Sensor data points",
    },
    {
      label: "Active Sensors",
      value: analytics?.total_sensors ?? 0,
      description: "Connected sensors",
    },
    {
      label: "Minimum Reading",
      value: analytics?.minimum_value ?? 0,
      description: "Observed value",
    },
    {
      label: "Maximum Reading",
      value: analytics?.maximum_value ?? 0,
      description: "Observed value",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-950 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-medium text-blue-400">
            INDUSTRIAL OPERATIONS CENTER
          </p>

          <h1 className="mt-2 text-3xl lg:text-4xl font-bold tracking-tight">
            Industrial IoT Dashboard
          </h1>

          <p className="mt-3 text-slate-400">
            Monitor your industrial infrastructure, sensor activity,
            machine data and operational analytics from one place.
          </p>
        </div>

        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
      </section>

      {/* Infrastructure */}
      <section>
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">
            Infrastructure
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Platform Overview
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {infrastructureCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                  {card.icon}
                </div>

                <span className="text-xs text-emerald-600 font-medium">
                  ACTIVE
                </span>
              </div>

              <p className="text-3xl font-bold text-slate-900 mt-5">
                {card.value}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                {card.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Analytics */}
      <section>
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">
            Data Analytics
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Sensor Activity
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {analyticsCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">
                {card.label}
              </p>

              <p className="text-3xl font-bold text-slate-900 mt-3">
                {card.value}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Two-column section */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Sensor table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200">
            <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">
              Monitoring
            </p>

            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Sensor Statistics
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Current aggregated sensor performance.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Sensor
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Type
                  </th>

                  <th className="text-right px-6 py-4 font-semibold text-slate-600">
                    Readings
                  </th>

                  <th className="text-right px-6 py-4 font-semibold text-slate-600">
                    Average
                  </th>

                  <th className="text-right px-6 py-4 font-semibold text-slate-600">
                    Maximum
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sensorStats.map((sensor) => (
                  <tr
                    key={sensor.sensor_id}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {sensor.sensor_code}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Sensor #{sensor.sensor_id}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {sensor.sensor_type}
                    </td>

                    <td className="px-6 py-4 text-right text-slate-600">
                      {sensor.reading_count.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      {sensor.average} {sensor.unit}
                    </td>

                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      {sensor.maximum} {sensor.unit}
                    </td>
                  </tr>
                ))}

                {sensorStats.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No sensor statistics available.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>

        {/* System status */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">
            System
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Platform Status
          </h2>

          <div className="mt-6 space-y-4">

            {[
              ["API Server", "Operational"],
              ["Database", "Connected"],
              ["Sensor Pipeline", "Active"],
              ["ML Engine", "Ready"],
            ].map(([name, status]) => (
              <div
                key={name}
                className="flex items-center justify-between border-b border-slate-100 pb-4"
              >
                <span className="text-sm text-slate-600">
                  {name}
                </span>

                <span className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {status}
                </span>
              </div>
            ))}

          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              Data points collected
            </p>

            <p className="text-2xl font-bold text-slate-900 mt-1">
              {analytics?.total_readings.toLocaleString() ?? "0"}
            </p>
          </div>
        </div>

      </section>

      {/* Recent readings */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">
          <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">
            Live Data
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Recent Sensor Readings
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                  Reading
                </th>

                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                  Sensor
                </th>

                <th className="text-right px-6 py-4 font-semibold text-slate-600">
                  Value
                </th>

                <th className="text-right px-6 py-4 font-semibold text-slate-600">
                  Timestamp
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {recentReadings.map((reading) => (
                <tr
                  key={reading.id}
                  className="hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    #{reading.id}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    Sensor #{reading.sensor_id}
                  </td>

                  <td className="px-6 py-4 text-right font-semibold text-slate-900">
                    {reading.value}
                  </td>

                  <td className="px-6 py-4 text-right text-slate-500">
                    {new Date(reading.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}

              {recentReadings.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    No recent readings available.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

      </section>

    </div>
  );
}