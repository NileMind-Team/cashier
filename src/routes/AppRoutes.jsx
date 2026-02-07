import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ShiftReports from "../pages/ShiftReports";
import SalesReport from "../pages/SalesReport";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reports/shifts" element={<ShiftReports />} />
      <Route path="/reports/sales" element={<SalesReport />} />
    </Routes>
  );
}
