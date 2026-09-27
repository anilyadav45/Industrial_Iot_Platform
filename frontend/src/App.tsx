import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";

import Login from "./pages/auth/Login";

import Dashboard from "./pages/admin/Dashboard";
import Organizations from "./pages/admin/Organizations";
import Machines from "./pages/admin/Machines";
import MachineDetails from "./pages/admin/MachineDetails";
import Sensors from "./pages/admin/Sensors";
import SensorDetails from "./pages/admin/SensorDetails";
import Alerts from "./pages/admin/Alerts";
import AlertDetails from "./pages/admin/AlertDetails";
import MachineML from "./pages/admin/MachineML";
import MLPredictions from "./pages/admin/MLPredictions";
import CloudResources from "./pages/admin/CloudResources";
import Optimization from "./pages/admin/Optimization";
import Reports from "./pages/admin/Reports";
import AuditLogs from "./pages/admin/AuditLogs";
import Factories from "./pages/admin/Factories";
import ProductionLines from "./pages/admin/ProductionLines";


function ComingSoon({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-10 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">
        Industrial IQ
      </p>

      <h1 className="text-2xl font-bold text-slate-900 mt-2">
        {title}
      </h1>

      <p className="text-slate-500 mt-2">
        This module is coming next.
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            index
            element={<Dashboard />}
          />

          <Route
            path="organizations"
            element={<Organizations />}
          />

          <Route path="factories" element={<Factories />} />



          <Route
            path="production-lines"
            element={<ProductionLines />}
          />

          <Route
            path="machines"
            element={<Machines />}
          />

          <Route path="machines/:id" element={<MachineDetails />} />
          <Route path="machines/:id/ml" element={<MachineML />} />


          <Route path="sensors" element={<Sensors />} />
          <Route path="sensors/:id" element={<SensorDetails />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="alerts/:id" element={<AlertDetails />} />
          <Route path="ml-predictions" element={<MLPredictions />} />
          <Route
            path="cloud-resources"
            element={<CloudResources />}
          />
          <Route
            path="optimization"
            element={<Optimization />}
          />

          <Route
            path="reports"
            element={<Reports />}
          />

          <Route
            path="audit-logs"
            element={<AuditLogs />}
          />

        </Route>

        {/* Default */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;