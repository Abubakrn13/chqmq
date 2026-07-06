import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Panel from "./pages/Panel.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Sell from "./pages/Sell.jsx";
import TodaySales from "./pages/TodaySales.jsx";
import Products from "./pages/Products.jsx";
import Return from "./pages/Return.jsx";
import Customers from "./pages/Customers.jsx";
import Debts from "./pages/Debts.jsx";
import Profit from "./pages/Profit.jsx";
import Arenda from "./pages/Arenda.jsx";
import AiAnalyst from "./pages/AiAnalyst.jsx";
import BranchControl from "./pages/BranchControl.jsx";
import Staff from "./pages/Staff.jsx";
import Shifts from "./pages/Shifts.jsx";
import Suppliers from "./pages/Suppliers.jsx";
import Invoices from "./pages/Invoices.jsx";
import TelegramLinks from "./pages/TelegramLinks.jsx";
import Performance from "./pages/Performance.jsx";
import Audit from "./pages/Audit.jsx";
import Transfers from "./pages/Transfers.jsx";
import Activity from "./pages/Activity.jsx";
import Suspicious from "./pages/Suspicious.jsx";
import Reorder from "./pages/Reorder.jsx";
import Targets from "./pages/Targets.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import RoleGuard from "./components/RoleGuard.jsx";
import Settings from "./pages/Settings.jsx";
import SuperAdmin from "./pages/SuperAdmin.jsx";

function Protected({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="boot">Yuklanmoqda…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role === "superadmin" && user.role !== "superadmin") return <Navigate to="/panel" replace />;
  if (role !== "superadmin" && user.role === "superadmin") return <Navigate to="/superadmin" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/superadmin"
        element={
          <Protected role="superadmin">
            <SuperAdmin />
          </Protected>
        }
      />
      <Route
        path="/panel"
        element={
          <Protected>
            <Panel />
          </Protected>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="sell" element={<Sell />} />
        <Route path="today" element={<TodaySales />} />
        <Route path="products" element={<Products />} />
        <Route path="return" element={<Return />} />
        <Route path="customers" element={<Customers />} />
        <Route path="debts" element={<Debts />} />
        <Route path="profit" element={<RoleGuard allow={["owner"]}><Profit /></RoleGuard>} />
        <Route path="arenda" element={<RoleGuard allow={["owner"]}><Arenda /></RoleGuard>} />
        <Route path="ai" element={<RoleGuard allow={["owner"]}><AiAnalyst /></RoleGuard>} />
        <Route path="branches" element={<RoleGuard allow={["owner"]}><BranchControl /></RoleGuard>} />
        <Route path="staff" element={<RoleGuard allow={["owner"]}><Staff /></RoleGuard>} />
        <Route path="shifts" element={<Shifts />} />
        <Route path="suppliers" element={<RoleGuard allow={["owner", "manager"]}><Suppliers /></RoleGuard>} />
        <Route path="invoices" element={<RoleGuard allow={["owner", "manager"]}><Invoices /></RoleGuard>} />
        <Route path="telegram" element={<RoleGuard allow={["owner"]}><TelegramLinks /></RoleGuard>} />
        <Route path="performance" element={<RoleGuard allow={["owner"]}><Performance /></RoleGuard>} />
        <Route path="audit" element={<RoleGuard allow={["owner", "manager"]}><Audit /></RoleGuard>} />
        <Route path="transfers" element={<RoleGuard allow={["owner", "manager"]}><Transfers /></RoleGuard>} />
        <Route path="activity" element={<RoleGuard allow={["owner"]}><Activity /></RoleGuard>} />
        <Route path="suspicious" element={<RoleGuard allow={["owner"]}><Suspicious /></RoleGuard>} />
        <Route path="reorder" element={<RoleGuard allow={["owner", "manager"]}><Reorder /></RoleGuard>} />
        <Route path="targets" element={<Targets />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
