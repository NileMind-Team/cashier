import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

export default function ReturnsReport() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [returnedBills, setReturnedBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoFormatted = thirtyDaysAgo.toISOString().split("T")[0];

    setStartDate(thirtyDaysAgoFormatted);
    setEndDate(today);
  }, []);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      toast.error("يرجى اختيار تاريخ البداية والنهاية");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/Reports/ReturnsReport", {
        params: {
          from: startDate,
          to: endDate,
        },
      });

      if (response.status === 200 && response.data) {
        const data = response.data;

        const billsWithDetails = (data.invoices || []).map((bill) => ({
          id: bill.invoiceId,
          originalBillNumber: bill.invoiceNumber,
          returnDate: bill.invoiceDate,
          customerName: bill.customerName || "عميل",
          employeeName: bill.employeeName,
          totalAmount: bill.totalAmount,
        }));

        setReturnedBills(billsWithDetails);
        toast.success(`تم العثور على ${billsWithDetails.length} فاتورة مرتجعة`);
      }
    } catch (error) {
      console.error("خطأ في جلب الفواتير المرتجعة:", error);
      if (error.response?.status === 404) {
        toast.error("لا توجد فواتير مرتجعة");
        setReturnedBills([]);
      } else {
        toast.error("حدث خطأ في جلب الفواتير المرتجعة");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "0.00";
    return new Intl.NumberFormat("ar-EG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const calculateStats = () => {
    const totalReturns = returnedBills.length;
    const totalRefundAmount = returnedBills.reduce(
      (sum, bill) => sum + bill.totalAmount,
      0,
    );
    const avgRefundAmount =
      totalReturns > 0 ? totalRefundAmount / totalReturns : 0;

    const employeeCount = returnedBills.reduce((acc, bill) => {
      acc[bill.employeeName] = (acc[bill.employeeName] || 0) + 1;
      return acc;
    }, {});

    const topEmployee = Object.entries(employeeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1);

    return {
      totalReturns,
      totalRefundAmount,
      avgRefundAmount,
      employeeCount: Object.keys(employeeCount).length,
      topEmployee: topEmployee.length > 0 ? topEmployee[0] : null,
    };
  };

  const handleViewReturnDetails = (bill) => {
    setSelectedBill(bill);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setTimeout(() => {
      setSelectedBill(null);
    }, 200);
  };

  const stats = calculateStats();

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
                نظام الكاشير - تقارير المرتجعات
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
                    onClick={handleSearch}
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-md ${
                      loading
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    }`}
                    style={{
                      backgroundColor: loading ? "" : "#193F94",
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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        بحث وتطبيق الفلترة
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-blue-600 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  جاري تحميل تقارير المرتجعات
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  يتم الآن تحميل الفواتير والمنتجات المرتجعة...
                </p>
              </div>
            ) : returnedBills.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
                {/* رأس التقرير */}
                <div className="flex justify-between items-start mb-6 print:flex-col print:items-start">
                  <div>
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: "#193F94" }}
                    >
                      تقرير المرتجعات
                    </h2>
                    <p className="text-gray-600 mt-1">
                      عرض الفواتير والمنتجات المرتجعة في النظام
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {returnedBills.length} فاتورة مرتجعة |{" "}
                      {stats.employeeCount} موظف
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                    <div className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                      {returnedBills.length} مرتجعة
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {formatCurrency(stats.totalRefundAmount)} ج.م
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 print:grid-cols-2">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-800">
                          الفواتير المرتجعة
                        </p>
                        <p className="text-2xl font-bold text-red-900 mt-1">
                          {stats.totalReturns}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          فاتورة مرتجعة
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                        <span className="text-red-700 font-bold">🔄</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">
                          إجمالي المبالغ المرتجعة
                        </p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {formatCurrency(stats.totalRefundAmount)} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-bold">💸</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-800">
                          متوسط المبلغ المرتجع
                        </p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {formatCurrency(stats.avgRefundAmount)} ج.م
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          لكل فاتورة مرتجعة
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                        <span className="text-purple-700 font-bold">📊</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: "#193F94" }}
                  >
                    قائمة الفواتير المرتجعة ({returnedBills.length} فاتورة)
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            رقم الفاتورة
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            تاريخ الإرجاع
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            العميل
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            الموظف المسؤول
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            المبلغ المرتجع
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700 print:hidden">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {returnedBills.map((bill) => (
                          <tr
                            key={bill.id}
                            className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                          >
                            <td className="py-3 px-4 text-right">
                              <div className="font-medium text-blue-900">
                                {bill.originalBillNumber}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="text-sm">
                                {formatDate(bill.returnDate)}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-medium">
                                {bill.customerName}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-medium">
                                {bill.employeeName}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-bold text-red-600">
                                {formatCurrency(bill.totalAmount)} ج.م
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right print:hidden">
                              <button
                                onClick={() => handleViewReturnDetails(bill)}
                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors"
                              >
                                عرض التفاصيل
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-bold">
                          <td colSpan="4" className="py-4 px-4 text-right">
                            الإجمالي ({returnedBills.length} فاتورة):
                          </td>
                          <td className="py-4 px-4 text-right text-red-600">
                            {formatCurrency(stats.totalRefundAmount)} ج.م
                          </td>
                          <td className="print:hidden"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-white rounded-xl p-5 border border-red-200">
                  <h4
                    className="font-bold mb-4 text-gray-800"
                    style={{ color: "#193F94" }}
                  >
                    ملخص تقرير المرتجعات
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#193F94" }}
                      >
                        {returnedBills.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        عدد الفواتير المرتجعة
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#EF4444" }}
                      >
                        {formatCurrency(stats.totalRefundAmount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي المبالغ المرتجعة
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#8B5CF6" }}
                      >
                        {formatCurrency(stats.avgRefundAmount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        متوسط المبلغ المرتجع
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#F59E0B" }}
                      >
                        {stats.employeeCount}
                      </div>
                      <div className="text-sm text-gray-600">عدد الموظفين</div>
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  تقارير المرتجعات
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  اختر تاريخ البداية والنهاية واضغط على زر البحث لعرض الفواتير
                  المرتجعة
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    اختر التاريخ من وإلى
                  </div>
                  <div className="text-sm text-gray-500">
                    ثم اضغط على "بحث وتطبيق الفلترة"
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDetailsModal && selectedBill && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={closeModal}
        >
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-l from-red-600 to-red-700 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">
                    تفاصيل الفاتورة المرتجعة
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg
                      className="h-6 w-6"
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
              </div>

              <div className="px-6 py-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-500">رقم الفاتورة</p>
                    <p className="text-xl font-bold text-blue-900">
                      {selectedBill.originalBillNumber}
                    </p>
                  </div>
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    مرتجعة
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">تاريخ الإرجاع:</span>
                    <span className="font-medium">
                      {formatDate(selectedBill.returnDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">العميل:</span>
                    <span className="font-medium">
                      {selectedBill.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الموظف المسؤول:</span>
                    <span className="font-medium">
                      {selectedBill.employeeName}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-white rounded-xl p-4 border border-red-200">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-red-600">المبلغ المرتجع:</span>
                    <span className="text-red-600">
                      {formatCurrency(selectedBill.totalAmount)} ج.م
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 rounded-b-2xl flex justify-left">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
