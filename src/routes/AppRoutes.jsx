import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ShiftReports from "../pages/ShiftReports";
import SalesReport from "../pages/SalesReport";
import ProductsReports from "../pages/ProductReport";
import CustomersReport from "../pages/CustomersReport";
import PaymentMethodsReport from "../pages/PaymentMethodsReport";
import PendingBillsReport from "../pages/PendingBillsReport";
import ReturnsReport from "../pages/ReturnsReport";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reports/shifts" element={<ShiftReports />} />
      <Route path="/reports/sales" element={<SalesReport />} />
      <Route path="/reports/products" element={<ProductsReports />} />
      <Route path="/reports/customers" element={<CustomersReport />} />
      <Route
        path="/reports/payment-methods"
        element={<PaymentMethodsReport />}
      />
      <Route path="/reports/pending-bills" element={<PendingBillsReport />} />
      <Route path="/reports/returns" element={<ReturnsReport />} />
    </Routes>
  );
}
