import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ProductsReports() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("quantitySold");
  const [sortOrder, setSortOrder] = useState("desc");

  const productsData = useMemo(
    () => [
      {
        id: "prod_001",
        name: "قهوة تركية",
        category: "مشروبات ساخنة",
        price: 15,
        cost: 5,
        quantitySold: 156,
        totalRevenue: 2340,
        date: "2024-01-15",
        profit: 1560,
      },
      {
        id: "prod_002",
        name: "كابتشينو",
        category: "مشروبات ساخنة",
        price: 18,
        cost: 6,
        quantitySold: 128,
        totalRevenue: 2304,
        date: "2024-01-15",
        profit: 1536,
      },
      {
        id: "prod_003",
        name: "إسبريسو",
        category: "مشروبات ساخنة",
        price: 12,
        cost: 4,
        quantitySold: 95,
        totalRevenue: 1140,
        date: "2024-01-15",
        profit: 760,
      },
      {
        id: "prod_004",
        name: "شاي أخضر",
        category: "مشروبات ساخنة",
        price: 10,
        cost: 3,
        quantitySold: 142,
        totalRevenue: 1420,
        date: "2024-01-14",
        profit: 994,
      },
      {
        id: "prod_005",
        name: "كرواسون",
        category: "مخبوزات",
        price: 8,
        cost: 3,
        quantitySold: 89,
        totalRevenue: 712,
        date: "2024-01-14",
        profit: 445,
      },
      {
        id: "prod_006",
        name: "تشيز كيك",
        category: "حلويات",
        price: 20,
        cost: 8,
        quantitySold: 67,
        totalRevenue: 1340,
        date: "2024-01-14",
        profit: 804,
      },
      {
        id: "prod_007",
        name: "دونات",
        category: "حلويات",
        price: 10,
        cost: 4,
        quantitySold: 112,
        totalRevenue: 1120,
        date: "2024-01-13",
        profit: 672,
      },
      {
        id: "prod_008",
        name: "بيتزا صغيرة",
        category: "أطباق رئيسية",
        price: 35,
        cost: 15,
        quantitySold: 54,
        totalRevenue: 1890,
        date: "2024-01-13",
        profit: 1080,
      },
      {
        id: "prod_009",
        name: "برجر لحم",
        category: "أطباق رئيسية",
        price: 40,
        cost: 18,
        quantitySold: 48,
        totalRevenue: 1920,
        date: "2024-01-13",
        profit: 1056,
      },
      {
        id: "prod_010",
        name: "عصير برتقال",
        category: "مشروبات باردة",
        price: 12,
        cost: 4,
        quantitySold: 135,
        totalRevenue: 1620,
        date: "2024-01-16",
        profit: 1080,
      },
      {
        id: "prod_011",
        name: "عصير مانجو",
        category: "مشروبات باردة",
        price: 15,
        cost: 5,
        quantitySold: 98,
        totalRevenue: 1470,
        date: "2024-01-16",
        profit: 980,
      },
      {
        id: "prod_012",
        name: "مشروب غازي",
        category: "مشروبات باردة",
        price: 7,
        cost: 2,
        quantitySold: 176,
        totalRevenue: 1232,
        date: "2024-01-16",
        profit: 880,
      },
      {
        id: "prod_013",
        name: "آيس كريم",
        category: "حلويات",
        price: 12,
        cost: 5,
        quantitySold: 103,
        totalRevenue: 1236,
        date: "2024-01-12",
        profit: 721,
      },
      {
        id: "prod_014",
        name: "سوشي",
        category: "أطباق رئيسية",
        price: 45,
        cost: 20,
        quantitySold: 32,
        totalRevenue: 1440,
        date: "2024-01-12",
        profit: 800,
      },
      {
        id: "prod_015",
        name: "سلطة خضار",
        category: "سلطات",
        price: 22,
        cost: 9,
        quantitySold: 76,
        totalRevenue: 1672,
        date: "2024-01-12",
        profit: 988,
      },
      {
        id: "prod_016",
        name: "قهوة مثلجة",
        category: "مشروبات باردة",
        price: 20,
        cost: 7,
        quantitySold: 84,
        totalRevenue: 1680,
        date: "2024-01-11",
        profit: 1092,
      },
      {
        id: "prod_017",
        name: "كيك شوكولاتة",
        category: "حلويات",
        price: 22,
        cost: 9,
        quantitySold: 58,
        totalRevenue: 1276,
        date: "2024-01-11",
        profit: 754,
      },
      {
        id: "prod_018",
        name: "ساندويتش جبنة",
        category: "ساندويتشات",
        price: 25,
        cost: 10,
        quantitySold: 72,
        totalRevenue: 1800,
        date: "2024-01-11",
        profit: 1080,
      },
      {
        id: "prod_019",
        name: "معكرونة",
        category: "أطباق رئيسية",
        price: 28,
        cost: 12,
        quantitySold: 46,
        totalRevenue: 1288,
        date: "2024-01-10",
        profit: 736,
      },
      {
        id: "prod_020",
        name: "ستيك لحم",
        category: "أطباق رئيسية",
        price: 65,
        cost: 30,
        quantitySold: 29,
        totalRevenue: 1885,
        date: "2024-01-10",
        profit: 1015,
      },
    ],
    [],
  );

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

      const filteredData = productsData.filter((product) => {
        const productDate = new Date(product.date);
        return productDate >= start && productDate <= end;
      });

      const aggregatedData = filteredData.reduce((acc, product) => {
        const existing = acc.find((p) => p.id === product.id);
        if (existing) {
          existing.quantitySold += product.quantitySold;
          existing.totalRevenue += product.totalRevenue;
          existing.profit += product.profit;
        } else {
          acc.push({ ...product });
        }
        return acc;
      }, []);

      const sortedData = [...aggregatedData].sort((a, b) => {
        let aValue, bValue;

        if (sortBy === "name") {
          aValue = a.name;
          bValue = b.name;
        } else if (sortBy === "category") {
          aValue = a.category;
          bValue = b.category;
        } else if (sortBy === "price") {
          aValue = a.price;
          bValue = b.price;
        } else if (sortBy === "totalRevenue") {
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
        } else if (sortBy === "profit") {
          aValue = a.profit;
          bValue = b.profit;
        } else {
          aValue = a.quantitySold;
          bValue = b.quantitySold;
        }

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      const stats = {
        totalProducts: sortedData.length,
        totalQuantitySold: sortedData.reduce(
          (sum, product) => sum + product.quantitySold,
          0,
        ),
        totalRevenue: sortedData.reduce(
          (sum, product) => sum + product.totalRevenue,
          0,
        ),
        totalProfit: sortedData.reduce(
          (sum, product) => sum + product.profit,
          0,
        ),
        averageRevenuePerProduct:
          sortedData.length > 0
            ? sortedData.reduce(
                (sum, product) => sum + product.totalRevenue,
                0,
              ) / sortedData.length
            : 0,
        averageProfitMargin:
          sortedData.length > 0
            ? (sortedData.reduce((sum, product) => sum + product.profit, 0) /
                sortedData.reduce(
                  (sum, product) => sum + product.totalRevenue,
                  0,
                )) *
              100
            : 0,
        topSellingProduct: sortedData.length > 0 ? sortedData[0] : null,
        categoryBreakdown: sortedData.reduce((acc, product) => {
          const category = product.category;
          acc[category] = acc[category] || {
            count: 0,
            quantity: 0,
            revenue: 0,
          };
          acc[category].count++;
          acc[category].quantity += product.quantitySold;
          acc[category].revenue += product.totalRevenue;
          return acc;
        }, {}),
      };

      setReportData({
        products: sortedData,
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
        `تم إنشاء التقرير للفترة من ${formatArabicDate(startDate)} إلى ${formatArabicDate(endDate)} (${sortedData.length} منتج)`,
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

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      "مشروبات ساخنة": { bg: "#FEE2E2", text: "#DC2626" },
      "مشروبات باردة": { bg: "#DBEAFE", text: "#1D4ED8" },
      حلويات: { bg: "#F3E8FF", text: "#7C3AED" },
      مخبوزات: { bg: "#FEF3C7", text: "#D97706" },
      "أطباق رئيسية": { bg: "#DCFCE7", text: "#16A34A" },
      سلطات: { bg: "#FCE7F3", text: "#DB2777" },
      ساندويتشات: { bg: "#E0E7FF", text: "#4F46E5" },
    };
    return colors[category] || { bg: "#F3F4F6", text: "#6B7280" };
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
          {/* اللوحة الجانبية للفلترة */}
          <div className="lg:col-span-1 print:hidden">
            <div className="bg-white rounded-2xl shadow-lg p-5 sticky top-6">
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: "#193F94" }}
              >
                فلترة التقارير
              </h3>

              <div className="space-y-4">
                {/* حقل التاريخ من */}
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

                {/* حقل التاريخ إلى */}
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

                {/* اختيار طريقة الفرز */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الفرز حسب
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="quantitySold">الأكثر مبيعاً</option>
                    <option value="totalRevenue">الأعلى إيراداً</option>
                    <option value="profit">الأعلى ربحاً</option>
                    <option value="name">اسم المنتج</option>
                    <option value="category">الفئة</option>
                    <option value="price">السعر</option>
                  </select>
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
                    <p className="text-sm text-gray-500 mt-1">
                      {reportData.stats.totalProducts} منتج |{" "}
                      {reportData.stats.totalQuantitySold} وحدة مباعة
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {reportData.stats.totalProducts} منتج
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      {formatCurrency(reportData.stats.totalRevenue)} ج.م
                    </div>
                  </div>
                </div>

                {/* بطاقات الإحصائيات الرئيسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 print:grid-cols-2">
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
                        <span className="text-blue-700 font-bold">💰</span>
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
                        <span className="text-green-700 font-bold">📦</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-800">إجمالي الربح</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {formatCurrency(reportData.stats.totalProfit)} ج.م
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          هامش ربح:{" "}
                          {reportData.stats.averageProfitMargin.toFixed(1)}%
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                        <span className="text-purple-700 font-bold">📈</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-800">
                          المنتج الأكثر مبيعاً
                        </p>
                        <p className="text-2xl font-bold text-amber-900 mt-1">
                          {reportData.stats.topSellingProduct?.name.substring(
                            0,
                            10,
                          )}
                          ...
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          {reportData.stats.topSellingProduct?.quantitySold}{" "}
                          وحدة
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                        <span className="text-amber-700 font-bold">🏆</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* توزيع المنتجات حسب الفئة */}
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

                {/* جدول المنتجات التفصيلي */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className="text-lg font-bold"
                      style={{ color: "#193F94" }}
                    >
                      تفاصيل أداء المنتجات ({reportData.products.length} منتج)
                    </h3>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                      <span className="text-sm text-gray-600">ترتيب:</span>
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
                              onClick={() => handleSort("name")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              اسم المنتج
                              {sortBy === "name" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("category")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              الفئة
                              {sortBy === "category" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("price")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              السعر
                              {sortBy === "price" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("quantitySold")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              الكمية المباعة
                              {sortBy === "quantitySold" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("totalRevenue")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              إجمالي الإيرادات
                              {sortBy === "totalRevenue" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("profit")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              الربح
                              {sortBy === "profit" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.products.map((product) => {
                          const categoryColor = getCategoryColor(
                            product.category,
                          );
                          const profitMargin =
                            (product.profit / product.totalRevenue) * 100;

                          return (
                            <tr
                              key={product.id}
                              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                              <td className="py-3 px-4 text-right">
                                <div className="font-medium text-gray-900">
                                  {product.name}
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
                                  {product.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="font-bold">
                                  {formatCurrency(product.price)} ج.م
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end">
                                  <div className="text-center">
                                    <div className="font-bold text-blue-900 text-lg">
                                      {product.quantitySold}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      وحدة
                                    </div>
                                  </div>
                                  <div className="w-1 h-10 bg-gray-200 mx-3"></div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium">
                                      {formatCurrency(
                                        product.price * product.quantitySold,
                                      )}{" "}
                                      ج.م
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      إجمالي
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div
                                  className="font-bold text-lg"
                                  style={{ color: "#193F94" }}
                                >
                                  {formatCurrency(product.totalRevenue)} ج.م
                                </div>
                                <div className="text-xs text-gray-500">
                                  {product.quantitySold > 0
                                    ? `${formatCurrency(product.totalRevenue / product.quantitySold)} ج.م/وحدة`
                                    : "لا توجد مبيعات"}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="font-bold text-green-700">
                                  {formatCurrency(product.profit)} ج.م
                                </div>
                                <div
                                  className={`text-xs ${profitMargin >= 50 ? "text-green-600" : profitMargin >= 30 ? "text-amber-600" : "text-red-600"}`}
                                >
                                  {profitMargin.toFixed(1)}% هامش ربح
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
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
                            {formatCurrency(reportData.stats.totalRevenue)} ج.م
                          </td>
                          <td className="py-4 px-4 text-right text-green-700">
                            {formatCurrency(reportData.stats.totalProfit)} ج.م
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* ملخص النتائج */}
                <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-5 border border-blue-200">
                  <h4
                    className="font-bold mb-4 text-gray-800"
                    style={{ color: "#193F94" }}
                  >
                    ملخص أداء المنتجات
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        {reportData.stats.topSellingProduct?.quantitySold || 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        أعلى كمية مبيعاً
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#F59E0B" }}
                      >
                        {reportData.stats.averageProfitMargin.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        متوسط هامش الربح
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  تقارير أداء المنتجات
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  اختر تاريخ البداية والنهاية لعرض تقرير أداء المنتجات
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
                    يمكنك فرز المنتجات حسب الأكثر مبيعاً أو الأعلى ربحاً
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
