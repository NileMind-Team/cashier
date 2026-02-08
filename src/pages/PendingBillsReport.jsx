import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PendingBillsReport() {
  const navigate = useNavigate();
  const [pendingBills, setPendingBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // بيانات تجريبية للفواتير المعلقة
  const pendingBillsData = [
    {
      id: 1,
      billNumber: "F-2026-101",
      createdAt: "2026-01-15 14:30",
      createdBy: "أحمد محمد",
      employeeId: "EMP-001",
      status: "pending",
      customerName: "سارة علي",
      customerPhone: "01123456789",
      billType: "dinein",
      tableInfo: {
        hallName: "الصالة الرئيسية",
        tableNumber: "ط5",
      },
      subtotal: 265.75,
      tax: 37.21,
      discount: 13.29,
      deliveryFee: 0,
      total: 289.67,
      items: [
        { name: "قهوة تركية", quantity: 2, price: 15, note: "سكر متوسط" },
        { name: "كرواسون", quantity: 1, price: 8 },
        { name: "تشيز كيك", quantity: 2, price: 20 },
      ],
      generalNote: "الطاولة قريبة من النافذة",
      createdByImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 2,
      billNumber: "F-2026-102",
      createdAt: "2026-01-15 15:45",
      createdBy: "محمد خالد",
      employeeId: "EMP-002",
      status: "pending",
      customerName: "علي حسن",
      customerPhone: "01098765432",
      billType: "delivery",
      tableInfo: null,
      subtotal: 180.5,
      tax: 25.27,
      discount: 9.03,
      deliveryFee: 25,
      total: 221.74,
      items: [
        { name: "برجر لحم", quantity: 2, price: 40 },
        { name: "بطاطس مقلية", quantity: 1, price: 15 },
        { name: "مشروب غازي", quantity: 2, price: 7 },
      ],
      generalNote: "توصيل للمنزل - الطابق الثالث",
      createdByImage:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 3,
      billNumber: "F-2026-103",
      createdAt: "2026-01-14 12:15",
      createdBy: "فاطمة أحمد",
      employeeId: "EMP-003",
      status: "pending",
      customerName: "ريم سعد",
      customerPhone: "01234567890",
      billType: "takeaway",
      tableInfo: null,
      subtotal: 95.25,
      tax: 13.34,
      discount: 4.76,
      deliveryFee: 0,
      total: 103.83,
      items: [
        { name: "شاي أخضر", quantity: 1, price: 10, note: "بدون سكر" },
        { name: "دونات", quantity: 3, price: 10 },
        { name: "عصير برتقال", quantity: 1, price: 12 },
      ],
      generalNote: "العميل يفضل التغليف الحراري",
      createdByImage:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 4,
      billNumber: "F-2026-104",
      createdAt: "2026-01-14 19:30",
      createdBy: "خالد عمر",
      employeeId: "EMP-004",
      status: "pending",
      customerName: "نورا سليم",
      customerPhone: "01187654321",
      billType: "dinein",
      tableInfo: {
        hallName: "الصالة الخارجية",
        tableNumber: "ط12",
      },
      subtotal: 320.0,
      tax: 44.8,
      discount: 16.0,
      deliveryFee: 0,
      total: 348.8,
      items: [
        { name: "ستيك لحم", quantity: 1, price: 65 },
        { name: "سلطة خضار", quantity: 2, price: 22 },
        { name: "معكرونة", quantity: 1, price: 28 },
        { name: "آيس كريم", quantity: 2, price: 12 },
      ],
      generalNote: "العميل يحتفل بعيد ميلاده",
      createdByImage:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 5,
      billNumber: "F-2026-105",
      createdAt: "2026-01-13 11:20",
      createdBy: "سامي رامي",
      employeeId: "EMP-005",
      status: "pending",
      customerName: "ليلى محمود",
      customerPhone: "01011223344",
      billType: "takeaway",
      tableInfo: null,
      subtotal: 152.75,
      tax: 21.39,
      discount: 7.64,
      deliveryFee: 0,
      total: 166.5,
      items: [
        { name: "قهوة مثلجة", quantity: 2, price: 20 },
        { name: "ساندويتش جبنة", quantity: 1, price: 25 },
        { name: "كيك شوكولاتة", quantity: 1, price: 22 },
        { name: "عصير مانجو", quantity: 1, price: 15 },
      ],
      generalNote: "العميل يطلب فاتورة ضريبية",
      createdByImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 6,
      billNumber: "F-2026-106",
      createdAt: "2026-01-13 16:45",
      createdBy: "أحمد محمد",
      employeeId: "EMP-001",
      status: "pending",
      customerName: "محمد خالد",
      customerPhone: "01199887766",
      billType: "dinein",
      tableInfo: {
        hallName: "الصالة VIP",
        tableNumber: "ط16",
      },
      subtotal: 210.5,
      tax: 29.47,
      discount: 10.53,
      deliveryFee: 0,
      total: 229.44,
      items: [
        { name: "سوشي", quantity: 2, price: 45 },
        { name: "شاي أخضر", quantity: 1, price: 10 },
        { name: "كابتشينو", quantity: 2, price: 18 },
        { name: "كرواسون", quantity: 2, price: 8 },
      ],
      generalNote: "اجتماع عمل - يحتاج انترنت سريع",
      createdByImage:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 7,
      billNumber: "F-2026-107",
      createdAt: "2026-01-12 14:10",
      createdBy: "فاطمة أحمد",
      employeeId: "EMP-003",
      status: "pending",
      customerName: "علي حسن",
      customerPhone: "01233445566",
      billType: "delivery",
      tableInfo: null,
      subtotal: 185.25,
      tax: 25.94,
      discount: 9.26,
      deliveryFee: 25,
      total: 226.93,
      items: [
        { name: "بيتزا صغيرة", quantity: 3, price: 35 },
        { name: "سلطة خضار", quantity: 1, price: 22 },
        { name: "مشروب غازي", quantity: 4, price: 7 },
      ],
      generalNote: "التوصيل قبل الساعة 8 مساءً",
      createdByImage:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const sortedData = sortBills([...pendingBillsData]);
      setPendingBills(sortedData);
      setLoading(false);
      toast.success(`تم تحميل ${sortedData.length} فاتورة معلقة`);
    }, 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortBills = (bills) => {
    return [...bills].sort((a, b) => {
      let aValue, bValue;

      if (sortBy === "billNumber") {
        aValue = a.billNumber;
        bValue = b.billNumber;
      } else if (sortBy === "total") {
        aValue = a.total;
        bValue = b.total;
      } else if (sortBy === "createdBy") {
        aValue = a.createdBy;
        bValue = b.createdBy;
      } else {
        // تاريخ الإنشاء
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
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

    const sortedData = sortBills([...pendingBills]);
    setPendingBills(sortedData);
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

  const calculateStats = () => {
    const totalPendingAmount = pendingBills.reduce(
      (sum, bill) => sum + bill.total,
      0,
    );
    const averageBillAmount =
      pendingBills.length > 0 ? totalPendingAmount / pendingBills.length : 0;

    const billTypeCount = pendingBills.reduce((acc, bill) => {
      acc[bill.billType] = (acc[bill.billType] || 0) + 1;
      return acc;
    }, {});

    const employeeCount = pendingBills.reduce((acc, bill) => {
      acc[bill.createdBy] = (acc[bill.createdBy] || 0) + 1;
      return acc;
    }, {});

    const topEmployee =
      Object.entries(employeeCount).sort((a, b) => b[1] - a[1])[0] || null;

    return {
      totalCount: pendingBills.length,
      totalAmount: totalPendingAmount,
      averageAmount: averageBillAmount,
      billTypeCount,
      topEmployee: topEmployee
        ? { name: topEmployee[0], count: topEmployee[1] }
        : null,
      employeeCount: Object.keys(employeeCount).length,
    };
  };

  const handleResumeBill = (billId) => {
    const bill = pendingBills.find((b) => b.id === billId);

    toast.info(
      <div className="text-right p-3">
        <p className="font-bold mb-2">استئناف الفاتورة {bill?.billNumber}</p>
        <p className="text-sm text-gray-600 mb-3">
          هل تريد استئناف هذه الفاتورة والانتقال لصفحة البيع؟
        </p>
        <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-3">
          <button
            onClick={() => {
              toast.dismiss();
              toast.success(`جارٍ استئناف الفاتورة ${bill?.billNumber}...`);
              // في التطبيق الحقيقي، هنا سيتم توجيه المستخدم لصفحة البيع مع تحميل الفاتورة
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            نعم، استئناف
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            إلغاء
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      },
    );
  };

  const handleViewBillDetails = (billId) => {
    const bill = pendingBills.find((b) => b.id === billId);

    if (!bill) return;

    const billType = getBillTypeLabel(bill.billType);

    toast.info(
      <div className="text-right p-3 max-w-md">
        <h4 className="font-bold mb-3 text-lg" style={{ color: "#193F94" }}>
          تفاصيل الفاتورة {bill.billNumber}
        </h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">الموظف:</span>
            <span className="font-medium">{bill.createdBy}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">تاريخ الإنشاء:</span>
            <span className="font-medium">{formatDate(bill.createdAt)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">نوع الفاتورة:</span>
            <span className="font-medium">{billType.label}</span>
          </div>

          {bill.tableInfo && (
            <div className="flex justify-between">
              <span className="text-gray-600">الطاولة:</span>
              <span className="font-medium">
                {bill.tableInfo.tableNumber} ({bill.tableInfo.hallName})
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">العميل:</span>
            <span className="font-medium">
              {bill.customerName || "غير محدد"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">الهاتف:</span>
            <span className="font-medium">
              {bill.customerPhone || "غير محدد"}
            </span>
          </div>

          {bill.generalNote && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-gray-600 mb-1">ملاحظة عامة:</p>
              <p className="text-blue-600 text-sm">{bill.generalNote}</p>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t">
          <h5 className="font-bold mb-2">المنتجات:</h5>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {bill.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start text-sm"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {item.name} × {item.quantity}
                  </p>
                  {item.note && (
                    <p className="text-xs text-gray-500">ملاحظة: {item.note}</p>
                  )}
                </div>
                <span className="font-bold">
                  {item.price * item.quantity} ج.م
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex justify-between">
              <span>المجموع الفرعي:</span>
              <span>{formatCurrency(bill.subtotal)} ج.م</span>
            </div>
            <div className="flex justify-between">
              <span>الضريبة:</span>
              <span>{formatCurrency(bill.tax)} ج.م</span>
            </div>
            <div className="flex justify-between">
              <span>الخصم:</span>
              <span>{formatCurrency(bill.discount)} ج.م</span>
            </div>
            {bill.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>رسوم التوصيل:</span>
                <span>{formatCurrency(bill.deliveryFee)} ج.م</span>
              </div>
            )}
            <div className="flex justify-between font-bold mt-2 pt-2 border-t">
              <span>الإجمالي:</span>
              <span>{formatCurrency(bill.total)} ج.م</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-4">
          <button
            onClick={() => {
              toast.dismiss();
              handleResumeBill(bill.id);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            استئناف الفاتورة
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false },
    );
  };

  const stats = calculateStats();

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
                نظام الكاشير - الفواتير المعلقة
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
          {/* اللوحة الجانبية للإحصائيات */}
          <div className="lg:col-span-1 print:hidden">
            <div className="bg-white rounded-2xl shadow-lg p-5 sticky top-6">
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: "#193F94" }}
              >
                إحصائيات الفواتير المعلقة
              </h3>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-800">عدد الفواتير</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {stats.totalCount}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">فاتورة معلقة</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-bold">📋</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-800">إجمالي المبالغ</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">
                        {formatCurrency(stats.totalAmount)} ج.م
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        متوسط الفاتورة: {formatCurrency(stats.averageAmount)}{" "}
                        ج.م
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                      <span className="text-green-700 font-bold">💰</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-800">عدد الموظفين</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        {stats.employeeCount}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">موظف</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                      <span className="text-purple-700 font-bold">👥</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-800">أكثر الموظفين</p>
                      <p className="text-2xl font-bold text-amber-900 mt-1">
                        {stats.topEmployee?.name.substring(0, 8) || "غير محدد"}
                        ...
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        {stats.topEmployee?.count || 0} فاتورة
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                      <span className="text-amber-700 font-bold">👑</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-gray-700">
                      توزيع حسب النوع
                    </h4>
                    {Object.entries(stats.billTypeCount).map(
                      ([type, count]) => {
                        const billType = getBillTypeLabel(type);
                        const percentage = (count / stats.totalCount) * 100;
                        return (
                          <div key={type} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span style={{ color: billType.color }}>
                                {billType.label}
                              </span>
                              <span>
                                {count} فاتورة ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: billType.color,
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
          </div>

          {/* منطقة عرض الفواتير */}
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
                  جاري تحميل الفواتير المعلقة
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  يتم الآن تحميل قائمة الفواتير غير المكتملة...
                </p>
              </div>
            ) : pendingBills.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
                {/* رأس التقرير */}
                <div className="flex justify-between items-start mb-6 print:flex-col print:items-start">
                  <div>
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: "#193F94" }}
                    >
                      الفواتير المعلقة
                    </h2>
                    <p className="text-gray-600 mt-1">
                      عرض الفواتير غير المكتملة في النظام
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {pendingBills.length} فاتورة معلقة | {stats.employeeCount}{" "}
                      موظف
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                    <div className="px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">
                      {pendingBills.length} معلقة
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {formatCurrency(stats.totalAmount)} ج.م
                    </div>
                  </div>
                </div>

                {/* بطاقات الإحصائيات الرئيسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 print:grid-cols-2">
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-800">
                          الفواتير المعلقة
                        </p>
                        <p className="text-2xl font-bold text-amber-900 mt-1">
                          {stats.totalCount}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          فاتورة غير مكتملة
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                        <span className="text-amber-700 font-bold">⏸️</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">
                          القيمة الإجمالية
                        </p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {formatCurrency(stats.totalAmount)} ج.م
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          إجمالي المبالغ المعلقة
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-bold">💵</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-800">
                          متوسط الفاتورة
                        </p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {formatCurrency(stats.averageAmount)} ج.م
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          لكل فاتورة معلقة
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
                          {stats.topEmployee?.name.substring(0, 8) ||
                            "غير محدد"}
                          ...
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {stats.topEmployee?.count || 0} فاتورة
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-bold">🏆</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* جدول الفواتير المعلقة */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className="text-lg font-bold"
                      style={{ color: "#193F94" }}
                    >
                      قائمة الفواتير المعلقة ({pendingBills.length} فاتورة)
                    </h3>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                      <span className="text-sm text-gray-600">ترتيب حسب:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => handleSort(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                      >
                        <option value="date">تاريخ الإنشاء</option>
                        <option value="billNumber">رقم الفاتورة</option>
                        <option value="total">المبلغ الإجمالي</option>
                        <option value="createdBy">الموظف</option>
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
                              تاريخ الإنشاء
                              {sortBy === "date" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("createdBy")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              الموظف
                              {sortBy === "createdBy" && (
                                <span className="mr-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            نوع الفاتورة
                          </th>
                          <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("total")}
                              className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                            >
                              المبلغ الإجمالي
                              {sortBy === "total" && (
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
                        {pendingBills.map((bill) => {
                          const billType = getBillTypeLabel(bill.billType);

                          return (
                            <tr
                              key={bill.id}
                              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                              <td className="py-3 px-4 text-right">
                                <div className="font-medium text-blue-900">
                                  {bill.billNumber}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {bill.customerName || "عميل"}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="text-sm">
                                  {formatDate(bill.createdAt)}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end">
                                  <div className="ml-3 text-right">
                                    <div className="font-medium">
                                      {bill.createdBy}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {bill.employeeId}
                                    </div>
                                  </div>
                                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                                    <img
                                      src={bill.createdByImage}
                                      alt={bill.createdBy}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex flex-col items-end">
                                  <span
                                    className="px-3 py-1 rounded-full text-xs font-medium mb-1"
                                    style={{
                                      backgroundColor: billType.bgColor,
                                      color: billType.color,
                                    }}
                                  >
                                    {billType.label}
                                  </span>
                                  {bill.tableInfo && (
                                    <div className="text-xs text-gray-500">
                                      {bill.tableInfo.tableNumber}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div
                                  className="font-bold"
                                  style={{ color: "#193F94" }}
                                >
                                  {formatCurrency(bill.total)} ج.م
                                </div>
                                <div className="text-xs text-gray-500">
                                  {bill.items.length} منتج
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right print:hidden">
                                <div className="flex space-x-2 rtl:space-x-reverse">
                                  <button
                                    onClick={() =>
                                      handleViewBillDetails(bill.id)
                                    }
                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    التفاصيل
                                  </button>
                                  <button
                                    onClick={() => handleResumeBill(bill.id)}
                                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    استئناف
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-bold">
                          <td colSpan="4" className="py-4 px-4 text-right">
                            الإجمالي ({pendingBills.length} فاتورة):
                          </td>
                          <td
                            className="py-4 px-4 text-right"
                            style={{ color: "#193F94" }}
                          >
                            {formatCurrency(stats.totalAmount)} ج.م
                          </td>
                          <td className="print:hidden"></td>
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
                    ملخص الفواتير المعلقة
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#193F94" }}
                      >
                        {pendingBills.length}
                      </div>
                      <div className="text-sm text-gray-600">عدد الفواتير</div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#10B981" }}
                      >
                        {formatCurrency(stats.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي المبالغ
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#8B5CF6" }}
                      >
                        {formatCurrency(stats.averageAmount)}
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
                        {stats.employeeCount}
                      </div>
                      <div className="text-sm text-gray-600">عدد الموظفين</div>
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
                  لا توجد فواتير معلقة
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  جميع الفواتير مكتملة حالياً. الفواتير المعلقة تظهر هنا عند ترك
                  فاتورة غير مكتملة.
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
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    لا توجد فواتير معلقة
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
