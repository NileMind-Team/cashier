import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useState, useRef, useEffect } from "react";
import {
  FaCashRegister,
  FaCalendarDay,
  FaCircle,
  FaClock,
  FaChair,
} from "react-icons/fa6";
import {
  FaChartBar,
  FaChevronDown,
  FaChartLine,
  FaUserFriends,
  FaMoneyCheck,
  FaExclamationCircle,
  FaUndo,
  FaBoxes,
  FaTruck,
  FaCreditCard,
  FaUserCog,
  FaStopCircle,
  FaLayerGroup,
  FaBoxOpen,
  FaUser,
  FaShieldAlt,
  FaPizzaSlice,
} from "react-icons/fa";

export default function Navbar({ isShiftOpen, onShiftClose, shiftSummary }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showReportsDropdown, setShowReportsDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowReportsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCloseShift = () => {
    Swal.fire({
      title: "هل أنت متأكد من إغلاق الوردية؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#193F94",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، إغلاق الوردية",
      cancelButtonText: "البقاء في الوردية",
      reverseButtons: true,
      customClass: {
        confirmButton: "px-4 py-2",
        cancelButton: "px-4 py-2",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (onShiftClose) {
          onShiftClose();
        }

        Swal.fire({
          title: "تم إغلاق الوردية بنجاح!",
          html: `
            <div dir="rtl" class="text-right">
              <div class="mb-3">
                <h4 class="font-bold text-lg mb-2" style="color: #193F94">تفاصيل الوردية المغلقة</h4>
              </div>
              
              <div class="space-y-2">
                <div class="flex justify-between items-center border-b pb-1">
                  <span class="text-gray-700">عدد الفواتير:</span>
                  <span class="font-bold">${shiftSummary?.totalBills || 0}</span>
                </div>
                
                <div class="flex justify-between items-center border-b pb-1">
                  <span class="text-gray-700">الفواتير المكتملة:</span>
                  <span class="font-bold text-green-600">${shiftSummary?.completedBills || 0}</span>
                </div>
                
                <div class="flex justify-between items-center border-b pb-1">
                  <span class="text-gray-700">الفواتير المعلقة:</span>
                  <span class="font-bold text-amber-600">${shiftSummary?.pendingBills || 0}</span>
                </div>
                
                <div class="flex justify-between items-center border-b pb-1">
                  <span class="text-gray-700">الفواتير المرتجعة:</span>
                  <span class="font-bold text-red-600">${shiftSummary?.returnedBills || 0}</span>
                </div>
                
                <div class="flex justify-between items-center border-b pb-1">
                  <span class="text-gray-700">إجمالي المبيعات:</span>
                  <span class="font-bold" style="color: #193F94">${shiftSummary?.totalSales?.toFixed(2) || "0.00"} ج.م</span>
                </div>
                
                <div class="flex justify-between items-center border-b pb-1">
                  <span class="text-gray-700">إجمالي الضرائب:</span>
                  <span class="font-bold">${shiftSummary?.totalTax?.toFixed(2) || "0.00"} ج.م</span>
                </div>
                
                <div class="flex justify-between items-center border-b pb-1">
                  <span class="text-gray-700">إجمالي الخصومات:</span>
                  <span class="font-bold text-red-600">${shiftSummary?.totalDiscount?.toFixed(2) || "0.00"} ج.م</span>
                </div>
                
                <div class="flex justify-between items-center border-b pb-1 pt-2">
                  <span class="text-gray-700 font-bold">صافي الإيرادات:</span>
                  <span class="font-bold text-lg" style="color: #10B981">${shiftSummary?.netRevenue?.toFixed(2) || "0.00"} ج.م</span>
                </div>
              </div>
              
              <div class="mt-4 pt-3 border-t border-gray-200">
                <p class="text-sm text-gray-500">
                  وقت بداية الوردية: ${shiftSummary?.startTime || "غير محدد"}
                </p>
                <p class="text-sm text-gray-500">
                  وقت نهاية الوردية: ${new Date().toLocaleTimeString("ar-EG")}
                </p>
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonColor: "#193F94",
          confirmButtonText: "موافق",
          showConfirmButton: true,
          showCancelButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/login");
          }
        });
      }
    });
  };

  const handleReportNavigation = (reportType) => {
    setShowReportsDropdown(false);

    if (reportType === "shifts") {
      navigate("/reports/shifts");
    } else if (reportType === "sales") {
      navigate("/reports/sales");
    } else if (reportType === "products") {
      navigate("/reports/products");
    } else if (reportType === "customers") {
      navigate("/reports/customers");
    } else if (reportType === "payment-methods") {
      navigate("/reports/payment-methods");
    } else if (reportType === "pending-bills") {
      navigate("/reports/pending-bills");
    } else if (reportType === "returns") {
      navigate("/reports/returns");
    }
  };

  const handleUsersNavigation = () => {
    navigate("/users");
  };

  const handlePermissionsNavigation = () => {
    navigate("/permissions");
  };

  const handleCategoriesNavigation = () => {
    navigate("/categories");
  };

  const handleProductsManagementNavigation = () => {
    navigate("/products-management");
  };

  const handleCustomersNavigation = () => {
    navigate("/customers");
  };

  const handleShippingCompaniesNavigation = () => {
    navigate("/shipping-companies");
  };

  const handlePaymentMethodsNavigation = () => {
    navigate("/payment-methods");
  };

  const handleHallsNavigation = () => {
    navigate("/halls");
  };

  const handleOptionsNavigation = () => {
    navigate("/options");
  };

  const isReportsActive = location.pathname.startsWith("/reports");
  const isUsersActive = location.pathname === "/users";
  const isPermissionsActive = location.pathname === "/permissions";
  const isCategoriesActive = location.pathname === "/categories";
  const isProductsManagementActive =
    location.pathname === "/products-management";
  const isCustomersActive = location.pathname === "/customers";
  const isShippingCompaniesActive = location.pathname === "/shipping-companies";
  const isPaymentMethodsActive = location.pathname === "/payment-methods";
  const isHallsActive = location.pathname === "/halls";
  const isOptionsActive = location.pathname === "/options";

  return (
    <div className="bg-gradient-to-r from-white to-gray-50/80 shadow-lg backdrop-blur-sm border-b border-gray-200/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center ml-3 shadow-md shadow-blue-900/20 group-hover:shadow-lg group-hover:shadow-blue-900/30 transition-all duration-300 transform group-hover:scale-105">
              <FaCashRegister className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-l from-blue-900 to-blue-700 bg-clip-text text-transparent">
                نظام الكاشير
              </h1>
              <div className="flex items-center mt-0.5 space-x-2 rtl:space-x-reverse">
                {isShiftOpen && (
                  <span className="text-xs bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-200 flex items-center shadow-sm">
                    <FaCircle className="w-2 h-2 text-green-500 ml-1 animate-pulse" />
                    الوردية مفتوحة
                  </span>
                )}
                <span className="text-xs text-gray-500 flex items-center">
                  <FaCalendarDay className="inline ml-1 text-blue-600" />
                  {new Date().toLocaleDateString("ar-EG")}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
            {/* Halls Management */}
            <button
              onClick={handleHallsNavigation}
              className={`h-9 px-3 rounded-lg font-medium transition-all duration-300 flex items-center text-sm whitespace-nowrap flex-shrink-0 relative overflow-hidden group ${
                isHallsActive
                  ? "text-white bg-gradient-to-r from-blue-900 to-blue-700 shadow-md shadow-blue-900/30"
                  : "text-gray-700 bg-white/80 hover:bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/10"
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/0 transition-all duration-300"></span>
              <FaChair
                className={`h-4 w-4 ml-1.5 ${isHallsActive ? "text-white" : "text-blue-700"}`}
              />
              <span className="relative">إدارة الصالات</span>
            </button>

            {/* Options Management */}
            <button
              onClick={handleOptionsNavigation}
              className={`h-9 px-3 rounded-lg font-medium transition-all duration-300 flex items-center text-sm whitespace-nowrap flex-shrink-0 relative overflow-hidden group ${
                isOptionsActive
                  ? "text-white bg-gradient-to-r from-blue-900 to-blue-700 shadow-md shadow-blue-900/30"
                  : "text-gray-700 bg-white/80 hover:bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/10"
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/0 transition-all duration-300"></span>
              <FaPizzaSlice
                className={`h-4 w-4 ml-1.5 ${isOptionsActive ? "text-white" : "text-blue-700"}`}
              />
              <span className="relative">إدارة الإضافات</span>
            </button>

            {/* Categories Management */}
            <button
              onClick={handleCategoriesNavigation}
              className={`h-9 px-3 rounded-lg font-medium transition-all duration-300 flex items-center text-sm relative overflow-hidden group ${
                isCategoriesActive
                  ? "text-white bg-gradient-to-r from-blue-900 to-blue-700 shadow-md shadow-blue-900/30"
                  : "text-gray-700 bg-white/80 hover:bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/10"
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/0 transition-all duration-300"></span>
              <FaLayerGroup
                className={`h-4 w-4 ml-1.5 ${isCategoriesActive ? "text-white" : "text-blue-700"}`}
              />
              <span className="relative">إدارة الفئات</span>
            </button>

            {/* Products Management */}
            <button
              onClick={handleProductsManagementNavigation}
              className={`h-9 px-3 rounded-lg font-medium transition-all duration-300 flex items-center text-sm relative overflow-hidden group ${
                isProductsManagementActive
                  ? "text-white bg-gradient-to-r from-blue-900 to-blue-700 shadow-md shadow-blue-900/30"
                  : "text-gray-700 bg-white/80 hover:bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/10"
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/0 transition-all duration-300"></span>
              <FaBoxOpen
                className={`h-4 w-4 ml-1.5 ${isProductsManagementActive ? "text-white" : "text-blue-700"}`}
              />
              <span className="relative">إدارة المنتجات</span>
            </button>

            {/* Customers Management */}
            <button
              onClick={handleCustomersNavigation}
              className={`h-9 px-3 rounded-lg font-medium transition-all duration-300 flex items-center text-sm relative overflow-hidden group ${
                isCustomersActive
                  ? "text-white bg-gradient-to-r from-blue-900 to-blue-700 shadow-md shadow-blue-900/30"
                  : "text-gray-700 bg-white/80 hover:bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/10"
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/0 transition-all duration-300"></span>
              <FaUser
                className={`h-4 w-4 ml-1.5 ${isCustomersActive ? "text-white" : "text-blue-700"}`}
              />
              <span className="relative">إدارة العملاء</span>
            </button>

            {/* Shipping Companies */}
            <button
              onClick={handleShippingCompaniesNavigation}
              className={`h-9 px-3 rounded-lg font-medium transition-all duration-300 flex items-center text-sm relative overflow-hidden group ${
                isShippingCompaniesActive
                  ? "text-white bg-gradient-to-r from-blue-900 to-blue-700 shadow-md shadow-blue-900/30"
                  : "text-gray-700 bg-white/80 hover:bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/10"
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/0 transition-all duration-300"></span>
              <FaTruck
                className={`h-4 w-4 ml-1.5 ${isShippingCompaniesActive ? "text-white" : "text-blue-700"}`}
              />
              <span className="relative">شركات التوصيل</span>
            </button>

            {/* Payment Methods */}
            <button
              onClick={handlePaymentMethodsNavigation}
              className={`h-9 px-3 rounded-lg font-medium transition-all duration-300 flex items-center text-sm relative overflow-hidden group ${
                isPaymentMethodsActive
                  ? "text-white bg-gradient-to-r from-blue-900 to-blue-700 shadow-md shadow-blue-900/30"
                  : "text-gray-700 bg-white/80 hover:bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/10"
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/0 transition-all duration-300"></span>
              <FaCreditCard
                className={`h-4 w-4 ml-1.5 ${isPaymentMethodsActive ? "text-white" : "text-blue-700"}`}
              />
              <span className="relative">طرق الدفع</span>
            </button>

            {/* Users Management */}
            <button
              onClick={handleUsersNavigation}
              className={`h-9 px-3 rounded-lg font-medium transition-all duration-300 flex items-center text-sm relative overflow-hidden group ${
                isUsersActive
                  ? "text-white bg-gradient-to-r from-blue-900 to-blue-700 shadow-md shadow-blue-900/30"
                  : "text-gray-700 bg-white/80 hover:bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/10"
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/0 transition-all duration-300"></span>
              <FaUserCog
                className={`h-4 w-4 ml-1.5 ${isUsersActive ? "text-white" : "text-blue-700"}`}
              />
              <span className="relative">إدارة الموظفين</span>
            </button>

            {/* Permissions Management */}
            <button
              onClick={handlePermissionsNavigation}
              className={`h-9 px-3 rounded-lg font-medium transition-all duration-300 flex items-center text-sm relative overflow-hidden group ${
                isPermissionsActive
                  ? "text-white bg-gradient-to-r from-blue-900 to-blue-700 shadow-md shadow-blue-900/30"
                  : "text-gray-700 bg-white/80 hover:bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/10"
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/0 transition-all duration-300"></span>
              <FaShieldAlt
                className={`h-4 w-4 ml-1.5 ${isPermissionsActive ? "text-white" : "text-blue-700"}`}
              />
              <span className="relative">إدارة الصلاحيات</span>
            </button>

            {/* Reports Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowReportsDropdown(!showReportsDropdown)}
                aria-expanded={showReportsDropdown}
                aria-haspopup="true"
                className={`h-9 px-3 rounded-lg font-medium transition-all duration-300 flex items-center text-sm relative overflow-hidden group ${
                  isReportsActive
                    ? "text-white bg-gradient-to-r from-blue-900 to-blue-700 shadow-md shadow-blue-900/30"
                    : "text-gray-700 bg-white/80 hover:bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/10"
                } ${showReportsDropdown ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white" : ""}`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/0 transition-all duration-300"></span>
                <FaChartBar
                  className={`h-4 w-4 ml-1.5 ${isReportsActive || showReportsDropdown ? "text-white" : "text-blue-700"}`}
                />
                <span className="relative">التقارير</span>
                <FaChevronDown
                  className={`h-3 w-3 mr-1 transition-all duration-300 ${
                    showReportsDropdown ? "rotate-180 transform" : ""
                  } ${isReportsActive || showReportsDropdown ? "text-white" : "text-gray-500"}`}
                />
              </button>

              {showReportsDropdown && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-slideDown">
                  <div className="p-2 bg-gradient-to-b from-gray-50 to-white">
                    <div className="text-xs font-semibold text-gray-500 px-3 py-2 border-b border-gray-100 mb-2">
                      قائمة التقارير
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleReportNavigation("shifts")}
                        className={`flex items-center w-full px-3 py-2.5 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/reports/shifts"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg ml-3 transition-all duration-200 ${
                            location.pathname === "/reports/shifts"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaClock
                            className={`h-4 w-4 transition-all duration-200 ${
                              location.pathname === "/reports/shifts"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير الورديات</p>
                          <p className="text-xs text-gray-500">
                            سجل الورديات والإيرادات
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("sales")}
                        className={`flex items-center w-full px-3 py-2.5 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/reports/sales"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg ml-3 transition-all duration-200 ${
                            location.pathname === "/reports/sales"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaChartLine
                            className={`h-4 w-4 transition-all duration-200 ${
                              location.pathname === "/reports/sales"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير المبيعات</p>
                          <p className="text-xs text-gray-500">
                            تحليلات المبيعات والأرباح
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("products")}
                        className={`flex items-center w-full px-3 py-2.5 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/reports/products"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg ml-3 transition-all duration-200 ${
                            location.pathname === "/reports/products"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaBoxes
                            className={`h-4 w-4 transition-all duration-200 ${
                              location.pathname === "/reports/products"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير المنتجات</p>
                          <p className="text-xs text-gray-500">
                            أكثر المنتجات مبيعاً
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("customers")}
                        className={`flex items-center w-full px-3 py-2.5 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/reports/customers"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg ml-3 transition-all duration-200 ${
                            location.pathname === "/reports/customers"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaUserFriends
                            className={`h-4 w-4 transition-all duration-200 ${
                              location.pathname === "/reports/customers"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير العملاء</p>
                          <p className="text-xs text-gray-500">
                            تحليلات العملاء والمشتريات
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() =>
                          handleReportNavigation("payment-methods")
                        }
                        className={`flex items-center w-full px-3 py-2.5 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/reports/payment-methods"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg ml-3 transition-all duration-200 ${
                            location.pathname === "/reports/payment-methods"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaMoneyCheck
                            className={`h-4 w-4 transition-all duration-200 ${
                              location.pathname === "/reports/payment-methods"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير طرق الدفع</p>
                          <p className="text-xs text-gray-500">
                            تحليلات طرق الدفع المستخدمة
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("pending-bills")}
                        className={`flex items-center w-full px-3 py-2.5 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/reports/pending-bills"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg ml-3 transition-all duration-200 ${
                            location.pathname === "/reports/pending-bills"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaExclamationCircle
                            className={`h-4 w-4 transition-all duration-200 ${
                              location.pathname === "/reports/pending-bills"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير الفواتير المعلقة</p>
                          <p className="text-xs text-gray-500">
                            الفواتير غير المكتملة
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("returns")}
                        className={`flex items-center w-full px-3 py-2.5 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/reports/returns"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg ml-3 transition-all duration-200 ${
                            location.pathname === "/reports/returns"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaUndo
                            className={`h-4 w-4 transition-all duration-200 ${
                              location.pathname === "/reports/returns"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير المرتجعات</p>
                          <p className="text-xs text-gray-500">
                            سجل المنتجات المرتجعة
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Close Shift Button */}
            {isShiftOpen && (
              <button
                onClick={handleCloseShift}
                className="h-9 px-3 rounded-lg font-medium transition-all duration-300 flex items-center text-sm relative overflow-hidden group bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <FaStopCircle className="h-4 w-4 ml-1.5" />
                <span className="relative">إغلاق الوردية</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
