import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SalesReports() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const salesData = [
    {
      id: "sale_001",
      billNumber: "F-2026-001",
      date: "2026-01-15 14:30",
      customerName: "أحمد محمد",
      billType: "dinein",
      tableNumber: "ط5",
      paymentMethod: "cash",
      subtotal: 150.0,
      tax: 21.0,
      discount: 7.5,
      deliveryFee: 0,
      total: 163.5,
      products: [
        { name: "قهوة تركية", quantity: 2, price: 15 },
        { name: "كرواسون", quantity: 1, price: 8 },
      ],
      completed: true,
    },
    {
      id: "sale_002",
      billNumber: "F-2026-002",
      date: "2026-01-15 15:15",
      customerName: "سارة علي",
      billType: "takeaway",
      tableNumber: null,
      paymentMethod: "visa",
      subtotal: 85.0,
      tax: 11.9,
      discount: 4.25,
      deliveryFee: 0,
      total: 92.65,
      products: [
        { name: "شاي أخضر", quantity: 1, price: 10 },
        { name: "تشيز كيك", quantity: 1, price: 20 },
        { name: "عصير برتقال", quantity: 2, price: 12 },
      ],
      completed: true,
    },
    {
      id: "sale_003",
      billNumber: "F-2026-003",
      date: "2026-01-15 16:45",
      customerName: "محمد خالد",
      billType: "delivery",
      tableNumber: null,
      paymentMethod: "wallet",
      subtotal: 120.0,
      tax: 16.8,
      discount: 6.0,
      deliveryFee: 25,
      total: 155.8,
      products: [
        { name: "برجر لحم", quantity: 2, price: 40 },
        { name: "بطاطس مقلية", quantity: 1, price: 15 },
      ],
      completed: true,
    },
    {
      id: "sale_004",
      billNumber: "F-2026-004",
      date: "2026-01-14 10:20",
      customerName: "فاطمة أحمد",
      billType: "dinein",
      tableNumber: "ط2",
      paymentMethod: "cash",
      subtotal: 65.0,
      tax: 9.1,
      discount: 3.25,
      deliveryFee: 0,
      total: 70.85,
      products: [
        { name: "إسبريسو", quantity: 1, price: 12 },
        { name: "دونات", quantity: 2, price: 10 },
      ],
      completed: true,
    },
    {
      id: "sale_005",
      billNumber: "F-2026-005",
      date: "2026-01-14 12:45",
      customerName: "علي حسن",
      billType: "takeaway",
      tableNumber: null,
      paymentMethod: "visa",
      subtotal: 210.0,
      tax: 29.4,
      discount: 10.5,
      deliveryFee: 0,
      total: 228.9,
      products: [
        { name: "بيتزا صغيرة", quantity: 2, price: 35 },
        { name: "مشروب غازي", quantity: 3, price: 7 },
      ],
      completed: true,
    },
    {
      id: "sale_006",
      billNumber: "F-2026-006",
      date: "2026-01-13 19:30",
      customerName: "ريم سعد",
      billType: "delivery",
      tableNumber: null,
      paymentMethod: "cash",
      subtotal: 180.0,
      tax: 25.2,
      discount: 9.0,
      deliveryFee: 25,
      total: 221.2,
      products: [
        { name: "سوشي", quantity: 1, price: 45 },
        { name: "سلطة خضار", quantity: 1, price: 22 },
        { name: "آيس كريم", quantity: 2, price: 12 },
      ],
      completed: true,
    },
    {
      id: "sale_007",
      billNumber: "F-2026-007",
      date: "2026-01-13 20:15",
      customerName: "خالد عمر",
      billType: "dinein",
      tableNumber: "ط8",
      paymentMethod: "wallet",
      subtotal: 95.0,
      tax: 13.3,
      discount: 4.75,
      deliveryFee: 0,
      total: 103.55,
      products: [
        { name: "كابتشينو", quantity: 2, price: 18 },
        { name: "ساندويتش جبنة", quantity: 1, price: 25 },
      ],
      completed: true,
    },
    {
      id: "sale_008",
      billNumber: "F-2026-008",
      date: "2026-01-12 11:30",
      customerName: "نورا سليم",
      billType: "takeaway",
      tableNumber: null,
      paymentMethod: "visa",
      subtotal: 140.0,
      tax: 19.6,
      discount: 7.0,
      deliveryFee: 0,
      total: 152.6,
      products: [
        { name: "معكرونة", quantity: 1, price: 28 },
        { name: "عصير مانجو", quantity: 2, price: 15 },
      ],
      completed: true,
    },
    {
      id: "sale_009",
      billNumber: "F-2026-009",
      date: "2026-01-16 09:15",
      customerName: "سامي رامي",
      billType: "dinein",
      tableNumber: "ط3",
      paymentMethod: "cash",
      subtotal: 75.0,
      tax: 10.5,
      discount: 3.75,
      deliveryFee: 0,
      total: 81.75,
      products: [
        { name: "قهوة مثلجة", quantity: 1, price: 20 },
        { name: "كيك شوكولاتة", quantity: 1, price: 22 },
      ],
      completed: true,
    },
    {
      id: "sale_010",
      billNumber: "F-2026-010",
      date: "2026-01-16 13:45",
      customerName: "ليلى محمود",
      billType: "delivery",
      tableNumber: null,
      paymentMethod: "wallet",
      subtotal: 195.0,
      tax: 27.3,
      discount: 9.75,
      deliveryFee: 25,
      total: 237.55,
      products: [
        { name: "ستيك لحم", quantity: 1, price: 65 },
        { name: "سلطة خضار", quantity: 1, price: 22 },
        { name: "عصير مانجو", quantity: 2, price: 15 },
      ],
      completed: true,
    },
  ];

  const getBillTypeLabel = (type) => {
    const types = {
      dinein: { label: "طاولة", color: "#10B981", bgColor: "#10B9811A" },
      takeaway: { label: "سفري", color: "#3B82F6", bgColor: "#3B82F61A" },
      delivery: { label: "دليفري", color: "#8B5CF6", bgColor: "#8B5CF61A" },
    };
    return (
      types[type] || { label: "غير محدد", color: "#6B7280", bgColor: "#F3F4F6" }
    );
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cash: { label: "كاش", icon: "💰", color: "#10B981" },
      visa: { label: "فيزا", icon: "💳", color: "#3B82F6" },
      wallet: { label: "محفظة", icon: "📱", color: "#8B5CF6" },
    };
    return (
      methods[method] || { label: "غير محدد", icon: "❓", color: "#6B7280" }
    );
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoFormatted = sevenDaysAgo.toISOString().split("T")[0];

    setStartDate(sevenDaysAgoFormatted);
    setEndDate(today);
  }, []);

  const generateReport = () => {
    if (!startDate || !endDate) {
      toast.error("يرجى اختيار تاريخ البداية والنهاية");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const filteredData = salesData.filter((sale) => {
        const saleDate = new Date(sale.date);
        return saleDate >= start && saleDate <= end;
      });

      const sortedData = [...filteredData].sort((a, b) => {
        const aValue = sortBy === "date" ? new Date(a.date) : a[sortBy];
        const bValue = sortBy === "date" ? new Date(b.date) : b[sortBy];

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      const stats = {
        totalSales: sortedData.reduce((sum, sale) => sum + sale.total, 0),
        totalBills: sortedData.length,
        averageBill:
          sortedData.length > 0
            ? sortedData.reduce((sum, sale) => sum + sale.total, 0) /
              sortedData.length
            : 0,
        totalTax: sortedData.reduce((sum, sale) => sum + sale.tax, 0),
        totalDiscount: sortedData.reduce((sum, sale) => sum + sale.discount, 0),
        totalDeliveryFee: sortedData.reduce(
          (sum, sale) => sum + sale.deliveryFee,
          0,
        ),
        totalSubtotal: sortedData.reduce((sum, sale) => sum + sale.subtotal, 0),
        paymentBreakdown: sortedData.reduce((acc, sale) => {
          const method = sale.paymentMethod;
          acc[method] = acc[method] || { count: 0, amount: 0 };
          acc[method].count++;
          acc[method].amount += sale.total;
          return acc;
        }, {}),
        billTypeBreakdown: sortedData.reduce((acc, sale) => {
          const type = sale.billType;
          acc[type] = acc[type] || { count: 0, amount: 0 };
          acc[type].count++;
          acc[type].amount += sale.total;
          return acc;
        }, {}),
        dailySales: sortedData.reduce((acc, sale) => {
          const saleDate = new Date(sale.date).toISOString().split("T")[0];
          acc[saleDate] = acc[saleDate] || {
            date: saleDate,
            count: 0,
            amount: 0,
          };
          acc[saleDate].count++;
          acc[saleDate].amount += sale.total;
          return acc;
        }, {}),
      };

      const dailySalesArray = Object.values(stats.dailySales).sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );

      setReportData({
        sales: sortedData,
        stats: stats,
        dailySales: dailySalesArray,
        dateRange: {
          start: formatArabicDate(startDate),
          end: formatArabicDate(endDate),
          startDate: startDate,
          endDate: endDate,
        },
      });

      setLoading(false);
      toast.success(
        `تم إنشاء التقرير للفترة من ${formatArabicDate(startDate)} إلى ${formatArabicDate(endDate)} (${sortedData.length} فاتورة)`,
      );
    }, 800);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    return new Intl.NumberFormat("ar-EG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
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
              <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                <span className="text-white font-bold">$</span>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "#193F94" }}>
                نظام الكاشير - تقارير المبيعات
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التاريخ من
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    max={endDate || undefined}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التاريخ إلى
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    min={startDate || undefined}
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={generateReport}
                    disabled={loading || !startDate || !endDate}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 mb-3 ${
                      loading || !startDate || !endDate
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    style={{
                      backgroundColor:
                        loading || !startDate || !endDate ? "" : "#193F94",
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
              <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
                <div className="flex justify-between items-start mb-6 print:flex-col print:items-start">
                  <div>
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: "#193F94" }}
                    >
                      تقرير المبيعات
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
                      {reportData.sales.length} فاتورة |{" "}
                      {
                        new Set(reportData.sales.map((s) => s.customerName))
                          .size
                      }{" "}
                      عميل
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {reportData.sales.length} فاتورة
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      {formatCurrency(reportData.stats.totalSales)} ج.م
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 print:grid-cols-2">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">إجمالي المبيعات</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {formatCurrency(reportData.stats.totalSales)} ج.م
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {formatCurrency(reportData.stats.totalSubtotal)} +{" "}
                          {formatCurrency(reportData.stats.totalTax)} ضريبة
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
                          {reportData.stats.totalBills}
                        </p>
                        <div className="text-xs text-green-600 mt-1">
                          متوسط الفاتورة:{" "}
                          {formatCurrency(reportData.stats.averageBill)} ج.م
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
                          إجمالي الضريبة
                        </p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {formatCurrency(reportData.stats.totalTax)} ج.م
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          {reportData.stats.totalSales > 0
                            ? (
                                (reportData.stats.totalTax /
                                  reportData.stats.totalSales) *
                                100
                              ).toFixed(1)
                            : 0}
                          % من المبيعات
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                        <span className="text-purple-700 font-bold">🏛️</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-800">رسوم التوصيل</p>
                        <p className="text-2xl font-bold text-amber-900 mt-1">
                          {formatCurrency(reportData.stats.totalDeliveryFee)}{" "}
                          ج.م
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          {reportData.stats.totalSales > 0
                            ? (
                                (reportData.stats.totalDeliveryFee /
                                  reportData.stats.totalSales) *
                                100
                              ).toFixed(1)
                            : 0}
                          % من المبيعات
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                        <span className="text-amber-700 font-bold">🚚</span>
                      </div>
                    </div>
                  </div>
                </div>

                {reportData.dailySales.length > 0 && (
                  <div className="mb-6">
                    <h3
                      className="text-lg font-bold mb-4"
                      style={{ color: "#193F94" }}
                    >
                      المبيعات اليومية
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="py-2 px-3 text-right text-sm font-medium text-gray-700">
                                اليوم
                              </th>
                              <th className="py-2 px-3 text-right text-sm font-medium text-gray-700">
                                عدد الفواتير
                              </th>
                              <th className="py-2 px-3 text-right text-sm font-medium text-gray-700">
                                إجمالي المبيعات
                              </th>
                              <th className="py-2 px-3 text-right text-sm font-medium text-gray-700">
                                متوسط الفاتورة
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.dailySales.map((day, index) => (
                              <tr
                                key={index}
                                className="border-b border-gray-200 hover:bg-gray-100"
                              >
                                <td className="py-2 px-3 text-right">
                                  <div className="font-medium">
                                    {formatArabicDate(day.date)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(day.date).toLocaleDateString(
                                      "ar-EG",
                                      { weekday: "long" },
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <div className="font-bold text-blue-900">
                                    {day.count}
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <div className="font-bold text-green-700">
                                    {formatCurrency(day.amount)} ج.م
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <div className="font-bold text-purple-700">
                                    {formatCurrency(day.amount / day.count)} ج.م
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className="text-lg font-bold"
                      style={{ color: "#193F94" }}
                    >
                      تفاصيل الفواتير ({reportData.sales.length} فاتورة)
                    </h3>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                      <span className="text-sm text-gray-600">ترتيب حسب:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => handleSort(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                      >
                        <option value="date">التاريخ</option>
                        <option value="total">القيمة</option>
                        <option value="billNumber">رقم الفاتورة</option>
                      </select>
                      <button
                        onClick={() =>
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                      >
                        {sortOrder === "asc" ? "تصاعدي ↑" : "تنازلي ↓"}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("billNumber")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              رقم الفاتورة
                              {sortBy === "billNumber" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("date")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              التاريخ
                              {sortBy === "date" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            العميل
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            النوع
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            الدفع
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("total")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              الإجمالي
                              {sortBy === "total" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700 print:hidden">
                            تفاصيل
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.sales.map((sale) => {
                          const billType = getBillTypeLabel(sale.billType);
                          const paymentMethod = getPaymentMethodLabel(
                            sale.paymentMethod,
                          );

                          return (
                            <tr
                              key={sale.id}
                              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                              <td className="py-3 px-4 text-right">
                                <div className="font-medium text-blue-900">
                                  {sale.billNumber}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="text-sm">
                                  {formatDate(sale.date)}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="font-medium">
                                  {sale.customerName || "عميل"}
                                </div>
                                {sale.tableNumber && (
                                  <div className="text-xs text-gray-500">
                                    طاولة: {sale.tableNumber}
                                  </div>
                                )}
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
                                <div className="flex items-center justify-end">
                                  <span className="ml-1">
                                    {paymentMethod.icon}
                                  </span>
                                  <span className="text-sm">
                                    {paymentMethod.label}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div
                                  className="font-bold"
                                  style={{ color: "#193F94" }}
                                >
                                  {formatCurrency(sale.total)} ج.م
                                </div>
                                <div className="text-xs text-gray-500">
                                  شامل ضريبة: {formatCurrency(sale.tax)} ج.م
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right print:hidden">
                                <button
                                  onClick={() => {
                                    toast.info(
                                      <div className="text-right p-3">
                                        <h4 className="font-bold mb-2">
                                          تفاصيل الفاتورة {sale.billNumber}
                                        </h4>
                                        <div className="space-y-2">
                                          {sale.products.map((product, idx) => (
                                            <div
                                              key={idx}
                                              className="flex justify-between"
                                            >
                                              <span>
                                                {product.name} ×{" "}
                                                {product.quantity}
                                              </span>
                                              <span>
                                                {formatCurrency(
                                                  product.price *
                                                    product.quantity,
                                                )}{" "}
                                                ج.م
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="mt-3 pt-3 border-t">
                                          <div className="flex justify-between">
                                            <span>المجموع الفرعي:</span>
                                            <span>
                                              {formatCurrency(sale.subtotal)}{" "}
                                              ج.م
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>الضريبة:</span>
                                            <span>
                                              {formatCurrency(sale.tax)} ج.م
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>الخصم:</span>
                                            <span>
                                              {formatCurrency(sale.discount)}{" "}
                                              ج.م
                                            </span>
                                          </div>
                                          {sale.deliveryFee > 0 && (
                                            <div className="flex justify-between">
                                              <span>رسوم التوصيل:</span>
                                              <span>
                                                {formatCurrency(
                                                  sale.deliveryFee,
                                                )}{" "}
                                                ج.م
                                              </span>
                                            </div>
                                          )}
                                          <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                                            <span>الإجمالي:</span>
                                            <span>
                                              {formatCurrency(sale.total)} ج.م
                                            </span>
                                          </div>
                                        </div>
                                      </div>,
                                      { autoClose: 5000 },
                                    );
                                  }}
                                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
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
                          <td colSpan="5" className="py-4 px-4 text-right">
                            الإجمالي العام:
                          </td>
                          <td
                            className="py-4 px-4 text-right"
                            style={{ color: "#193F94" }}
                          >
                            {formatCurrency(reportData.stats.totalSales)} ج.م
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
                    ملخص التقرير
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#193F94" }}
                      >
                        {reportData.stats.totalBills}
                      </div>
                      <div className="text-sm text-gray-600">عدد الفواتير</div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#10B981" }}
                      >
                        {formatCurrency(reportData.stats.totalSales)}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي المبيعات
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#8B5CF6" }}
                      >
                        {formatCurrency(reportData.stats.averageBill)}
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
                        {formatCurrency(reportData.stats.totalTax)}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي الضريبة
                      </div>
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  تقارير المبيعات
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  اختر تاريخ البداية والنهاية لعرض التقرير التفصيلي
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
