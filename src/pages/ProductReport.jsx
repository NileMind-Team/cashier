import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

export default function ProductsReports() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

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
      const response = await axiosInstance.get("/api/Reports/ProductsReport", {
        params: {
          from: startDate,
          to: endDate,
        },
      });

      if (response.status === 200 && response.data) {
        const data = response.data;

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
          totalProducts: data.products?.length || 0,
          totalQuantitySold: data.totalQuantitySold || 0,
          totalRevenue: data.totalRevenue || 0,
          averageRevenuePerProduct:
            data.products?.length > 0
              ? (data.totalRevenue || 0) / data.products.length
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
        });

        toast.success(
          `تم إنشاء التقرير للفترة من ${formatArabicDate(startDate)} إلى ${formatArabicDate(endDate)} (${data.products?.length || 0} منتج)`,
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
                      التاريخ إلى
                    </span>
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    onClick={generateReport}
                    disabled={loading || !startDate || !endDate}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-md ${
                      loading || !startDate || !endDate
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    }`}
                    style={{
                      backgroundColor:
                        loading || !startDate || !endDate ? "" : "#193F94",
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
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
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
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
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
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
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

                <div className="mb-6">
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: "#193F94" }}
                  >
                    تفاصيل أداء المنتجات ({reportData.products.length} منتج)
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
                        {reportData.products.map((product) => {
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 