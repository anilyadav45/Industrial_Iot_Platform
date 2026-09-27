import { useEffect, useState } from "react";
import {
    Cloud,
    Cpu,
    Database,
    HardDrive,
    Network,
    RefreshCw,
    Server,
} from "lucide-react";

import { getCloudResources } from "../../services/cloudService";

interface CloudResource {
    id: number;
    resource_name: string;
    resource_type: string;
    provider: string;
    region: string;

    cpu_capacity: number;
    memory_capacity: number;
    storage_capacity: number;
    network_capacity: number;

    current_cpu_usage?: number;
    current_memory_usage?: number;
    current_storage_usage?: number;
    current_network_usage?: number;

    status: string;
}

const CloudResources = () => {
    const [resources, setResources] = useState<CloudResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadResources = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getCloudResources();

            setResources(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Failed to load cloud resources.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadResources();
    }, []);


    const activeResources = resources.filter(
        (resource) => resource.status === "ACTIVE"
    ).length;

    const totalCpu = resources.reduce(
        (sum, resource) => sum + (resource.cpu_capacity || 0),
        0
    );

    const totalMemory = resources.reduce(
        (sum, resource) => sum + (resource.memory_capacity || 0),
        0
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                        <Cloud size={24} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Cloud Resources
                        </h1>

                        <p className="text-sm text-slate-500">
                            Monitor and manage cloud infrastructure resources
                        </p>
                    </div>
                </div>

                <button
                    onClick={loadResources}
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Total Resources
                        </p>

                        <Server size={20} className="text-blue-500" />
                    </div>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {resources.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Active Resources
                        </p>

                        <Cloud size={20} className="text-green-500" />
                    </div>

                    <p className="mt-2 text-3xl font-bold text-green-600">
                        {activeResources}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Total CPU
                        </p>

                        <Cpu size={20} className="text-purple-500" />
                    </div>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {totalCpu}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        CPU cores
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Total Memory
                        </p>

                        <Database size={20} className="text-orange-500" />
                    </div>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {totalMemory}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        GB
                    </p>
                </div>
            </div>

            {/* Resources */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                    <h2 className="font-semibold text-slate-900">
                        Resources
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Cloud infrastructure currently registered in the platform
                    </p>
                </div>

                {loading ? (
                    <div className="px-6 py-12 text-center text-sm text-slate-500">
                        Loading cloud resources...
                    </div>
                ) : resources.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-slate-500">
                        No cloud resources found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">
                                        Resource
                                    </th>

                                    <th className="px-6 py-3 font-semibold">
                                        Type
                                    </th>

                                    <th className="px-6 py-3 font-semibold">
                                        Provider
                                    </th>

                                    <th className="px-6 py-3 font-semibold">
                                        Region
                                    </th>

                                    <th className="px-6 py-3 font-semibold">
                                        CPU
                                    </th>

                                    <th className="px-6 py-3 font-semibold">
                                        Memory
                                    </th>

                                    <th className="px-6 py-3 font-semibold">
                                        Storage
                                    </th>

                                    <th className="px-6 py-3 font-semibold">
                                        Network
                                    </th>

                                    <th className="px-6 py-3 font-semibold">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {resources.map((resource) => (
                                    <tr
                                        key={resource.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">

                                                {resource.resource_name}
                                            </div>

                                            <div className="text-xs text-slate-500">
                                                ID: {resource.id}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                {resource.resource_type}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-slate-700">
                                            {resource.provider}
                                        </td>

                                        <td className="px-6 py-4 text-slate-700">
                                            {resource.region}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Cpu
                                                    size={15}
                                                    className="text-slate-400"
                                                />
                                                {resource.cpu_capacity} cores
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {resource.memory_capacity} GB
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <HardDrive
                                                    size={15}
                                                    className="text-slate-400"
                                                />
                                                {resource.storage_capacity} GB
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Network
                                                    size={15}
                                                    className="text-slate-400"
                                                />
                                                {resource.network_capacity} Mbps
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {resource.status === "ACTIVE" ? (
                                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                                    {resource.status}
                                                </span>
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
};

export default CloudResources;