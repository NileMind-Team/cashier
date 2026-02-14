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

  const isReportsActive = location.pathname.startsWith("/reports");
  const isUsersActive = location.pathname === "/users";
  const isCategoriesActive = location.pathname === "/categories";
  const isProductsManagementActive =
    location.pathname === "/products-management";
  const isCustomersActive = location.pathname === "/customers";
  const isShippingCompaniesActive = location.pathname === "/shipping-companies";
  const isPaymentMethodsActive = location.pathname === "/payment-methods";
  const isHallsActive = location.pathname === "/halls";

  return (
    <div className="bg-white shadow-md relative">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center ml-3">
              <FaCashRegister className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#193F94" }}>
                نظام الكاشير
              </h1>
              <div className="flex items-center mt-0.5">
                {isShiftOpen && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium border border-green-200 flex items-center">
                    <FaCircle className="w-2 h-2 text-green-500 ml-1 animate-pulse" />
                    الوردية مفتوحة
                  </span>
                )}
                <span className="text-xs text-gray-500 mr-2">
                  <FaCalendarDay className="inline ml-1" />
                  {new Date().toLocaleDateString("ar-EG")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={handleHallsNavigation}
              className={`h-9 px-3 rounded-lg font-medium border transition-all flex items-center text-sm whitespace-nowrap flex-shrink-0 ${
                isHallsActive
                  ? "bg-blue-900 text-white border-blue-900"
                  : "border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
              }`}
            >
              <FaChair className="h-4 w-4 ml-1.5" />
              إدارة الصالات
            </button>

            <button
              onClick={handleCategoriesNavigation}
              className={`h-9 px-3 rounded-lg font-medium border transition-all flex items-center text-sm ${
                isCategoriesActive
                  ? "bg-blue-900 text-white border-blue-900"
                  : "border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
              }`}
            >
              <FaLayerGroup className="h-4 w-4 ml-1.5" />
              إدارة الفئات
            </button>

            <button
              onClick={handleProductsManagementNavigation}
              className={`h-9 px-3 rounded-lg font-medium border transition-all flex items-center text-sm ${
                isProductsManagementActive
                  ? "bg-blue-900 text-white border-blue-900"
                  : "border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
              }`}
            >
              <FaBoxOpen className="h-4 w-4 ml-1.5" />
              إدارة المنتجات
            </button>

            <button
              onClick={handleCustomersNavigation}
              className={`h-9 px-3 rounded-lg font-medium border transition-all flex items-center text-sm ${
                isCustomersActive
                  ? "bg-blue-900 text-white border-blue-900"
                  : "border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
              }`}
            >
              <FaUser className="h-4 w-4 ml-1.5" />
              إدارة العملاء
            </button>

            <button
              onClick={handleShippingCompaniesNavigation}
              className={`h-9 px-3 rounded-lg font-medium border transition-all flex items-center text-sm ${
                isShippingCompaniesActive
                  ? "bg-blue-900 text-white border-blue-900"
                  : "border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
              }`}
            >
              <FaTruck className="h-4 w-4 ml-1.5" />
              شركات التوصيل
            </button>

            <button
              onClick={handlePaymentMethodsNavigation}
              className={`h-9 px-3 rounded-lg font-medium border transition-all flex items-center text-sm ${
                isPaymentMethodsActive
                  ? "bg-blue-900 text-white border-blue-900"
                  : "border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
              }`}
            >
              <FaCreditCard className="h-4 w-4 ml-1.5" />
              طرق الدفع
            </button>

            <button
              onClick={handleUsersNavigation}
              className={`h-9 px-3 rounded-lg font-medium border transition-all flex items-center text-sm ${
                isUsersActive
                  ? "bg-blue-900 text-white border-blue-900"
                  : "border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
              }`}
            >
              <FaUserCog className="h-4 w-4 ml-1.5" />
              إدارة الموظفين
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowReportsDropdown(!showReportsDropdown)}
                aria-expanded={showReportsDropdown}
                aria-haspopup="true"
                className={`h-9 px-3 rounded-lg font-medium border transition-all flex items-center text-sm ${
                  isReportsActive
                    ? "bg-blue-900 text-white border-blue-900"
                    : "border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                } ${showReportsDropdown ? "bg-blue-900 text-white" : ""}`}
              >
                <FaChartBar className="h-4 w-4 ml-1.5" />
                التقارير
                <FaChevronDown
                  className={`h-3 w-3 mr-1 transition-transform duration-200 ${
                    showReportsDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showReportsDropdown && (
                <div className="absolute left-0 mt-1 w-60 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fadeIn">
                  <div className="p-1">
                    <div className="space-y-1 mt-1">
                      <button
                        onClick={() => handleReportNavigation("shifts")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-colors rounded-lg text-sm ${
                          location.pathname === "/reports/shifts"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 ${
                            location.pathname === "/reports/shifts"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <FaClock className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير الورديات</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("sales")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-colors rounded-lg text-sm ${
                          location.pathname === "/reports/sales"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 ${
                            location.pathname === "/reports/sales"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <FaChartLine className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير المبيعات</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("products")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-colors rounded-lg text-sm ${
                          location.pathname === "/reports/products"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 ${
                            location.pathname === "/reports/products"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <FaBoxes className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير المنتجات</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("customers")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-colors rounded-lg text-sm ${
                          location.pathname === "/reports/customers"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 ${
                            location.pathname === "/reports/customers"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <FaUserFriends className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير العملاء</p>
                        </div>
                      </button>

                      <button
                        onClick={() =>
                          handleReportNavigation("payment-methods")
                        }
                        className={`flex items-center w-full px-3 py-2 text-right transition-colors rounded-lg text-sm ${
                          location.pathname === "/reports/payment-methods"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 ${
                            location.pathname === "/reports/payment-methods"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <FaMoneyCheck className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير طرق الدفع</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("pending-bills")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-colors rounded-lg text-sm ${
                          location.pathname === "/reports/pending-bills"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 ${
                            location.pathname === "/reports/pending-bills"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <FaExclamationCircle className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير الفواتير المعلقة</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("returns")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-colors rounded-lg text-sm ${
                          location.pathname === "/reports/returns"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 ${
                            location.pathname === "/reports/returns"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <FaUndo className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير المرتجعات</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isShiftOpen && (
              <button
                onClick={handleCloseShift}
                className="h-9 px-3 rounded-lg font-medium border transition-all flex items-center text-sm"
                style={{ borderColor: "#F59E0B", color: "#F59E0B" }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#F59E0B";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#F59E0B";
                }}
              >
                <FaStopCircle className="h-4 w-4 ml-1.5" />
                إغلاق الوردية
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
