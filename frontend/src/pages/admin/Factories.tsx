import { useEffect, useState } from "react";

import {
    Building2,
    CheckCircle2,
    Factory as FactoryIcon,
    MapPin,
    Plus,
    XCircle,
} from "lucide-react";

import {
    getFactories,
    createFactory,
    getOrganizations,
} from "../../services/adminService";

interface Organization {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
}

interface Factory {
    id: number;
    name: string;
    location: string;
    organization_id: number;
    is_active: boolean;
}

export default function Factories() {
    const [factories, setFactories] = useState<Factory[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);

    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [organizationId, setOrganizationId] = useState("");

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [factoryData, organizationData] = await Promise.all([
                getFactories(),
                getOrganizations(),
            ]);

            setFactories(factoryData);
            setOrganizations(organizationData);
        } catch (error) {
            console.error("Failed to load factories:", error);
            setError("Unable to load factory data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");

        const trimmedName = name.trim();
        const trimmedLocation = location.trim();

        if (!trimmedName || !trimmedLocation || !organizationId) {
            setError(
                "Factory name, location, and organization are required."
            );
            return;
        }

        try {
            setCreating(true);

            await createFactory(
                trimmedName,
                trimmedLocation,
                Number(organizationId)
            );

            setName("");
            setLocation("");
            setOrganizationId("");

            await loadData();
        } catch (error) {
            console.error("Failed to create factory:", error);
            setError("Unable to create factory. Please try again.");
        } finally {
            setCreating(false);
        }
    };

    const activeFactories = factories.filter(
        (factory) => factory.is_active
    ).length;

    const inactiveFactories =
        factories.length - activeFactories;

    const getOrganizationName = (organizationId: number) => {
        const organization = organizations.find(
            (item) => item.id === organizationId
        );

        return organization?.name ?? `Organization #${organizationId}`;
    };

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-blue-600">
                        <FactoryIcon size={18} />

                        <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                            Factory Management
                        </span>
                    </div>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Factories
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-slate-500">
                        Manage factories and associate them with organizations on the
                        Industrial IQ platform.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <p className="text-xs text-slate-500">
                            Total
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-900">
                            {factories.length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <p className="text-xs text-emerald-700">
                            Active
                        </p>

                        <p className="mt-1 text-xl font-bold text-emerald-700">
                            {activeFactories}
                        </p>
                    </div>
                </div>
            </section>

            {/* Create Factory */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Plus size={19} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Add Factory
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Register a new factory and assign it to an organization.
                            </p>
                        </div>

                    </div>
                </div>

                <form
                    onSubmit={handleCreate}
                    className="p-6"
                >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                        {/* Factory Name */}
                        <div>
                            <label
                                htmlFor="factory-name"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Factory Name
                            </label>

                            <input
                                id="factory-name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="e.g. Main Production Factory"
                                disabled={creating}
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"


                            />
                        </div>

                        <div>
                            <label
                                htmlFor="factory-location"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Location
                            </label>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <MapPin
                                        size={18}
                                        className="text-slate-400"
                                    />
                                </div>

                                <input
                                    id="factory-location"
                                    value={location}
                                    onChange={(event) =>
                                        setLocation(event.target.value)
                                    }
                                    placeholder="e.g. Chittoor, Andhra Pradesh"
                                    disabled={creating}
                                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="factory-organization"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Organization
                            </label>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
                                    <Building2
                                        size={18}
                                        className="text-slate-400"
                                    />
                                </div>

                                <select
                                    id="factory-organization"
                                    value={organizationId}
                                    onChange={(event) =>
                                        setOrganizationId(event.target.value)
                                    }
                                    disabled={creating}
                                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                                >
                                    <option value="">
                                        Select organization
                                    </option>

                                    {organizations
                                        .filter(
                                            (organization) =>
                                                organization.is_active
                                        )
                                        .map((organization) => (
                                            <option
                                                key={organization.id}
                                                value={organization.id}
                                            >
                                                {organization.name} ({organization.code})
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="mt-5 flex justify-end">
                        <button
                            type="submit"
                            disabled={creating}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Plus size={17} />

                            {creating
                                ? "Creating..."
                                : "Add Factory"}
                        </button>
                    </div>
                </form>
            </section>

            {/* Factory List */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Factory List
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Factories currently registered on the platform.
                        </p>
                    </div>

                    <div className="text-sm text-slate-500">
                        {inactiveFactories} inactive
                    </div>
                </div>

                {loading ? (
                    <div className="flex min-h-48 items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                            <p className="mt-3 text-sm text-slate-500">
                                Loading factories...
                            </p>
                        </div>
                    </div>
                ) : factories.length === 0 ? (
                    <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">

                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <FactoryIcon size={22} />
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            No factories found
                        </h3>

                        <p className="mt-1 max-w-sm text-sm text-slate-500">
                            Create your first factory using the form above.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        ID
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Factory
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Location
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Organization
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {factories.map((factory) => (
                                    <tr
                                        key={factory.id}
                                        className="transition hover:bg-slate-50"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-500">
                                            #{factory.id}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">

                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                    <FactoryIcon size={17} />
                                                </div>

                                                <span className="font-semibold text-slate-900">
                                                    {factory.name}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <MapPin
                                                    size={15}
                                                    className="text-slate-400"
                                                />

                                                {factory.location}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                <Building2 size={13} />
                                                {getOrganizationName(
                                                    factory.organization_id
                                                )}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            {factory.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                    <CheckCircle2 size={14} />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                                                    <XCircle size={14} />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}