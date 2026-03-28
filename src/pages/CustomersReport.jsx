import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import {
  ArrowLeft,
  Search,
  X,
  Calendar,
  BarChart3,
  Wallet,
  Printer,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Users,
  CreditCard,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { FaSpinner, FaUsers } from "react-icons/fa";

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
  const paymentMethodsFetchedRef = useRef(false);

  const [isPrinting, setIsPrinting] = useState(false);

  const addTwoHours = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    date.setHours(date.getHours() + 2);
    return date;
  };

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
    const date = addTwoHours(dateString);
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

  const getPrintableData = () => {
    if (
      !customerData ||
      (customerInvoices.length === 0 && customerTransactions.length === 0)
    )
      return [];

    const allTransactions = [];

    customerInvoices.forEach((invoice) => {
      const invoiceDate = addTwoHours(invoice.date);
      const formattedDateTime = invoiceDate.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      allTransactions.push({
        date: invoiceDate,
        dateTime: formattedDateTime,
        type: "فاتورة",
        description: `فاتورة رقم ${invoice.invoiceNumber}`,
        amount: invoice.totalAmount,
        paid: invoice.paidAmount,
        remaining: invoice.remainingAmount,
        isInvoice: true,
      });
    });

    customerTransactions.forEach((transaction) => {
      const transactionDate = addTwoHours(transaction.date);
      const formattedDateTime = transactionDate.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      const invoice = customerInvoices.find(
        (inv) => inv.invoiceId === transaction.invoiceId,
      );
      const invoiceNumber = invoice ? invoice.invoiceNumber : "مدفوعات منفصلة";

      allTransactions.push({
        date: transactionDate,
        dateTime: formattedDateTime,
        type: "دفعة",
        description: `دفعة على فاتورة ${invoiceNumber} - ${transaction.paymentMethod || "كاش"}`,
        amount: 0,
        paid: transaction.debit || transaction.credit || 0,
        remaining: 0,
        isInvoice: false,
      });
    });

    allTransactions.sort((a, b) => a.date - b.date);

    return allTransactions;
  };

  const totals = calculateTotals();
  const groupedData = groupByDate();
  const printableTransactions = getPrintableData();

  const handlePrint = () => {
    setIsPrinting(true);
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const printContent = document.getElementById("printable-content");
    if (!printContent) {
      setIsPrinting(false);
      return;
    }

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background: white;
            color: #333;
          }
          
          .print-container {
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #193F94;
          }
          
          .header h1 {
            color: #193F94;
            margin-bottom: 10px;
          }
          
          .header h3 {
            color: #666;
            font-size: 16px;
          }
          
          .customer-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            border: 1px solid #dee2e6;
          }
          
          .customer-info h4 {
            color: #193F94;
            margin-bottom: 10px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
          }
          
          .info-item {
            font-size: 14px;
          }
          
          .info-label {
            font-weight: bold;
            color: #666;
          }
          
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          
          .summary-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #dee2e6;
          }
          
          .summary-card .amount {
            font-size: 24px;
            font-weight: bold;
            margin-top: 5px;
          }
          
          .summary-card.sales .amount { color: #193F94; }
          .summary-card.paid .amount { color: #28a745; }
          .summary-card.remaining .amount { color: #dc3545; }
          
          .transactions-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            page-break-after: avoid;
          }
          
          .transactions-table th {
            border: 1px solid #dee2e6;
            padding: 12px 10px;
            text-align: right;
            font-size: 14px;
            font-weight: bold;
            background-color: #4a5568;
            color: white;
          }
          
          .transactions-table td {
            border: 1px solid #dee2e6;
            padding: 10px;
            text-align: right;
            font-size: 13px;
          }
          
          .transactions-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          .invoice-row {
            background-color: #e3f2fd;
          }
          
          .payment-row {
            background-color: #e8f5e9;
          }
          
          .transactions-table tfoot {
            display: table-row-group;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          
          @media print {
            body {
              padding: 0;
            }
            .transactions-table th {
              background-color: #4a5568 !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .transactions-table tfoot {
              display: table-row-group;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${printContent.innerHTML}
        </div>
        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => {
              window.parent.document.body.removeChild(window.frameElement);
            };
          };
        </script>
      </body>
      </html>
    `);
    iframeDoc.close();
    setTimeout(() => setIsPrinting(false), 1000);
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
                <FaUsers className="text-white text-lg" />
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
              <ArrowLeft className="h-5 w-5 ml-2" />
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Printable Content */}
      <div id="printable-content" style={{ display: "none" }}>
        <div className="header">
          <h1>تقرير حركة العميل</h1>
        </div>

        <div className="customer-info">
          <h4>بيانات العميل</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">الاسم:</span>{" "}
              {reportData?.customer.analytics.customerName ||
                customerData?.name ||
                ""}
            </div>
            <div className="info-item">
              <span className="info-label">رقم التليفون:</span>{" "}
              {reportData?.customer.analytics.phone ||
                customerData?.phone ||
                ""}
            </div>
            {reportData?.customer.address && (
              <div className="info-item">
                <span className="info-label">العنوان:</span>{" "}
                {reportData.customer.address}
              </div>
            )}
            <div className="info-item">
              <span className="info-label">الفترة:</span>{" "}
              {reportData?.dateRange.start || formatArabicDate(startDate)} -{" "}
              {reportData?.dateRange.end || formatArabicDate(endDate)}
            </div>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card sales">
            <div>إجمالي المبيعات</div>
            <div className="amount">
              {formatCurrency(totals.totalInvoicesAmount)} ج.م
            </div>
          </div>
          <div className="summary-card paid">
            <div>إجمالي المدفوعات</div>
            <div className="amount">{formatCurrency(totals.totalPaid)} ج.م</div>
          </div>
          <div className="summary-card remaining">
            <div>المتبقي</div>
            <div className="amount">
              {formatCurrency(totals.totalRemaining)} ج.م
            </div>
          </div>
        </div>

        <table className="transactions-table">
          <thead>
            <tr>
              <th>التاريخ والوقت</th>
              <th>نوع العملية</th>
              <th>الوصف</th>
              <th>قيمة الفاتورة</th>
              <th>المدفوع</th>
              <th>المتبقي</th>
            </tr>
          </thead>
          <tbody>
            {printableTransactions.map((transaction, index) => (
              <tr
                key={index}
                className={
                  transaction.isInvoice ? "invoice-row" : "payment-row"
                }
              >
                <td>{transaction.dateTime}</td>
                <td>{transaction.type}</td>
                <td>{transaction.description}</td>
                <td>
                  {transaction.isInvoice
                    ? formatCurrency(transaction.amount)
                    : "-"}
                </td>
                <td>{formatCurrency(transaction.paid)}</td>
                <td>
                  {transaction.isInvoice
                    ? formatCurrency(transaction.remaining)
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}>
              <td colSpan="3" style={{ textAlign: "left" }}>
                الإجمالي:
              </td>
              <td>{formatCurrency(totals.totalInvoicesAmount)} ج.م</td>
              <td>{formatCurrency(totals.totalPaid)} ج.م</td>
              <td>{formatCurrency(totals.totalRemaining)} ج.م</td>
            </tr>
          </tfoot>
        </table>
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
                        <FaSpinner className="h-5 w-5 animate-spin" />
                      ) : (
                        <Search className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <label className="absolute -top-2.5 right-3 px-2 text-xs text-blue-500 font-medium bg-white">
                    <span className="flex items-center">
                      <Search className="w-4 h-4 ml-1" />
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
                        <X className="h-4 w-4" />
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
                      <Calendar className="w-4 h-4 ml-1" />
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
                      <Calendar className="w-4 h-4 ml-1" />
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
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="h-5 w-5 ml-2 animate-spin" />
                        جاري التحميل...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-5 w-5 ml-2" />
                        عرض التقرير
                      </>
                    )}
                  </button>

                  {customerData && totals.totalRemaining > 0 && (
                    <button
                      onClick={openPaymentModal}
                      className="w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-md bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                    >
                      <Wallet className="h-5 w-5 ml-2" />
                      استكمال الدفع ({formatCurrency(
                        totals.totalRemaining,
                      )}{" "}
                      ج.م)
                    </button>
                  )}

                  {/* Print Button */}
                  {reportData && (
                    <button
                      onClick={handlePrint}
                      disabled={isPrinting}
                      className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-md ${
                        isPrinting
                          ? "opacity-50 cursor-not-allowed bg-gray-400"
                          : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      }`}
                    >
                      {isPrinting ? (
                        <>
                          <FaSpinner className="h-5 w-5 ml-2 animate-spin" />
                          جاري الطباعة...
                        </>
                      ) : (
                        <>
                          <Printer className="h-5 w-5 ml-2" />
                          طباعة التقرير PDF
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {reportData ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
                <div className="flex justify-between items-start mb-6 print:hidden">
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
                </div>

                {/* البطاقات الرئيسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 print:hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800">إجمالي المبيعات</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {formatCurrency(totals.totalInvoicesAmount)} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-blue-700" />
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
                        <CreditCard className="h-6 w-6 text-green-700" />
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
                        <AlertCircle className="h-6 w-6 text-red-700" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6 print:hidden">
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
                            <Users className="h-5 w-5 text-blue-700" />
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
                    </div>
                  </div>
                </div>

                <div className="mb-6 print:hidden">
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: "#193F94" }}
                  >
                    سجل الحركات
                  </h3>

                  {ledgerLoading ? (
                    <div className="bg-gray-50 rounded-xl p-8 flex flex-col items-center justify-center">
                      <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                      <p className="text-gray-600">جاري تحميل البيانات...</p>
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
                            <div
                              className="bg-gradient-to-r from-gray-50 to-white p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => toggleDayDetails(date)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                  {isExpanded ? (
                                    <ChevronUp className="h-5 w-5 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                  )}
                                  <span className="font-bold text-blue-900">
                                    {formatDateOnly(date)}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(date).toLocaleDateString(
                                      "ar-EG",
                                      { weekday: "long" },
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
                                      className={`font-bold ${dayTotalRemaining > 0 ? "text-red-600" : "text-green-600"}`}
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

                            {isExpanded && (
                              <div className="p-4 bg-gray-50 border-t border-gray-200">
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
                      <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500">
                        لا توجد بيانات للعميل في الفترة المحددة
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  تقارير العملاء
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  ابحث برقم التليفون واختر تاريخ البداية والنهاية لعرض التقرير
                </p>
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Search className="h-5 w-5 ml-2" />
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
                  <X className="h-5 w-5" />
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
                            <Trash2 className="h-4 w-4" />
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
                    <FaSpinner className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
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
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
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
                      <FaSpinner className="w-3 h-3 ml-1 animate-spin" />
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
