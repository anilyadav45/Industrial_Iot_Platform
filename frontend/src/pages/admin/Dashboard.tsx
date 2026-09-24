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

  const [sensorStats, setSensorStats] = useState<
    SensorStatistic[]
  >([]);

  const [recentReadings, setRecentReadings] = useState<
    RecentReading[]
  >([]);

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
        console.error(
          "Dashboard data loading failed:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const infrastructureCards = [
    {
      title: "Organizations",
      value: stats.organizations,
    },
    {
      title: "Factories",
      value: stats.factories,
    },
    {
      title: "Production Lines",
      value: stats.productionLines,
    },
    {
      title: "Machines",
      value: stats.machines,
    },
    {
      title: "Sensors",
      value: stats.sensors,
    },
  ];

  const analyticsCards = [
    {
      title: "Total Readings",
      value: analytics?.total_readings ?? 0,
    },
    {
      title: "Active Sensors",
      value: analytics?.total_sensors ?? 0,
    },
    {
      title: "Minimum Value",
      value: analytics?.minimum_value ?? 0,
    },
    {
      title: "Maximum Value",
      value: analytics?.maximum_value ?? 0,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Admin Dashboard
        </h1>

        <p className="text-slate-500 mt-2">
          Industrial infrastructure and IoT analytics overview
        </p>
      </div>

      {/* Infrastructure */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Infrastructure
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
          {infrastructureCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
            >
              <p className="text-sm text-slate-500">
                {card.title}
              </p>

              <p className="text-3xl font-bold text-slate-900 mt-3">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          IoT Analytics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {analyticsCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
            >
              <p className="text-sm text-slate-500">
                {card.title}
              </p>

              <p className="text-3xl font-bold text-slate-900 mt-3">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor Statistics */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Sensor Statistics
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Statistical summary for each sensor
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Sensor
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Type
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Unit
                  </th>

                  <th className="text-right px-6 py-4 font-semibold text-slate-600">
                    Readings
                  </th>

                  <th className="text-right px-6 py-4 font-semibold text-slate-600">
                    Average
                  </th>

                  <th className="text-right px-6 py-4 font-semibold text-slate-600">
                    Minimum
                  </th>

                  <th className="text-right px-6 py-4 font-semibold text-slate-600">
                    Maximum
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {sensorStats.map((sensor) => (
                  <tr
                    key={sensor.sensor_id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {sensor.sensor_code}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {sensor.sensor_type}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {sensor.unit}
                    </td>

                    <td className="px-6 py-4 text-right text-slate-600">
                      {sensor.reading_count.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-right text-slate-600">
                      {sensor.average}
                    </td>

                    <td className="px-6 py-4 text-right text-slate-600">
                      {sensor.minimum}
                    </td>

                    <td className="px-6 py-4 text-right text-slate-600">
                      {sensor.maximum}
                    </td>
                  </tr>
                ))}

                {sensorStats.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No sensor statistics available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Readings */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Recent Sensor Readings
        </h2>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Reading ID
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Sensor ID
                  </th>

                  <th className="text-right px-6 py-4 font-semibold text-slate-600">
                    Value
                  </th>

                  <th className="text-right px-6 py-4 font-semibold text-slate-600">
                    Timestamp
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {recentReadings.map((reading) => (
                  <tr
                    key={reading.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-slate-700">
                      #{reading.id}
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      Sensor #{reading.sensor_id}
                    </td>

                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      {reading.value}
                    </td>

                    <td className="px-6 py-4 text-right text-slate-500">
                      {new Date(
                        reading.timestamp
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {recentReadings.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No recent readings available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}