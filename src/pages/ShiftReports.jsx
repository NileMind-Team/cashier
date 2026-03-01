import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

export default function ShiftReports() {
  const navigate = useNavigate();
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [shifts, setShifts] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingShifts, setFetchingShifts] = useState(false);

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

    setLoading(true);
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
      setLoading(false);
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
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      اختيار الوردية
                    </span>
                  </label>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={generateReport}
                    disabled={loading || !selectedShift || fetchingShifts}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-md ${
                      loading || !selectedShift || fetchingShifts
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    }`}
                    style={{
                      backgroundColor:
                        loading || !selectedShift || fetchingShifts
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
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: "#193F94" }}
                    >
                      تقرير الوردية
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 ml-1"
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {reportData.endTime ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        )}
                      </svg>
                      {reportData.endTime ? "مغلقة" : "مفتوحة"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">إجمالي المبيعات</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {reportData.totalSales?.toFixed(2) || "0.00"} ج.م
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
                        <p className="text-sm text-green-800">عدد الفواتير</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {reportData.totalInvoicesCount || 0}
                        </p>
                        <div className="flex text-xs mt-1 flex-wrap gap-1">
                          <span className="text-green-600 ml-2 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 ml-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {reportData.doneInvoicesCount || 0} مكتملة
                          </span>
                          <span className="text-amber-600 ml-2 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 ml-1"
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
                            {reportData.suspendedInvoicesCount || 0} معلقة
                          </span>
                          {reportData.returnedInvoicesCount > 0 && (
                            <span className="text-red-600 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 ml-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 3v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V15z"
                                />
                              </svg>
                              {reportData.returnedInvoicesCount} مرتجعة
                            </span>
                          )}
                        </div>
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
                          صافي الإيرادات
                        </p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {reportData.netRevenue?.toFixed(2) || "0.00"} ج.م
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

                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-800">متوسط الفاتورة</p>
                        <p className="text-2xl font-bold text-amber-900 mt-1">
                          {reportData.doneInvoicesCount > 0
                            ? (
                                reportData.totalSales /
                                reportData.doneInvoicesCount
                              ).toFixed(2)
                            : "0.00"}{" "}
                          ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-amber-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                          />
                        </svg>
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
                              <span className="font-medium">
                                {payment.paymentMethodName}
                              </span>
                            </div>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 ml-1"
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
                              {payment.count || 0} فاتورة
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {payment.amount?.toFixed(2) || "0.00"} ج.م
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
                      <span className="text-gray-600">إجمالي المبيعات:</span>
                      <span className="font-bold">
                        {reportData.totalSales?.toFixed(2) || "0.00"} ج.م
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600">
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
                        {reportData.totalTax?.toFixed(2) || "0.00"} ج.م
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600">
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
                        {reportData.totalDiscount?.toFixed(2) || "0.00"} ج.م
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">
                          صافي الإيرادات:
                        </span>
                        <span
                          className="font-bold text-lg"
                          style={{ color: "#10B981" }}
                        >
                          {reportData.netRevenue?.toFixed(2) || "0.00"} ج.م
                        </span>
                      </div>
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
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
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
                    <div className="w-6 h-6 border-t-2 border-blue-600 rounded-full animate-spin ml-2"></div>
                    <span>جاري تحميل الورديات...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 max-w-md">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {stats.totalShifts}
                      </div>
                      <div className="text-sm text-blue-600 flex items-center justify-center">
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        ورديات
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {stats.openShifts}
                      </div>
                      <div className="text-sm text-green-600 flex items-center justify-center">
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
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        مفتوحة
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-700">
                        {stats.closedShifts}
                      </div>
                      <div className="text-sm text-purple-600 flex items-center justify-center">
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
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
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
