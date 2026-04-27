import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  ChevronDown,
  FileText,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  PieChart,
  Settings,
  Printer,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";

export default function ProductsReports() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orderBy, setOrderBy] = useState("mostSold");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
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

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoFormatted = sevenDaysAgo.toISOString().split("T")[0];

    setStartDate(sevenDaysAgoFormatted);
    setEndDate(today);
  }, []);

  const generateReport = async (pageNumber = 1) => {
    if (!startDate || !endDate) {
      toast.error("يرجى اختيار تاريخ البداية والنهاية");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
      return;
    }

    setIsGeneratingReport(true);
    setLoading(true);

    try {
      const response = await axiosInstance.post(
        "/api/Reports/ProductsReport",
        {
          pageNumber: pageNumber,
          pageSize: pagination.pageSize,
          skip: (pageNumber - 1) * pagination.pageSize,
        },
        {
          params: {
            from: startDate,
            to: endDate,
            orderBy: orderBy,
          },
        },
      );

      if (response.status === 200 && response.data) {
        const data = response.data;

        setPagination({
          currentPage: data.pageNumber || pageNumber,
          pageSize: data.pageSize || 10,
          totalCount: data.totalCount || 0,
          totalPages: data.totalPages || 1,
          hasNextPage: data.hasNext || false,
          hasPreviousPage: data.hasPrevious || false,
        });

        const categoryBreakdown = (data.products || []).reduce(
          (acc, product) => {
            const category = product.subCategoryName || "غير مصنف";
            acc[category] = acc[category] || {
              count: 0,
              quantity: 0,
              revenue: 0,
            };
            acc[category].count++;
            acc[category].quantity += product.quantitySold;
            acc[category].revenue += product.revenue;
            return acc;
          },
          {},
        );

        const stats = {
          totalProducts: data.totalCount || 0,
          totalQuantitySold: data.totalQuantitySold || 0,
          totalRevenue: data.totalRevenue || 0,
          averageRevenuePerProduct:
            data.totalCount > 0
              ? (data.totalRevenue || 0) / data.totalCount
              : 0,
          categoryBreakdown: categoryBreakdown,
        };

        setReportData({
          products: data.products || [],
          stats: stats,
          dateRange: {
            start: formatArabicDate(startDate),
            end: formatArabicDate(endDate),
            startDate: startDate,
            endDate: endDate,
          },
          orderBy: orderBy,
        });

        toast.success(
          `تم إنشاء التقرير للفترة من ${formatArabicDate(startDate)} إلى ${formatArabicDate(endDate)} (${data.totalCount || 0} منتج)`,
        );
      }
    } catch (error) {
      console.error("خطأ في جلب تقرير المنتجات:", error);
      if (error.response?.status === 404) {
        toast.error("لا توجد بيانات للفترة المحددة");
      } else if (error.response?.status === 400) {
        toast.error("بيانات غير صالحة: تأكد من تواريخ صحيحة");
      } else {
        toast.error("حدث خطأ في جلب تقرير المنتجات");
      }
    } finally {
      setLoading(false);
      setIsGeneratingReport(false);
    }
  };

  const fetchAllProductsForPrint = async () => {
    if (!startDate || !endDate) {
      toast.error("يرجى اختيار تاريخ البداية والنهاية أولاً");
      return false;
    }

    setPrintLoading(true);

    try {
      const allProductsPageSize =
        pagination.totalCount > 0 ? pagination.totalCount : 1000;

      const response = await axiosInstance.post(
        "/api/Reports/ProductsReport",
        {
          pageNumber: 1,
          pageSize: allProductsPageSize,
          skip: 0,
        },
        {
          params: {
            from: startDate,
            to: endDate,
            orderBy: orderBy,
          },
        },
      );

      if (response.status === 200 && response.data) {
        const data = response.data;

        const stats = {
          totalProducts: data.totalCount || 0,
          totalQuantitySold: data.totalQuantitySold || 0,
          totalRevenue: data.totalRevenue || 0,
          averageRevenuePerProduct:
            data.totalCount > 0
              ? (data.totalRevenue || 0) / data.totalCount
              : 0,
        };

        setPrintData({
          products: data.products || [],
          stats: stats,
          dateRange: {
            start: formatArabicDate(startDate),
            end: formatArabicDate(endDate),
          },
          orderBy: orderBy,
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
    const success = await fetchAllProductsForPrint();
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
            .products-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .products-table th {
              background-color: #4a5568;
              color: white;
              padding: 12px;
              text-align: center;
              border: 1px solid #dee2e6;
            }
            .products-table td {
              padding: 10px;
              text-align: center;
              border: 1px solid #dee2e6;
            }
            .products-table tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .products-table tfoot {
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
              .products-table th {
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
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      generateReport(newPage);

      const tableElement = document.getElementById("report-table-container");
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

  const getCategoryColor = (category) => {
    const colors = [
      { bg: "#FEE2E2", text: "#DC2626" },
      { bg: "#DBEAFE", text: "#1D4ED8" },
      { bg: "#F3E8FF", text: "#7C3AED" },
      { bg: "#FEF3C7", text: "#D97706" },
      { bg: "#DCFCE7", text: "#16A34A" },
      { bg: "#FCE7F3", text: "#DB2777" },
      { bg: "#E0E7FF", text: "#4F46E5" },
      { bg: "#FFEDD5", text: "#EA580C" },
    ];

    const hash = category
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getOrderByText = (orderValue) => {
    const orderOptions = {
      mostSold: "الأكثر مبيعاً",
      highestRevenue: "الأعلى إيراداً",
      name: "الترتيب الأبجدي",
      SubCategory: "حسب الفئة",
      price: "الأعلى سعراً",
    };
    return orderOptions[orderValue] || "الأكثر مبيعاً";
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
                نظام الكاشير - تقارير المنتجات
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
              <ArrowLeft className="h-5 w-5 ml-2" />
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>

      <div id="printable-content" style={{ display: "none" }}>
        {printData && (
          <>
            <div className="header">
              <h1>تقرير أداء المنتجات</h1>
              <h3>
                الفترة من {printData.dateRange.start} إلى{" "}
                {printData.dateRange.end}
              </h3>
              <h3>مرتب حسب: {getOrderByText(printData.orderBy)}</h3>
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
                  <td className="label">إجمالي الإيرادات</td>
                  <td>{formatCurrency(printData.stats.totalRevenue)} ج.م</td>
                </tr>
                <tr>
                  <td className="label">متوسط المنتج</td>
                  <td>
                    {formatCurrency(printData.stats.averageRevenuePerProduct)}{" "}
                    ج.م
                  </td>
                </tr>
                <tr>
                  <td className="label">الوحدات المباعة</td>
                  <td>{printData.stats.totalQuantitySold}</td>
                </tr>
                <tr>
                  <td className="label">عدد المنتجات</td>
                  <td>{printData.stats.totalProducts}</td>
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
              تفاصيل أداء المنتجات ({printData.stats.totalProducts} منتج)
            </h3>

            <table className="products-table">
              <thead>
                <tr>
                  <th>اسم المنتج</th>
                  <th>الفئة</th>
                  <th>السعر</th>
                  <th>الكمية المباعة</th>
                  <th>إجمالي الإيرادات</th>
                </tr>
              </thead>
              <tbody>
                {printData.products.map((product, idx) => {
                  const categoryColor = getCategoryColor(
                    product.subCategoryName || "غير مصنف",
                  );
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: "bold" }}>
                        {product.productName}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            backgroundColor: categoryColor.bg,
                            color: categoryColor.text,
                          }}
                        >
                          {product.subCategoryName || "غير مصنف"}
                        </span>
                      </td>
                      <td>{formatCurrency(product.price)} ج.م</td>
                      <td style={{ fontWeight: "bold", color: "#1D4ED8" }}>
                        {product.quantitySold}
                      </td>
                      <td style={{ fontWeight: "bold", color: "#193F94" }}>
                        {formatCurrency(product.revenue)} ج.م
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    الإجمالي العام:
                  </td>
                  <td style={{ fontWeight: "bold", color: "#1D4ED8" }}>
                    {printData.stats.totalQuantitySold} وحدة
                  </td>
                  <td style={{ fontWeight: "bold", color: "#193F94" }}>
                    {formatCurrency(printData.stats.totalRevenue)} ج.م
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
                      <Calendar className="w-4 h-4 ml-1" />
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
                      <Calendar className="w-4 h-4 ml-1" />
                      التاريخ إلى
                    </span>
                  </label>
                </div>

                <div className="relative">
                  <select
                    value={orderBy}
                    onChange={(e) => setOrderBy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white appearance-none cursor-pointer"
                    dir="rtl"
                  >
                    <option value="mostSold">الأكثر مبيعاً</option>
                    <option value="highestRevenue">الأعلى إيراداً</option>
                    <option value="name">الترتيب الأبجدي</option>
                    <option value="SubCategory">حسب الفئة</option>
                    <option value="price">الأعلى سعراً</option>
                  </select>
                  <label className="absolute -top-2.5 right-3 px-2 text-xs text-blue-500 font-medium bg-white">
                    <span className="flex items-center">
                      <Settings className="w-4 h-4 ml-1" />
                      ترتيب حسب
                    </span>
                  </label>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={() => generateReport(1)}
                    disabled={isGeneratingReport || !startDate || !endDate}
                    className="w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    {isGeneratingReport ? (
                      <>
                        <FaSpinner className="w-5 h-5 ml-2 animate-spin" />
                        جاري التحميل...
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5 ml-2" />
                        عرض التقرير
                      </>
                    )}
                  </button>

                  {reportData && (
                    <button
                      onClick={handlePrint}
                      disabled={isPrinting || printLoading}
                      className="w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
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
                  )}
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
                      تقرير أداء المنتجات
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
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-sm text-gray-500">
                        {reportData.stats.totalProducts} منتج |{" "}
                        {reportData.stats.totalQuantitySold} وحدة مباعة
                      </p>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        مرتب حسب: {getOrderByText(reportData.orderBy)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {reportData.stats.totalProducts} منتج
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      {formatCurrency(reportData.stats.totalRevenue)} ج.م
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
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">
                          إجمالي الإيرادات
                        </p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {formatCurrency(reportData.stats.totalRevenue)} ج.م
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          متوسط المنتج:{" "}
                          {formatCurrency(
                            reportData.stats.averageRevenuePerProduct,
                          )}{" "}
                          ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-blue-700" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-800">
                          الوحدات المباعة
                        </p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {reportData.stats.totalQuantitySold}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {reportData.stats.totalProducts} منتج مختلف
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-700" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-800">عدد المنتجات</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {reportData.stats.totalProducts}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          إجمالي الإيرادات:{" "}
                          {formatCurrency(reportData.stats.totalRevenue)} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-purple-700" />
                      </div>
                    </div>
                  </div>
                </div>

                {Object.keys(reportData.stats.categoryBreakdown).length > 0 && (
                  <div className="mb-6">
                    <h3
                      className="text-lg font-bold mb-4"
                      style={{ color: "#193F94" }}
                    >
                      توزيع المنتجات حسب الفئة
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(reportData.stats.categoryBreakdown).map(
                          ([category, data], index) => {
                            const color = getCategoryColor(category);
                            const percentage =
                              (data.revenue / reportData.stats.totalRevenue) *
                              100;

                            return (
                              <div
                                key={index}
                                className="bg-white rounded-lg p-4 border border-gray-200"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center">
                                    <div
                                      className="w-3 h-3 rounded-full ml-2"
                                      style={{ backgroundColor: color.text }}
                                    ></div>
                                    <span className="font-medium text-sm">
                                      {category}
                                    </span>
                                  </div>
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                    {data.count} منتج
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                      الوحدات المباعة:
                                    </span>
                                    <span className="font-bold">
                                      {data.quantity}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                      الإيرادات:
                                    </span>
                                    <span
                                      className="font-bold"
                                      style={{ color: color.text }}
                                    >
                                      {formatCurrency(data.revenue)} ج.م
                                    </span>
                                  </div>
                                  <div className="pt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="h-2 rounded-full"
                                        style={{
                                          width: `${percentage}%`,
                                          backgroundColor: color.text,
                                        }}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 text-left">
                                      {percentage.toFixed(1)}% من إجمالي
                                      الإيرادات
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div id="report-table-container" className="mb-6">
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: "#193F94" }}
                  >
                    تفاصيل أداء المنتجات ({pagination.totalCount} منتج)
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            اسم المنتج
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            الفئة
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            السعر
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            الكمية المباعة
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            إجمالي الإيرادات
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                                <p className="text-gray-500">
                                  جاري تحميل البيانات...
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          reportData.products.map((product) => {
                            const categoryColor = getCategoryColor(
                              product.subCategoryName || "غير مصنف",
                            );
                            return (
                              <tr
                                key={product.productId}
                                className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                              >
                                <td className="py-3 px-4 text-right">
                                  <div className="font-medium text-gray-900">
                                    {product.productName}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span
                                    className="px-3 py-1 rounded-full text-xs font-medium"
                                    style={{
                                      backgroundColor: categoryColor.bg,
                                      color: categoryColor.text,
                                    }}
                                  >
                                    {product.subCategoryName || "غير مصنف"}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="font-bold">
                                    {formatCurrency(product.price)} ج.م
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="font-bold text-blue-900 text-lg">
                                    {product.quantitySold}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    وحدة
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div
                                    className="font-bold text-lg"
                                    style={{ color: "#193F94" }}
                                  >
                                    {formatCurrency(product.revenue)} ج.م
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {product.quantitySold > 0
                                      ? `${formatCurrency(product.revenue / product.quantitySold)} ج.م/وحدة`
                                      : "لا توجد مبيعات"}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {!loading && reportData.products.length > 0 && (
                        <tfoot>
                          <tr className="bg-gray-50 font-bold">
                            <td colSpan="3" className="py-4 px-4 text-right">
                              الإجمالي العام:
                            </td>
                            <td className="py-4 px-4 text-right text-blue-900">
                              {reportData.stats.totalQuantitySold} وحدة
                            </td>
                            <td
                              className="py-4 px-4 text-right"
                              style={{ color: "#193F94" }}
                            >
                              {formatCurrency(reportData.stats.totalRevenue)}{" "}
                              ج.م
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>

                  {pagination.totalPages > 0 && !loading && (
                    <div className="px-4 py-4 border-t border-gray-200 bg-gray-50 mt-4">
                      <div className="flex justify-end">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePageChange(1)}
                            disabled={!pagination.hasPreviousPage}
                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-700 hover:bg-gray-200 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                            title="الصفحة الأولى"
                          >
                            <ChevronsRight className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handlePageChange(pagination.currentPage - 1)
                            }
                            disabled={!pagination.hasPreviousPage}
                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-700 hover:bg-gray-200 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                            title="الصفحة السابقة"
                          >
                            <ChevronRight className="w-5 h-5" />
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
                                  className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all ${
                                    pagination.currentPage === page
                                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800"
                                      : "text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-200"
                                  }`}
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
                            disabled={!pagination.hasNextPage}
                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-700 hover:bg-gray-200 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                            title="الصفحة التالية"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handlePageChange(pagination.totalPages)
                            }
                            disabled={!pagination.hasNextPage}
                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-700 hover:bg-gray-200 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                            title="الصفحة الأخيرة"
                          >
                            <ChevronsLeft className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      {pagination.totalPages > 10 && (
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <span className="text-sm text-gray-600">
                            انتقل إلى صفحة:
                          </span>
                          <input
                            type="number"
                            min="1"
                            max={pagination.totalPages}
                            value={pagination.currentPage}
                            onChange={(e) => {
                              const page = parseInt(e.target.value);
                              if (page >= 1 && page <= pagination.totalPages) {
                                handlePageChange(page);
                              }
                            }}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="text-sm text-gray-600">
                            من {pagination.totalPages}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-5 border border-blue-200">
                  <h4
                    className="font-bold mb-4 text-gray-800"
                    style={{ color: "#193F94" }}
                  >
                    ملخص أداء المنتجات
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#193F94" }}
                      >
                        {reportData.stats.totalProducts}
                      </div>
                      <div className="text-sm text-gray-600">عدد المنتجات</div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#10B981" }}
                      >
                        {reportData.stats.totalQuantitySold}
                      </div>
                      <div className="text-sm text-gray-600">وحدات مباعة</div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#8B5CF6" }}
                      >
                        {formatCurrency(reportData.stats.totalRevenue)}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي الإيرادات
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-6">
                  <PieChart className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  تقارير أداء المنتجات
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  اختر تاريخ البداية والنهاية وطريقة الترتيب لعرض تقرير أداء
                  المنتجات
                </p>
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Calendar className="h-5 w-5 ml-2" />
                    اختر التاريخ من وإلى
                  </div>
                  <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg">
                    <Settings className="h-5 w-5 ml-2" />
                    اختر طريقة الترتيب
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
