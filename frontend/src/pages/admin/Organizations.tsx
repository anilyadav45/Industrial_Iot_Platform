import { useEffect, useState } from "react";

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

  const loadOrganizations = async () => {

    try {

      const data = await getOrganizations();

      setOrganizations(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleCreate = async (
    event: React.FormEvent
  ) => {

    event.preventDefault();

    if (!name || !code) {
      return;
    }

    try {

      await createOrganization(name, code);

      setName("");
      setCode("");

      await loadOrganizations();

    } catch (error) {

      console.error(error);

    }
  };

  return (
    <div>

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Organizations
        </h1>

        <p className="text-slate-500 mt-2">
          Manage organizations on the platform
        </p>

      </div>

      {/* Create */}

      <div className="bg-white border rounded-xl p-6 mb-8">

        <h2 className="text-lg font-semibold mb-5">
          Add Organization
        </h2>

        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Organization name"
            className="border rounded-lg px-4 py-3"
          />

          <input
            value={code}
            onChange={(e) =>
              setCode(e.target.value.toUpperCase())
            }
            placeholder="Organization code"
            className="border rounded-lg px-4 py-3"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700"
          >
            Add Organization
          </button>

        </form>

      </div>

      {/* List */}

      <div className="bg-white border rounded-xl overflow-hidden">

        <div className="px-6 py-5 border-b">

          <h2 className="font-semibold">
            Organization List
          </h2>

        </div>

        {loading ? (

          <div className="p-6">
            Loading...
          </div>

        ) : organizations.length === 0 ? (

          <div className="p-6 text-slate-500">
            No organizations found.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50">

                <tr>

                  <th className="text-left px-6 py-4">
                    ID
                  </th>

                  <th className="text-left px-6 py-4">
                    Name
                  </th>

                  <th className="text-left px-6 py-4">
                    Code
                  </th>

                  <th className="text-left px-6 py-4">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {organizations.map((organization) => (

                  <tr
                    key={organization.id}
                    className="border-t"
                  >

                    <td className="px-6 py-4">
                      {organization.id}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      {organization.name}
                    </td>

                    <td className="px-6 py-4">
                      {organization.code}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={
                          organization.is_active
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {organization.is_active
                          ? "Active"
                          : "Inactive"}
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