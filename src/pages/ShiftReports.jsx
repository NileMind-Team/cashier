import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ShiftReports() {
  const navigate = useNavigate();
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [shifts, setShifts] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const mockShifts = [
      {
        id: "shift_001",
        startTime: "2026-01-15 08:00",
        endTime: "2026-01-15 16:00",
        totalBills: 45,
        completedBills: 42,
        pendingBills: 3,
        returnedBills: 1,
        totalSales: 12560.75,
        totalTax: 1758.51,
        totalDiscount: 628.04,
        netRevenue: 13691.22,
        paymentMethods: {
          cash: { count: 25, amount: 7560.5 },
          visa: { count: 15, amount: 4500.25 },
          wallet: { count: 5, amount: 500.0 },
        },
      },
      {
        id: "shift_002",
        startTime: "2026-01-14 08:00",
        endTime: "2026-01-14 16:00",
        totalBills: 38,
        completedBills: 36,
        pendingBills: 2,
        returnedBills: 0,
        totalSales: 9850.25,
        totalTax: 1379.04,
        totalDiscount: 492.51,
        netRevenue: 10736.78,
        paymentMethods: {
          cash: { count: 22, amount: 6320.75 },
          visa: { count: 12, amount: 3200.5 },
          wallet: { count: 4, amount: 330.0 },
        },
      },
      {
        id: "shift_003",
        startTime: "2026-01-13 08:00",
        endTime: "2026-01-13 16:00",
        totalBills: 52,
        completedBills: 50,
        pendingBills: 2,
        returnedBills: 2,
        totalSales: 14200.5,
        totalTax: 1988.07,
        totalDiscount: 710.03,
        netRevenue: 15478.54,
        paymentMethods: {
          cash: { count: 30, amount: 8520.25 },
          visa: { count: 18, amount: 4980.75 },
          wallet: { count: 4, amount: 700.0 },
        },
      },
    ];

    setShifts(mockShifts);
    if (mockShifts.length > 0) {
      setSelectedShift(mockShifts[0].id);
    }

    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  const generateReport = () => {
    if (!selectedShift) {
      toast.error("يرجى اختيار وردية لعرض التقرير");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const shift = shifts.find((s) => s.id === selectedShift);
      if (shift) {
        setReportData(shift);
        toast.success(`تم تحميل تقرير الوردية ${selectedShift}`);
      } else {
        toast.error("لم يتم العثور على بيانات الوردية المحددة");
      }
      setLoading(false);
    }, 1000);
  };

  const formatDate = (dateString) => {
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

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-l from-gray-50 to-gray-100"
    >
      {/* Navbar */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
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
            <div className="bg-white rounded-2xl shadow-lg p-5 sticky top-6">
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: "#193F94" }}
              >
                فلترة التقارير
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اختيار الوردية
                  </label>
                  <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="">اختر وردية</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {formatDate(shift.startTime)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التاريخ
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={generateReport}
                    disabled={loading || !selectedShift}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 ${
                      loading || !selectedShift
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    style={{
                      backgroundColor:
                        loading || !selectedShift ? "" : "#193F94",
                    }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin ml-2"></div>
                        جاري التحميل...
                      </div>
                    ) : (
                      "عرض التقرير"
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
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      مدة الوردية: 8 ساعات
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      {reportData.completedBills} فاتورة مكتملة
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">إجمالي المبيعات</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {reportData.totalSales.toFixed(2)} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-bold">💰</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-800">عدد الفواتير</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {reportData.totalBills}
                        </p>
                        <div className="flex text-xs mt-1">
                          <span className="text-green-600 mr-2">
                            {reportData.completedBills} مكتملة
                          </span>
                          <span className="text-amber-600">
                            {reportData.pendingBills} معلقة
                          </span>
                          {reportData.returnedBills > 0 && (
                            <span className="text-red-600 mr-2">
                              {reportData.returnedBills} مرتجعة
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-bold">🧾</span>
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
                          {reportData.netRevenue.toFixed(2)} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                        <span className="text-purple-700 font-bold">💵</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-800">متوسط الفاتورة</p>
                        <p className="text-2xl font-bold text-amber-900 mt-1">
                          {reportData.completedBills > 0
                            ? (
                                reportData.totalSales /
                                reportData.completedBills
                              ).toFixed(2)
                            : "0.00"}{" "}
                          ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                        <span className="text-amber-700 font-bold">📊</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: "#193F94" }}
                  >
                    المبيعات حسب طريقة الدفع
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(reportData.paymentMethods).map(
                      ([method, data]) => (
                        <div
                          key={method}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                                  method === "cash"
                                    ? "bg-green-100 text-green-700"
                                    : method === "visa"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {method === "cash"
                                  ? "💰"
                                  : method === "visa"
                                    ? "💳"
                                    : "📱"}
                              </div>
                              <span className="font-medium">
                                {method === "cash"
                                  ? "كاش"
                                  : method === "visa"
                                    ? "فيزا"
                                    : "محفظة"}
                              </span>
                            </div>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                              {data.count} فاتورة
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {data.amount.toFixed(2)} ج.م
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {(
                                (data.amount / reportData.totalSales) *
                                100
                              ).toFixed(1)}
                              % من إجمالي المبيعات
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

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
                        {reportData.totalSales.toFixed(2)} ج.م
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600">
                        إجمالي الضرائب (
                        {(
                          (reportData.totalTax / reportData.totalSales) *
                          100
                        ).toFixed(1)}
                        %):
                      </span>
                      <span className="font-bold">
                        {reportData.totalTax.toFixed(2)} ج.م
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600">
                        إجمالي الخصومات (
                        {(
                          (reportData.totalDiscount / reportData.totalSales) *
                          100
                        ).toFixed(1)}
                        %):
                      </span>
                      <span className="font-bold text-red-600">
                        {reportData.totalDiscount.toFixed(2)} ج.م
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
                          {reportData.netRevenue.toFixed(2)} ج.م
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
                  اختر وردية من القائمة الجانبية لعرض التقرير التفصيلي
                </p>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-700">
                      {shifts.reduce((sum, shift) => sum + shift.totalBills, 0)}
                    </div>
                    <div className="text-sm text-blue-600">فواتير</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {shifts
                        .reduce((sum, shift) => sum + shift.totalSales, 0)
                        .toFixed(0)}
                    </div>
                    <div className="text-sm text-green-600">مبيعات</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      {shifts.reduce(
                        (sum, shift) => sum + shift.completedBills,
                        0,
                      )}
                    </div>
                    <div className="text-sm text-purple-600">مكتملة</div>
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
