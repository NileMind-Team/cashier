import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import {
  ArrowLeft,
  Calendar,
  BarChart3,
  DollarSign,
  FileText,
  CreditCard,
  Printer,
  PieChart,
} from "lucide-react";
import { FaSpinner, FaUsers } from "react-icons/fa";

export default function PaymentMethodsReport() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoFormatted = sevenDaysAgo.toISOString().split("T")[0];

    setStartDate(sevenDaysAgoFormatted);
    setEndDate(today);
  }, []);

  const generateReport = async () => {
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
      const response = await axiosInstance.get(
        "/api/Reports/PaymentMethodsReport",
        {
          params: {
            from: startDate,
            to: endDate,
          },
        },
      );

      if (response.status === 200 && response.data) {
        const data = response.data;

        const methodsWithPercentage = (data.methods || []).map((method) => ({
          ...method,
          percentage:
            data.totalAmount > 0 ? (method.amount / data.totalAmount) * 100 : 0,
        }));

        methodsWithPercentage.sort((a, b) => b.amount - a.amount);

        const stats = {
          totalAmount: data.totalAmount || 0,
          totalBills: data.totalInvoices || 0,
          paymentMethodsCount: methodsWithPercentage.length,
          paymentMethodsArray: methodsWithPercentage,
        };

        setReportData({
          paymentMethods: methodsWithPercentage,
          stats: stats,
          dateRange: {
            start: formatArabicDate(startDate),
            end: formatArabicDate(endDate),
            startDate: startDate,
            endDate: endDate,
          },
        });

        toast.success(
          `تم إنشاء تقرير طرق الدفع للفترة من ${formatArabicDate(startDate)} إلى ${formatArabicDate(endDate)}`,
        );
      }
    } catch (error) {
      console.error("خطأ في جلب تقرير طرق الدفع:", error);
      if (error.response?.status === 404) {
        toast.error("لا توجد بيانات للفترة المحددة");
      } else if (error.response?.status === 400) {
        toast.error("بيانات غير صالحة: تأكد من تواريخ صحيحة");
      } else {
        toast.error("حدث خطأ في جلب تقرير طرق الدفع");
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

  const handlePrint = () => {
    setIsPrinting(true);
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
          
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          
          .summary-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #dee2e6;
          }
          
          .summary-card .amount {
            font-size: 24px;
            font-weight: bold;
            margin-top: 5px;
          }
          
          .summary-card.total .amount { color: #193F94; }
          .summary-card.bills .amount { color: #28a745; }
          .summary-card.methods .amount { color: #8B5CF6; }
          
          .methods-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          .methods-table th {
            border: 1px solid #dee2e6;
            padding: 12px 10px;
            text-align: right;
            font-size: 14px;
            font-weight: bold;
            background-color: #4a5568;
            color: white;
          }
          
          .methods-table td {
            border: 1px solid #dee2e6;
            padding: 10px;
            text-align: right;
            font-size: 13px;
          }
          
          .methods-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          .methods-table tfoot {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          
          .percentage-bar {
            width: 100%;
            background-color: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 5px;
          }
          
          .percentage-fill {
            height: 6px;
            background-color: #193F94;
            border-radius: 4px;
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
            .methods-table th {
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
                <FaUsers className="text-white text-lg" />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "#193F94" }}>
                نظام الكاشير - تقارير طرق الدفع
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

      {/* Hidden Printable Content */}
      <div id="printable-content" style={{ display: "none" }}>
        <div className="header">
          <h1>تقرير طرق الدفع</h1>
          <h3>
            الفترة من {reportData?.dateRange.start} إلى{" "}
            {reportData?.dateRange.end}
          </h3>
        </div>

        <div className="summary-cards">
          <div className="summary-card total">
            <div>إجمالي المدفوعات</div>
            <div className="amount">
              {formatCurrency(reportData?.stats.totalAmount || 0)} ج.م
            </div>
          </div>
          <div className="summary-card bills">
            <div>عدد الفواتير</div>
            <div className="amount">{reportData?.stats.totalBills || 0}</div>
          </div>
          <div className="summary-card methods">
            <div>طرق الدفع</div>
            <div className="amount">
              {reportData?.stats.paymentMethodsCount || 0}
            </div>
          </div>
        </div>

        <table className="methods-table">
          <thead>
            <tr>
              <th>طريقة الدفع</th>
              <th>عدد الفواتير</th>
              <th>إجمالي المدفوعات</th>
              <th>النسبة المئوية</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.paymentMethods.map((method, index) => (
              <tr key={index}>
                <td style={{ fontWeight: "bold" }}>
                  {method.paymentMethodName}
                </td>
                <td>{method.count}</td>
                <td>{formatCurrency(method.amount)} ج.م</td>
                <td>{method.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>الإجمالي</td>
              <td>{reportData?.stats.totalBills || 0}</td>
              <td>{formatCurrency(reportData?.stats.totalAmount || 0)} ج.م</td>
              <td>100%</td>
            </tr>
          </tfoot>
        </table>
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

                <div className="pt-4 space-y-3">
                  <button
                    onClick={generateReport}
                    disabled={loading || !startDate || !endDate}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-md ${
                      loading || !startDate || !endDate
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    }`}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="h-5 w-5 ml-2 animate-spin" />
                        جاري التحميل...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-5 w-5 ml-2" />
                        عرض التقرير
                      </>
                    )}
                  </button>

                  {reportData && (
                    <button
                      onClick={handlePrint}
                      disabled={isPrinting}
                      className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-md ${
                        isPrinting
                          ? "opacity-50 cursor-not-allowed bg-gray-400"
                          : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      }`}
                    >
                      {isPrinting ? (
                        <>
                          <FaSpinner className="h-5 w-5 ml-2 animate-spin" />
                          جاري الطباعة...
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
                      تقرير طرق الدفع
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
                      {reportData.stats.totalBills} فاتورة |{" "}
                      {reportData.stats.paymentMethodsCount} طريقة دفع
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {reportData.stats.totalBills} فاتورة
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      {formatCurrency(reportData.stats.totalAmount)} ج.م
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:grid-cols-2">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">
                          إجمالي المدفوعات
                        </p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {formatCurrency(reportData.stats.totalAmount)} ج.م
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {reportData.stats.totalBills} فاتورة
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
                        <p className="text-sm text-green-800">عدد الفواتير</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {reportData.stats.totalBills}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          إجمالي الفواتير
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        <FileText className="h-6 w-6 text-green-700" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-800">طرق الدفع</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {reportData.stats.paymentMethodsCount}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">مختلفة</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-purple-700" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: "#193F94" }}
                  >
                    توزيع المدفوعات حسب النسبة المئوية
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="space-y-4">
                      {reportData.paymentMethods.map((method, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-gray-800">
                                {method.paymentMethodName}
                              </h4>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-800">
                                {formatCurrency(method.amount)} ج.م
                              </div>
                              <div className="text-sm text-gray-600">
                                {method.count} فاتورة (
                                {method.percentage.toFixed(1)}%)
                              </div>
                            </div>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="h-3 rounded-full bg-blue-600"
                              style={{
                                width: `${method.percentage}%`,
                              }}
                            ></div>
                          </div>

                          <div className="text-left text-sm text-gray-600">
                            {method.percentage.toFixed(1)}% من إجمالي المدفوعات
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: "#193F94" }}
                  >
                    تفاصيل طرق الدفع
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            طريقة الدفع
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            عدد الفواتير
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            إجمالي المدفوعات
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            النسبة المئوية
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.paymentMethods.map((method, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                          >
                            <td className="py-3 px-4 text-right">
                              <div className="font-bold text-gray-900">
                                {method.paymentMethodName}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-bold text-blue-900 text-lg">
                                {method.count}
                              </div>
                              <div className="text-xs text-gray-500">
                                فاتورة
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-bold text-lg text-gray-800">
                                {formatCurrency(method.amount)} ج.م
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-bold text-lg text-blue-600">
                                {method.percentage.toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">
                                من الإجمالي
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-bold">
                          <td className="py-4 px-4 text-right">الإجمالي</td>
                          <td className="py-4 px-4 text-right text-blue-900">
                            {reportData.stats.totalBills}
                          </td>
                          <td
                            className="py-4 px-4 text-right"
                            style={{ color: "#193F94" }}
                          >
                            {formatCurrency(reportData.stats.totalAmount)} ج.م
                          </td>
                          <td className="py-4 px-4 text-right text-green-700">
                            100%
                          </td>
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
                    ملخص تقرير طرق الدفع
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#193F94" }}
                      >
                        {reportData.stats.paymentMethodsCount}
                      </div>
                      <div className="text-sm text-gray-600">طرق دفع</div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#10B981" }}
                      >
                        {formatCurrency(reportData.stats.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي المدفوعات
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#8B5CF6" }}
                      >
                        {reportData.stats.totalBills}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي الفواتير
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
                  تقارير طرق الدفع
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  اختر تاريخ البداية والنهاية لعرض تحليل المدفوعات حسب طرق الدفع
                  المختلفة
                </p>
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Calendar className="h-5 w-5 ml-2" />
                    اختر التاريخ من وإلى
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
