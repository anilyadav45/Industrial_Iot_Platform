import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Clock,
  Database,
  Gauge,
  RefreshCw,
  Server,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { getSensors, getMachines } from "../../services/adminService";
import { getSensorReadings } from "../../services/sensorService";

interface Sensor {
  id: number;
  sensor_code: string;
  sensor_type: string;
  unit: string;
  machine_id: number;
}

interface Machine {
  id: number;
  name: string;
  machine_code: string;
}

interface Reading {
  id?: number;
  sensor_id?: number;
  value: number;
  timestamp?: string;
  created_at?: string;
}

function formatSensorType(type: string) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date?: string) {
  if (!date) return "—";

  return new Date(date).toLocaleString();
}

export default function SensorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const sensorId = Number(id);

  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [sensorsData, machinesData, readingsData] =
        await Promise.all([
          getSensors(),
          getMachines(),
          getSensorReadings(sensorId),
        ]);

      const selectedSensor = sensorsData.find(
        (item: Sensor) => item.id === sensorId
      );

      setSensor(selectedSensor || null);

      const selectedMachine = machinesData.find(
        (item: Machine) => item.id === selectedSensor?.machine_id
      );

      setMachine(selectedMachine || null);

      /*
       * The API may return either:
       *
       * [...]
       *
       * or:
       *
       * { readings: [...] }
       *
       * Support both formats.
       */
      const actualReadings = Array.isArray(readingsData)
        ? readingsData
        : readingsData?.readings || [];

      setReadings(actualReadings);
    } catch (err) {
      console.error(err);
      setError("Failed to load sensor details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (sensorId) {
      loadData();
    }
  }, [sensorId]);

  const latestReading = readings.length
    ? readings[0]
    : null;

  const values = useMemo(() => {
    return readings
      .map((reading) => Number(reading.value))
      .filter((value) => Number.isFinite(value));
  }, [readings]);

  const average = values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;

  const minimum = values.length
    ? Math.min(...values)
    : 0;

  const maximum = values.length
    ? Math.max(...values)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">
          Loading sensor details...
        </p>
      </div>
    );
  }

  if (error || !sensor) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            {error || "Sensor not found."}
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/sensors")}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} />
          Back to Sensors
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            onClick={() => navigate("/admin/sensors")}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Sensors
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <Gauge size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {sensor.sensor_code}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {formatSensorType(sensor.sensor_type)}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Sensor Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Activity className="text-blue-600" size={21} />

          <div>
            <h2 className="font-bold text-slate-900">
              Sensor Information
            </h2>

            <p className="text-sm text-slate-500">
              Configuration and machine association
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Sensor ID
            </p>

            <p className="mt-2 font-bold text-slate-900">
              #{sensor.id}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Sensor Type
            </p>

            <p className="mt-2 font-bold text-slate-900">
              {formatSensorType(sensor.sensor_type)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Unit
            </p>

            <p className="mt-2 font-bold text-slate-900">
              {sensor.unit}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Machine
            </p>

            <p className="mt-2 font-bold text-slate-900">
              {machine?.name || `Machine #${sensor.machine_id}`}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Latest Reading
            </p>

            <Activity size={19} className="text-blue-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {latestReading
              ? Number(latestReading.value).toFixed(2)
              : "—"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {sensor.unit}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Average
            </p>

            <Server size={19} className="text-purple-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {average.toFixed(2)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Based on loaded readings
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Minimum
            </p>

            <TrendingDown size={19} className="text-green-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {minimum.toFixed(2)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {sensor.unit}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Maximum
            </p>

            <TrendingUp size={19} className="text-red-500" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {maximum.toFixed(2)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {sensor.unit}
          </p>
        </div>
      </div>

      {/* Latest Reading */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Clock className="text-blue-600" size={21} />

          <div>
            <h2 className="font-bold text-slate-900">
              Latest Reading
            </h2>

            <p className="text-sm text-slate-500">
              Most recent value received from this sensor
            </p>
          </div>
        </div>

        {latestReading ? (
          <div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-4xl font-bold text-slate-900">
                {Number(latestReading.value).toFixed(2)}
                <span className="ml-2 text-lg font-medium text-slate-500">
                  {sensor.unit}
                </span>
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Recorded{" "}
                {formatDate(
                  latestReading.timestamp ||
                    latestReading.created_at
                )}
              </p>
            </div>

            <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              Sensor Active
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No readings available for this sensor.
          </p>
        )}
      </div>

      {/* Readings Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              Real Sensor Readings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Data retrieved directly from the sensor readings API.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
            <Database size={14} />
            {readings.length.toLocaleString()} loaded
          </div>
        </div>

        {readings.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No readings found for this sensor.
          </div>
        ) : (
          <div className="max-h-[600px] overflow-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">
                    #
                  </th>

                  <th className="px-6 py-4">
                    Value
                  </th>

                  <th className="px-6 py-4">
                    Unit
                  </th>

                  <th className="px-6 py-4">
                    Timestamp
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {readings.map((reading, index) => (
                  <tr
                    key={
                      reading.id ??
                      `${reading.timestamp}-${index}`
                    }
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">
                        {Number(reading.value).toFixed(2)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {sensor.unit}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(
                        reading.timestamp ||
                          reading.created_at
                      )}
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