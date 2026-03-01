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
import UsersManagement from "../pages/UsersManagement";
import ProductsManagement from "../pages/ProductsManagement";
import CategoriesManagement from "../pages/CategoriesManagement";
import CustomersManagement from "../pages/CustomersManagement";
import ShippingCompaniesManagement from "../pages/ShippingCompaniesManagement";
import PaymentMethodsManagement from "../pages/PaymentMethodsManagement";
import HallsManagement from "../pages/HallsManagement";
import PermissionsManagement from "../pages/PermissionsManagement";
import OptionsManagement from "../pages/OptionsManagement";
import DiscountsManagement from "../pages/DiscountsManagement";
import PrintersManagement from "../pages/PrintersManagement";

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
      <Route path="/users" element={<UsersManagement />} />
      <Route path="/products-management" element={<ProductsManagement />} />
      <Route path="/categories" element={<CategoriesManagement />} />
      <Route path="/customers" element={<CustomersManagement />} />
      <Route
        path="/shipping-companies"
        element={<ShippingCompaniesManagement />}
      />
      <Route path="/payment-methods" element={<PaymentMethodsManagement />} />
      <Route path="/halls" element={<HallsManagement />} />
      <Route path="/permissions" element={<PermissionsManagement />} />
      <Route path="/options" element={<OptionsManagement />} />
      <Route path="/discounts" element={<DiscountsManagement />} />
      <Route path="/printers" element={<PrintersManagement />} />
    </Routes>
  );
}
