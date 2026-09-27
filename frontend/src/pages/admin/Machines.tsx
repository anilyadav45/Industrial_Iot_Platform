import { useEffect, useState } from "react";
import {
    Activity,
    Factory,
    MonitorCog,
    Power,
    RefreshCw,
} from "lucide-react";

import { getMachines } from "../../services/adminService";
import { useNavigate } from "react-router-dom";

interface Machine {
    id: number;
    machine_code: string;
    name: string;
    machine_type: string;
    factory_id: number;
    production_line_id: number | null;
    status: string;
}

export default function Machines() {
    const navigate = useNavigate();
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadMachines = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await getMachines();
            setMachines(data);
        } catch (err) {
            console.error("Failed to load machines:", err);
            setError("Unable to load machines.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadMachines();
    }, []);

    const onlineMachines = machines.filter(
        (machine) => machine.status === "ONLINE"
    ).length;

    const offlineMachines = machines.filter(
        (machine) => machine.status !== "ONLINE"
    ).length;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-sm text-slate-500">
                        Loading machines...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">
                        Industrial Assets
                    </p>

                    <h1 className="text-3xl font-bold text-slate-900 mt-1">
                        Machines
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Monitor machines connected to your industrial infrastructure.
                    </p>
                </div>

                <button
                    onClick={() => loadMachines(true)}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 transition"
                >
                    <RefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                    />

                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <MonitorCog size={21} />
                        </div>

                        <span className="text-xs font-semibold text-slate-400">
                            TOTAL
                        </span>
                    </div>

                    <p className="text-3xl font-bold text-slate-900 mt-5">
                        {machines.length}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                        Registered machines
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Activity size={21} />
                        </div>

                        <span className="text-xs font-semibold text-emerald-600">
                            ONLINE
                        </span>
                    </div>

                    <p className="text-3xl font-bold text-slate-900 mt-5">
                        {onlineMachines}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                        Currently operational
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                            <Power size={21} />
                        </div>

                        <span className="text-xs font-semibold text-slate-500">
                            OFFLINE
                        </span>
                    </div>

                    <p className="text-3xl font-bold text-slate-900 mt-5">
                        {offlineMachines}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                        Not currently operational
                    </p>
                </div>

            </div>

            {/* Machine Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                <div className="px-6 py-5 border-b border-slate-200">
                    <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">
                        Machine Registry
                    </p>

                    <h2 className="text-lg font-bold text-slate-900 mt-1">
                        All Machines
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        Machines currently registered in the platform.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">

                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                                    Machine
                                </th>

                                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                                    Code
                                </th>

                                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                                    Type
                                </th>

                                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                                    Factory
                                </th>

                                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                                    Production Line
                                </th>

                                <th className="text-right px-6 py-4 font-semibold text-slate-600">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">

                            {machines.map((machine) => {
                                const isOnline = machine.status === "ONLINE";

                                return (
                                    <tr
                                        key={machine.id}
                                        className="hover:bg-slate-50 transition"
                                    >
                                        {/* Machine */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                                                    <MonitorCog size={18} />
                                                </div>

                                                <div>
                                                    
                                                        <button
                                                            onClick={() => navigate(`/admin/machines/${machine.id}`)}
                                                            className="text-left font-semibold text-slate-900 hover:text-blue-600"
                                                        >
                                                            {machine.name}
                                                        </button>
                                                   
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Machine #{machine.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Code */}
                                        <td className="px-6 py-5">
                                            <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg">
                                                {machine.machine_code}
                                            </span>
                                        </td>

                                        {/* Type */}
                                        <td className="px-6 py-5">
                                            <span className="text-slate-600">
                                                {machine.machine_type}
                                            </span>
                                        </td>

                                        {/* Factory */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Factory size={15} />
                                                Factory #{machine.factory_id}
                                            </div>
                                        </td>

                                        {/* Production line */}
                                        <td className="px-6 py-5 text-slate-600">
                                            {machine.production_line_id
                                                ? `Line #${machine.production_line_id}`
                                                : "Not assigned"}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-5 text-right">
                                            <span
                                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isOnline
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-600"
                                                    }`}
                                            >
                                                <span
                                                    className={`w-2 h-2 rounded-full ${isOnline
                                                            ? "bg-emerald-500"
                                                            : "bg-slate-400"
                                                        }`}
                                                />

                                                {machine.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}

                            {machines.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-12 text-center text-slate-500"
                                    >
                                        No machines found.
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}