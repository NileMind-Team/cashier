import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

export default function CustomersReports() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [customerData, setCustomerData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [customerTransactions, setCustomerTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payments, setPayments] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [excessAmount, setExcessAmount] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const paymentMethodsFetchedRef = { current: false };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoFormatted = thirtyDaysAgo.toISOString().split("T")[0];

    setStartDate(thirtyDaysAgoFormatted);
    setEndDate(today);

    fetchPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPaymentMethods = async () => {
    if (paymentMethodsFetchedRef.current) {
      return;
    }

    try {
      setPaymentMethodsLoading(true);
      const response = await axiosInstance.get("/api/Payment/GetAll");

      if (response.status === 200 && Array.isArray(response.data)) {
        const formattedMethods = response.data.map((method) => ({
          id: method.id,
          name: method.name || "",
          isActive: method.isActive || false,
          color: getPaymentMethodColor(method.id),
        }));
        setPaymentMethods(formattedMethods);
        paymentMethodsFetchedRef.current = true;
      } else {
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error("خطأ في جلب طرق الدفع:", error);
      toast.error("حدث خطأ في جلب طرق الدفع");
      setPaymentMethods([]);
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  const getPaymentMethodColor = (id) => {
    const colors = [
      "#10B981",
      "#3B82F6",
      "#8B5CF6",
      "#F59E0B",
      "#EF4444",
      "#EC4899",
      "#6366F1",
    ];
    return colors[id % colors.length];
  };

  const handlePhoneSearch = async () => {
    if (!phoneSearch.trim()) {
      toast.error("يرجى إدخال رقم التليفون");
      return;
    }

    const searchTerm = phoneSearch.replace(/\D/g, "");

    if (searchTerm.length < 3) {
      toast.error("يرجى إدخال 3 أرقام على الأقل للبحث");
      return;
    }

    setSearchLoading(true);

    try {
      const response = await axiosInstance.get("/api/Reports/GetCustomer", {
        params: {
          phone: searchTerm,
        },
      });

      if (response.status === 200 && response.data) {
        setCustomerData(response.data);
        toast.success(`تم العثور على ${response.data.name}`);
        setCustomerInvoices([]);
        setCustomerTransactions([]);
      }
    } catch (error) {
      console.error("خطأ في البحث عن العميل:", error);
      if (error.response?.status === 404) {
        toast.error(`لم يتم العثور على عميل برقم التليفون ${phoneSearch}`);
        setCustomerData(null);
        setCustomerInvoices([]);
        setCustomerTransactions([]);
      } else if (error.response?.status === 400) {
        toast.error("بيانات غير صالحة: تأكد من رقم التليفون");
      } else {
        toast.error("حدث خطأ في البحث عن العميل");
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePhoneSearch();
    }
  };

  const clearSearch = () => {
    setPhoneSearch("");
    setCustomerData(null);
    setReportData(null);
    setCustomerInvoices([]);
    setCustomerTransactions([]);
    setExpandedDay(null);
  };

  const fetchCustomerLedger = async (customerId) => {
    setLedgerLoading(true);
    try {
      const response = await axiosInstance.get(
        `/api/Invoices/GetCustomerLedger/customer/${customerId}`,
      );

      if (response.status === 200 && response.data) {
        let invoices = response.data.invoices || [];
        let transactions = response.data.transactions || [];

        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);

          invoices = invoices.filter((invoice) => {
            const invoiceDate = new Date(invoice.date);
            return invoiceDate >= start && invoiceDate <= end;
          });

          transactions = transactions.filter((transaction) => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= start && transactionDate <= end;
          });
        }

        invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        const transactionsByInvoice = {};
        transactions.forEach((transaction) => {
          if (!transactionsByInvoice[transaction.invoiceId]) {
            transactionsByInvoice[transaction.invoiceId] = [];
          }
          transactionsByInvoice[transaction.invoiceId].push(transaction);
        });

        const invoicesWithTransactions = invoices.map((invoice) => ({
          ...invoice,
          transactions: transactionsByInvoice[invoice.invoiceId] || [],
          remainingAmount: invoice.remainingAmount || 0,
          paidAmount: invoice.paidAmount || 0,
        }));

        setCustomerInvoices(invoicesWithTransactions);
        setCustomerTransactions(transactions);
      }
    } catch (error) {
      console.error("خطأ في جلب بيانات العميل:", error);
      if (error.response?.status === 404) {
        toast.info("لا توجد بيانات للعميل");
        setCustomerInvoices([]);
        setCustomerTransactions([]);
      } else {
        toast.error("حدث خطأ في جلب بيانات العميل");
      }
    } finally {
      setLedgerLoading(false);
    }
  };

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("يرجى اختيار تاريخ البداية والنهاية");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
      return;
    }

    if (!customerData) {
      toast.error("يرجى البحث عن عميل أولاً");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `/api/Reports/CustomerAnalytics/${customerData.id}`,
        {
          params: {
            from: startDate,
            to: endDate,
          },
        },
      );

      if (response.status === 200 && response.data) {
        const data = response.data;

        setReportData({
          customer: {
            ...customerData,
            analytics: data,
          },
          dateRange: {
            start: formatArabicDate(startDate),
            end: formatArabicDate(endDate),
            startDate: startDate,
            endDate: endDate,
          },
        });

        await fetchCustomerLedger(customerData.id);

        toast.success(`تم إنشاء تقرير ${data.customerName}`);
      }
    } catch (error) {
      console.error("خطأ في جلب تقرير العميل:", error);
      if (error.response?.status === 404) {
        toast.error("لا توجد بيانات للعميل في الفترة المحددة");
      } else if (error.response?.status === 400) {
        toast.error("بيانات غير صالحة: تأكد من تواريخ صحيحة");
      } else {
        toast.error("حدث خطأ في جلب تقرير العميل");
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString) => {
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

  const calculateTotals = () => {
    let totalInvoicesAmount = 0;
    let totalPaid = 0;
    let totalRemaining = 0;

    customerInvoices.forEach((invoice) => {
      totalInvoicesAmount += invoice.totalAmount || 0;
      totalPaid += invoice.paidAmount || 0;
      totalRemaining += invoice.remainingAmount || 0;
    });

    return {
      totalInvoicesAmount,
      totalPaid,
      totalRemaining,
    };
  };

  const groupByDate = () => {
    const grouped = {};

    customerInvoices.forEach((invoice) => {
      const date = invoice.date.split("T")[0];
      if (!grouped[date]) {
        grouped[date] = {
          date: date,
          invoices: [],
          payments: [],
        };
      }
      grouped[date].invoices.push(invoice);
    });

    customerTransactions.forEach((transaction) => {
      const date = transaction.date.split("T")[0];
      if (!grouped[date]) {
        grouped[date] = {
          date: date,
          invoices: [],
          payments: [],
        };
      }
      grouped[date].payments.push(transaction);
    });

    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(b) - new Date(a),
    );
    const sortedGrouped = {};
    sortedDates.forEach((date) => {
      sortedGrouped[date] = grouped[date];
    });

    return sortedGrouped;
  };

  const toggleDayDetails = (date) => {
    if (expandedDay === date) {
      setExpandedDay(null);
    } else {
      setExpandedDay(date);
    }
  };

  const openPaymentModal = () => {
    if (!customerData) {
      toast.error("يرجى البحث عن عميل أولاً");
      return;
    }

    if (totals.totalRemaining <= 0) {
      toast.info("لا توجد مبالغ مستحقة على هذا العميل");
      return;
    }

    setRemainingAmount(totals.totalRemaining);
    setPayments([]);
    setExcessAmount(0);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPayments([]);
    setRemainingAmount(0);
    setExcessAmount(0);
  };

  const handleAddPayment = (paymentMethodId) => {
    const existingPaymentIndex = payments.findIndex(
      (p) => p.paymentMethodId === paymentMethodId,
    );

    if (existingPaymentIndex !== -1) {
      const newPayments = payments.filter(
        (_, index) => index !== existingPaymentIndex,
      );
      setPayments(newPayments);

      const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
      setRemainingAmount(totals.totalRemaining - totalPaid);
      setExcessAmount(
        totalPaid > totals.totalRemaining
          ? totalPaid - totals.totalRemaining
          : 0,
      );
    } else {
      const currentTotalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = totals.totalRemaining - currentTotalPaid;

      const newPayments = [...payments, { paymentMethodId, amount: remaining }];
      setPayments(newPayments);
      setRemainingAmount(0);
      setExcessAmount(0);
    }
  };

  const handlePaymentAmountChange = (paymentMethodId, amount) => {
    const updatedPayments = payments.map((payment) =>
      payment.paymentMethodId === paymentMethodId
        ? { ...payment, amount: parseFloat(amount) || 0 }
        : payment,
    );
    setPayments(updatedPayments);

    const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
    setRemainingAmount(totals.totalRemaining - totalPaid);
    setExcessAmount(
      totalPaid > totals.totalRemaining ? totalPaid - totals.totalRemaining : 0,
    );
  };

  const handleRemovePayment = (paymentMethodId) => {
    const newPayments = payments.filter(
      (p) => p.paymentMethodId !== paymentMethodId,
    );
    setPayments(newPayments);

    const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
    setRemainingAmount(totals.totalRemaining - totalPaid);
    setExcessAmount(
      totalPaid > totals.totalRemaining ? totalPaid - totals.totalRemaining : 0,
    );
  };

  const handleCompletePayment = async () => {
    if (payments.length === 0) {
      toast.error("يرجى اختيار طريقة دفع واحدة على الأقل");
      return;
    }

    if (isProcessingPayment) {
      return;
    }

    setIsProcessingPayment(true);

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalRequired = totals.totalRemaining;

    if (totalPaid <= 0) {
      toast.error("المبلغ المدفوع يجب أن يكون أكبر من صفر");
      setIsProcessingPayment(false);
      return;
    }

    try {
      const paymentsData = payments.map((payment) => ({
        paymentMethodId: payment.paymentMethodId,
        amount: payment.amount,
      }));

      const response = await axiosInstance.post(
        "/api/Invoices/PayCustomerInvoices",
        {
          customerId: customerData.id,
          payments: paymentsData,
        },
      );

      if (response.status === 200) {
        if (totalPaid >= totalRequired) {
          toast.success(
            `تم استكمال الدفع بالكامل بقيمة ${formatCurrency(totalPaid)} ج.م`,
          );
        } else {
          toast.success(
            `تم دفع ${formatCurrency(totalPaid)} ج.م من إجمالي ${formatCurrency(totalRequired)} ج.م (باقي ${formatCurrency(totalRequired - totalPaid)} ج.م)`,
          );
        }

        setShowPaymentModal(false);
        setPayments([]);
        setRemainingAmount(0);
        setExcessAmount(0);

        await fetchCustomerLedger(customerData.id);

        if (reportData) {
          await generateReport();
        }
      }
    } catch (error) {
      console.error("خطأ في استكمال الدفع:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const paymentError = errors.find(
          (err) => err.code === "Invoice.InvalidPayment",
        );

        if (paymentError) {
          if (
            paymentError.description.includes(
              "Paid amount is More than invoice total",
            )
          ) {
            toast.error("المبلغ المدفوع أكثر من إجمالي المبلغ المستحق");
          } else if (
            paymentError.description.includes(
              "Paid amount is less than invoice total",
            )
          ) {
            toast.error("المبلغ المدفوع أقل من إجمالي المبلغ المستحق");
          } else {
            toast.error("خطأ في عملية الدفع");
          }
        } else {
          toast.error("حدث خطأ في استكمال الدفع");
        }
      } else {
        toast.error("حدث خطأ في استكمال الدفع");
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const totals = calculateTotals();
  const groupedData = groupByDate();

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
                <div className="relative">
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <input
                      type="text"
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="أدخل رقم التليفون..."
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      dir="rtl"
                    />
                    <button
                      onClick={handlePhoneSearch}
                      disabled={searchLoading}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {searchLoading ? (
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
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
                      )}
                    </button>
                  </div>
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      بحث برقم التليفون
                    </span>
                  </label>
                </div>

                {customerData && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-green-800">
                        {customerData.name}
                      </span>
                      <button
                        onClick={clearSearch}
                        className="text-red-600 hover:text-red-800"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="text-sm text-green-700">
                      <div>رقم التليفون: {customerData.phone}</div>
                      {customerData.address && (
                        <div className="mt-1 text-xs">
                          العنوان: {customerData.address}
                        </div>
                      )}
                    </div>
                  </div>
                )}

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

                <div className="pt-4 space-y-3">
                  <button
                    onClick={generateReport}
                    disabled={
                      loading || !startDate || !endDate || !customerData
                    }
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-md ${
                      loading || !startDate || !endDate || !customerData
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    }`}
                    style={{
                      backgroundColor:
                        loading || !startDate || !endDate || !customerData
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        عرض التقرير
                      </>
                    )}
                  </button>

                  {customerData && totals.totalRemaining > 0 && (
                    <button
                      onClick={openPaymentModal}
                      className="w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-md bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
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
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      استكمال الدفع ({formatCurrency(totals.totalRemaining)}{" "}
                      ج.م)
                    </button>
                  )}
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
                      تقرير العميل -{" "}
                      {reportData.customer.analytics.customerName}
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
                      {customerInvoices.length} فاتورة في هذه الفترة
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse print:hidden">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {customerInvoices.length} فاتورة
                    </div>
                    {totals.totalRemaining > 0 && (
                      <div className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                        متبقي {formatCurrency(totals.totalRemaining)} ج.م
                      </div>
                    )}
                  </div>
                </div>

                {/* البطاقات الرئيسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 print:grid-cols-2">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">إجمالي المبيعات</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {formatCurrency(totals.totalInvoicesAmount)} ج.م
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
                        <p className="text-sm text-green-800">إجمالي المدفوع</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {formatCurrency(totals.totalPaid)} ج.م
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
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-800">المتبقي</p>
                        <p className="text-2xl font-bold text-red-900 mt-1">
                          {formatCurrency(totals.totalRemaining)} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-red-700"
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
                </div>

                <div className="mb-6">
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: "#193F94" }}
                  >
                    سجل الحركات
                  </h3>

                  {ledgerLoading ? (
                    <div className="bg-gray-50 rounded-xl p-8 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-t-2 border-blue-600 rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-500">جاري تحميل البيانات...</p>
                    </div>
                  ) : Object.keys(groupedData).length > 0 ? (
                    <div className="space-y-4">
                      {Object.keys(groupedData).map((date) => {
                        const dayData = groupedData[date];
                        const dayTotalInvoices = dayData.invoices.reduce(
                          (sum, inv) => sum + inv.totalAmount,
                          0,
                        );
                        const dayTotalPayments = dayData.payments.reduce(
                          (sum, pay) => sum + (pay.debit || pay.credit || 0),
                          0,
                        );
                        const dayTotalRemaining = dayData.invoices.reduce(
                          (sum, inv) => sum + (inv.remainingAmount || 0),
                          0,
                        );
                        const isExpanded = expandedDay === date;

                        return (
                          <div
                            key={date}
                            className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                          >
                            {/* Day Header - Clickable like invoice header */}
                            <div
                              className="bg-gradient-to-r from-gray-50 to-white p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => toggleDayDetails(date)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-5 w-5 text-gray-500 transform transition-transform ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                  <span className="font-bold text-blue-900">
                                    {formatDateOnly(date)}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(date).toLocaleDateString(
                                      "ar-EG",
                                      {
                                        weekday: "long",
                                      },
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-sm">
                                    <span className="text-gray-600">
                                      الفواتير:{" "}
                                    </span>
                                    <span className="font-bold text-blue-700">
                                      {formatCurrency(dayTotalInvoices)} ج.م
                                    </span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-gray-600">
                                      المدفوعات:{" "}
                                    </span>
                                    <span className="font-bold text-green-600">
                                      {formatCurrency(dayTotalPayments)} ج.م
                                    </span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-gray-600">
                                      المتبقي:{" "}
                                    </span>
                                    <span
                                      className={`font-bold ${
                                        dayTotalRemaining > 0
                                          ? "text-red-600"
                                          : "text-green-600"
                                      }`}
                                    >
                                      {formatCurrency(dayTotalRemaining)} ج.م
                                    </span>
                                  </div>
                                  {dayTotalInvoices === 0 &&
                                    dayTotalPayments === 0 &&
                                    dayTotalRemaining === 0 && (
                                      <span className="text-xs text-gray-500">
                                        لا توجد حركات
                                      </span>
                                    )}
                                </div>
                              </div>
                            </div>

                            {/* Day Details (Expandable) */}
                            {isExpanded && (
                              <div className="p-4 bg-gray-50 border-t border-gray-200">
                                {/* Invoices Section */}
                                {dayData.invoices.length > 0 && (
                                  <div className="mb-6">
                                    <h4 className="font-bold mb-3 text-gray-700">
                                      الفواتير
                                    </h4>
                                    <div className="space-y-3">
                                      {dayData.invoices.map((invoice) => (
                                        <div
                                          key={invoice.invoiceId}
                                          className="bg-white rounded-lg p-3 border border-gray-200"
                                        >
                                          <div className="flex justify-between items-start flex-wrap gap-3 mb-3">
                                            <div>
                                              <p className="font-bold text-gray-800">
                                                فاتورة #{invoice.invoiceNumber}
                                              </p>
                                              <p className="text-xs text-gray-500 mt-1">
                                                {formatDateTime(invoice.date)}
                                              </p>
                                            </div>
                                            <div className="flex gap-4">
                                              <div className="text-right">
                                                <p className="text-xs text-gray-600">
                                                  القيمة
                                                </p>
                                                <p className="font-bold text-blue-700">
                                                  {formatCurrency(
                                                    invoice.totalAmount,
                                                  )}{" "}
                                                  ج.م
                                                </p>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-xs text-gray-600">
                                                  مدفوع
                                                </p>
                                                <p className="font-bold text-green-600">
                                                  {formatCurrency(
                                                    invoice.paidAmount,
                                                  )}{" "}
                                                  ج.م
                                                </p>
                                              </div>
                                              {invoice.remainingAmount > 0 && (
                                                <div className="text-right">
                                                  <p className="text-xs text-gray-600">
                                                    متبقي
                                                  </p>
                                                  <p className="font-bold text-red-600">
                                                    {formatCurrency(
                                                      invoice.remainingAmount,
                                                    )}{" "}
                                                    ج.م
                                                  </p>
                                                </div>
                                              )}
                                              {invoice.remainingAmount ===
                                                0 && (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium self-center">
                                                  مدفوع بالكامل
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {/* Payment details for this invoice */}
                                          {invoice.transactions &&
                                            invoice.transactions.length > 0 && (
                                              <div className="mt-3 pt-3 border-t border-gray-100">
                                                <p className="text-xs font-medium text-gray-600 mb-2">
                                                  تفاصيل المدفوعات:
                                                </p>
                                                <div className="overflow-x-auto">
                                                  <table className="w-full text-sm">
                                                    <thead className="bg-gray-100">
                                                      <tr>
                                                        <th className="py-2 px-3 text-right text-xs font-medium text-gray-700">
                                                          التاريخ
                                                        </th>
                                                        <th className="py-2 px-3 text-right text-xs font-medium text-gray-700">
                                                          طريقة الدفع
                                                        </th>
                                                        <th className="py-2 px-3 text-right text-xs font-medium text-gray-700">
                                                          المبلغ
                                                        </th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {invoice.transactions.map(
                                                        (transaction, idx) => (
                                                          <tr
                                                            key={idx}
                                                            className="border-b border-gray-200"
                                                          >
                                                            <td className="py-2 px-3 text-xs">
                                                              {formatDateTime(
                                                                transaction.date,
                                                              )}
                                                            </td>
                                                            <td className="py-2 px-3 text-xs">
                                                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                                                {transaction.paymentMethod ||
                                                                  "كاش"}
                                                              </span>
                                                            </td>
                                                            <td className="py-2 px-3 text-xs">
                                                              <span className="font-bold text-green-600">
                                                                {formatCurrency(
                                                                  transaction.debit ||
                                                                    transaction.credit,
                                                                )}{" "}
                                                                ج.م
                                                              </span>
                                                            </td>
                                                          </tr>
                                                        ),
                                                      )}
                                                    </tbody>
                                                    <tfoot className="bg-gray-100">
                                                      <tr>
                                                        <td
                                                          colSpan="2"
                                                          className="py-2 px-3 text-xs font-bold"
                                                        >
                                                          إجمالي المدفوعات:
                                                        </td>
                                                        <td className="py-2 px-3 text-xs font-bold text-green-600">
                                                          {formatCurrency(
                                                            invoice.paidAmount,
                                                          )}{" "}
                                                          ج.م
                                                        </td>
                                                      </tr>
                                                      {invoice.remainingAmount >
                                                        0 && (
                                                        <tr>
                                                          <td
                                                            colSpan="2"
                                                            className="py-2 px-3 text-xs font-bold text-red-600"
                                                          >
                                                            المتبقي:
                                                          </td>
                                                          <td className="py-2 px-3 text-xs font-bold text-red-600">
                                                            {formatCurrency(
                                                              invoice.remainingAmount,
                                                            )}{" "}
                                                            ج.م
                                                          </td>
                                                        </tr>
                                                      )}
                                                    </tfoot>
                                                  </table>
                                                </div>
                                              </div>
                                            )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {dayData.payments.length > 0 && (
                                  <div>
                                    <h4 className="font-bold mb-3 text-gray-700">
                                      المدفوعات
                                    </h4>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm bg-white rounded-lg border border-gray-200">
                                        <thead className="bg-gray-100">
                                          <tr>
                                            <th className="py-2 px-3 text-right text-xs font-medium text-gray-700">
                                              رقم الفاتورة
                                            </th>
                                            <th className="py-2 px-3 text-right text-xs font-medium text-gray-700">
                                              التاريخ
                                            </th>
                                            <th className="py-2 px-3 text-right text-xs font-medium text-gray-700">
                                              طريقة الدفع
                                            </th>
                                            <th className="py-2 px-3 text-right text-xs font-medium text-gray-700">
                                              المبلغ
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {dayData.payments.map(
                                            (payment, idx) => {
                                              const invoice =
                                                dayData.invoices.find(
                                                  (inv) =>
                                                    inv.invoiceId ===
                                                    payment.invoiceId,
                                                );
                                              const invoiceNumber = invoice
                                                ? invoice.invoiceNumber
                                                : "مدفوعات منفصلة";

                                              return (
                                                <tr
                                                  key={payment.id || idx}
                                                  className="border-b border-gray-200 hover:bg-gray-50"
                                                >
                                                  <td className="py-2 px-3 text-xs font-medium">
                                                    {invoiceNumber}
                                                  </td>
                                                  <td className="py-2 px-3 text-xs">
                                                    {formatDateTime(
                                                      payment.date,
                                                    )}
                                                  </td>
                                                  <td className="py-2 px-3 text-xs">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                                      {payment.paymentMethod ||
                                                        "كاش"}
                                                    </span>
                                                  </td>
                                                  <td className="py-2 px-3 text-xs">
                                                    <span className="font-bold text-green-600">
                                                      {formatCurrency(
                                                        payment.debit ||
                                                          payment.credit,
                                                      )}{" "}
                                                      ج.م
                                                    </span>
                                                  </td>
                                                </tr>
                                              );
                                            },
                                          )}
                                        </tbody>
                                        <tfoot className="bg-gray-100">
                                          <tr>
                                            <td
                                              colSpan="3"
                                              className="py-2 px-3 text-xs font-bold"
                                            >
                                              إجمالي المدفوعات:
                                            </td>
                                            <td className="py-2 px-3 text-xs font-bold text-green-600">
                                              {formatCurrency(
                                                dayData.payments.reduce(
                                                  (sum, pay) =>
                                                    sum +
                                                    (pay.debit ||
                                                      pay.credit ||
                                                      0),
                                                  0,
                                                ),
                                              )}{" "}
                                              ج.م
                                            </td>
                                          </tr>
                                        </tfoot>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {dayData.invoices.length === 0 &&
                                  dayData.payments.length === 0 && (
                                    <div className="text-center text-gray-500 py-4">
                                      لا توجد حركات في هذا اليوم
                                    </div>
                                  )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-gray-400 mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-gray-500">
                        لا توجد بيانات للعميل في الفترة المحددة
                      </p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: "#193F94" }}
                  >
                    تفاصيل العميل
                  </h3>
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ml-2">
                            <span className="text-blue-700 font-bold">👤</span>
                          </div>
                          <div>
                            <p className="font-bold text-lg">
                              {reportData.customer.analytics.customerName}
                            </p>
                            <p className="text-sm text-gray-600">العميل</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">الهاتف:</span>
                            <span className="font-medium">
                              {reportData.customer.analytics.phone}
                            </span>
                          </div>
                          {reportData.customer.address && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">العنوان:</span>
                              <span className="font-medium">
                                {reportData.customer.address}
                              </span>
                            </div>
                          )}
                          {reportData.customer.nationalId && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                الرقم القومي:
                              </span>
                              <span className="font-medium">
                                {reportData.customer.nationalId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-bold mb-3 text-gray-800">
                          إحصائيات الفترة
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              إجمالي الفواتير:
                            </span>
                            <span className="font-bold">
                              {customerInvoices.length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              إجمالي المبيعات:
                            </span>
                            <span className="font-bold text-blue-700">
                              {formatCurrency(totals.totalInvoicesAmount)} ج.م
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              إجمالي المدفوعات:
                            </span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(totals.totalPaid)} ج.م
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">المتبقي:</span>
                            <span
                              className={`font-bold ${totals.totalRemaining > 0 ? "text-red-600" : "text-green-600"}`}
                            >
                              {formatCurrency(totals.totalRemaining)} ج.م
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-5 border border-blue-200">
                  <h4
                    className="font-bold mb-4 text-gray-800"
                    style={{ color: "#193F94" }}
                  >
                    ملخص تقرير العميل
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#193F94" }}
                      >
                        {customerInvoices.length}
                      </div>
                      <div className="text-sm text-gray-600">عدد الفواتير</div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#10B981" }}
                      >
                        {formatCurrency(totals.totalInvoicesAmount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي المبيعات
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#3B82F6" }}
                      >
                        {formatCurrency(totals.totalPaid)}
                      </div>
                      <div className="text-sm text-gray-600">
                        إجمالي المدفوع
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${totals.totalRemaining > 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        {formatCurrency(totals.totalRemaining)}
                      </div>
                      <div className="text-sm text-gray-600">المتبقي</div>
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
                  ابحث برقم التليفون واختر تاريخ البداية والنهاية لعرض التقرير
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                  استكمال الدفع
                </h3>
                <button
                  onClick={closePaymentModal}
                  disabled={isProcessingPayment}
                  className="text-gray-500 hover:text-gray-700 text-2xl disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              <div className="mb-4">
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">المبلغ المستحق</p>
                      <p
                        className="text-xl font-bold"
                        style={{ color: "#193F94" }}
                      >
                        {formatCurrency(totals.totalRemaining)} ج.م
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-600">
                        {customerData?.name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {customerData?.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {payments.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <p className="text-xs font-medium text-gray-700">
                      طرق الدفع المختارة:
                    </p>
                    {payments.map((payment) => {
                      const method = paymentMethods.find(
                        (m) => m.id === payment.paymentMethodId,
                      );
                      return (
                        <div
                          key={payment.paymentMethodId}
                          className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200"
                        >
                          <div
                            className="w-1 h-8 rounded-full"
                            style={{ backgroundColor: method?.color }}
                          ></div>
                          <div className="flex-1 flex items-center gap-2">
                            <p className="text-xs font-medium min-w-[60px]">
                              {method?.name}
                            </p>
                            <input
                              type="number"
                              value={payment.amount}
                              onChange={(e) =>
                                handlePaymentAmountChange(
                                  payment.paymentMethodId,
                                  e.target.value,
                                )
                              }
                              disabled={isProcessingPayment}
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 disabled:bg-gray-100"
                              placeholder="المبلغ"
                              min="0"
                              step="0.01"
                              dir="ltr"
                            />
                          </div>
                          <button
                            onClick={() =>
                              handleRemovePayment(payment.paymentMethodId)
                            }
                            disabled={isProcessingPayment}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="bg-gray-50 p-2 rounded-lg mb-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-xs text-gray-600">
                      المبلغ المتبقي:
                    </span>
                    <span
                      className={`font-bold text-sm ${remainingAmount < 0 ? "text-green-600" : remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {Math.abs(remainingAmount).toFixed(2)} ج.م
                      {remainingAmount < 0 && (
                        <span className="text-[10px] mr-1 text-green-600">
                          (زيادة)
                        </span>
                      )}
                      {remainingAmount > 0 && (
                        <span className="text-[10px] mr-1 text-red-600">
                          (باقي)
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {paymentMethodsLoading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      جاري تحميل طرق الدفع...
                    </p>
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-xs">لا توجد طرق دفع متاحة</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    <p className="text-xs font-medium text-gray-700">
                      اختر طريقة الدفع:
                    </p>
                    {paymentMethods
                      .filter((method) => method.isActive)
                      .map((method) => {
                        const isSelected = payments.some(
                          (p) => p.paymentMethodId === method.id,
                        );
                        return (
                          <button
                            key={method.id}
                            onClick={() => handleAddPayment(method.id)}
                            disabled={isProcessingPayment}
                            className={`w-full p-2 rounded-lg border flex items-center justify-between transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <div className="flex items-center">
                              <div
                                className="w-1 h-6 rounded-full ml-2"
                                style={{ backgroundColor: method.color }}
                              ></div>
                              <p className="text-xs font-medium">
                                {method.name}
                              </p>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="flex space-x-2 rtl:space-x-reverse">
                <button
                  onClick={closePaymentModal}
                  disabled={isProcessingPayment}
                  className="flex-1 py-2 px-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors text-xs disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCompletePayment}
                  disabled={payments.length === 0 || isProcessingPayment}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-white transition-colors text-xs ${
                    payments.length === 0 || isProcessingPayment
                      ? "opacity-50 cursor-not-allowed bg-gray-400"
                      : "bg-yellow-600 hover:bg-yellow-700"
                  }`}
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin ml-1"></div>
                      جاري تأكيد الدفع...
                    </span>
                  ) : (
                    "تأكيد الدفع"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
