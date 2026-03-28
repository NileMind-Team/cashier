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
} from "lucide-react";

export default function ShiftReports() {
  const navigate = useNavigate();
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [shifts, setShifts] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [fetchingShifts, setFetchingShifts] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchShiftsByDate(selectedDate);
    }
  }, [selectedDate]);

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
          const firstShiftId = response.data[0].id;
          setSelectedShift(firstShiftId ? firstShiftId.toString() : "");
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

      const response = await axiosInstance.get(
        `/api/Reports/ShiftReport/${shiftIdNumber}`,
      );

      if (response.status === 200 && response.data) {
        setReportData(response.data);
        toast.success("تم تحميل تقرير الوردية بنجاح");
      } else {
        toast.error("لم يتم العثور على بيانات الوردية المحددة");
      }
    } catch (error) {
      console.error("خطأ في جلب تقرير الوردية:", error);
      if (error.response?.status === 404) {
        toast.error("لم يتم العثور على بيانات الوردية المحددة");
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
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateShiftDuration = (startTime, endTime) => {
    if (!startTime) return "غير محدد";
    if (!endTime) return "قيد التشغيل";

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHrs} ساعة ${diffMins} دقيقة`;
  };

  const formatNumber = (value) => {
    return (value || 0).toFixed(2);
  };

  const stats = {
    totalShifts: shifts.length,
    openShifts: shifts.filter((s) => !s.endTime).length,
    closedShifts: shifts.filter((s) => s.endTime).length,
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-l from-gray-50 to-gray-100"
    >
      {/* Navbar */}
      <div className="bg-white shadow-md sticky top-0 z-10">
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

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-5 sticky top-24">
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
                            {shift.endTime
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

                <div className="pt-4">
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
                    style={{
                      backgroundColor:
                        isGeneratingReport || !selectedShift || fetchingShifts
                          ? ""
                          : "#193F94",
                    }}
                  >
                    {isGeneratingReport ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                        جاري التحميل...
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5 ml-2" />
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
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
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
                    {reportData.endTime && (
                      <p className="text-sm text-gray-500 mt-1">
                        انتهت في: {formatDate(reportData.endTime)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse flex-wrap gap-2">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium flex items-center">
                      <Clock className="h-3 w-3 ml-1" />
                      مدة الوردية:{" "}
                      {calculateShiftDuration(
                        reportData.startTime,
                        reportData.endTime,
                      )}
                    </div>
                    <div
                      className={`px-3 py-1 text-xs rounded-full font-medium flex items-center ${
                        reportData.endTime
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {reportData.endTime ? (
                        <PowerOff className="h-3 w-3 ml-1" />
                      ) : (
                        <Power className="h-3 w-3 ml-1" />
                      )}
                      {reportData.endTime ? "مغلقة" : "مفتوحة"}
                    </div>
                  </div>
                </div>

                {/* البطاقات الرئيسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">إجمالي المبيعات</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {formatNumber(reportData.totalSales)} ج.م
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
                          {reportData.totalInvoicesCount || 0}
                        </p>
                        <div className="flex text-xs mt-1 flex-wrap gap-1">
                          <span className="text-green-600 ml-2 flex items-center">
                            <CheckCircle className="h-3 w-3 ml-1" />
                            {reportData.doneInvoicesCount || 0} مكتملة
                          </span>
                          <span className="text-amber-600 ml-2 flex items-center">
                            <Clock className="h-3 w-3 ml-1" />
                            {reportData.suspendedInvoicesCount || 0} معلقة
                          </span>
                          {reportData.partailPaidInvoicesCount > 0 && (
                            <span className="text-orange-600 flex items-center">
                              <Receipt className="h-3 w-3 ml-1" />
                              {reportData.partailPaidInvoicesCount} مدفوعة
                              جزئياً
                            </span>
                          )}
                          {reportData.returnedInvoicesCount > 0 && (
                            <span className="text-red-600 flex items-center">
                              <RotateCcw className="h-3 w-3 ml-1" />
                              {reportData.returnedInvoicesCount} مرتجعة
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        <FileCheck className="h-6 w-6 text-green-700" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-800">
                          صافي الإيرادات
                        </p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {formatNumber(reportData.netRevenue)} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-purple-700" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-800">متوسط الفاتورة</p>
                        <p className="text-2xl font-bold text-amber-900 mt-1">
                          {reportData.doneInvoicesCount > 0
                            ? formatNumber(
                                reportData.totalSales /
                                  reportData.doneInvoicesCount,
                              )
                            : "0.00"}{" "}
                          ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                        <PieChart className="h-6 w-6 text-amber-700" />
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
                              <Wallet className="h-4 w-4 ml-2 text-gray-600" />
                              <span className="font-medium">
                                {payment.paymentMethodName}
                              </span>
                            </div>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full flex items-center">
                              <FileText className="h-3 w-3 ml-1" />
                              {payment.count || 0} فاتورة
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {formatNumber(payment.amount)} ج.م
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {reportData.totalSales > 0
                                ? (
                                    (payment.amount / reportData.totalSales) *
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
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      لا توجد مدفوعات في هذه الوردية
                    </p>
                  </div>
                )}

                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                  <h4
                    className="font-bold mb-3 text-gray-800"
                    style={{ color: "#193F94" }}
                  >
                    ملخص الضرائب والخصومات
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600 flex items-center">
                        <Coins className="h-4 w-4 ml-2 text-gray-500" />
                        الإجمالي الفرعي:
                      </span>
                      <span className="font-bold">
                        {formatNumber(reportData.totalSubTotal)} ج.م
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600 flex items-center">
                        <DollarSign className="h-4 w-4 ml-2 text-gray-500" />
                        إجمالي المبيعات:
                      </span>
                      <span className="font-bold">
                        {formatNumber(reportData.totalSales)} ج.م
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600 flex items-center">
                        <Percent className="h-4 w-4 ml-2 text-gray-500" />
                        إجمالي الضرائب (
                        {reportData.totalSales > 0
                          ? (
                              (reportData.totalTax / reportData.totalSales) *
                              100
                            ).toFixed(1)
                          : 0}
                        %):
                      </span>
                      <span className="font-bold">
                        {formatNumber(reportData.totalTax)} ج.م
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600 flex items-center">
                        <AlertCircle className="h-4 w-4 ml-2 text-gray-500" />
                        إجمالي الخصومات (
                        {reportData.totalSales > 0
                          ? (
                              (reportData.totalDiscount /
                                reportData.totalSales) *
                              100
                            ).toFixed(1)
                          : 0}
                        %):
                      </span>
                      <span className="font-bold text-red-600">
                        {formatNumber(reportData.totalDiscount)} ج.م
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600 flex items-center">
                        <RotateCcw className="h-4 w-4 ml-2 text-gray-500" />
                        إجمالي المرتجعات:
                      </span>
                      <span className="font-bold text-red-600">
                        {formatNumber(reportData.totalReturns)} ج.م
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 flex items-center">
                          <TrendingUp className="h-5 w-5 ml-2 text-green-600" />
                          صافي الإيرادات:
                        </span>
                        <span
                          className="font-bold text-lg"
                          style={{ color: "#10B981" }}
                        >
                          {formatNumber(reportData.netRevenue)} ج.م
                        </span>
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
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin ml-2"></div>
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
