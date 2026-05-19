import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  FileText,
  Clock,
  Power,
  PowerOff,
  DollarSign,
  FileCheck,
  Receipt,
  TrendingUp,
  PieChart,
  Wallet,
  CheckCircle,
  AlertCircle,
  Percent,
  RotateCcw,
  Coins,
  Printer,
  CreditCard,
  Truck,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";

export default function ShiftReports() {
  const navigate = useNavigate();
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [shifts, setShifts] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [fetchingShifts, setFetchingShifts] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [activeShift, setActiveShift] = useState(null);
  const [loadingActiveShift, setLoadingActiveShift] = useState(true);

  const addThreeHours = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    date.setHours(date.getHours() + 3);
    return date;
  };

  useEffect(() => {
    const fetchActiveShift = async () => {
      setLoadingActiveShift(true);
      try {
        const response = await axiosInstance.post(
          "/api/Shifts/GetDetails",
        );

        if (response.status === 200 && response.data && response.data.shiftId) {
          setActiveShift(response.data);

          const shiftDate = response.data.startTime?.split("T")[0];
          if (shiftDate) {
            setSelectedDate(shiftDate);
          }
        } else {
          const today = new Date().toISOString().split("T")[0];
          setSelectedDate(today);
        }
      } catch (error) {
        console.error("خطأ في جلب الوردية النشطة:", error);
        const today = new Date().toISOString().split("T")[0];
        setSelectedDate(today);
      } finally {
        setLoadingActiveShift(false);
      }
    };

    fetchActiveShift();
  }, []);

  useEffect(() => {
    if (selectedDate && !loadingActiveShift) {
      fetchShiftsByDate(selectedDate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, loadingActiveShift]);

  useEffect(() => {
    if (shifts.length > 0 && activeShift && activeShift.shiftId) {
      const activeShiftInList = shifts.find(
        (s) => s.id === activeShift.shiftId,
      );
      if (activeShiftInList) {
        setSelectedShift(activeShiftInList.id.toString());
      }
    }
  }, [shifts, activeShift]);

  const fetchShiftsByDate = async (date) => {
    if (!date) return;

    setFetchingShifts(true);
    try {
      const response = await axiosInstance.get(
        `/api/Reports/ShiftsByDate?date=${date}`,
      );

      if (response.status === 200 && Array.isArray(response.data)) {
        setShifts(response.data);
        if (response.data.length > 0) {
          if (!activeShift || !activeShift.shiftId) {
            const firstShiftId = response.data[0].id;
            setSelectedShift(firstShiftId ? firstShiftId.toString() : "");
          }
        } else {
          setSelectedShift("");
          setReportData(null);
          toast.info("لا توجد ورديات في هذا التاريخ");
        }
      } else {
        setShifts([]);
        setSelectedShift("");
        setReportData(null);
      }
    } catch (error) {
      console.error("خطأ في جلب الورديات:", error);
      if (error.response?.status === 404) {
        setShifts([]);
        setSelectedShift("");
        setReportData(null);
        toast.info("لا توجد ورديات في هذا التاريخ");
      } else {
        toast.error("حدث خطأ في جلب الورديات");
      }
    } finally {
      setFetchingShifts(false);
    }
  };

  const generateReport = async () => {
    if (!selectedShift) {
      toast.error("يرجى اختيار وردية لعرض التقرير");
      return;
    }

    setIsGeneratingReport(true);
    try {
      const shiftIdNumber = parseInt(selectedShift);
      const shiftData = shifts.find((s) => s.id === shiftIdNumber);

      if (!shiftData) {
        toast.error("لم يتم العثور على بيانات الوردية");
        return;
      }

      let startDateTime = shiftData.startTime;
      let endDateTime = shiftData.endTime;
      if (!endDateTime || endDateTime === "0001-01-01T00:00:00") {
        const now = new Date();
        endDateTime = now.toISOString();
      }
      const formattedStartDate = startDateTime;
      const formattedEndDate = endDateTime;

      const response = await axiosInstance.get("/api/Reports/SalesReport", {
        params: {
          from: formattedStartDate,
          to: formattedEndDate,
        },
      });

      if (response.status === 200 && response.data) {
        const data = response.data;

        setReportData({
          ...data,
          shiftId: shiftData.id,
          startTime: shiftData.startTime,
          endTime: shiftData.endTime,
          shiftDuration: calculateShiftDuration(
            shiftData.startTime,
            shiftData.endTime,
          ),
        });

        toast.success("تم تحميل تقرير الوردية بنجاح");
      } else {
        toast.error("لم يتم العثور على بيانات للفترة المحددة");
      }
    } catch (error) {
      console.error("خطأ في جلب تقرير الوردية:", error);
      if (error.response?.status === 404) {
        toast.error("لا توجد بيانات للفترة المحددة");
      } else if (error.response?.status === 400) {
        toast.error("بيانات غير صالحة: تأكد من اختيار وردية صحيحة");
      } else {
        toast.error("حدث خطأ في جلب تقرير الوردية");
      }
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return "";
    const adjustedDate = addThreeHours(dateString);
    return adjustedDate.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return "";
    const adjustedDate = addThreeHours(dateString);
    return adjustedDate.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateShiftDuration = (startTime, endTime) => {
    if (!startTime) return "غير محدد";

    const start = addThreeHours(startTime);
    if (!endTime || endTime === "0001-01-01T00:00:00") return "قيد التشغيل";

    const end = addThreeHours(endTime);
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHrs} ساعة ${diffMins} دقيقة`;
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "0.00";
    return new Intl.NumberFormat("ar-EG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatAverage = (amount) => {
    if (amount === undefined || amount === null) return "0.00";
    return new Intl.NumberFormat("ar-EG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const stats = {
    totalShifts: shifts.length,
    openShifts: shifts.filter(
      (s) => !s.endTime || s.endTime === "0001-01-01T00:00:00",
    ).length,
    closedShifts: shifts.filter(
      (s) => s.endTime && s.endTime !== "0001-01-01T00:00:00",
    ).length,
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
          
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          .report-table th {
            background-color: #193F94;
            color: white;
            padding: 12px;
            text-align: center;
            border: 1px solid #dee2e6;
          }
          
          .report-table td {
            padding: 10px;
            text-align: center;
            border: 1px solid #dee2e6;
          }
          
          .report-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          .report-table .label {
            font-weight: bold;
            background-color: #e9ecef;
          }
          
          .report-table .total-row {
            font-weight: bold;
            background-color: #e2e3e5;
          }
          
          .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          .payment-table th {
            background-color: #4a5568;
            color: white;
            padding: 12px;
            text-align: center;
            border: 1px solid #dee2e6;
          }
          
          .payment-table td {
            padding: 10px;
            text-align: center;
            border: 1px solid #dee2e6;
          }
          
          .payment-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          .cards-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 20px;
            color: white;
          }
          
          .card h4 {
            font-size: 14px;
            margin-bottom: 10px;
            opacity: 0.9;
          }
          
          .card .value {
            font-size: 28px;
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
            .report-table th {
              background-color: #193F94 !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .payment-table th {
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
      <div className="bg-white shadow-md sticky top-0 z-10 print:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center ml-3">
                <span className="text-white font-bold">$</span>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "#193F94" }}>
                نظام الكاشير - تقارير الورديات
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
        {reportData && (
          <>
            <div className="header">
              <h1>تقرير الوردية #{reportData.shiftId}</h1>
              <h3>
                من: {formatDate(reportData.startTime)}
                {reportData.endTime &&
                  reportData.endTime !== "0001-01-01T00:00:00" &&
                  ` إلى: ${formatDate(reportData.endTime)}`}
              </h3>
              <h3>
                المدة: {reportData.shiftDuration}
                {" | "}
                الحالة:{" "}
                {reportData.endTime &&
                reportData.endTime !== "0001-01-01T00:00:00"
                  ? "مغلقة"
                  : "مفتوحة"}
              </h3>
            </div>

            <table className="report-table">
              <thead>
                <tr>
                  <th>البيان</th>
                  <th>القيمة</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="label">عدد الفواتير</td>
                  <td>{reportData.totalInvoicesCount || 0} فاتورة</td>
                </tr>
                <tr>
                  <td className="label">إجمالي المبيعات</td>
                  <td>{formatCurrency(reportData.totalSales || 0)} ج.م</td>
                </tr>
                <tr>
                  <td className="label">إجمالي المدفوع</td>
                  <td>{formatCurrency(reportData.totalPaid || 0)} ج.م</td>
                </tr>
                <tr>
                  <td className="label">المبلغ المتبقي</td>
                  <td>{formatCurrency(reportData.totalRemaining || 0)} ج.م</td>
                </tr>
                <tr>
                  <td className="label">إجمالي الضريبة</td>
                  <td>{formatCurrency(reportData.totalTax || 0)} ج.م</td>
                </tr>
                <tr>
                  <td className="label">صافي الإيرادات</td>
                  <td>{formatCurrency(reportData.netRevenue || 0)} ج.م</td>
                </tr>
                <tr>
                  <td className="label">الإجمالي الفرعي</td>
                  <td>{formatCurrency(reportData.totalSubTotal || 0)} ج.م</td>
                </tr>
                <tr>
                  <td className="label">إجمالي رسوم التوصيل</td>
                  <td>
                    {formatCurrency(reportData.totalDiliveryFee || 0)} ج.م
                  </td>
                </tr>
                <tr>
                  <td className="label">متوسط الفاتورة</td>
                  <td>{formatAverage(reportData.averageInvoice || 0)} ج.م</td>
                </tr>
                <tr>
                  <td className="label">إجمالي المرتجعات</td>
                  <td style={{ color: "#dc2626" }}>
                    {formatCurrency(reportData.totalReturns || 0)} ج.م
                  </td>
                </tr>
                <tr>
                  <td className="label">إجمالي الخصومات</td>
                  <td style={{ color: "#dc2626" }}>
                    {formatCurrency(reportData.totalDiscount || 0)} ج.م
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 print:hidden">
            <div className="bg-white rounded-2xl shadow-lg p-5 sticky top-24">
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: "#193F94" }}
              >
                فلترة التقارير
              </h3>

              {loadingActiveShift ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="w-6 h-6 animate-spin text-blue-600 ml-2" />
                  <span>جاري تحميل الوردية النشطة...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      max={new Date().toISOString().split("T")[0]}
                      dir="rtl"
                    />
                    <label className="absolute -top-2.5 right-3 px-2 text-xs text-blue-500 font-medium bg-white">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 ml-1" />
                        التاريخ
                      </span>
                    </label>
                  </div>

                  <div className="relative">
                    <select
                      value={selectedShift}
                      onChange={(e) => setSelectedShift(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white appearance-none"
                      disabled={fetchingShifts || shifts.length === 0}
                      dir="rtl"
                    >
                      {fetchingShifts ? (
                        <option value="">جاري تحميل الورديات...</option>
                      ) : shifts.length === 0 ? (
                        <option value="">لا توجد ورديات</option>
                      ) : (
                        <>
                          <option value="">اختر وردية</option>
                          {shifts.map((shift) => (
                            <option key={shift.id} value={shift.id?.toString()}>
                              {formatDate(shift.startTime)} -{" "}
                              {shift.endTime &&
                              shift.endTime !== "0001-01-01T00:00:00"
                                ? `حتى ${formatTime(shift.endTime)}`
                                : "مستمرة"}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    <label className="absolute -top-2.5 right-3 px-2 text-xs text-blue-500 font-medium bg-white">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 ml-1" />
                        اختيار الوردية
                      </span>
                    </label>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {activeShift && activeShift.shiftId && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-blue-700 font-medium mb-1">
                        الوردية النشطة حالياً
                      </p>
                      <p className="text-sm text-blue-900">
                        #{activeShift.shiftId} -{" "}
                        {formatDate(activeShift.startTime)}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 space-y-3">
                    <button
                      onClick={generateReport}
                      disabled={
                        isGeneratingReport || !selectedShift || fetchingShifts
                      }
                      className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-md ${
                        isGeneratingReport || !selectedShift || fetchingShifts
                          ? "opacity-50 cursor-not-allowed bg-gray-400"
                          : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      }`}
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
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            {reportData ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
                <div className="flex justify-between items-start mb-6 flex-wrap gap-4 print:hidden">
                  <div>
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: "#193F94" }}
                    >
                      تقرير الوردية #{reportData.shiftId}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {formatDate(reportData.startTime)}
                    </p>
                    {reportData.endTime &&
                      reportData.endTime !== "0001-01-01T00:00:00" && (
                        <p className="text-sm text-gray-500 mt-1">
                          انتهت في: {formatDate(reportData.endTime)}
                        </p>
                      )}
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse flex-wrap gap-2">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium flex items-center">
                      <Clock className="h-3 w-3 ml-1" />
                      مدة الوردية: {reportData.shiftDuration}
                    </div>
                    <div
                      className={`px-3 py-1 text-xs rounded-full font-medium flex items-center ${
                        reportData.endTime &&
                        reportData.endTime !== "0001-01-01T00:00:00"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {reportData.endTime &&
                      reportData.endTime !== "0001-01-01T00:00:00" ? (
                        <PowerOff className="h-3 w-3 ml-1" />
                      ) : (
                        <Power className="h-3 w-3 ml-1" />
                      )}
                      {reportData.endTime &&
                      reportData.endTime !== "0001-01-01T00:00:00"
                        ? "مغلقة"
                        : "مفتوحة"}
                    </div>
                    <button
                      onClick={handlePrint}
                      disabled={isPrinting}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium flex items-center hover:bg-gray-200 transition-colors"
                    >
                      <Printer className="h-3 w-3 ml-1" />
                      طباعة
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">إجمالي المبيعات</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {formatCurrency(reportData.totalSales || 0)} ج.م
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
                        <p className="text-sm text-green-800">إجمالي المدفوع</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {formatCurrency(reportData.totalPaid || 0)} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-green-700" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-800">
                          المبلغ المتبقي
                        </p>
                        <p className="text-2xl font-bold text-orange-900 mt-1">
                          {formatCurrency(reportData.totalRemaining || 0)} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-orange-700" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-800">
                          إجمالي الضريبة
                        </p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {formatCurrency(reportData.totalTax || 0)} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                        <Percent className="h-6 w-6 text-purple-700" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-800">صافي الإيرادات</p>
                        <p className="text-2xl font-bold text-amber-900 mt-1">
                          {formatCurrency(reportData.netRevenue || 0)} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-amber-700" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-teal-800">عدد الفواتير</p>
                        <p className="text-2xl font-bold text-teal-900 mt-1">
                          {reportData.totalInvoicesCount || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-teal-200 rounded-full flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-teal-700" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-indigo-800">
                          الإجمالي الفرعي
                        </p>
                        <p className="text-2xl font-bold text-indigo-900 mt-1">
                          {formatCurrency(reportData.totalSubTotal || 0)} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-indigo-700" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl p-4 border border-cyan-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-cyan-800">
                          إجمالي رسوم التوصيل
                        </p>
                        <p className="text-2xl font-bold text-cyan-900 mt-1">
                          {formatCurrency(reportData.totalDiliveryFee || 0)} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-cyan-200 rounded-full flex items-center justify-center">
                        <Truck className="h-6 w-6 text-cyan-700" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-800">إجمالي المرتجعات</p>
                        <p className="text-2xl font-bold text-red-900 mt-1">
                          {formatCurrency(reportData.totalReturns || 0)} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                        <TrendingDown className="h-6 w-6 text-red-700" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-pink-800">متوسط الفاتورة</p>
                        <p className="text-2xl font-bold text-pink-900 mt-1">
                          {formatAverage(reportData.averageInvoice || 0)} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-pink-700" />
                      </div>
                    </div>
                  </div>
                </div>

                {reportData.payments && reportData.payments.length > 0 && (
                  <div className="mb-6">
                    <h3
                      className="text-lg font-bold mb-4"
                      style={{ color: "#193F94" }}
                    >
                      المبيعات حسب طريقة الدفع
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {reportData.payments.map((payment, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 ml-2 text-gray-600" />
                              <span className="font-medium">
                                {payment.paymentMethodName}
                              </span>
                            </div>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full flex items-center">
                              <Receipt className="h-3 w-3 ml-1" />
                              {payment.count || 0} فاتورة
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {formatCurrency(payment.amount || 0)} ج.م
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {reportData.totalSales > 0
                                ? (
                                    ((payment.amount || 0) /
                                      reportData.totalSales) *
                                    100
                                  ).toFixed(1)
                                : 0}
                              % من إجمالي المبيعات
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!reportData.payments || reportData.payments.length === 0) && (
                  <div className="mb-6 p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      لا توجد مدفوعات في هذه الوردية
                    </p>
                  </div>
                )}

                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                  <h4
                    className="font-bold mb-4 text-gray-800 flex items-center"
                    style={{ color: "#193F94" }}
                  >
                    <PieChart className="h-5 w-5 ml-2" />
                    ملخص التقرير
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#193F94" }}
                      >
                        {reportData.totalInvoicesCount || 0}
                      </div>
                      <div className="text-sm text-gray-600">عدد الفواتير</div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#10B981" }}
                      >
                        {formatCurrency(reportData.totalSales || 0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي المبيعات
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#3B82F6" }}
                      >
                        {formatCurrency(reportData.totalPaid || 0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي المدفوع
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#F59E0B" }}
                      >
                        {formatCurrency(reportData.totalRemaining || 0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        المبلغ المتبقي
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#06B6D4" }}
                      >
                        {formatCurrency(reportData.totalDiliveryFee || 0)}
                      </div>
                      <div className="text-sm text-gray-600">رسوم التوصيل</div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#8B5CF6" }}
                      >
                        {formatAverage(reportData.averageInvoice || 0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        متوسط الفاتورة
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#EF4444" }}
                      >
                        {formatCurrency(reportData.totalDiscount || 0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي الخصومات
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#DC2626" }}
                      >
                        {formatCurrency(reportData.totalReturns || 0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي المرتجعات
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6">
                  <FileText className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  تقارير الورديات
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  اختر تاريخاً ومن ثم وردية من القائمة الجانبية لعرض التقرير
                  التفصيلي
                </p>
                {fetchingShifts ? (
                  <div className="flex items-center justify-center">
                    <FaSpinner className="w-6 h-6 ml-2 animate-spin text-blue-600" />
                    <span>جاري تحميل الورديات...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 max-w-md">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {stats.totalShifts}
                      </div>
                      <div className="text-sm text-blue-600 flex items-center justify-center">
                        <Clock className="h-4 w-4 ml-1" />
                        ورديات
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {stats.openShifts}
                      </div>
                      <div className="text-sm text-green-600 flex items-center justify-center">
                        <Power className="h-4 w-4 ml-1" />
                        مفتوحة
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-700">
                        {stats.closedShifts}
                      </div>
                      <div className="text-sm text-purple-600 flex items-center justify-center">
                        <PowerOff className="h-4 w-4 ml-1" />
                        مغلقة
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
