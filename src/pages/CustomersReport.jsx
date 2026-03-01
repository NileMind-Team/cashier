import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

export default function CustomersReports() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [customerData, setCustomerData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoFormatted = thirtyDaysAgo.toISOString().split("T")[0];

    setStartDate(thirtyDaysAgoFormatted);
    setEndDate(today);
  }, []);

  const handlePhoneSearch = async () => {
    if (!phoneSearch.trim()) {
      toast.error("يرجى إدخال رقم التليفون");
      return;
    }

    const searchTerm = phoneSearch.replace(/\D/g, "");

    if (searchTerm.length < 3) {
      toast.error("يرجى إدخال 3 أرقام على الأقل للبحث");
      return;
    }

    setSearchLoading(true);

    try {
      const response = await axiosInstance.get("/api/Reports/GetCustomer", {
        params: {
          phone: searchTerm,
        },
      });

      if (response.status === 200 && response.data) {
        setCustomerData(response.data);
        toast.success(`تم العثور على ${response.data.name}`);
      }
    } catch (error) {
      console.error("خطأ في البحث عن العميل:", error);
      if (error.response?.status === 404) {
        toast.error(`لم يتم العثور على عميل برقم التليفون ${phoneSearch}`);
        setCustomerData(null);
      } else if (error.response?.status === 400) {
        toast.error("بيانات غير صالحة: تأكد من رقم التليفون");
      } else {
        toast.error("حدث خطأ في البحث عن العميل");
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePhoneSearch();
    }
  };

  const clearSearch = () => {
    setPhoneSearch("");
    setCustomerData(null);
    setReportData(null);
  };

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("يرجى اختيار تاريخ البداية والنهاية");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
      return;
    }

    if (!customerData) {
      toast.error("يرجى البحث عن عميل أولاً");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `/api/Reports/CustomerAnalytics/${customerData.id}`,
        {
          params: {
            from: startDate,
            to: endDate,
          },
        },
      );

      if (response.status === 200 && response.data) {
        const data = response.data;

        setReportData({
          customer: {
            ...customerData,
            analytics: data,
          },
          dateRange: {
            start: formatArabicDate(startDate),
            end: formatArabicDate(endDate),
            startDate: startDate,
            endDate: endDate,
          },
        });

        toast.success(`تم إنشاء تقرير ${data.customerName}`);
      }
    } catch (error) {
      console.error("خطأ في جلب تقرير العميل:", error);
      if (error.response?.status === 404) {
        toast.error("لا توجد بيانات للعميل في الفترة المحددة");
      } else if (error.response?.status === 400) {
        toast.error("بيانات غير صالحة: تأكد من تواريخ صحيحة");
      } else {
        toast.error("حدث خطأ في جلب تقرير العميل");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatArabicDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "0.00";
    return new Intl.NumberFormat("ar-EG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-l from-gray-50 to-gray-100"
    >
      {/* Navbar */}
      <div className="bg-white shadow-md print:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center ml-3">
                <span className="text-white font-bold">$</span>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "#193F94" }}>
                نظام الكاشير - تقارير العملاء
              </h1>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg font-medium border transition-all flex items-center"
              style={{ borderColor: "#193F94", color: "#193F94" }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#193F94";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#193F94";
              }}
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 print:hidden">
            <div className="bg-white rounded-2xl shadow-lg p-5 sticky top-6">
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: "#193F94" }}
              >
                فلترة التقارير
              </h3>

              <div className="space-y-4">
                <div className="relative">
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <input
                      type="text"
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="أدخل رقم التليفون..."
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      dir="rtl"
                    />
                    <button
                      onClick={handlePhoneSearch}
                      disabled={searchLoading}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {searchLoading ? (
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <label className="absolute -top-2.5 right-3 px-2 text-xs text-blue-500 font-medium bg-white">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      بحث برقم التليفون
                    </span>
                  </label>
                </div>

                {customerData && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-green-800">
                        {customerData.name}
                      </span>
                      <button
                        onClick={clearSearch}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="text-sm text-green-700">
                      <div>رقم التليفون: {customerData.phone}</div>
                      {customerData.address && (
                        <div className="mt-1 text-xs">
                          العنوان: {customerData.address}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                    max={endDate || undefined}
                    dir="rtl"
                  />
                  <label className="absolute -top-2.5 right-3 px-2 text-xs text-blue-500 font-medium bg-white">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      التاريخ من
                    </span>
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                    min={startDate || undefined}
                    dir="rtl"
                  />
                  <label className="absolute -top-2.5 right-3 px-2 text-xs text-blue-500 font-medium bg-white">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      التاريخ إلى
                    </span>
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    onClick={generateReport}
                    disabled={
                      loading || !startDate || !endDate || !customerData
                    }
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-md ${
                      loading || !startDate || !endDate || !customerData
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    }`}
                    style={{
                      backgroundColor:
                        loading || !startDate || !endDate || !customerData
                          ? ""
                          : "#193F94",
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin ml-2"></div>
                        جاري التحميل...
                      </>
                    ) : (
                      <>
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        عرض التقرير
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {reportData ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
                <div className="flex justify-between items-start mb-6 print:flex-col print:items-start">
                  <div>
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: "#193F94" }}
                    >
                      تقرير العميل -{" "}
                      {reportData.customer.analytics.customerName}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      الفترة من{" "}
                      <span className="font-bold">
                        {reportData.dateRange.start}
                      </span>{" "}
                      إلى{" "}
                      <span className="font-bold">
                        {reportData.dateRange.end}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {reportData.customer.analytics.totalInvoices} فاتورة
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {reportData.customer.analytics.totalInvoices} فاتورة
                    </div>
                    {reportData.customer.analytics.hasDebt && (
                      <div className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                        عليه مدفوعات
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 print:grid-cols-2">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">
                          إجمالي المشتريات
                        </p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {formatCurrency(
                            reportData.customer.analytics.totalPurchases,
                          )}{" "}
                          ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-blue-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-800">
                          إجمالي الفواتير
                        </p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {reportData.customer.analytics.totalInvoices}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {reportData.customer.analytics.totalInvoices > 0
                            ? `متوسط ${formatCurrency(reportData.customer.analytics.averageSpending)} ج.م/فاتورة`
                            : "لا توجد فواتير"}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-green-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-800">
                          إجمالي المدفوع
                        </p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {formatCurrency(
                            reportData.customer.analytics.totalPaid,
                          )}{" "}
                          ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-purple-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`bg-gradient-to-r rounded-xl p-4 border ${
                      reportData.customer.analytics.hasDebt
                        ? "from-red-50 to-red-100 border-red-200"
                        : "from-amber-50 to-amber-100 border-amber-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm ${
                            reportData.customer.analytics.hasDebt
                              ? "text-red-800"
                              : "text-amber-800"
                          }`}
                        >
                          المتبقي
                        </p>
                        <p
                          className={`text-2xl font-bold mt-1 ${
                            reportData.customer.analytics.hasDebt
                              ? "text-red-900"
                              : "text-amber-900"
                          }`}
                        >
                          {formatCurrency(
                            reportData.customer.analytics.totalRemaining,
                          )}{" "}
                          ج.م
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            reportData.customer.analytics.hasDebt
                              ? "text-red-600"
                              : "text-amber-600"
                          }`}
                        >
                          {reportData.customer.analytics.hasDebt
                            ? "مدفوعات ناقصة"
                            : "جميع المدفوعات مكتملة"}
                        </p>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          reportData.customer.analytics.hasDebt
                            ? "bg-red-200"
                            : "bg-amber-200"
                        }`}
                      >
                        <span
                          className={`text-xl ${
                            reportData.customer.analytics.hasDebt
                              ? "text-red-700"
                              : "text-amber-700"
                          }`}
                        >
                          {reportData.customer.analytics.hasDebt ? "⚠️" : "✓"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: "#193F94" }}
                  >
                    تفاصيل العميل
                  </h3>
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ml-2">
                            <span className="text-blue-700 font-bold">👤</span>
                          </div>
                          <div>
                            <p className="font-bold text-lg">
                              {reportData.customer.analytics.customerName}
                            </p>
                            <p className="text-sm text-gray-600">العميل</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">الهاتف:</span>
                            <span className="font-medium">
                              {reportData.customer.analytics.phone}
                            </span>
                          </div>
                          {reportData.customer.address && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">العنوان:</span>
                              <span className="font-medium">
                                {reportData.customer.address}
                              </span>
                            </div>
                          )}
                          {reportData.customer.nationalId && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                الرقم القومي:
                              </span>
                              <span className="font-medium">
                                {reportData.customer.nationalId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-bold mb-3 text-gray-800">
                          إحصائيات الفترة
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              المشتريات في الفترة:
                            </span>
                            <span className="font-bold text-blue-700">
                              {formatCurrency(
                                reportData.customer.analytics.totalPurchases,
                              )}{" "}
                              ج.م
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">عدد الفواتير:</span>
                            <span className="font-bold">
                              {reportData.customer.analytics.totalInvoices}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              متوسط الإنفاق:
                            </span>
                            <span className="font-bold">
                              {formatCurrency(
                                reportData.customer.analytics.averageSpending,
                              )}{" "}
                              ج.م
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-5 border border-blue-200">
                  <h4
                    className="font-bold mb-4 text-gray-800"
                    style={{ color: "#193F94" }}
                  >
                    ملخص تقرير العميل
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#193F94" }}
                      >
                        {reportData.customer.analytics.totalInvoices}
                      </div>
                      <div className="text-sm text-gray-600">عدد الفواتير</div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#10B981" }}
                      >
                        {formatCurrency(
                          reportData.customer.analytics.totalPurchases,
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي المشتريات
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#8B5CF6" }}
                      >
                        {formatCurrency(
                          reportData.customer.analytics.totalPaid,
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي المدفوع
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${
                          reportData.customer.analytics.hasDebt
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {formatCurrency(
                          reportData.customer.analytics.totalRemaining,
                        )}
                      </div>
                      <div className="text-sm text-gray-600">المتبقي</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  تقارير العملاء
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  ابحث برقم التليفون واختر تاريخ البداية والنهاية لعرض التقرير
                </p>
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    بحث برقم التليفون
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
