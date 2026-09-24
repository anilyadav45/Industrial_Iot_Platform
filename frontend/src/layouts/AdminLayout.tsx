import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();

  const links = [
    {
      name: "Dashboard",
      path: "/admin",
    },
    {
      name: "Organizations",
      path: "/admin/organizations",
    },
    {
      name: "Factories",
      path: "/admin/factories",
    },
    {
      name: "Production Lines",
      path: "/admin/production-lines",
    },
    {
      name: "Machines",
      path: "/admin/machines",
    },
    {
      name: "Sensors",
      path: "/admin/sensors",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* Sidebar */}

      <aside className="w-64 bg-slate-900 text-white p-5">

        <h1 className="text-xl font-bold mb-8">
          Industrial IoT
        </h1>

        <nav className="space-y-2">

          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/admin"}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 transition ${
                  isActive
                    ? "bg-blue-600"
                    : "hover:bg-slate-800"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

        </nav>

        <div className="mt-10 border-t border-slate-700 pt-5">

          <p className="text-sm text-slate-400">
            Logged in as
          </p>

          <p className="font-medium mt-1">
            {user?.name}
          </p>

          <p className="text-xs text-slate-400">
            {user?.role}
          </p>

          <button
            onClick={logout}
            className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
          >
            Logout
          </button>

        </div>

      </aside>

      {/* Main */}

      <main className="flex-1 p-8">
        <Outlet />
      </main>

    </div>
  );
}