import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PaymentMethodsReport() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const paymentMethodsData = {
    cash: {
      name: "كاش",
      icon: "💰",
      color: "#10B981",
      bgColor: "#10B9811A",
      description: "مدفوعات نقدية مباشرة",
    },
    visa: {
      name: "فيزا",
      icon: "💳",
      color: "#3B82F6",
      bgColor: "#3B82F61A",
      description: "بطاقات ائتمان ودخل",
    },
    wallet: {
      name: "محفظة",
      icon: "📱",
      color: "#8B5CF6",
      bgColor: "#8B5CF61A",
      description: "محافظ رقمية وتطبيقات",
    },
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

      const paymentAnalysis = {};

      filteredData.forEach((sale) => {
        const method = sale.paymentMethod;
        if (!paymentAnalysis[method]) {
          paymentAnalysis[method] = {
            name: paymentMethodsData[method]?.name || method,
            icon: paymentMethodsData[method]?.icon || "❓",
            color: paymentMethodsData[method]?.color || "#6B7280",
            bgColor: paymentMethodsData[method]?.bgColor || "#F3F4F6",
            description: paymentMethodsData[method]?.description || "طريقة دفع",
            count: 0,
            amount: 0,
            bills: [],
          };
        }
        paymentAnalysis[method].count++;
        paymentAnalysis[method].amount += sale.total;
        paymentAnalysis[method].bills.push(sale);
      });

      const paymentMethodsArray = Object.values(paymentAnalysis);

      const totalAmount = paymentMethodsArray.reduce(
        (sum, method) => sum + method.amount,
        0,
      );
      const totalBills = paymentMethodsArray.reduce(
        (sum, method) => sum + method.count,
        0,
      );

      paymentMethodsArray.forEach((method) => {
        method.percentage =
          totalAmount > 0 ? (method.amount / totalAmount) * 100 : 0;
        method.averageBill =
          method.count > 0 ? method.amount / method.count : 0;
      });

      paymentMethodsArray.sort((a, b) => b.amount - a.amount);

      const topPaymentMethod =
        paymentMethodsArray.length > 0 ? paymentMethodsArray[0] : null;
      const lowestPaymentMethod =
        paymentMethodsArray.length > 0
          ? paymentMethodsArray[paymentMethodsArray.length - 1]
          : null;

      const stats = {
        totalAmount,
        totalBills,
        averageBill: totalBills > 0 ? totalAmount / totalBills : 0,
        paymentMethodsCount: paymentMethodsArray.length,
        topPaymentMethod,
        lowestPaymentMethod,
        paymentMethodsArray,
      };

      setReportData({
        paymentMethods: paymentMethodsArray,
        stats: stats,
        dateRange: {
          start: formatArabicDate(startDate),
          end: formatArabicDate(endDate),
          startDate: startDate,
          endDate: endDate,
        },
      });

      setLoading(false);
      toast.success(
        `تم إنشاء تقرير طرق الدفع للفترة من ${formatArabicDate(startDate)} إلى ${formatArabicDate(endDate)}`,
      );
    }, 800);
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 print:grid-cols-2">
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
                        <span className="text-blue-700 font-bold">💰</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-800">متوسط الفاتورة</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {formatCurrency(reportData.stats.averageBill)} ج.م
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          لكل فاتورة
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-bold">📊</span>
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
                        <span className="text-purple-700 font-bold">💳</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-800">
                          الأكثر استخداماً
                        </p>
                        <p className="text-2xl font-bold text-amber-900 mt-1">
                          {reportData.stats.topPaymentMethod?.name ||
                            "غير محدد"}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          {reportData.stats.topPaymentMethod?.percentage?.toFixed(
                            1,
                          ) || 0}
                          %
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                        <span className="text-amber-700 font-bold">👑</span>
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
                            <div className="flex items-center">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center ml-2"
                                style={{ backgroundColor: method.bgColor }}
                              >
                                <span className="text-lg">{method.icon}</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800">
                                  {method.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {method.description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className="font-bold"
                                style={{ color: method.color }}
                              >
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
                              className="h-3 rounded-full"
                              style={{
                                width: `${method.percentage}%`,
                                backgroundColor: method.color,
                              }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-sm text-gray-600">
                            <div>
                              متوسط الفاتورة:{" "}
                              {formatCurrency(method.averageBill)} ج.م
                            </div>
                            <div>
                              {method.percentage.toFixed(1)}% من إجمالي
                              المدفوعات
                            </div>
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
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            متوسط الفاتورة
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
                              <div className="flex items-center justify-end">
                                <span className="ml-2 text-xl">
                                  {method.icon}
                                </span>
                                <div>
                                  <div className="font-bold text-gray-900">
                                    {method.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {method.description}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex flex-col items-center">
                                <div className="font-bold text-blue-900 text-lg">
                                  {method.count}
                                </div>
                                <div className="text-xs text-gray-500">
                                  فاتورة
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div
                                className="font-bold text-lg"
                                style={{ color: method.color }}
                              >
                                {formatCurrency(method.amount)} ج.م
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatCurrency(method.amount / method.count)}{" "}
                                ج.م/فاتورة
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex flex-col items-center">
                                <div
                                  className="font-bold text-lg"
                                  style={{ color: method.color }}
                                >
                                  {method.percentage.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500">
                                  من إجمالي المدفوعات
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-bold text-green-700">
                                {formatCurrency(method.averageBill)} ج.م
                              </div>
                              <div className="text-xs text-gray-500">
                                لكل فاتورة
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
                          <td className="py-4 px-4 text-right text-purple-700">
                            {formatCurrency(reportData.stats.averageBill)} ج.م
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        {reportData.stats.topPaymentMethod?.percentage?.toFixed(
                          1,
                        ) || 0}
                        %
                      </div>
                      <div className="text-sm text-gray-600">
                        أعلى طريقة استخداماً
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#F59E0B" }}
                      >
                        {formatCurrency(reportData.stats.averageBill)}
                      </div>
                      <div className="text-sm text-gray-600">
                        متوسط الفاتورة
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
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
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
                    عرض نسب المدفوعات حسب طريقة الدفع
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
