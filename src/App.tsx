import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import ReceptionPage from "@/pages/ReceptionPage";
import TechnicianPage from "@/pages/TechnicianPage";
import TrendsPage from "@/pages/TrendsPage";
import ScreenPage from "@/pages/ScreenPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/screen"
          element={
            <ProtectedRoute>
              <ScreenPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/reception" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reception"
          element={
            <ProtectedRoute allowedRoles={["admin", "reception"]}>
              <ReceptionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trends"
          element={
            <ProtectedRoute allowedRoles={["admin", "reception"]}>
              <TrendsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/technician"
          element={
            <ProtectedRoute allowedRoles={["admin", "technician"]}>
              <TechnicianPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Navigate to="/reception" replace />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
