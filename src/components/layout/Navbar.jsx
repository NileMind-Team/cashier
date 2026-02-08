import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useState, useRef, useEffect } from "react";

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
    }
  };

  const isReportsActive = location.pathname.startsWith("/reports");
  const isHomeActive = location.pathname === "/";

  return (
    <div className="bg-white shadow-md relative">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
              <span className="text-white font-bold">$</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#193F94" }}>
                نظام الكاشير
              </h1>
              <div className="flex items-center mt-1">
                {isShiftOpen && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium border border-green-200 flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full ml-1 animate-pulse"></div>
                    الوردية مفتوحة
                  </span>
                )}
                <span className="text-xs text-gray-500 mr-2">
                  {new Date().toLocaleDateString("ar-EG")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* زر الرئيسية */}
            <button
              onClick={() => navigate("/")}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center text-sm ${
                isHomeActive
                  ? "bg-blue-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              الرئيسية
            </button>

            {/* زر التقارير مع الدروب داون */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowReportsDropdown(!showReportsDropdown)}
                aria-expanded={showReportsDropdown}
                aria-haspopup="true"
                className={`px-4 py-2 rounded-lg font-medium border transition-all flex items-center ${
                  isReportsActive
                    ? "bg-blue-900 text-white border-blue-900"
                    : "border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                } ${showReportsDropdown ? "bg-blue-900 text-white" : ""}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                التقارير
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 mr-2 transition-transform duration-200 ${
                    showReportsDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* قائمة التقارير المنسدلة */}
              {showReportsDropdown && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fadeIn">
                  <div className="p-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3
                        className="font-bold text-gray-800 text-sm"
                        style={{ color: "#193F94" }}
                      >
                        تقارير النظام
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        اختر التقرير المطلوب
                      </p>
                    </div>

                    <div className="space-y-1 mt-2">
                      <button
                        onClick={() => handleReportNavigation("shifts")}
                        className={`flex items-center w-full px-4 py-3 text-right transition-colors rounded-lg text-sm ${
                          location.pathname === "/reports/shifts"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg ml-3 ${
                            location.pathname === "/reports/shifts"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير الورديات</p>
                          <p className="text-xs text-gray-500">
                            عرض تفاصيل الورديات المغلقة
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("sales")}
                        className={`flex items-center w-full px-4 py-3 text-right transition-colors rounded-lg text-sm ${
                          location.pathname === "/reports/sales"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg ml-3 ${
                            location.pathname === "/reports/sales"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير المبيعات</p>
                          <p className="text-xs text-gray-500">
                            تحليل المبيعات حسب الفترة
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("products")}
                        className={`flex items-center w-full px-4 py-3 text-right transition-colors rounded-lg text-sm ${
                          location.pathname === "/reports/products"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg ml-3 ${
                            location.pathname === "/reports/products"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير المنتجات</p>
                          <p className="text-xs text-gray-500">
                            المنتجات الأكثر والأقل مبيعاً
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleReportNavigation("customers")}
                        className={`flex items-center w-full px-4 py-3 text-right transition-colors rounded-lg text-sm ${
                          location.pathname === "/reports/customers"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg ml-3 ${
                            location.pathname === "/reports/customers"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0h-6m3.5 0a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">تقارير العملاء</p>
                          <p className="text-xs text-gray-500">
                            تحليل سلوك العملاء
                          </p>
                        </div>
                      </button>

                      {/* تقرير طرق الدفع الجديد */}
                      <button
                        onClick={() =>
                          handleReportNavigation("payment-methods")
                        }
                        className={`flex items-center w-full px-4 py-3 text-right transition-colors rounded-lg text-sm ${
                          location.pathname === "/reports/payment-methods"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg ml-3 ${
                            location.pathname === "/reports/payment-methods"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">طرق الدفع</p>
                          <p className="text-xs text-gray-500">
                            تحليل المبيعات حسب وسائل الدفع
                          </p>
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
                className="px-4 py-2 rounded-lg font-medium border transition-all flex items-center"
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                    clipRule="evenodd"
                  />
                </svg>
                إغلاق الوردية
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
