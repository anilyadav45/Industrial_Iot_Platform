import { useEffect, useState } from "react";
import {
    Activity,
    Gauge,
    Plus,
    RefreshCw,
    Thermometer,
    Wrench,
} from "lucide-react";

import { getMachines, getSensors } from "../../services/adminService";
import { useNavigate } from "react-router-dom";

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

function formatSensorType(type: string) {
    return type
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function SensorIcon({ type }: { type: string }) {
    if (type.includes("TEMPERATURE")) {
        return <Thermometer size={18} />;
    }

    if (type === "TOOL_WEAR") {
        return <Wrench size={18} />;
    }

    return <Activity size={18} />;
}

export default function Sensors() {
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [sensorData, machineData] = await Promise.all([
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
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const getMachineName = (machineId: number) => {
        const machine = machines.find((item) => item.id === machineId);

        return machine
            ? machine.name
            : `Machine #${machineId}`;
    };

    const sensorTypes = new Set(
        sensors.map((sensor) => sensor.sensor_type)
    ).size;

    const getSensorCardIcon = () => {
        return <Gauge size={20} />;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Industrial IQ
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-slate-900">
                        Sensors
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Monitor and manage industrial sensor streams.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                    <button
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                        <Plus size={17} />
                        Add Sensor
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Total Sensors
                        </p>

                        <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                            <Activity size={20} />
                        </div>
                    </div>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                        {sensors.length}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Registered sensor streams
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Sensor Types
                        </p>

                        <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                            <Gauge size={20} />
                        </div>
                    </div>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                        {sensorTypes}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Different measurement types
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Machines Covered
                        </p>

                        <div className="rounded-lg bg-green-100 p-2 text-green-600">
                            {getSensorCardIcon()}
                        </div>
                    </div>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                        {new Set(sensors.map((sensor) => sensor.machine_id)).size}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Machines with sensors
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                    <h2 className="font-bold text-slate-900">
                        Sensor Registry
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        All sensors registered in the platform.
                    </p>
                </div>

                {loading ? (
                    <div className="px-6 py-12 text-center text-sm text-slate-500">
                        Loading sensors...
                    </div>
                ) : sensors.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-slate-500">
                        No sensors found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Sensor</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Unit</th>
                                    <th className="px-6 py-4">Machine</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {sensors.map((sensor) => (
                                    <tr
                                        key={sensor.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                                                    <SensorIcon
                                                        type={sensor.sensor_type}
                                                    />
                                                </div>

                                                <div>

                                                    <button
                                                        onClick={() => navigate(`/admin/sensors/${sensor.id}`)}
                                                        className="text-left font-semibold text-slate-900 hover:text-blue-600"
                                                    >
                                                        {sensor.sensor_code}
                                                    </button>

                                                    <p className="text-xs text-slate-500">
                                                        ID #{sensor.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-700">
                                            {formatSensorType(sensor.sensor_type)}
                                        </td>

                                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                            {sensor.unit}
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-900">
                                                {getMachineName(sensor.machine_id)}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                Machine #{sensor.machine_id}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                                Active
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