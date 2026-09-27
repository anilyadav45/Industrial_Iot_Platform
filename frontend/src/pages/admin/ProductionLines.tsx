import { useEffect, useState } from "react";

import {
  Factory,
  GitBranch,
  Plus,
} from "lucide-react";

import {
  getProductionLines,
  createProductionLine,
  getFactories,
} from "../../services/adminService";

interface FactoryItem {
  id: number;
  name: string;
  location: string;
  organization_id: number;
  is_active: boolean;
}

interface ProductionLine {
  id: number;
  name: string;
  factory_id: number;
}

export default function ProductionLines() {
  const [productionLines, setProductionLines] = useState<
    ProductionLine[]
  >([]);

  const [factories, setFactories] = useState<FactoryItem[]>(
    []
  );

  const [name, setName] = useState("");
  const [factoryId, setFactoryId] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [lineData, factoryData] = await Promise.all([
        getProductionLines(),
        getFactories(),
      ]);

      setProductionLines(lineData);
      setFactories(factoryData);
    } catch (error) {
      console.error(
        "Failed to load production lines:",
        error
      );

      setError(
        "Unable to load production line data."
      );
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

    if (!trimmedName || !factoryId) {
      setError(
        "Production line name and factory are required."
      );

      return;
    }

    try {
      setCreating(true);

      await createProductionLine(
        trimmedName,
        Number(factoryId)
      );

      setName("");
      setFactoryId("");

      await loadData();
    } catch (error) {
      console.error(
        "Failed to create production line:",
        error
      );

      setError(
        "Unable to create production line. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  const getFactoryName = (id: number) => {
    const factory = factories.find(
      (item) => item.id === id
    );

    return factory?.name ?? `Factory #${id}`;
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-600">
            <GitBranch size={18} />

            <span className="text-xs font-semibold uppercase tracking-[0.16em]">
              Production Management
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Production Lines
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Manage production lines and assign them to
            factories across the platform.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-xs text-slate-500">
            Total Lines
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {productionLines.length}
          </p>
        </div>
      </section>

      {/* Create Production Line */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Plus size={19} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Add Production Line
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create a production line and assign it
                to a factory.
              </p>
            </div>

          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="p-6"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Name */}
            <div>
              <label
                htmlFor="production-line-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Production Line Name
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center">
                  <GitBranch
                    size={18}
                    className="text-slate-400"
                  />
                </div>

                <input
                  id="production-line-name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="e.g. Assembly Line 1"
                  disabled={creating}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-14 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Factory */}
            <div>
              <label
                htmlFor="production-line-factory"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Factory
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-12 items-center justify-center">
                  <Factory
                    size={18}
                    className="text-slate-400"
                  />
                </div>

                <select
                  id="production-line-factory"
                  value={factoryId}
                  onChange={(event) =>
                    setFactoryId(event.target.value)
                  }
                  disabled={creating}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-14 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">
                    Select factory
                  </option>

                  {factories
                    .filter(
                      (factory) =>
                        factory.is_active
                    )
                    .map((factory) => (
                      <option
                        key={factory.id}
                        value={factory.id}
                      >
                        {factory.name}
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
                : "Add Production Line"}
            </button>
          </div>
        </form>
      </section>

      {/* Production Line List */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Production Line List
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Production lines currently registered on
            the platform.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-3 text-sm text-slate-500">
                Loading production lines...
              </p>
            </div>
          </div>
        ) : productionLines.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <GitBranch size={22} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No production lines found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Create your first production line using
              the form above.
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
                    Production Line
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Factory
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Factory ID
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {productionLines.map((line) => (
                  <tr
                    key={line.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-500">
                      #{line.id}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <GitBranch size={17} />
                        </div>

                        <span className="font-semibold text-slate-900">
                          {line.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        <Factory size={13} />
                        {getFactoryName(
                          line.factory_id
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      #{line.factory_id}
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