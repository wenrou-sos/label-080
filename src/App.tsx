import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ReceptionPage from "@/pages/ReceptionPage";
import ScreenPage from "@/pages/ScreenPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/reception" replace />} />
        <Route path="/reception" element={<ReceptionPage />} />
        <Route path="/screen" element={<ScreenPage />} />
        <Route path="*" element={<Navigate to="/reception" replace />} />
      </Routes>
    </Router>
  );
}
