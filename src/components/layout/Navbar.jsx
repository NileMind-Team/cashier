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
  FaPercentage,
  FaPrint,
  FaBuilding,
} from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";

export default function Navbar({ isShiftOpen, onShiftClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showReportsDropdown, setShowReportsDropdown] = useState(false);
  const [showManagementDropdown, setShowManagementDropdown] = useState(false);
  const [isClosingShift, setIsClosingShift] = useState(false);
  const dropdownRef = useRef(null);
  const managementDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowReportsDropdown(false);
      }
      if (
        managementDropdownRef.current &&
        !managementDropdownRef.current.contains(event.target)
      ) {
        setShowManagementDropdown(false);
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
      text: "سيتم إغلاق الوردية الحالية",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#193F94",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، إغلاق الوردية",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
      customClass: {
        confirmButton: "px-4 py-2",
        cancelButton: "px-4 py-2",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsClosingShift(true);

        try {
          const response = await axiosInstance.post("/api/Shifts/Close");

          if (response.status === 200 || response.status === 201) {
            if (onShiftClose) {
              onShiftClose();
            }

            const startTime = response.data.startTime
              ? new Date(response.data.startTime).toLocaleString("ar-EG")
              : "غير محدد";
            const endTime = response.data.endTime
              ? new Date(response.data.endTime).toLocaleString("ar-EG")
              : new Date().toLocaleString("ar-EG");

            Swal.fire({
              title: "تم إغلاق الوردية بنجاح!",
              html: `
                <div dir="rtl" class="text-right">
                  <div class="mb-3">
                    <h4 class="font-bold text-lg mb-2" style="color: #193F94">تفاصيل الوردية المغلقة</h4>
                  </div>
                  
                  <div class="space-y-2">
                    <div class="flex justify-between items-center border-b pb-1">
                      <span class="text-gray-700">رقم الوردية:</span>
                      <span class="font-bold">${response.data.shiftId || 0}</span>
                    </div>
                    
                    <div class="flex justify-between items-center border-b pb-1">
                      <span class="text-gray-700">عدد الفواتير:</span>
                      <span class="font-bold">${response.data.invoiceCount || 0}</span>
                    </div>
                    
                    <div class="flex justify-between items-center border-b pb-1">
                      <span class="text-gray-700">إجمالي المبيعات:</span>
                      <span class="font-bold" style="color: #193F94">${(response.data.totalSales || 0).toFixed(2)} ج.م</span>
                    </div>
                    
                    <div class="flex justify-between items-center border-b pb-1">
                      <span class="text-gray-700">الرصيد الافتتاحي:</span>
                      <span class="font-bold">${(response.data.openingCash || 0).toFixed(2)} ج.م</span>
                    </div>
                    
                    <div class="flex justify-between items-center border-b pb-1">
                      <span class="text-gray-700">الرصيد الختامي:</span>
                      <span class="font-bold">${(response.data.closingCash || 0).toFixed(2)} ج.م</span>
                    </div>
                    
                    <div class="flex justify-between items-center border-b pb-1">
                      <span class="text-gray-700">صافي النقدية:</span>
                      <span class="font-bold" style="color: ${response.data.netCash >= 0 ? "#10B981" : "#EF4444"}">${(response.data.netCash || 0).toFixed(2)} ج.م</span>
                    </div>
                  </div>
                  
                  <div class="mt-4 pt-3 border-t border-gray-200">
                    <p class="text-sm text-gray-500">
                      وقت بداية الوردية: ${startTime}
                    </p>
                    <p class="text-sm text-gray-500">
                      وقت نهاية الوردية: ${endTime}
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
        } catch (error) {
          console.error("Failed to close shift:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "حدث خطأ أثناء إغلاق الوردية";

          Swal.fire({
            title: "خطأ في إغلاق الوردية",
            text: errorMessage,
            icon: "error",
            confirmButtonColor: "#193F94",
            confirmButtonText: "حسناً",
          });
        } finally {
          setIsClosingShift(false);
        }
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

  const handleManagementNavigation = (managementType) => {
    setShowManagementDropdown(false);

    switch (managementType) {
      case "halls":
        navigate("/halls");
        break;
      case "options":
        navigate("/options");
        break;
      case "categories":
        navigate("/categories");
        break;
      case "products":
        navigate("/products-management");
        break;
      case "customers":
        navigate("/customers");
        break;
      case "shipping":
        navigate("/shipping-companies");
        break;
      case "payment-methods":
        navigate("/payment-methods");
        break;
      case "printers":
        navigate("/printers");
        break;
      case "discounts":
        navigate("/discounts");
        break;
      case "users":
        navigate("/users");
        break;
      case "permissions":
        navigate("/permissions");
        break;
      default:
        break;
    }
  };

  const isReportsActive = location.pathname.startsWith("/reports");
  const isManagementActive =
    location.pathname === "/halls" ||
    location.pathname === "/options" ||
    location.pathname === "/categories" ||
    location.pathname === "/products-management" ||
    location.pathname === "/customers" ||
    location.pathname === "/shipping-companies" ||
    location.pathname === "/payment-methods" ||
    location.pathname === "/printers" ||
    location.pathname === "/discounts" ||
    location.pathname === "/users" ||
    location.pathname === "/permissions";

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
            {/* Management Dropdown */}
            <div className="relative" ref={managementDropdownRef}>
              <button
                onClick={() =>
                  setShowManagementDropdown(!showManagementDropdown)
                }
                aria-expanded={showManagementDropdown}
                aria-haspopup="true"
                className={`h-9 px-3 rounded-lg font-medium transition-all duration-300 flex items-center text-sm relative overflow-hidden group ${
                  isManagementActive
                    ? "text-white bg-gradient-to-r from-blue-900 to-blue-700 shadow-md shadow-blue-900/30"
                    : "text-gray-700 bg-white/80 hover:bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/10"
                } ${showManagementDropdown ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white" : ""}`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/0 transition-all duration-300"></span>
                <FaBuilding
                  className={`h-4 w-4 ml-1.5 ${isManagementActive || showManagementDropdown ? "text-white" : "text-blue-700"}`}
                />
                <span className="relative">الإدارات</span>
                <FaChevronDown
                  className={`h-3 w-3 mr-1 transition-all duration-300 ${
                    showManagementDropdown ? "rotate-180 transform" : ""
                  } ${isManagementActive || showManagementDropdown ? "text-white" : "text-gray-500"}`}
                />
              </button>

              {showManagementDropdown && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-slideDown">
                  <div className="p-2 bg-gradient-to-b from-gray-50 to-white">
                    <div className="text-xs font-semibold text-gray-500 px-3 py-1.5 border-b border-gray-100 mb-1">
                      قائمة الإدارات
                    </div>
                    <div className="space-y-0.5">
                      {/* Halls Management */}
                      <button
                        onClick={() => handleManagementNavigation("halls")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/halls"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/halls"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaChair
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/halls"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">إدارة الصالات</p>
                        </div>
                      </button>

                      {/* Options Management */}
                      <button
                        onClick={() => handleManagementNavigation("options")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/options"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/options"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaPizzaSlice
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/options"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">إدارة الإضافات</p>
                        </div>
                      </button>

                      {/* Categories Management */}
                      <button
                        onClick={() => handleManagementNavigation("categories")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/categories"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/categories"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaLayerGroup
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/categories"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">إدارة الفئات</p>
                        </div>
                      </button>

                      {/* Products Management */}
                      <button
                        onClick={() => handleManagementNavigation("products")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/products-management"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/products-management"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaBoxOpen
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/products-management"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">إدارة المنتجات</p>
                        </div>
                      </button>

                      {/* Customers Management */}
                      <button
                        onClick={() => handleManagementNavigation("customers")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/customers"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/customers"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaUser
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/customers"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">إدارة العملاء</p>
                        </div>
                      </button>

                      {/* Shipping Companies */}
                      <button
                        onClick={() => handleManagementNavigation("shipping")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/shipping-companies"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/shipping-companies"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaTruck
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/shipping-companies"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">شركات التوصيل</p>
                        </div>
                      </button>

                      {/* Payment Methods */}
                      <button
                        onClick={() =>
                          handleManagementNavigation("payment-methods")
                        }
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/payment-methods"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/payment-methods"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaCreditCard
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/payment-methods"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">طرق الدفع</p>
                        </div>
                      </button>

                      {/* Printers Management */}
                      <button
                        onClick={() => handleManagementNavigation("printers")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/printers"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/printers"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaPrint
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/printers"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">إدارة الطابعات</p>
                        </div>
                      </button>

                      {/* Discounts Management */}
                      <button
                        onClick={() => handleManagementNavigation("discounts")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/discounts"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/discounts"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaPercentage
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/discounts"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">إدارة الخصومات</p>
                        </div>
                      </button>

                      {/* Users Management */}
                      <button
                        onClick={() => handleManagementNavigation("users")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/users"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/users"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaUserCog
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/users"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">إدارة الموظفين</p>
                        </div>
                      </button>

                      {/* Permissions Management */}
                      <button
                        onClick={() =>
                          handleManagementNavigation("permissions")
                        }
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/permissions"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/permissions"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaShieldAlt
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/permissions"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">إدارة الصلاحيات</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                    <div className="text-xs font-semibold text-gray-500 px-3 py-1.5 border-b border-gray-100 mb-1">
                      قائمة التقارير
                    </div>
                    <div className="space-y-0.5">
                      <button
                        onClick={() => handleReportNavigation("shifts")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/reports/shifts"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/reports/shifts"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaClock
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/reports/shifts"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">تقارير الورديات</p>
                          <p className="text-xs text-gray-500">
                            سجل الورديات والإيرادات
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("sales")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/reports/sales"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/reports/sales"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaChartLine
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/reports/sales"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">تقارير المبيعات</p>
                          <p className="text-xs text-gray-500">
                            تحليلات المبيعات والأرباح
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("products")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/reports/products"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/reports/products"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaBoxes
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/reports/products"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">تقارير المنتجات</p>
                          <p className="text-xs text-gray-500">
                            أكثر المنتجات مبيعاً
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("customers")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/reports/customers"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/reports/customers"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaUserFriends
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/reports/customers"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">تقارير العملاء</p>
                          <p className="text-xs text-gray-500">
                            تحليلات العملاء والمشتريات
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() =>
                          handleReportNavigation("payment-methods")
                        }
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/reports/payment-methods"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/reports/payment-methods"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaMoneyCheck
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/reports/payment-methods"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">
                            تقارير طرق الدفع
                          </p>
                          <p className="text-xs text-gray-500">
                            تحليلات طرق الدفع المستخدمة
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("pending-bills")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/reports/pending-bills"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/reports/pending-bills"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaExclamationCircle
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/reports/pending-bills"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">
                            تقارير الفواتير المعلقة
                          </p>
                          <p className="text-xs text-gray-500">
                            الفواتير غير المكتملة
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("returns")}
                        className={`flex items-center w-full px-3 py-2 text-right transition-all duration-200 rounded-lg text-sm group hover:translate-x-1 ${
                          location.pathname === "/reports/returns"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ml-2 transition-all duration-200 ${
                            location.pathname === "/reports/returns"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30"
                          }`}
                        >
                          <FaUndo
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              location.pathname === "/reports/returns"
                                ? "text-white"
                                : "text-blue-600 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-sm">
                            تقارير المرتجعات
                          </p>
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
                disabled={isClosingShift}
                className={`h-9 px-3 rounded-lg font-medium transition-all duration-300 flex items-center text-sm relative overflow-hidden group ${
                  isClosingShift
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg hover:shadow-amber-500/40 hover:scale-105 active:scale-95"
                } text-white shadow-md shadow-amber-500/30`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                {isClosingShift ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 ml-1.5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="relative">جاري إغلاق الوردية...</span>
                  </>
                ) : (
                  <>
                    <FaStopCircle className="h-4 w-4 ml-1.5" />
                    <span className="relative">إغلاق الوردية</span>
                  </>
                )}
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
