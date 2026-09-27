import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Activity,
  Gauge,
  Plus,
  RefreshCw,
  Thermometer,
  Wrench,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  createSensor,
  getMachines,
  getSensors,
} from "../../services/adminService";

interface Sensor {
  id: number;
  sensor_code: string;
  sensor_type: string;
  unit: string;
  machine_id: number;
  status?: string;
}

interface Machine {
  id: number;
  name: string;
  machine_code: string;
}

const SENSOR_TYPES = [
  {
    value: "TEMPERATURE",
    label: "Temperature",
    unit: "°C",
  },
  {
    value: "VIBRATION",
    label: "Vibration",
    unit: "mm/s",
  },
  {
    value: "TORQUE",
    label: "Torque",
    unit: "Nm",
  },
  {
    value: "ENERGY",
    label: "Energy",
    unit: "kWh",
  },
  {
    value: "ROTATIONAL_SPEED",
    label: "Rotational Speed",
    unit: "RPM",
  },
  {
    value: "AIR_TEMPERATURE",
    label: "Air Temperature",
    unit: "K",
  },
  {
    value: "PROCESS_TEMPERATURE",
    label: "Process Temperature",
    unit: "K",
  },
  {
    value: "TOOL_WEAR",
    label: "Tool Wear",
    unit: "min",
  },
];

const formatSensorType = (type: string) => {
  return type
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

const SensorIcon = ({ type }: { type: string }) => {
  if (
    type === "TEMPERATURE" ||
    type === "AIR_TEMPERATURE" ||
    type === "PROCESS_TEMPERATURE"
  ) {
    return <Thermometer size={18} />;
  }

  if (type === "TOOL_WEAR") {
    return <Wrench size={18} />;
  }

  if (type === "ROTATIONAL_SPEED") {
    return <Gauge size={18} />;
  }

  return <Activity size={18} />;
};

export default function Sensors() {
  const navigate = useNavigate();

  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [sensorCode, setSensorCode] = useState("");
  const [sensorType, setSensorType] = useState("");
  const [unit, setUnit] = useState("");
  const [machineId, setMachineId] = useState("");

  const [formError, setFormError] = useState("");

  const loadData = async () => {
    try {
      setError("");

      const [sensorData, machineData] =
        await Promise.all([
          getSensors(),
          getMachines(),
        ]);

      setSensors(sensorData);
      setMachines(machineData);
    } catch (err) {
      console.error(err);
      setError("Failed to load sensors.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleCreateSensor = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFormError("");

    if (!sensorCode.trim()) {
      setFormError("Sensor code is required.");
      return;
    }

    if (!sensorType) {
      setFormError("Please select a sensor type.");
      return;
    }

    if (!unit.trim()) {
      setFormError("Unit is required.");
      return;
    }

    if (!machineId) {
      setFormError("Please select a machine.");
      return;
    }

    try {
      setCreating(true);

      await createSensor({
        sensor_code: sensorCode.trim(),
        sensor_type: sensorType,
        unit: unit.trim(),
        machine_id: Number(machineId),
      });

      setSensorCode("");
      setSensorType("");
      setUnit("");
      setMachineId("");
      setFormError("");
      setShowForm(false);

      await loadData();
    } catch (err: any) {
      console.error(err);

      setFormError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to create sensor."
      );
    } finally {
      setCreating(false);
    }
  };

  const getMachineName = (machineId: number) => {
    const machine = machines.find(
      (item) => item.id === machineId
    );

    return machine
      ? machine.name
      : `Machine #${machineId}`;
  };

  const sensorTypes = new Set(
    sensors.map((sensor) => sensor.sensor_type)
  );

  const machinesCovered = new Set(
    sensors.map((sensor) => sensor.machine_id)
  );

  const activeSensors = sensors.filter(
    (sensor) =>
      !sensor.status ||
      sensor.status.toUpperCase() === "ACTIVE"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Activity size={20} />
            </div>

            <div>
              <p className="text-sm font-medium text-blue-600">
                IoT Infrastructure
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Sensors
              </h1>
            </div>
          </div>

          <p className="max-w-2xl text-sm text-slate-500">
            Monitor and manage sensors connected to
            your industrial machines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "animate-spin" : ""
              }
            />
            Refresh
          </button>

          <button
            onClick={() => {
              setShowForm(true);
              setFormError("");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={17} />
            Add Sensor
          </button>
        </div>
      </div>

      {/* Add Sensor Form */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Add New Sensor
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Register a sensor and assign it to a
                machine.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormError("");
              }}
              disabled={creating}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed"
            >
              <X size={18} />
            </button>
          </div>

          {formError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form
            onSubmit={handleCreateSensor}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {/* Sensor Code */}
            <div>
              <label
                htmlFor="sensor-code"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Sensor Code
              </label>

              <input
                id="sensor-code"
                value={sensorCode}
                onChange={(event) =>
                  setSensorCode(event.target.value)
                }
                placeholder="e.g. TEMP-002"
                disabled={creating}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            {/* Sensor Type */}
            <div>
              <label
                htmlFor="sensor-type"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Sensor Type
              </label>

              <select
                id="sensor-type"
                value={sensorType}
                onChange={(event) => {
                  const value = event.target.value;

                  setSensorType(value);

                  const selectedType =
                    SENSOR_TYPES.find(
                      (item) => item.value === value
                    );

                  if (selectedType) {
                    setUnit(selectedType.unit);
                  } else {
                    setUnit("");
                  }
                }}
                disabled={creating}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  Select sensor type
                </option>

                {SENSOR_TYPES.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label
                htmlFor="sensor-unit"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Unit
              </label>

              <input
                id="sensor-unit"
                value={unit}
                onChange={(event) =>
                  setUnit(event.target.value)
                }
                placeholder="e.g. °C"
                disabled={creating}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            {/* Machine */}
            <div>
              <label
                htmlFor="sensor-machine"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Machine
              </label>

              <select
                id="sensor-machine"
                value={machineId}
                onChange={(event) =>
                  setMachineId(event.target.value)
                }
                disabled={creating}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  Select machine
                </option>

                {machines.map((machine) => (
                  <option
                    key={machine.id}
                    value={machine.id}
                  >
                    {machine.name} (
                    {machine.machine_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormError("");
                }}
                disabled={creating}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Sensor
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Sensors
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "—" : sensors.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Activity size={21} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Registered industrial sensors
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Sensor Types
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "—" : sensorTypes.size}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Gauge size={21} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Different measurement categories
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Machines Covered
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "—" : machinesCovered.size}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Wrench size={21} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Machines with connected sensors
          </p>
        </div>
      </div>

      {/* Sensor List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Sensor Registry
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              All sensors currently registered in the
              platform.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
            {loading
              ? "Loading..."
              : `${activeSensors} active`}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <RefreshCw
                size={18}
                className="animate-spin"
              />
              Loading sensors...
            </div>
          </div>
        ) : sensors.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Activity size={25} />
            </div>

            <h3 className="text-base font-semibold text-slate-900">
              No sensors found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Add your first sensor to start collecting
              industrial telemetry.
            </p>

            <button
              onClick={() => {
                setShowForm(true);
                setFormError("");
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={17} />
              Add Sensor
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Sensor
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Unit
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Machine
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sensors.map((sensor) => {
                  const isActive =
                    !sensor.status ||
                    sensor.status.toUpperCase() ===
                      "ACTIVE";

                  return (
                    <tr
                      key={sensor.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      {/* Sensor */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/sensors/${sensor.id}`
                            )
                          }
                          className="flex items-center gap-3 text-left"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <SensorIcon
                              type={sensor.sensor_type}
                            />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900 transition hover:text-blue-600">
                              {sensor.sensor_code}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              ID #{sensor.id}
                            </p>
                          </div>
                        </button>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                          {formatSensorType(
                            sensor.sensor_type
                          )}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-700">
                          {sensor.unit}
                        </span>
                      </td>

                      {/* Machine */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {getMachineName(
                              sensor.machine_id
                            )}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Machine ID #{sensor.machine_id}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />

                          {sensor.status || "ACTIVE"}
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