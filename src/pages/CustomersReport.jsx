import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CustomersReports() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("totalSpent");
  const [sortOrder, setSortOrder] = useState("desc");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [searchMode, setSearchMode] = useState("select");

  const customersData = useMemo(
    () => [
      {
        id: "cust_001",
        name: "أحمد محمد",
        phone: "01012345678",
        email: "ahmed@example.com",
        joinDate: "2026-11-15",
        totalSpent: 25640.75,
        totalBills: 42,
        pendingAmount: 1250.5,
        bills: [
          { id: "bill_001", date: "2026-01-15", amount: 163.5, status: "paid" },
          {
            id: "bill_002",
            date: "2026-01-14",
            amount: 285.75,
            status: "paid",
          },
          {
            id: "bill_003",
            date: "2026-01-10",
            amount: 452.0,
            status: "pending",
          },
          {
            id: "bill_004",
            date: "2026-01-05",
            amount: 320.25,
            status: "paid",
          },
          {
            id: "bill_005",
            date: "2026-12-28",
            amount: 1250.5,
            status: "pending",
          },
        ],
      },
      {
        id: "cust_002",
        name: "سارة علي",
        phone: "01123456789",
        email: "sara@example.com",
        joinDate: "2026-10-20",
        totalSpent: 18950.25,
        totalBills: 36,
        pendingAmount: 0,
        bills: [
          { id: "bill_006", date: "2026-01-16", amount: 92.65, status: "paid" },
          { id: "bill_007", date: "2026-01-12", amount: 185.3, status: "paid" },
          {
            id: "bill_008",
            date: "2026-01-08",
            amount: 320.75,
            status: "paid",
          },
          { id: "bill_009", date: "2026-12-15", amount: 452.8, status: "paid" },
        ],
      },
      {
        id: "cust_003",
        name: "محمد خالد",
        phone: "01234567890",
        email: "mohamed@example.com",
        joinDate: "2026-12-05",
        totalSpent: 15478.54,
        totalBills: 29,
        pendingAmount: 850.25,
        bills: [
          { id: "bill_010", date: "2026-01-15", amount: 155.8, status: "paid" },
          {
            id: "bill_011",
            date: "2026-01-13",
            amount: 850.25,
            status: "pending",
          },
          { id: "bill_012", date: "2026-01-07", amount: 285.6, status: "paid" },
          {
            id: "bill_013",
            date: "2026-12-25",
            amount: 325.75,
            status: "paid",
          },
        ],
      },
      {
        id: "cust_004",
        name: "فاطمة أحمد",
        phone: "01098765432",
        email: "fatma@example.com",
        joinDate: "2026-09-12",
        totalSpent: 32015.8,
        totalBills: 58,
        pendingAmount: 2100.75,
        bills: [
          { id: "bill_014", date: "2026-01-14", amount: 70.85, status: "paid" },
          {
            id: "bill_015",
            date: "2026-01-11",
            amount: 2100.75,
            status: "pending",
          },
          {
            id: "bill_016",
            date: "2026-01-05",
            amount: 185.25,
            status: "paid",
          },
          { id: "bill_017", date: "2026-12-20", amount: 452.9, status: "paid" },
          { id: "bill_018", date: "2026-12-10", amount: 325.6, status: "paid" },
        ],
      },
      {
        id: "cust_005",
        name: "علي حسن",
        phone: "01187654321",
        email: "ali@example.com",
        joinDate: "2026-08-30",
        totalSpent: 15420.35,
        totalBills: 31,
        pendingAmount: 625.0,
        bills: [
          { id: "bill_019", date: "2026-01-14", amount: 228.9, status: "paid" },
          {
            id: "bill_020",
            date: "2026-01-10",
            amount: 625.0,
            status: "pending",
          },
          {
            id: "bill_021",
            date: "2026-01-03",
            amount: 185.45,
            status: "paid",
          },
          {
            id: "bill_022",
            date: "2026-12-22",
            amount: 320.15,
            status: "paid",
          },
        ],
      },
      {
        id: "cust_006",
        name: "ريم سعد",
        phone: "01276543210",
        email: "reem@example.com",
        joinDate: "2026-11-25",
        totalSpent: 10235.4,
        totalBills: 24,
        pendingAmount: 0,
        bills: [
          { id: "bill_023", date: "2026-01-13", amount: 221.2, status: "paid" },
          {
            id: "bill_024",
            date: "2026-01-09",
            amount: 185.75,
            status: "paid",
          },
          { id: "bill_025", date: "2026-01-02", amount: 125.3, status: "paid" },
        ],
      },
      {
        id: "cust_007",
        name: "خالد عمر",
        phone: "01065432109",
        email: "khaled@example.com",
        joinDate: "2026-10-15",
        totalSpent: 18765.85,
        totalBills: 38,
        pendingAmount: 1550.0,
        bills: [
          {
            id: "bill_026",
            date: "2026-01-13",
            amount: 103.55,
            status: "paid",
          },
          {
            id: "bill_027",
            date: "2026-01-08",
            amount: 1550.0,
            status: "pending",
          },
          { id: "bill_028", date: "2026-01-04", amount: 285.3, status: "paid" },
          { id: "bill_029", date: "2026-12-18", amount: 452.5, status: "paid" },
        ],
      },
      {
        id: "cust_008",
        name: "نورا سليم",
        phone: "01154321098",
        email: "nora@example.com",
        joinDate: "2026-12-18",
        totalSpent: 8750.6,
        totalBills: 19,
        pendingAmount: 325.75,
        bills: [
          { id: "bill_030", date: "2026-01-12", amount: 152.6, status: "paid" },
          {
            id: "bill_031",
            date: "2026-01-07",
            amount: 325.75,
            status: "pending",
          },
          {
            id: "bill_032",
            date: "2026-01-01",
            amount: 185.25,
            status: "paid",
          },
        ],
      },
      {
        id: "cust_009",
        name: "سامي رامي",
        phone: "01243210987",
        email: "sami@example.com",
        joinDate: "2026-01-05",
        totalSpent: 5175.8,
        totalBills: 12,
        pendingAmount: 850.0,
        bills: [
          { id: "bill_033", date: "2026-01-16", amount: 81.75, status: "paid" },
          {
            id: "bill_034",
            date: "2026-01-14",
            amount: 850.0,
            status: "pending",
          },
          {
            id: "bill_035",
            date: "2026-01-09",
            amount: 125.05,
            status: "paid",
          },
        ],
      },
      {
        id: "cust_010",
        name: "ليلى محمود",
        phone: "01032109876",
        email: "layla@example.com",
        joinDate: "2026-09-28",
        totalSpent: 24150.35,
        totalBills: 46,
        pendingAmount: 0,
        bills: [
          {
            id: "bill_036",
            date: "2026-01-16",
            amount: 237.55,
            status: "paid",
          },
          { id: "bill_037", date: "2026-01-13", amount: 185.8, status: "paid" },
          {
            id: "bill_038",
            date: "2026-01-08",
            amount: 325.25,
            status: "paid",
          },
          {
            id: "bill_039",
            date: "2026-12-28",
            amount: 452.75,
            status: "paid",
          },
        ],
      },
    ],
    [],
  );

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoFormatted = thirtyDaysAgo.toISOString().split("T")[0];

    setStartDate(thirtyDaysAgoFormatted);
    setEndDate(today);
    setCustomers(customersData);
    setFilteredCustomers(customersData);
    if (customersData.length > 0) {
      setSelectedCustomer(customersData[0].id);
    }
  }, [customersData]);

  const handlePhoneSearch = () => {
    if (!phoneSearch.trim()) {
      setFilteredCustomers(customersData);
      setSearchMode("select");
      toast.info("تم عرض جميع العملاء");
      return;
    }

    const searchTerm = phoneSearch.replace(/\D/g, "");

    if (searchTerm.length < 3) {
      toast.error("يرجى إدخال 3 أرقام على الأقل للبحث");
      return;
    }

    const results = customersData.filter((customer) =>
      customer.phone.includes(searchTerm),
    );

    if (results.length === 0) {
      toast.error(`لم يتم العثور على عميل برقم التليفون ${phoneSearch}`);
      setFilteredCustomers([]);
    } else if (results.length === 1) {
      const customer = results[0];
      setSelectedCustomer(customer.id);
      setPhoneSearch(customer.phone);
      toast.success(`تم العثور على ${customer.name}`);
      setFilteredCustomers(results);
      setSearchMode("search");
    } else {
      setFilteredCustomers(results);
      setSearchMode("search");
      toast.success(`تم العثور على ${results.length} عميل`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePhoneSearch();
    }
  };

  const clearSearch = () => {
    setPhoneSearch("");
    setFilteredCustomers(customersData);
    setSearchMode("select");
    if (customersData.length > 0) {
      setSelectedCustomer(customersData[0].id);
    }
  };

  const generateReport = () => {
    if (!startDate || !endDate) {
      toast.error("يرجى اختيار تاريخ البداية والنهاية");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
      return;
    }

    if (selectedCustomer === "" || selectedCustomer === "all") {
      setLoading(true);
    } else {
      const customerExists = filteredCustomers.find(
        (c) => c.id === selectedCustomer,
      );
      if (!customerExists) {
        toast.error("العميل المحدد غير موجود في نتائج البحث");
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      let filteredData;

      if (selectedCustomer === "all") {
        filteredData = filteredCustomers
          .map((customer) => {
            const filteredBills = customer.bills.filter((bill) => {
              const billDate = new Date(bill.date);
              return billDate >= start && billDate <= end;
            });

            const totalSpentInPeriod = filteredBills.reduce(
              (sum, bill) => sum + bill.amount,
              0,
            );
            const pendingAmountInPeriod = filteredBills
              .filter((bill) => bill.status === "pending")
              .reduce((sum, bill) => sum + bill.amount, 0);

            return {
              ...customer,
              filteredBills,
              totalSpentInPeriod,
              pendingAmountInPeriod,
              billsCountInPeriod: filteredBills.length,
            };
          })
          .filter((customer) => customer.billsCountInPeriod > 0);
      } else {
        const customer = filteredCustomers.find(
          (c) => c.id === selectedCustomer,
        );
        if (!customer) {
          toast.error("لم يتم العثور على بيانات العميل");
          setLoading(false);
          return;
        }

        const filteredBills = customer.bills.filter((bill) => {
          const billDate = new Date(bill.date);
          return billDate >= start && billDate <= end;
        });

        const totalSpentInPeriod = filteredBills.reduce(
          (sum, bill) => sum + bill.amount,
          0,
        );
        const pendingAmountInPeriod = filteredBills
          .filter((bill) => bill.status === "pending")
          .reduce((sum, bill) => sum + bill.amount, 0);

        filteredData = [
          {
            ...customer,
            filteredBills,
            totalSpentInPeriod,
            pendingAmountInPeriod,
            billsCountInPeriod: filteredBills.length,
          },
        ];
      }

      const sortedData = [...filteredData].sort((a, b) => {
        let aValue, bValue;

        if (sortBy === "name") {
          aValue = a.name;
          bValue = b.name;
        } else if (sortBy === "totalBills") {
          aValue = a.totalBills;
          bValue = b.totalBills;
        } else if (sortBy === "totalSpent") {
          aValue = a.totalSpent;
          bValue = b.totalSpent;
        } else if (sortBy === "pendingAmount") {
          aValue = a.pendingAmount;
          bValue = b.pendingAmount;
        } else {
          aValue =
            selectedCustomer === "all" ? a.totalSpentInPeriod : a.totalSpent;
          bValue =
            selectedCustomer === "all" ? b.totalSpentInPeriod : b.totalSpent;
        }

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      const stats = {
        totalCustomers: sortedData.length,
        totalSpentAll: sortedData.reduce(
          (sum, customer) =>
            sum +
            (selectedCustomer === "all"
              ? customer.totalSpentInPeriod
              : customer.totalSpent),
          0,
        ),
        totalBillsAll: sortedData.reduce(
          (sum, customer) =>
            sum +
            (selectedCustomer === "all"
              ? customer.billsCountInPeriod
              : customer.totalBills),
          0,
        ),
        totalPendingAll: sortedData.reduce(
          (sum, customer) =>
            sum +
            (selectedCustomer === "all"
              ? customer.pendingAmountInPeriod
              : customer.pendingAmount),
          0,
        ),
        averageSpentPerCustomer:
          sortedData.length > 0
            ? sortedData.reduce(
                (sum, customer) =>
                  sum +
                  (selectedCustomer === "all"
                    ? customer.totalSpentInPeriod
                    : customer.totalSpent),
                0,
              ) / sortedData.length
            : 0,
        topSpender:
          sortedData.length > 0
            ? sortedData.reduce((max, customer) =>
                (selectedCustomer === "all"
                  ? customer.totalSpentInPeriod
                  : customer.totalSpent) >
                (selectedCustomer === "all"
                  ? max.totalSpentInPeriod
                  : max.totalSpent)
                  ? customer
                  : max,
              )
            : null,
        customersWithPending: sortedData.filter(
          (customer) =>
            (selectedCustomer === "all"
              ? customer.pendingAmountInPeriod
              : customer.pendingAmount) > 0,
        ).length,
      };

      setReportData({
        customers: sortedData,
        stats: stats,
        dateRange: {
          start: formatArabicDate(startDate),
          end: formatArabicDate(endDate),
          startDate: startDate,
          endDate: endDate,
        },
        selectedCustomer:
          selectedCustomer === "all"
            ? "جميع العملاء"
            : filteredCustomers.find((c) => c.id === selectedCustomer)?.name ||
              "عميل محدد",
      });

      setLoading(false);
      toast.success(
        selectedCustomer === "all"
          ? `تم إنشاء التقرير لـ ${sortedData.length} عميل`
          : `تم إنشاء تقرير ${filteredCustomers.find((c) => c.id === selectedCustomer)?.name}`,
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

  const formatDetailedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      weekday: "short",
      year: "numeric",
      month: "short",
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

  const getStatusColor = (status) => {
    return status === "paid"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getStatusLabel = (status) => {
    return status === "paid" ? "مدفوعة" : "معلقة";
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
                نظام الكاشير - تقارير العملاء
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
                    <span className="flex items-center">
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      بحث برقم التليفون
                    </span>
                  </label>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <input
                      type="text"
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="أدخل رقم التليفون..."
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    />
                    <button
                      onClick={handlePhoneSearch}
                      className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                    </button>
                  </div>
                  {phoneSearch && (
                    <div className="flex justify-between items-center mt-1">
                      <button
                        onClick={clearSearch}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        مسح البحث
                      </button>
                      <span className="text-xs text-gray-500">
                        {searchMode === "search" ? "وضع البحث" : "وضع الاختيار"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اختيار العميل
                    {searchMode === "search" && (
                      <span className="text-xs text-green-600 mr-2">
                        ({filteredCustomers.length} نتيجة)
                      </span>
                    )}
                  </label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    disabled={filteredCustomers.length === 0}
                  >
                    <option value="all">جميع العملاء</option>
                    {filteredCustomers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                  {filteredCustomers.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      لا توجد عملاء متطابقين مع البحث
                    </p>
                  )}
                </div>

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
                    disabled={
                      loading ||
                      !startDate ||
                      !endDate ||
                      filteredCustomers.length === 0
                    }
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 mb-3 ${
                      loading ||
                      !startDate ||
                      !endDate ||
                      filteredCustomers.length === 0
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    style={{
                      backgroundColor:
                        loading ||
                        !startDate ||
                        !endDate ||
                        filteredCustomers.length === 0
                          ? ""
                          : "#193F94",
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
                      تقرير العملاء - {reportData.selectedCustomer}
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
                      {reportData.stats.totalCustomers} عميل |{" "}
                      {reportData.stats.totalBillsAll} فاتورة
                      {searchMode === "search" && (
                        <span className="mr-2 text-blue-600">
                          • بحث برقم التليفون
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {reportData.stats.totalCustomers} عميل
                    </div>
                    {reportData.stats.customersWithPending > 0 && (
                      <div className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                        {reportData.stats.customersWithPending} عميل عليه
                        مدفوعات
                      </div>
                    )}
                    {searchMode === "search" && (
                      <div className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                        بحث
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 print:grid-cols-2">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">
                          إجمالي المشتريات
                        </p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {formatCurrency(reportData.stats.totalSpentAll)} ج.م
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          متوسط/عميل:{" "}
                          {formatCurrency(
                            reportData.stats.averageSpentPerCustomer,
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
                          إجمالي الفواتير
                        </p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {reportData.stats.totalBillsAll}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {reportData.stats.totalCustomers > 0
                            ? (
                                reportData.stats.totalBillsAll /
                                reportData.stats.totalCustomers
                              ).toFixed(1)
                            : 0}{" "}
                          فاتورة/عميل
                        </p>
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
                          إجمالي المديونيات
                        </p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {formatCurrency(reportData.stats.totalPendingAll)} ج.م
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          {reportData.stats.customersWithPending} عميل عليه
                          مدفوعات
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                        <span className="text-purple-700 font-bold">⚠️</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-800">أعلى إنفاق</p>
                        <p className="text-2xl font-bold text-amber-900 mt-1">
                          {reportData.stats.topSpender?.name.substring(0, 10)}
                          ...
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          {formatCurrency(
                            selectedCustomer === "all"
                              ? reportData.stats.topSpender?.totalSpentInPeriod
                              : reportData.stats.topSpender?.totalSpent,
                          )}{" "}
                          ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                        <span className="text-amber-700 font-bold">👑</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCustomer !== "all" &&
                  reportData.customers.length > 0 && (
                    <div className="mb-6">
                      <h3
                        className="text-lg font-bold mb-4"
                        style={{ color: "#193F94" }}
                      >
                        تفاصيل العميل
                      </h3>
                      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center mb-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ml-2">
                                <span className="text-blue-700 font-bold">
                                  👤
                                </span>
                              </div>
                              <div>
                                <p className="font-bold text-lg">
                                  {reportData.customers[0].name}
                                </p>
                                <p className="text-sm text-gray-600">العميل</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">الهاتف:</span>
                                <span className="font-medium">
                                  {reportData.customers[0].phone}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  تاريخ الانضمام:
                                </span>
                                <span className="font-medium">
                                  {formatArabicDate(
                                    reportData.customers[0].joinDate,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-bold mb-3 text-gray-800">
                              إحصائيات الفترة
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                  المشتريات في الفترة:
                                </span>
                                <span className="font-bold text-blue-700">
                                  {formatCurrency(
                                    reportData.customers[0].totalSpentInPeriod,
                                  )}{" "}
                                  ج.م
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                  عدد الفواتير:
                                </span>
                                <span className="font-bold">
                                  {reportData.customers[0].billsCountInPeriod}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`rounded-lg p-4 border ${
                              reportData.customers[0].pendingAmountInPeriod > 0
                                ? "bg-red-50 border-red-200"
                                : "bg-green-50 border-green-200"
                            }`}
                          >
                            <h4 className="font-bold mb-3 text-gray-800">
                              حالة المدفوعات
                            </h4>
                            <div className="text-center">
                              <div
                                className={`text-3xl font-bold mb-2 ${
                                  reportData.customers[0]
                                    .pendingAmountInPeriod > 0
                                    ? "text-red-700"
                                    : "text-green-700"
                                }`}
                              >
                                {formatCurrency(
                                  reportData.customers[0].pendingAmountInPeriod,
                                )}{" "}
                                ج.م
                              </div>
                              <p className="text-sm text-gray-600">
                                {reportData.customers[0].pendingAmountInPeriod >
                                0
                                  ? "مدفوعات ناقصة"
                                  : "جميع المدفوعات مكتملة"}
                              </p>
                              {reportData.customers[0].pendingAmountInPeriod >
                                0 && (
                                <div className="mt-3">
                                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                                    إرسال تذكير
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {reportData.customers[0].filteredBills.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-bold mb-3 text-gray-800">
                              فواتير العميل في الفترة المحددة
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="py-2 px-3 text-right text-sm font-medium text-gray-700">
                                      رقم الفاتورة
                                    </th>
                                    <th className="py-2 px-3 text-right text-sm font-medium text-gray-700">
                                      التاريخ
                                    </th>
                                    <th className="py-2 px-3 text-right text-sm font-medium text-gray-700">
                                      المبلغ
                                    </th>
                                    <th className="py-2 px-3 text-right text-sm font-medium text-gray-700">
                                      الحالة
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {reportData.customers[0].filteredBills.map(
                                    (bill, index) => (
                                      <tr
                                        key={index}
                                        className="border-b border-gray-200 hover:bg-gray-50"
                                      >
                                        <td className="py-2 px-3 text-right font-medium">
                                          {bill.id}
                                        </td>
                                        <td className="py-2 px-3 text-right">
                                          {formatDetailedDate(bill.date)}
                                        </td>
                                        <td className="py-2 px-3 text-right font-bold">
                                          {formatCurrency(bill.amount)} ج.م
                                        </td>
                                        <td className="py-2 px-3 text-right">
                                          <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}
                                          >
                                            {getStatusLabel(bill.status)}
                                          </span>
                                        </td>
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                                <tfoot>
                                  <tr className="bg-gray-50 font-bold">
                                    <td
                                      colSpan="2"
                                      className="py-3 px-3 text-right"
                                    >
                                      الإجمالي:
                                    </td>
                                    <td className="py-3 px-3 text-right text-blue-700">
                                      {formatCurrency(
                                        reportData.customers[0].filteredBills.reduce(
                                          (sum, bill) => sum + bill.amount,
                                          0,
                                        ),
                                      )}{" "}
                                      ج.م
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                      <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
                                        <span className="text-green-600 text-sm">
                                          {
                                            reportData.customers[0].filteredBills.filter(
                                              (b) => b.status === "paid",
                                            ).length
                                          }{" "}
                                          مدفوعة
                                        </span>
                                        <span className="text-red-600 text-sm">
                                          {
                                            reportData.customers[0].filteredBills.filter(
                                              (b) => b.status === "pending",
                                            ).length
                                          }{" "}
                                          معلقة
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {selectedCustomer === "all" && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3
                        className="text-lg font-bold"
                        style={{ color: "#193F94" }}
                      >
                        قائمة العملاء ({reportData.customers.length} عميل)
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
                                اسم العميل
                                {sortBy === "name" && (
                                  <span className="mr-1">
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </span>
                                )}
                              </button>
                            </th>
                            <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                              رقم التليفون
                            </th>
                            <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                              <button
                                onClick={() => handleSort("totalBills")}
                                className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                              >
                                الفواتير
                                {sortBy === "totalBills" && (
                                  <span className="mr-1">
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </span>
                                )}
                              </button>
                            </th>
                            <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                              <button
                                onClick={() => handleSort("totalSpent")}
                                className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                              >
                                إجمالي المشتريات
                                {sortBy === "totalSpent" && (
                                  <span className="mr-1">
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </span>
                                )}
                              </button>
                            </th>
                            <th className="py-3 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                              <button
                                onClick={() => handleSort("pendingAmount")}
                                className="hover:text-blue-600 transition-colors flex items-center justify-end w-full"
                              >
                                المديونيات
                                {sortBy === "pendingAmount" && (
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
                          {reportData.customers.map((customer) => (
                            <tr
                              key={customer.id}
                              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                              <td className="py-3 px-4 text-right">
                                <div className="font-medium text-gray-900">
                                  {customer.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatArabicDate(customer.joinDate)}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="font-medium">
                                  {customer.phone}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {customer.email}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="text-center">
                                  <div className="font-bold text-lg text-blue-900">
                                    {customer.billsCountInPeriod}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    فاتورة في الفترة
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div
                                  className="font-bold text-lg"
                                  style={{ color: "#193F94" }}
                                >
                                  {formatCurrency(customer.totalSpentInPeriod)}{" "}
                                  ج.م
                                </div>
                                <div className="text-xs text-gray-500">
                                  {customer.billsCountInPeriod > 0
                                    ? `${formatCurrency(customer.totalSpentInPeriod / customer.billsCountInPeriod)} ج.م/فاتورة`
                                    : "لا توجد فواتير"}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div
                                  className={`font-bold ${customer.pendingAmountInPeriod > 0 ? "text-red-700" : "text-green-700"}`}
                                >
                                  {formatCurrency(
                                    customer.pendingAmountInPeriod,
                                  )}{" "}
                                  ج.م
                                </div>
                                <div className="text-xs text-gray-500">
                                  {customer.pendingAmountInPeriod > 0
                                    ? "مدفوعات ناقصة"
                                    : "مكتمل"}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right print:hidden">
                                <button
                                  onClick={() => {
                                    setSelectedCustomer(customer.id);
                                    setPhoneSearch(customer.phone);
                                    setTimeout(() => generateReport(), 100);
                                  }}
                                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  عرض التفاصيل
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 font-bold">
                            <td className="py-4 px-4 text-right">
                              الإجمالي ({reportData.customers.length} عميل):
                            </td>
                            <td className="py-4 px-4 text-right">-</td>
                            <td className="py-4 px-4 text-right text-blue-900">
                              {reportData.stats.totalBillsAll}
                            </td>
                            <td
                              className="py-4 px-4 text-right"
                              style={{ color: "#193F94" }}
                            >
                              {formatCurrency(reportData.stats.totalSpentAll)}{" "}
                              ج.م
                            </td>
                            <td className="py-4 px-4 text-right text-red-700">
                              {formatCurrency(reportData.stats.totalPendingAll)}{" "}
                              ج.م
                            </td>
                            <td className="print:hidden"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-5 border border-blue-200">
                  <h4
                    className="font-bold mb-4 text-gray-800"
                    style={{ color: "#193F94" }}
                  >
                    ملخص تقرير العملاء
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#193F94" }}
                      >
                        {reportData.stats.totalCustomers}
                      </div>
                      <div className="text-sm text-gray-600">عدد العملاء</div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#10B981" }}
                      >
                        {reportData.stats.totalBillsAll}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي الفواتير
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#8B5CF6" }}
                      >
                        {formatCurrency(
                          reportData.stats.averageSpentPerCustomer,
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        متوسط الإنفاق/عميل
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#F59E0B" }}
                      >
                        {reportData.stats.customersWithPending}
                      </div>
                      <div className="text-sm text-gray-600">
                        عملاء عليه مدفوعات
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  تقارير العملاء
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  ابحث برقم التليفون أو اختر عميلاً من القائمة وتاريخ البداية
                  والنهاية لعرض التقرير
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    بحث برقم التليفون
                  </div>
                  <div className="text-sm text-gray-500">
                    أو اختر "جميع العملاء" لعرض تقرير شامل
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
