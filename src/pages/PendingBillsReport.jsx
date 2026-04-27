import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import {
  FaArrowLeft,
  FaFileInvoice,
  FaMoneyBillWave,
  FaUsers,
  FaChartLine,
  FaEye,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaSpinner,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import { Printer } from "lucide-react";

export default function PendingBillsReport() {
  const navigate = useNavigate();
  const [pendingBills, setPendingBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const hasFetched = useRef(false);
  const [isViewingBill, setIsViewingBill] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [printLoading, setPrintLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [reportStats, setReportStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    totalRemaining: 0,
    averageInvoice: 0,
    employeesCount: 0,
    topEmployeeName: null,
    topEmployeeCount: 0,
    typeDistribution: [],
  });

  const addTwoHours = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    date.setHours(date.getHours() + 2);
    return date;
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchPendingBills(1);
      hasFetched.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPendingBills = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/api/Reports/PendingBillsReport",
        {
          pageNumber: pageNumber,
          pageSize: pagination.pageSize,
          skip: (pageNumber - 1) * pagination.pageSize,
        },
      );

      if (response.status === 200 && response.data) {
        const data = response.data;

        setPagination({
          currentPage: data.pageNumber || pageNumber,
          pageSize: data.pageSize || 10,
          totalCount: data.totalInvoices || 0,
          totalPages: data.totalPages || 1,
          hasNextPage: data.hasNext || false,
          hasPreviousPage: data.hasPrevious || false,
        });

        setReportStats({
          totalInvoices: data.totalInvoices || 0,
          totalAmount: data.totalAmount || 0,
          totalRemaining: data.totalRemaining || 0,
          averageInvoice: data.averageInvoice || 0,
          employeesCount: data.employeesCount || 0,
          topEmployeeName: data.topEmployeeName || null,
          topEmployeeCount: data.topEmployeeCount || 0,
          typeDistribution: data.typeDistribution || [],
        });

        const billsWithDetails = (data.invoices || []).map((bill) => {
          let sequentialNumber = null;
          if (bill.invoiceNumber && bill.invoiceNumber.startsWith("INV-")) {
            sequentialNumber = parseInt(bill.invoiceNumber.replace("INV-", ""));
          } else {
            sequentialNumber = bill.invoiceNumber;
          }

          return {
            id: bill.invoiceId,
            sequentialNumber: sequentialNumber,
            billNumber: bill.invoiceNumber,
            createdAt: bill.invoiceDate,
            createdBy: bill.employeeName,
            employeeId: bill.employeeId,
            employeeName: bill.employeeName,
            customerName: bill.customerName || "عميل",
            total: bill.totalAmount,
            remainingAmount: bill.remainingAmount,
            status: "pending",
            invoiceType: bill.invoiceType,
          };
        });

        setPendingBills(billsWithDetails);
        toast.success(`تم تحميل ${billsWithDetails.length} فاتورة معلقة`);
      }
    } catch (error) {
      console.error("خطأ في جلب الفواتير المعلقة:", error);
      if (error.response?.status === 404) {
        toast.error("لا توجد فواتير معلقة");
        setPendingBills([]);
        setPagination({
          ...pagination,
          totalCount: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        });
        setReportStats({
          totalInvoices: 0,
          totalAmount: 0,
          totalRemaining: 0,
          averageInvoice: 0,
          employeesCount: 0,
          topEmployeeName: null,
          topEmployeeCount: 0,
          typeDistribution: [],
        });
      } else {
        toast.error("حدث خطأ في جلب الفواتير المعلقة");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBillsForPrint = async () => {
    setPrintLoading(true);
    try {
      const allBillsPageSize =
        pagination.totalCount > 0 ? pagination.totalCount : 1000;

      const response = await axiosInstance.post(
        "/api/Reports/PendingBillsReport",
        {
          pageNumber: 1,
          pageSize: allBillsPageSize,
          skip: 0,
        },
      );

      if (response.status === 200 && response.data) {
        const data = response.data;

        const billsWithDetails = (data.invoices || []).map((bill) => {
          return {
            id: bill.invoiceId,
            billNumber: bill.invoiceNumber,
            createdAt: bill.invoiceDate,
            employeeName: bill.employeeName,
            customerName: bill.customerName || "عميل",
            total: bill.totalAmount,
            invoiceType: bill.invoiceType,
          };
        });

        const totalAmount = billsWithDetails.reduce(
          (sum, bill) => sum + bill.total,
          0,
        );
        const averageAmount =
          billsWithDetails.length > 0
            ? totalAmount / billsWithDetails.length
            : 0;

        const employeeCount = billsWithDetails.reduce((acc, bill) => {
          acc[bill.employeeName] = (acc[bill.employeeName] || 0) + 1;
          return acc;
        }, {});

        setPrintData({
          bills: billsWithDetails,
          stats: {
            totalCount: data.totalInvoices || 0,
            totalAmount: totalAmount,
            averageAmount: averageAmount,
            employeeCount: Object.keys(employeeCount).length,
          },
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error("خطأ في جلب بيانات الطباعة:", error);
      toast.error("حدث خطأ في تجهيز بيانات الطباعة");
      return false;
    } finally {
      setPrintLoading(false);
    }
  };

  const handlePrint = async () => {
    const success = await fetchAllBillsForPrint();
    if (!success) return;

    setIsPrinting(true);

    setTimeout(() => {
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const printContent = document.getElementById("printable-content");
      if (!printContent) {
        setIsPrinting(false);
        return;
      }

      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              background: white;
              color: #333;
            }
            .print-container {
              max-width: 1200px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #193F94;
            }
            .header h1 {
              color: #193F94;
              margin-bottom: 10px;
            }
            .header h3 {
              color: #666;
              font-size: 16px;
            }
            .summary-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .summary-table th {
              background-color: #193F94;
              color: white;
              padding: 12px;
              text-align: center;
              border: 1px solid #dee2e6;
            }
            .summary-table td {
              padding: 12px;
              text-align: center;
              border: 1px solid #dee2e6;
            }
            .summary-table .label {
              font-weight: bold;
              background-color: #e9ecef;
            }
            .bills-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .bills-table th {
              background-color: #4a5568;
              color: white;
              padding: 12px;
              text-align: center;
              border: 1px solid #dee2e6;
            }
            .bills-table td {
              padding: 10px;
              text-align: center;
              border: 1px solid #dee2e6;
            }
            .bills-table tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .bills-table tfoot {
              background-color: #e9ecef;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #dee2e6;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body {
                padding: 0;
              }
              .summary-table th {
                background-color: #193F94 !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .bills-table th {
                background-color: #4a5568 !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => {
                window.parent.document.body.removeChild(window.frameElement);
              };
            };
          </script>
        </body>
        </html>
      `);
      iframeDoc.close();
      setTimeout(() => setIsPrinting(false), 1000);
    }, 500);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !loading) {
      fetchPendingBills(newPage);

      const tableElement = document.getElementById("bills-table-container");
      if (tableElement) {
        tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= pagination.totalPages; i++) {
      if (
        i === 1 ||
        i === pagination.totalPages ||
        (i >= pagination.currentPage - delta &&
          i <= pagination.currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const adjustedDate = addTwoHours(dateString);
    return adjustedDate.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "";
    const adjustedDate = addTwoHours(dateString);
    return adjustedDate.toLocaleDateString("ar-EG", {
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

  const handleViewBillDetails = (bill) => {
    setIsViewingBill(true);
    setSelectedBill(bill);
    setShowDetailsModal(true);
    setTimeout(() => setIsViewingBill(false), 100);
  };

  const handleResumeBill = (bill) => {
    navigate("/", { state: { resumeInvoiceId: bill.sequentialNumber } });
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setTimeout(() => {
      setSelectedBill(null);
    }, 200);
  };

  const formatDateForPrint = (dateString) => {
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
                <FaClock className="text-white text-lg" />
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
              <FaArrowLeft className="h-5 w-5 ml-2" />
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Printable Content */}
      <div id="printable-content" style={{ display: "none" }}>
        {printData && (
          <>
            <div className="header">
              <h1>تقرير الفواتير المعلقة</h1>
              <h3>تاريخ التقرير: {formatDateOnly(new Date().toISOString())}</h3>
            </div>

            <table className="summary-table">
              <thead>
                <tr>
                  <th>البيان</th>
                  <th>القيمة</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="label">عدد الفواتير</td>
                  <td>{printData.stats.totalCount}</td>
                </tr>
                <tr>
                  <td className="label">إجمالي المبالغ</td>
                  <td>{formatCurrency(printData.stats.totalAmount)} ج.م</td>
                </tr>
                <tr>
                  <td className="label">متوسط الفاتورة</td>
                  <td>{formatCurrency(printData.stats.averageAmount)} ج.م</td>
                </tr>
                <tr>
                  <td className="label">عدد الموظفين</td>
                  <td>{printData.stats.employeeCount}</td>
                </tr>
              </tbody>
            </table>

            <h3
              style={{
                marginBottom: "15px",
                color: "#193F94",
                textAlign: "center",
              }}
            >
              قائمة الفواتير المعلقة ({printData.stats.totalCount} فاتورة)
            </h3>

            <table className="bills-table">
              <thead>
                <tr>
                  <th>رقم الفاتورة</th>
                  <th>تاريخ الإنشاء</th>
                  <th>الموظف</th>
                  <th>نوع الفاتورة</th>
                  <th>المبلغ الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {printData.bills.map((bill, idx) => {
                  const billType = getBillTypeLabel(bill.invoiceType);
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: "bold" }}>
                        {bill.billNumber}
                        <div style={{ fontSize: "11px", color: "#666" }}>
                          {bill.customerName || "عميل"}
                        </div>
                      </td>
                      <td>{formatDateForPrint(bill.createdAt)}</td>
                      <td>{bill.employeeName}</td>
                      <td>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            backgroundColor: billType.bgColor,
                            color: billType.color,
                          }}
                        >
                          {billType.label}
                        </span>
                      </td>
                      <td style={{ fontWeight: "bold", color: "#193F94" }}>
                        {formatCurrency(bill.total)} ج.م
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    الإجمالي العام:
                  </td>
                  <td style={{ fontWeight: "bold", color: "#193F94" }}>
                    {formatCurrency(printData.stats.totalAmount)} ج.م
                  </td>
                </tr>
              </tfoot>
            </table>
          </>
        )}
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
                        {reportStats.totalInvoices}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">فاتورة معلقة</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <FaFileInvoice className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-800">إجمالي المبالغ</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">
                        {formatCurrency(reportStats.totalAmount)} ج.م
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        متوسط الفاتورة:{" "}
                        {formatCurrency(reportStats.averageInvoice)} ج.م
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                      <FaMoneyBillWave className="h-6 w-6 text-green-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-800">عدد الموظفين</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        {reportStats.employeesCount}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">موظف</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                      <FaUsers className="h-6 w-6 text-purple-700" />
                    </div>
                  </div>
                </div>

                {reportStats.topEmployeeName && (
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-800">أكثر موظف</p>
                        <p className="text-xl font-bold text-amber-900 mt-1">
                          {reportStats.topEmployeeName}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          {reportStats.topEmployeeCount} فاتورة
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                        <FaChartLine className="h-6 w-6 text-amber-700" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  <button
                    onClick={handlePrint}
                    disabled={
                      isPrinting || printLoading || pendingBills.length === 0
                    }
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-md ${
                      isPrinting || printLoading || pendingBills.length === 0
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    }`}
                  >
                    {isPrinting || printLoading ? (
                      <>
                        <FaSpinner className="h-5 w-5 ml-2 animate-spin" />
                        {printLoading
                          ? "جاري تجهيز البيانات..."
                          : "جاري الطباعة..."}
                      </>
                    ) : (
                      <>
                        <Printer className="h-5 w-5 ml-2" />
                        طباعة التقرير PDF
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-gray-700">
                      توزيع حسب النوع
                    </h4>
                    {reportStats.typeDistribution.length > 0 ? (
                      reportStats.typeDistribution.map((item, index) => {
                        const typeValue =
                          item.type === "TakeAway"
                            ? 1
                            : item.type === "Delivery"
                              ? 2
                              : 0;
                        const billType = getBillTypeLabel(typeValue);
                        const percentage =
                          reportStats.totalInvoices > 0
                            ? (item.count / reportStats.totalInvoices) * 100
                            : 0;
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span style={{ color: billType.color }}>
                                {item.type === "TakeAway"
                                  ? "سفري"
                                  : item.type === "Delivery"
                                    ? "دليفري"
                                    : "طاولة"}
                              </span>
                              <span>
                                {item.count} فاتورة ({percentage.toFixed(1)}%)
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
                      })
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-2">
                        لا توجد بيانات
                      </p>
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
                  <FaSpinner className="h-12 w-12 text-blue-600 animate-spin" />
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
                      {pagination.totalCount} فاتورة معلقة |{" "}
                      {reportStats.employeesCount} موظف
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                    <div className="px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium flex items-center">
                      <FaClock className="h-3 w-3 ml-1" />
                      {pagination.totalCount} معلقة
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium flex items-center">
                      <FaMoneyBillWave className="h-3 w-3 ml-1" />
                      {formatCurrency(reportStats.totalAmount)} ج.م
                    </div>
                    <button
                      onClick={handlePrint}
                      disabled={isPrinting || printLoading}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium flex items-center hover:bg-gray-200 transition-colors"
                    >
                      <Printer className="h-3 w-3 ml-1" />
                      طباعة
                    </button>
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
                          {reportStats.totalInvoices}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          فاتورة غير مكتملة
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                        <FaClock className="h-6 w-6 text-amber-700" />
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
                          {formatCurrency(reportStats.totalAmount)} ج.م
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          إجمالي المبالغ المعلقة
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                        <FaMoneyBillWave className="h-6 w-6 text-blue-700" />
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
                          {formatCurrency(reportStats.averageInvoice)} ج.م
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          لكل فاتورة معلقة
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                        <FaChartLine className="h-6 w-6 text-purple-700" />
                      </div>
                    </div>
                  </div>
                </div>

                <div id="bills-table-container" className="mb-6">
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: "#193F94" }}
                  >
                    قائمة الفواتير المعلقة ({pendingBills.length} فاتورة من
                    إجمالي {pagination.totalCount})
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
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleViewBillDetails(bill)}
                                    disabled={isViewingBill}
                                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    {isViewingBill ? (
                                      <FaSpinner className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <FaEye className="h-3 w-3" />
                                    )}
                                    عرض التفاصيل
                                  </button>
                                  <button
                                    onClick={() => handleResumeBill(bill)}
                                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    <FaClock className="h-3 w-3" />
                                    استئناف
                                  </button>
                                </div>
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
                            {formatCurrency(reportStats.totalAmount)} ج.م
                          </td>
                          <td className="print:hidden"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {pagination.totalPages > 1 && (
                    <div className="px-4 py-4 border-t border-gray-200 bg-gray-50 mt-4">
                      <div className="flex justify-end">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePageChange(1)}
                            disabled={!pagination.hasPreviousPage || loading}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              pagination.hasPreviousPage && !loading
                                ? "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                            title="الصفحة الأولى"
                          >
                            <FaAngleDoubleRight className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() =>
                              handlePageChange(pagination.currentPage - 1)
                            }
                            disabled={!pagination.hasPreviousPage || loading}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              pagination.hasPreviousPage && !loading
                                ? "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                            title="الصفحة السابقة"
                          >
                            <FaChevronRight className="h-5 w-5" />
                          </button>

                          <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, index) =>
                              page === "..." ? (
                                <span
                                  key={`dots-${index}`}
                                  className="px-3 py-2 text-gray-500"
                                >
                                  ...
                                </span>
                              ) : (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  disabled={loading}
                                  className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all ${
                                    pagination.currentPage === page
                                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800"
                                      : "text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-200"
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  {page}
                                </button>
                              ),
                            )}
                          </div>

                          <button
                            onClick={() =>
                              handlePageChange(pagination.currentPage + 1)
                            }
                            disabled={!pagination.hasNextPage || loading}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              pagination.hasNextPage && !loading
                                ? "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                            title="الصفحة التالية"
                          >
                            <FaChevronLeft className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() =>
                              handlePageChange(pagination.totalPages)
                            }
                            disabled={!pagination.hasNextPage || loading}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              pagination.hasNextPage && !loading
                                ? "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                            title="الصفحة الأخيرة"
                          >
                            <FaAngleDoubleLeft className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
                        {reportStats.totalInvoices}
                      </div>
                      <div className="text-sm text-gray-600">عدد الفواتير</div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#10B981" }}
                      >
                        {formatCurrency(reportStats.totalAmount)}
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
                        {formatCurrency(reportStats.averageInvoice)}
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
                        {reportStats.employeesCount}
                      </div>
                      <div className="text-sm text-gray-600">عدد الموظفين</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-6">
                  <FaCheckCircle className="h-12 w-12 text-green-600" />
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
                    <FaClock className="h-5 w-5 ml-2" />
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
              <div className="bg-gradient-to-l from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">
                    تفاصيل الفاتورة
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FaTimes className="h-6 w-6" />
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
                  <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <FaClock className="h-3 w-3 ml-1" />
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

              <div className="bg-gray-50 px-6 py-3 rounded-b-2xl flex justify-between gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    handleResumeBill(selectedBill);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <FaClock className="h-4 w-4" />
                  استئناف الفاتورة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
