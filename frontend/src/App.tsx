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