import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

export default function PendingBillsReport() {
  const navigate = useNavigate();
  const [pendingBills, setPendingBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchPendingBills();
      hasFetched.current = true;
    }
  }, []);

  const fetchPendingBills = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        "/api/Reports/PendingBillsReport",
      );

      if (response.status === 200 && response.data) {
        const data = response.data;

        const billsWithDetails = (data.invoices || []).map((bill) => ({
          id: bill.invoiceId,
          billNumber: bill.invoiceNumber,
          createdAt: bill.invoiceDate,
          createdBy: bill.employeeName,
          employeeId: bill.employeeId,
          employeeName: bill.employeeName,
          customerName: bill.customerName || "عميل",
          total: bill.totalAmount,
          status: "pending",
          invoiceType: bill.invoiceType,
        }));

        setPendingBills(billsWithDetails);
        toast.success(`تم تحميل ${billsWithDetails.length} فاتورة معلقة`);
      }
    } catch (error) {
      console.error("خطأ في جلب الفواتير المعلقة:", error);
      if (error.response?.status === 404) {
        toast.error("لا توجد فواتير معلقة");
        setPendingBills([]);
      } else {
        toast.error("حدث خطأ في جلب الفواتير المعلقة");
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

  const getBillTypeLabel = (type) => {
    const numericTypes = {
      0: { label: "طاولة", color: "#10B981", bgColor: "#10B9811A" },
      1: { label: "سفري", color: "#3B82F6", bgColor: "#3B82F61A" },
      2: { label: "دليفري", color: "#8B5CF6", bgColor: "#8B5CF61A" },
    };

    return (
      numericTypes[type] || {
        label: "غير محدد",
        color: "#6B7280",
        bgColor: "#F3F4F6",
      }
    );
  };

  const calculateStats = () => {
    const totalPendingAmount = pendingBills.reduce(
      (sum, bill) => sum + bill.total,
      0,
    );
    const averageBillAmount =
      pendingBills.length > 0 ? totalPendingAmount / pendingBills.length : 0;

    const billTypeCount = pendingBills.reduce((acc, bill) => {
      const type = bill.invoiceType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const employeeCount = pendingBills.reduce((acc, bill) => {
      acc[bill.employeeName] = (acc[bill.employeeName] || 0) + 1;
      return acc;
    }, {});

    const topEmployee =
      Object.entries(employeeCount).sort((a, b) => b[1] - a[1])[0] || null;

    return {
      totalCount: pendingBills.length,
      totalAmount: totalPendingAmount,
      averageAmount: averageBillAmount,
      billTypeCount,
      topEmployee: topEmployee
        ? { name: topEmployee[0], count: topEmployee[1] }
        : null,
      employeeCount: Object.keys(employeeCount).length,
    };
  };

  const handleViewBillDetails = (bill) => {
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
                نظام الكاشير - الفواتير المعلقة
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
                إحصائيات الفواتير المعلقة
              </h3>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-800">عدد الفواتير</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {stats.totalCount}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">فاتورة معلقة</p>
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-800">إجمالي المبالغ</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">
                        {formatCurrency(stats.totalAmount)} ج.م
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        متوسط الفاتورة: {formatCurrency(stats.averageAmount)}{" "}
                        ج.م
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-800">عدد الموظفين</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        {stats.employeeCount}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">موظف</p>
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-gray-700">
                      توزيع حسب النوع
                    </h4>
                    {Object.entries(stats.billTypeCount).map(
                      ([type, count]) => {
                        const billType = getBillTypeLabel(parseInt(type));
                        const percentage = (count / stats.totalCount) * 100;
                        return (
                          <div key={type} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span style={{ color: billType.color }}>
                                {billType.label}
                              </span>
                              <span>
                                {count} فاتورة ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: billType.color,
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
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
                  جاري تحميل الفواتير المعلقة
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  يتم الآن تحميل قائمة الفواتير غير المكتملة...
                </p>
              </div>
            ) : pendingBills.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
                {/* رأس التقرير */}
                <div className="flex justify-between items-start mb-6 print:flex-col print:items-start">
                  <div>
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: "#193F94" }}
                    >
                      الفواتير المعلقة
                    </h2>
                    <p className="text-gray-600 mt-1">
                      عرض الفواتير غير المكتملة في النظام
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {pendingBills.length} فاتورة معلقة | {stats.employeeCount}{" "}
                      موظف
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                    <div className="px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">
                      {pendingBills.length} معلقة
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {formatCurrency(stats.totalAmount)} ج.م
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 print:grid-cols-2">
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-800">
                          الفواتير المعلقة
                        </p>
                        <p className="text-2xl font-bold text-amber-900 mt-1">
                          {stats.totalCount}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          فاتورة غير مكتملة
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl text-amber-700">⏸️</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">
                          القيمة الإجمالية
                        </p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {formatCurrency(stats.totalAmount)} ج.م
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          إجمالي المبالغ المعلقة
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

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-800">
                          متوسط الفاتورة
                        </p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {formatCurrency(stats.averageAmount)} ج.م
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          لكل فاتورة معلقة
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: "#193F94" }}
                  >
                    قائمة الفواتير المعلقة ({pendingBills.length} فاتورة)
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            رقم الفاتورة
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            تاريخ الإنشاء
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            الموظف
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            نوع الفاتورة
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            المبلغ الإجمالي
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700 print:hidden">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingBills.map((bill) => {
                          const billType = getBillTypeLabel(bill.invoiceType);

                          return (
                            <tr
                              key={bill.id}
                              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                              <td className="py-3 px-4 text-right">
                                <div className="font-medium text-blue-900">
                                  {bill.billNumber}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {bill.customerName || "عميل"}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="text-sm">
                                  {formatDate(bill.createdAt)}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="font-medium">
                                  {bill.employeeName}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: billType.bgColor,
                                    color: billType.color,
                                  }}
                                >
                                  {billType.label}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div
                                  className="font-bold"
                                  style={{ color: "#193F94" }}
                                >
                                  {formatCurrency(bill.total)} ج.م
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right print:hidden">
                                <button
                                  onClick={() => handleViewBillDetails(bill)}
                                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors"
                                >
                                  عرض التفاصيل
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-bold">
                          <td colSpan="4" className="py-4 px-4 text-right">
                            الإجمالي ({pendingBills.length} فاتورة):
                          </td>
                          <td
                            className="py-4 px-4 text-right"
                            style={{ color: "#193F94" }}
                          >
                            {formatCurrency(stats.totalAmount)} ج.م
                          </td>
                          <td className="print:hidden"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-5 border border-blue-200">
                  <h4
                    className="font-bold mb-4 text-gray-800"
                    style={{ color: "#193F94" }}
                  >
                    ملخص الفواتير المعلقة
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#193F94" }}
                      >
                        {pendingBills.length}
                      </div>
                      <div className="text-sm text-gray-600">عدد الفواتير</div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#10B981" }}
                      >
                        {formatCurrency(stats.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي المبالغ
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#8B5CF6" }}
                      >
                        {formatCurrency(stats.averageAmount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        متوسط الفاتورة
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
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  لا توجد فواتير معلقة
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  جميع الفواتير مكتملة حالياً. الفواتير المعلقة تظهر هنا عند ترك
                  فاتورة غير مكتملة.
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
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    لا توجد فواتير معلقة
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
              {/* الهيدر */}
              <div className="bg-gradient-to-l from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">
                    تفاصيل الفاتورة
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
                      {selectedBill.billNumber}
                    </p>
                  </div>
                  <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                    معلقة
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الموظف:</span>
                    <span className="font-medium">
                      {selectedBill.employeeName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">تاريخ الإنشاء:</span>
                    <span className="font-medium">
                      {formatDate(selectedBill.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">العميل:</span>
                    <span className="font-medium">
                      {selectedBill.customerName || "غير محدد"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">نوع الفاتورة:</span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getBillTypeLabel(
                          selectedBill.invoiceType,
                        ).bgColor,
                        color: getBillTypeLabel(selectedBill.invoiceType).color,
                      }}
                    >
                      {getBillTypeLabel(selectedBill.invoiceType).label}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-4 border border-blue-200">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span style={{ color: "#193F94" }}>الإجمالي:</span>
                    <span style={{ color: "#193F94" }}>
                      {formatCurrency(selectedBill.total)} ج.م
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
