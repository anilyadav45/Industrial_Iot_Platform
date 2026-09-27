import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  Building2,
  CheckCircle2,
  Plus,
  XCircle,
} from "lucide-react";

import {
  getOrganizations,
  createOrganization,
} from "../../services/adminService";

interface Organization {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

export default function Organizations() {
  const [organizations, setOrganizations] =
    useState<Organization[]>([]);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadOrganizations = async () => {
    try {
      setLoading(true);

      const data = await getOrganizations();

      setOrganizations(data);
    } catch (error) {
      console.error("Failed to load organizations:", error);
      setError("Unable to load organizations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedName || !trimmedCode) {
      setError("Organization name and code are required.");
      return;
    }

    try {
      setCreating(true);

      await createOrganization(trimmedName, trimmedCode);

      setName("");
      setCode("");

      await loadOrganizations();
    } catch (error) {
      console.error("Failed to create organization:", error);
      setError("Unable to create organization. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const activeOrganizations = organizations.filter(
    (organization) => organization.is_active
  ).length;

  const inactiveOrganizations =
    organizations.length - activeOrganizations;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-600">
            <Building2 size={18} />
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">
              Organization Management
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Organizations
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Create and manage organizations registered on the Industrial IQ
            platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500">Total</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {organizations.length}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs text-emerald-700">Active</p>
            <p className="mt-1 text-xl font-bold text-emerald-700">
              {activeOrganizations}
            </p>
          </div>
        </div>
      </section>

      {/* Create Organization */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Plus size={19} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Add Organization
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Register a new organization on the platform.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="p-6"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            {/* Name */}
            <div>
              <label
                htmlFor="organization-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Organization Name
              </label>

              <input
                id="organization-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Industrial Solutions"
                disabled={creating}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            {/* Code */}
            <div>
              <label
                htmlFor="organization-code"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Organization Code
              </label>

              <input
                id="organization-code"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.toUpperCase())
                }
                placeholder="e.g. IND001"
                disabled={creating}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm uppercase text-slate-900 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            {/* Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={17} />

                {creating ? "Creating..." : "Add Organization"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
        </form>
      </section>

      {/* Organization List */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Organization List
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Organizations currently registered on the platform.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            {inactiveOrganizations} inactive
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-3 text-sm text-slate-500">
                Loading organizations...
              </p>
            </div>
          </div>
        ) : organizations.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Building2 size={22} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No organizations found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Create your first organization using the form above.
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
                    Organization
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Code
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {organizations.map((organization) => (
                  <tr
                    key={organization.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-500">
                      #{organization.id}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Building2 size={17} />
                        </div>

                        <span className="font-semibold text-slate-900">
                          {organization.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">
                        {organization.code}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {organization.is_active ? (
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