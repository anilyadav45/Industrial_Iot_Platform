
import { NavLink, Outlet, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  Factory,
  GitBranch,
  Cpu,
  Activity,
  Bell,
  BrainCircuit,
  Cloud,
  Sparkles,
  FileText,
  ClipboardList,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const links = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Organizations",
    path: "/admin/organizations",
    icon: Building2,
  },
  {
    name: "Factories",
    path: "/admin/factories",
    icon: Factory,
  },
  {
    name: "Production Lines",
    path: "/admin/production-lines",
    icon: GitBranch,
  },
  {
    name: "Machines",
    path: "/admin/machines",
    icon: Cpu,
  },
  {
    name: "Sensors",
    path: "/admin/sensors",
    icon: Activity,
  },
  {
    name: "Alerts",
    path: "/admin/alerts",
    icon: Bell,
  },
  {
    name: "ML Predictions",
    path: "/admin/ml-predictions",
    icon: BrainCircuit,
  },
  {
    name: "Cloud Resources",
    path: "/admin/cloud-resources",
    icon: Cloud,
  },
  {
    name: "Optimization",
    path: "/admin/optimization",
    icon: Sparkles,
  },
  {
    name: "Reports",
    path: "/admin/reports",
    icon: FileText,
  },

  {
    name: "Audit Logs",
    path: "/admin/audit-logs",
    icon: ClipboardList,
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const currentPage =
    links.find((link) =>
      link.path === "/admin"
        ? location.pathname === "/admin"
        : location.pathname.startsWith(link.path)
    )?.name ?? "Dashboard";

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-950 text-white flex-col fixed inset-y-0 left-0 z-30">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
              IQ
            </div>

            <div>
              <h1 className="font-bold text-lg tracking-tight">
                Industrial IQ
              </h1>

              <p className="text-xs text-slate-500">
                IoT Optimization Platform
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <p className="text-xs uppercase tracking-wider text-slate-500 px-3 mb-3">
            Platform
          </p>

          <div className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >

                <link.icon size={18} />

                {link.name}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-800">
          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-xs text-slate-500 mb-1">
              Signed in as
            </p>

            <p className="text-sm font-semibold truncate">
              {user?.name}
            </p>

            <p className="text-xs text-blue-400 mt-1">
              {user?.role}
            </p>

            <button
              onClick={logout}
              className="mt-4 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-red-600 hover:border-red-600 hover:text-white transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 lg:ml-64">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-20">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Industrial IoT Platform
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {currentPage}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-900">
                {user?.name}
              </p>

              <p className="text-xs text-slate-500">
                {user?.role}
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}