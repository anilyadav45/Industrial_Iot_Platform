import { NavLink, Outlet, useLocation } from "react-router-dom";

import {
  Activity,
  Bell,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Cloud,
  Cpu,
  FileText,
  Factory,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Settings2,
  Sparkles,
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
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-800 bg-slate-950 text-white lg:flex">
        {/* Brand */}
        <div className="border-b border-slate-800 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/40">
              <Cpu size={21} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight">
                Industrial IQ
              </h1>

              <p className="truncate text-[11px] text-slate-500">
                IoT Optimization Platform
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="mb-3 flex items-center gap-2 px-3">
            <Settings2
              size={13}
              className="text-slate-600"
            />

            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Platform
            </p>
          </div>

          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/admin"}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-950/30"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        strokeWidth={isActive ? 2.3 : 2}
                        className="shrink-0"
                      />

                      <span className="flex-1">
                        {link.name}
                      </span>

                      {isActive && (
                        <ChevronRight
                          size={15}
                          className="text-blue-200"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-slate-800 p-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.name}
                </p>

                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

                  <p className="truncate text-[11px] text-slate-400">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="lg:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:px-8">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Industrial IoT Platform
            </p>

            <div className="mt-1 flex items-center gap-2">
              <h2 className="truncate text-xl font-bold text-slate-900">
                {currentPage}
              </h2>

              <ChevronRight
                size={16}
                className="hidden text-slate-300 sm:block"
              />

              <span className="hidden text-sm text-slate-400 sm:block">
                Admin Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {user?.name}
              </p>

              <p className="text-xs text-slate-500">
                {user?.role}
              </p>
            </div>

            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 ring-4 ring-slate-50">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>

              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}