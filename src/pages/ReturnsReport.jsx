import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ReturnsReport() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [returnedBills, setReturnedBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("returnDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const returnedBillsData = [
    {
      id: 1,
      originalBillNumber: "F-2026-001",
      returnReference: "RET-2026-001",
      returnDate: "2026-01-15 16:30",
      originalBillDate: "2026-01-15 14:30",
      customerName: "أحمد محمد",
      customerPhone: "01123456789",
      employeeName: "محمد خالد",
      employeeId: "EMP-001",
      returnReason: "جودة المنتج غير جيدة",
      returnType: "full",
      refundAmount: 163.5,
      originalAmount: 163.5,
      returnedItems: [
        {
          id: 1,
          name: "قهوة تركية",
          quantity: 2,
          price: 15,
          reason: "طعم غير مقبول",
          total: 30,
        },
        {
          id: 2,
          name: "كرواسون",
          quantity: 1,
          price: 8,
          reason: "غير طازج",
          total: 8,
        },
      ],
      paymentMethod: "cash",
      refundStatus: "completed", // pending, completed, cancelled
      notes: "تم استرجاع المبلغ نقداً للعميل",
    },
    {
      id: 2,
      originalBillNumber: "F-2026-003",
      returnReference: "RET-2026-002",
      returnDate: "2026-01-15 18:45",
      originalBillDate: "2026-01-15 16:45",
      customerName: "محمد خالد",
      customerPhone: "01098765432",
      employeeName: "سارة علي",
      employeeId: "EMP-002",
      returnReason: "تأخير في التوصيل",
      returnType: "partial",
      refundAmount: 40.0,
      originalAmount: 155.8,
      returnedItems: [
        {
          id: 3,
          name: "برجر لحم",
          quantity: 1,
          price: 40,
          reason: "تأخير التوصيل",
          total: 40,
        },
      ],
      paymentMethod: "wallet",
      refundStatus: "completed",
      notes: "تم إرجاع المبلغ للمحفظة الإلكترونية",
    },
    {
      id: 3,
      originalBillNumber: "F-2026-005",
      returnReference: "RET-2026-003",
      returnDate: "2026-01-14 13:30",
      originalBillDate: "2026-01-14 12:45",
      customerName: "علي حسن",
      customerPhone: "01234567890",
      employeeName: "فاطمة أحمد",
      employeeId: "EMP-003",
      returnReason: "خطأ في الطلب",
      returnType: "full",
      refundAmount: 228.9,
      originalAmount: 228.9,
      returnedItems: [
        {
          id: 4,
          name: "بيتزا صغيرة",
          quantity: 2,
          price: 35,
          reason: "نوع مختلف عن المطلوب",
          total: 70,
        },
        {
          id: 5,
          name: "مشروب غازي",
          quantity: 3,
          price: 7,
          reason: "خطأ في الطلب",
          total: 21,
        },
      ],
      paymentMethod: "visa",
      refundStatus: "completed",
      notes: "تم إرجاع المبلغ للبطاقة الائتمانية",
    },
    {
      id: 4,
      originalBillNumber: "F-2026-008",
      returnReference: "RET-2026-004",
      returnDate: "2026-01-13 12:15",
      originalBillDate: "2026-01-12 11:30",
      customerName: "نورا سليم",
      customerPhone: "01187654321",
      employeeName: "خالد عمر",
      employeeId: "EMP-004",
      returnReason: "تلف المنتج",
      returnType: "partial",
      refundAmount: 28.0,
      originalAmount: 152.6,
      returnedItems: [
        {
          id: 6,
          name: "معكرونة",
          quantity: 1,
          price: 28,
          reason: "تلف في التغليف",
          total: 28,
        },
      ],
      paymentMethod: "cash",
      refundStatus: "completed",
      notes: "تم استبدال المنتج بآخر",
    },
    {
      id: 5,
      originalBillNumber: "F-2026-010",
      returnReference: "RET-2026-005",
      returnDate: "2026-01-16 15:20",
      originalBillDate: "2026-01-16 13:45",
      customerName: "ليلى محمود",
      customerPhone: "01011223344",
      employeeName: "سامي رامي",
      employeeId: "EMP-005",
      returnReason: "شكوى من العميل",
      returnType: "full",
      refundAmount: 237.55,
      originalAmount: 237.55,
      returnedItems: [
        {
          id: 7,
          name: "ستيك لحم",
          quantity: 1,
          price: 65,
          reason: "غير مطهو جيداً",
          total: 65,
        },
        {
          id: 8,
          name: "سلطة خضار",
          quantity: 1,
          price: 22,
          reason: "غير طازجة",
          total: 22,
        },
        {
          id: 9,
          name: "عصير مانجو",
          quantity: 2,
          price: 15,
          reason: "طعم غير جيد",
          total: 30,
        },
      ],
      paymentMethod: "wallet",
      refundStatus: "pending",
      notes: "قيد المراجعة من الإدارة",
    },
    {
      id: 6,
      originalBillNumber: "F-2026-012",
      returnReference: "RET-2026-006",
      returnDate: "2026-01-11 11:45",
      originalBillDate: "2026-01-10 20:30",
      customerName: "أحمد سعيد",
      customerPhone: "01122334455",
      employeeName: "محمد خالد",
      employeeId: "EMP-001",
      returnReason: "سعر غير مناسب",
      returnType: "full",
      refundAmount: 189.75,
      originalAmount: 189.75,
      returnedItems: [
        {
          id: 10,
          name: "سوشي",
          quantity: 2,
          price: 45,
          reason: "سعر مرتفع",
          total: 90,
        },
        {
          id: 11,
          name: "شاي أخضر",
          quantity: 1,
          price: 10,
          reason: "غير مناسب",
          total: 10,
        },
      ],
      paymentMethod: "cash",
      refundStatus: "completed",
      notes: "تم الاسترجاع بنجاح",
    },
    {
      id: 7,
      originalBillNumber: "F-2026-015",
      returnReference: "RET-2026-007",
      returnDate: "2026-01-10 19:30",
      originalBillDate: "2026-01-09 18:15",
      customerName: "ريم علي",
      customerPhone: "01299887766",
      employeeName: "سارة علي",
      employeeId: "EMP-002",
      returnReason: "تغيير رأي العميل",
      returnType: "partial",
      refundAmount: 65.0,
      originalAmount: 320.0,
      returnedItems: [
        {
          id: 12,
          name: "ستيك لحم",
          quantity: 1,
          price: 65,
          reason: "تغيير في الطلب",
          total: 65,
        },
      ],
      paymentMethod: "visa",
      refundStatus: "cancelled",
      notes: "تم رفض الإرجاع بعد التقييم",
    },
    {
      id: 8,
      originalBillNumber: "F-2026-018",
      returnReference: "RET-2026-008",
      returnDate: "2026-01-09 14:15",
      originalBillDate: "2026-01-08 19:45",
      customerName: "خالد وليد",
      customerPhone: "01055443322",
      employeeName: "فاطمة أحمد",
      employeeId: "EMP-003",
      returnReason: "جودة غير مرضية",
      returnType: "full",
      refundAmount: 152.0,
      originalAmount: 152.0,
      returnedItems: [
        {
          id: 13,
          name: "برجر لحم",
          quantity: 2,
          price: 40,
          reason: "جودة اللحم غير جيدة",
          total: 80,
        },
        {
          id: 14,
          name: "بطاطس مقلية",
          quantity: 1,
          price: 15,
          reason: "غير مقرمشة",
          total: 15,
        },
        {
          id: 15,
          name: "مشروب غازي",
          quantity: 2,
          price: 7,
          reason: "غير بارد",
          total: 14,
        },
      ],
      paymentMethod: "cash",
      refundStatus: "completed",
      notes: "تم تقديم تعويض إضافي للعميل",
    },
  ];

  const employees = [
    { id: "all", name: "جميع الموظفين" },
    { id: "EMP-001", name: "محمد خالد" },
    { id: "EMP-002", name: "سارة علي" },
    { id: "EMP-003", name: "فاطمة أحمد" },
    { id: "EMP-004", name: "خالد عمر" },
    { id: "EMP-005", name: "سامي رامي" },
  ];

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoFormatted = thirtyDaysAgo.toISOString().split("T")[0];

    setStartDate(thirtyDaysAgoFormatted);
    setEndDate(today);

    // تحميل البيانات الأولية
    loadReturnedBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReturnedBills = () => {
    setLoading(true);
    setTimeout(() => {
      const filteredData = filterBills(returnedBillsData);
      const sortedData = sortBills([...filteredData]);
      setReturnedBills(sortedData);
      setLoading(false);
      toast.success(`تم تحميل ${sortedData.length} فاتورة مرتجعة`);
    }, 800);
  };

  const filterBills = (bills) => {
    let filtered = [...bills];

    // فلترة حسب التاريخ
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter((bill) => {
        const returnDate = new Date(bill.returnDate);
        return returnDate >= start && returnDate <= end;
      });
    }

    // فلترة حسب البحث
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (bill) =>
          bill.originalBillNumber.toLowerCase().includes(term) ||
          bill.returnReference.toLowerCase().includes(term) ||
          bill.customerName.toLowerCase().includes(term) ||
          bill.employeeName.toLowerCase().includes(term) ||
          bill.returnReason.toLowerCase().includes(term),
      );
    }

    // فلترة حسب الموظف
    if (employeeFilter !== "all") {
      filtered = filtered.filter((bill) => bill.employeeId === employeeFilter);
    }

    return filtered;
  };

  const sortBills = (bills) => {
    return [...bills].sort((a, b) => {
      let aValue, bValue;

      if (sortBy === "originalBillNumber") {
        aValue = a.originalBillNumber;
        bValue = b.originalBillNumber;
      } else if (sortBy === "customerName") {
        aValue = a.customerName;
        bValue = b.customerName;
      } else if (sortBy === "employeeName") {
        aValue = a.employeeName;
        bValue = b.employeeName;
      } else if (sortBy === "refundAmount") {
        aValue = a.refundAmount;
        bValue = b.refundAmount;
      } else {
        // تاريخ الإرجاع
        aValue = new Date(a.returnDate);
        bValue = new Date(b.returnDate);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }

    const sortedData = sortBills([...returnedBills]);
    setReturnedBills(sortedData);
  };

  const handleSearch = () => {
    const filteredData = filterBills(returnedBillsData);
    const sortedData = sortBills([...filteredData]);
    setReturnedBills(sortedData);

    toast.success(`تم العثور على ${sortedData.length} نتيجة`);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-EG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getRefundStatusColor = (status) => {
    const colors = {
      completed: { bg: "#D1FAE5", text: "#065F46", label: "مكتمل" },
      pending: { bg: "#FEF3C7", text: "#92400E", label: "قيد المراجعة" },
      cancelled: { bg: "#FEE2E2", text: "#991B1B", label: "ملغي" },
    };
    return (
      colors[status] || { bg: "#F3F4F6", text: "#6B7280", label: "غير معروف" }
    );
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash: "💰",
      visa: "💳",
      wallet: "📱",
    };
    return icons[method] || "❓";
  };

  const getReturnTypeLabel = (type) => {
    return type === "full" ? "إرجاع كامل" : "إرجاع جزئي";
  };

  const calculateStats = () => {
    const totalReturns = returnedBills.length;
    const totalRefundAmount = returnedBills.reduce(
      (sum, bill) => sum + bill.refundAmount,
      0,
    );
    const totalOriginalAmount = returnedBills.reduce(
      (sum, bill) => sum + bill.originalAmount,
      0,
    );
    const avgRefundAmount =
      totalReturns > 0 ? totalRefundAmount / totalReturns : 0;
    const refundPercentage =
      totalOriginalAmount > 0
        ? (totalRefundAmount / totalOriginalAmount) * 100
        : 0;

    const statusCount = returnedBills.reduce((acc, bill) => {
      acc[bill.refundStatus] = (acc[bill.refundStatus] || 0) + 1;
      return acc;
    }, {});

    const typeCount = returnedBills.reduce((acc, bill) => {
      acc[bill.returnType] = (acc[bill.returnType] || 0) + 1;
      return acc;
    }, {});

    const employeeCount = returnedBills.reduce((acc, bill) => {
      acc[bill.employeeName] = (acc[bill.employeeName] || 0) + 1;
      return acc;
    }, {});

    const topEmployee = Object.entries(employeeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1);

    return {
      totalReturns,
      totalRefundAmount,
      totalOriginalAmount,
      avgRefundAmount,
      refundPercentage,
      statusCount,
      typeCount,
      employeeCount: Object.keys(employeeCount).length,
      topEmployee: topEmployee.length > 0 ? topEmployee[0] : null,
    };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => calculateStats(), [returnedBills]);

  const handleViewReturnDetails = (billId) => {
    const bill = returnedBills.find((b) => b.id === billId);

    if (!bill) return;

    const statusColor = getRefundStatusColor(bill.refundStatus);

    toast.info(
      <div className="text-right p-3 max-w-md">
        <h4 className="font-bold mb-3 text-lg" style={{ color: "#193F94" }}>
          تفاصيل الفاتورة المرتجعة
        </h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">رقم الفاتورة الأصلية:</span>
            <span className="font-medium">{bill.originalBillNumber}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">رقم المرجع:</span>
            <span className="font-medium">{bill.returnReference}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">تاريخ الإرجاع:</span>
            <span className="font-medium">{formatDate(bill.returnDate)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">نوع الإرجاع:</span>
            <span className="font-medium">
              {getReturnTypeLabel(bill.returnType)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">العميل:</span>
            <span className="font-medium">{bill.customerName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">الهاتف:</span>
            <span className="font-medium">{bill.customerPhone}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">الموظف المسؤول:</span>
            <span className="font-medium">
              {bill.employeeName} ({bill.employeeId})
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">سبب الإرجاع:</span>
            <span className="font-medium text-red-600">
              {bill.returnReason}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">حالة الإرجاع:</span>
            <span
              className="px-2 py-1 rounded-full text-xs"
              style={{
                backgroundColor: statusColor.bg,
                color: statusColor.text,
              }}
            >
              {statusColor.label}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">طريقة الاسترجاع:</span>
            <span className="font-medium">
              {getPaymentMethodIcon(bill.paymentMethod)}{" "}
              {bill.paymentMethod === "cash"
                ? "كاش"
                : bill.paymentMethod === "visa"
                  ? "فيزا"
                  : "محفظة"}
            </span>
          </div>

          {bill.notes && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-gray-600 mb-1">ملاحظات:</p>
              <p className="text-blue-600 text-sm">{bill.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t">
          <h5 className="font-bold mb-2">المنتجات المرتجعة:</h5>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {bill.returnedItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start text-sm bg-gray-50 p-2 rounded"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {item.name} × {item.quantity}
                  </p>
                  {item.reason && (
                    <p className="text-xs text-gray-500 mt-1">
                      السبب: {item.reason}
                    </p>
                  )}
                </div>
                <span className="font-bold">{item.total} ج.م</span>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex justify-between">
              <span>المبلغ الأصلي:</span>
              <span>{formatCurrency(bill.originalAmount)} ج.م</span>
            </div>
            <div className="flex justify-between">
              <span>المبلغ المرتجع:</span>
              <span className="font-bold text-red-600">
                {formatCurrency(bill.refundAmount)} ج.م
              </span>
            </div>
            <div className="flex justify-between">
              <span>نسبة الاسترجاع:</span>
              <span className="font-bold">
                {((bill.refundAmount / bill.originalAmount) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false },
    );
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
                نظام الكاشير - تقارير المرتجعات
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البحث
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث برقم الفاتورة أو العميل..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموظف المسؤول
                  </label>
                  <select
                    value={employeeFilter}
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  >
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 mb-3 ${
                      loading
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    style={{
                      backgroundColor: loading ? "" : "#193F94",
                    }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin ml-2"></div>
                        جاري التحميل...
                      </div>
                    ) : (
                      "بحث وتطبيق الفلترة"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-blue-600 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  جاري تحميل تقارير المرتجعات
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  يتم الآن تحميل الفواتير والمنتجات المرتجعة...
                </p>
              </div>
            ) : returnedBills.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
                {/* رأس التقرير */}
                <div className="flex justify-between items-start mb-6 print:flex-col print:items-start">
                  <div>
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: "#193F94" }}
                    >
                      تقرير المرتجعات
                    </h2>
                    <p className="text-gray-600 mt-1">
                      عرض الفواتير والمنتجات المرتجعة في النظام
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {returnedBills.length} فاتورة مرتجعة |{" "}
                      {stats.employeeCount} موظف
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                    <div className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                      {returnedBills.length} مرتجعة
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {formatCurrency(stats.totalRefundAmount)} ج.م
                    </div>
                  </div>
                </div>

                {/* بطاقات الإحصائيات الرئيسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 print:grid-cols-2">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-800">
                          الفواتير المرتجعة
                        </p>
                        <p className="text-2xl font-bold text-red-900 mt-1">
                          {stats.totalReturns}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          فاتورة مرتجعة
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                        <span className="text-red-700 font-bold">🔄</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">
                          إجمالي المبالغ المرتجعة
                        </p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {formatCurrency(stats.totalRefundAmount)} ج.م
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          نسبة الاسترجاع: {stats.refundPercentage.toFixed(1)}%
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-bold">💸</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-800">
                          متوسط المبلغ المرتجع
                        </p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {formatCurrency(stats.avgRefundAmount)} ج.م
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          لكل فاتورة مرتجعة
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                        <span className="text-purple-700 font-bold">📊</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-800">الموظف الأكثر</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {stats.topEmployee?.[0]?.substring(0, 8) ||
                            "غير محدد"}
                          ...
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {stats.topEmployee?.[1] || 0} فاتورة
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-bold">👤</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* تحليل المرتجعات */}
                <div className="mb-6">
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: "#193F94" }}
                  >
                    تحليل المرتجعات
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-bold mb-3 text-gray-800">
                        حسب نوع الإرجاع
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(stats.typeCount).map(
                          ([type, count]) => {
                            const percentage =
                              (count / stats.totalReturns) * 100;
                            const isFull = type === "full";
                            return (
                              <div key={type} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <div
                                      className={`w-3 h-3 rounded-full ml-2 ${isFull ? "bg-red-500" : "bg-amber-500"}`}
                                    ></div>
                                    <span className="text-sm">
                                      {isFull ? "إرجاع كامل" : "إرجاع جزئي"}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold">{count}</span>
                                    <span className="text-xs text-gray-500">
                                      ({percentage.toFixed(1)}%)
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="h-1.5 rounded-full"
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor: isFull
                                        ? "#EF4444"
                                        : "#F59E0B",
                                    }}
                                  ></div>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* جدول الفواتير المرتجعة */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className="text-lg font-bold"
                      style={{ color: "#193F94" }}
                    >
                      قائمة الفواتير المرتجعة ({returnedBills.length} فاتورة)
                    </h3>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                      <span className="text-sm text-gray-600">ترتيب حسب:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => handleSort(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                      >
                        <option value="returnDate">تاريخ الإرجاع</option>
                        <option value="originalBillNumber">رقم الفاتورة</option>
                        <option value="customerName">اسم العميل</option>
                        <option value="employeeName">الموظف</option>
                        <option value="refundAmount">المبلغ المرتجع</option>
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
                              onClick={() => handleSort("originalBillNumber")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              رقم الفاتورة
                              {sortBy === "originalBillNumber" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("returnDate")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              تاريخ الإرجاع
                              {sortBy === "returnDate" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("customerName")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              العميل
                              {sortBy === "customerName" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("employeeName")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              الموظف المسؤول
                              {sortBy === "employeeName" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            نوع الإرجاع
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("refundAmount")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              المبلغ المرتجع
                              {sortBy === "refundAmount" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700 print:hidden">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {returnedBills.map((bill) => {
                          const statusColor = getRefundStatusColor(
                            bill.refundStatus,
                          );

                          return (
                            <tr
                              key={bill.id}
                              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                              <td className="py-3 px-4 text-right">
                                <div className="space-y-1">
                                  <div className="font-medium text-blue-900">
                                    {bill.originalBillNumber}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    المرجع: {bill.returnReference}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="text-sm">
                                  {formatDate(bill.returnDate)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(bill.originalBillDate)}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="font-medium">
                                  {bill.customerName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {bill.customerPhone}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end">
                                  <div className="ml-3 text-right">
                                    <div className="font-medium">
                                      {bill.employeeName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {bill.employeeId}
                                    </div>
                                  </div>
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-300">
                                    <span className="text-gray-700 font-bold text-xs">
                                      👤
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex flex-col items-end">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium mb-1 ${
                                      bill.returnType === "full"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {getReturnTypeLabel(bill.returnType)}
                                  </span>
                                  <div className="flex items-center">
                                    <span className="text-xs text-gray-500 ml-1">
                                      {getPaymentMethodIcon(bill.paymentMethod)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {bill.paymentMethod === "cash"
                                        ? "كاش"
                                        : bill.paymentMethod === "visa"
                                          ? "فيزا"
                                          : "محفظة"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="font-bold text-red-600">
                                  {formatCurrency(bill.refundAmount)} ج.م
                                </div>
                                <div className="text-xs text-gray-500">
                                  من {formatCurrency(bill.originalAmount)} ج.م
                                </div>
                                <div
                                  className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${statusColor.bg}`}
                                  style={{ color: statusColor.text }}
                                >
                                  {statusColor.label}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right print:hidden">
                                <div className="flex space-x-2 rtl:space-x-reverse">
                                  <button
                                    onClick={() =>
                                      handleViewReturnDetails(bill.id)
                                    }
                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    التفاصيل
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-bold">
                          <td colSpan="5" className="py-4 px-4 text-right">
                            الإجمالي ({returnedBills.length} فاتورة):
                          </td>
                          <td className="py-4 px-4 text-right text-red-600">
                            {formatCurrency(stats.totalRefundAmount)} ج.م
                          </td>
                          <td className="print:hidden"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* ملخص النتائج */}
                <div className="bg-gradient-to-r from-red-50 to-white rounded-xl p-5 border border-red-200">
                  <h4
                    className="font-bold mb-4 text-gray-800"
                    style={{ color: "#193F94" }}
                  >
                    ملخص تقرير المرتجعات
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#193F94" }}
                      >
                        {returnedBills.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        عدد الفواتير المرتجعة
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#EF4444" }}
                      >
                        {formatCurrency(stats.totalRefundAmount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي المبالغ المرتجعة
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#8B5CF6" }}
                      >
                        {formatCurrency(stats.avgRefundAmount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        متوسط المبلغ المرتجع
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#F59E0B" }}
                      >
                        {stats.refundPercentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        نسبة الاسترجاع
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  لا توجد فواتير مرتجعة
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  لم يتم العثور على فواتير مرتجعة ضمن الفلترة المحددة. حاول
                  تغيير معايير البحث.
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    غير معايير البحث
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
