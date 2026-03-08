import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Navbar from "../components/layout/Navbar.jsx";
import axiosInstance from "../api/axiosInstance";

export default function Home() {
  const initializedRef = useRef(false);
  const shiftFetchedRef = useRef(false);
  const hallsFetchedRef = useRef(false);
  const tablesFetchedRef = useRef(false);
  const mainCategoriesFetchedRef = useRef(false);
  const paymentMethodsFetchedRef = useRef(false);
  const invoicesFetchedRef = useRef(false);
  const deliveryCompaniesFetchedRef = useRef(false);
  const [isShiftOpen, setIsShiftOpen] = useState(true);
  const [shiftStartTime, setShiftStartTime] = useState(
    new Date().toLocaleTimeString("ar-EG"),
  );
  const [loading, setLoading] = useState(false);
  const [hallsLoading, setHallsLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [optionsCurrentPage, setOptionsCurrentPage] = useState(1);
  const [optionsPerPage] = useState(8);
  const [currentShift, setCurrentShift] = useState(null);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [invoices, setInvoices] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [totalInvoicesCount, setTotalInvoicesCount] = useState(0);
  const [currentInvoicePage, setCurrentInvoicePage] = useState(1);
  const [pageSize] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bills, setBills] = useState([
    {
      id: 1,
      cart: [],
      tax: 14,
      discount: 0,
      discountType: 0,
      deliveryFee: 0,
      completed: false,
      isReturned: false,
      returnReason: "",
      billType: "takeaway",
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      customerNationalId: "",
      customerId: null,
      tableStatus: null,
      generalNote: "",
      paymentMethod: null,
      invoiceId: null,
      isPending: true,
      invoiceNumber: null,
      invoiceDate: null,
      tableId: null,
      tableName: null,
      deliveryType: null,
      deliveryCompanyId: null,
      deliveryCompanyName: null,
      deliveryCompanyContact: null,
    },
  ]);
  const [currentBillIndex, setCurrentBillIndex] = useState(0);
  const [cart, setCart] = useState([]);
  const [tax, setTax] = useState(14);
  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNationalId, setCustomerNationalId] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showTableSelection, setShowTableSelection] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showTableInfo, setShowTableInfo] = useState(false);
  const [tableStatus, setTableStatus] = useState("available");
  const [editingNoteProductId, setEditingNoteProductId] = useState(null);
  const [tempNote, setTempNote] = useState("");
  const [generalNote, setGeneralNote] = useState("");
  const [isEditingGeneralNote, setIsEditingGeneralNote] = useState(false);
  const [tempGeneralNote, setTempGeneralNote] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [options, setOptions] = useState([]);
  const [optionsTotalPages, setOptionsTotalPages] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [optionsTotalCount, setOptionsTotalCount] = useState(0);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [deliveryCompanies, setDeliveryCompanies] = useState([]);
  const [deliveryCompaniesLoading, setDeliveryCompaniesLoading] =
    useState(false);
  const [halls, setHalls] = useState([]);
  const [tables, setTables] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({
    name: "",
    phone: "",
    address: "",
    nationalId: "",
  });
  const [focusedField, setFocusedField] = useState(null);
  const [isNewBillActive, setIsNewBillActive] = useState(true);
  const [showDeliveryTypeModal, setShowDeliveryTypeModal] = useState(false);
  const [showDeliveryCompanyModal, setShowDeliveryCompanyModal] =
    useState(false);
  const [deliveryType, setDeliveryType] = useState(null);
  const [selectedDeliveryCompany, setSelectedDeliveryCompany] = useState(null);

  const DeliveryType = {
    Store: "store",
    Company: "company",
  };

  const TableStatus = {
    Available: 0,
    Occupied: 1,
    Reserved: 2,
    OutOfService: 3,
  };

  const InvoiceType = {
    DineIn: 0,
    Takeaway: 1,
    Delivery: 2,
  };

  const DiscountType = {
    Percentage: 0,
    Fixed: 1,
  };

  const InvoiceStatus = {
    Open: 0,
    Done: 1,
    Suspended: 2,
    Returned: 3,
    PartialPaid: 4,
  };

  const getTableStatusText = (status) => {
    switch (status) {
      case TableStatus.Available:
        return "available";
      case TableStatus.Occupied:
        return "occupied";
      case TableStatus.Reserved:
        return "reserved";
      case TableStatus.OutOfService:
        return "outOfService";
      default:
        return "available";
    }
  };

  const getTableStatusFromText = (statusText) => {
    switch (statusText) {
      case "available":
        return TableStatus.Available;
      case "occupied":
        return TableStatus.Occupied;
      case "reserved":
        return TableStatus.Reserved;
      case "outOfService":
        return TableStatus.OutOfService;
      default:
        return TableStatus.Available;
    }
  };

  const getInvoiceTypeFromBillType = (billType) => {
    switch (billType) {
      case "dinein":
        return InvoiceType.DineIn;
      case "takeaway":
        return InvoiceType.Takeaway;
      case "delivery":
        return InvoiceType.Delivery;
      default:
        return InvoiceType.Takeaway;
    }
  };

  const getInvoiceStatusText = (status) => {
    switch (status) {
      case InvoiceStatus.Open:
        return "مفتوحة";
      case InvoiceStatus.Done:
        return "مكتملة";
      case InvoiceStatus.Suspended:
        return "معلقة";
      case InvoiceStatus.Returned:
        return "مرتجعة";
      case InvoiceStatus.PartialPaid:
        return "آجل";
      default:
        return "غير معروفة";
    }
  };

  const getInvoiceStatusStyle = (status) => {
    switch (status) {
      case InvoiceStatus.Open:
        return "bg-blue-100 text-blue-800";
      case InvoiceStatus.Done:
        return "bg-green-100 text-green-800";
      case InvoiceStatus.Suspended:
        return "bg-orange-100 text-orange-800";
      case InvoiceStatus.Returned:
        return "bg-red-100 text-red-800";
      case InvoiceStatus.PartialPaid:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const fetchShiftDetails = async () => {
    if (shiftFetchedRef.current) {
      return currentShift;
    }

    try {
      setShiftLoading(true);
      const response = await axiosInstance.post("/api/Shifts/GetDetails");

      if (response.status === 200 && response.data) {
        setCurrentShift(response.data);
        setIsShiftOpen(true);
        setShiftStartTime(
          new Date(response.data.startTime).toLocaleTimeString("ar-EG"),
        );
        shiftFetchedRef.current = true;

        const totalInvoice = response.data.totalInvoice || 0;
        setTotalPages(totalInvoice);

        return response.data;
      } else {
        toast.error("فشل في جلب بيانات الوردية");
        return null;
      }
    } catch (error) {
      console.error("خطأ في جلب بيانات الوردية:", error);
      toast.error("حدث خطأ في جلب بيانات الوردية");
      return null;
    } finally {
      setShiftLoading(false);
    }
  };

  const shiftSummary = useMemo(() => {
    if (currentShift) {
      return {
        totalBills: currentShift.invoiceCount || 0,
        completedBills: currentShift.invoiceCount || 0,
        pendingBills: 0,
        returnedBills: 0,
        totalSales: currentShift.totalSales || 0,
        totalTax: 0,
        totalDiscount: 0,
        netRevenue: currentShift.totalSales || 0,
        startTime: new Date(currentShift.startTime).toLocaleTimeString("ar-EG"),
        shiftId: currentShift.shiftId,
        openingCash: currentShift.openingCash || 0,
        closingCash: currentShift.closingCash || 0,
        netCash: currentShift.netCash || 0,
        lastInvoiceId: currentShift.lastInvoiceId,
      };
    }

    const totalBills = bills.length;
    const completedBills = bills.filter((bill) => bill.completed).length;
    const pendingBills = totalBills - completedBills;
    const returnedBills = bills.filter((bill) => bill.isReturned).length;

    let totalSales = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let netRevenue = 0;

    bills.forEach((bill) => {
      if (bill.completed && !bill.isReturned) {
        const subtotal = bill.cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        const billTax = (subtotal * bill.tax) / 100;
        const billDiscount =
          bill.discountType === DiscountType.Fixed
            ? bill.discount
            : (subtotal * bill.discount) / 100;
        const billTotal =
          subtotal +
          billTax -
          billDiscount +
          (bill.billType === "delivery" ? bill.deliveryFee : 0);

        totalSales += billTotal;
        totalTax += billTax;
        totalDiscount += billDiscount;
        netRevenue += billTotal;
      }
    });

    return {
      totalBills,
      completedBills,
      pendingBills,
      returnedBills,
      totalSales,
      totalTax,
      totalDiscount,
      netRevenue,
      startTime: shiftStartTime,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bills, shiftStartTime, currentShift]);

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
          icon: getPaymentMethodIcon(method.name),
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

  const fetchDeliveryCompanies = async () => {
    if (deliveryCompaniesFetchedRef.current) {
      return;
    }

    try {
      setDeliveryCompaniesLoading(true);
      const response = await axiosInstance.get("/api/DeliveryCompany/GetAll");

      if (response.status === 200 && Array.isArray(response.data)) {
        const activeCompanies = response.data.filter(
          (company) => company.isActive,
        );
        setDeliveryCompanies(activeCompanies);
        deliveryCompaniesFetchedRef.current = true;
      } else {
        setDeliveryCompanies([]);
      }
    } catch (error) {
      console.error("خطأ في جلب شركات التوصيل:", error);
      toast.error("حدث خطأ في جلب شركات التوصيل");
      setDeliveryCompanies([]);
    } finally {
      setDeliveryCompaniesLoading(false);
    }
  };

  const searchCustomerByPhone = async (phone) => {
    if (!phone || phone.length < 11) {
      setCustomerName("");
      setCustomerAddress("");
      setCustomerNationalId("");
      setCustomerId(null);
      return;
    }

    try {
      setIsSearchingCustomer(true);
      const response = await axiosInstance.get(`/api/Reports/GetCustomer`, {
        params: { phone: phone },
      });

      if (response.status === 200 && response.data) {
        setCustomerName(response.data.name || "");
        setCustomerAddress(response.data.address || "");
        setCustomerNationalId(response.data.nationalId || "");
        setCustomerId(response.data.id);
      } else {
        setCustomerName("");
        setCustomerAddress("");
        setCustomerNationalId("");
        setCustomerId(null);
      }
    } catch (error) {
      console.error("خطأ في البحث عن العميل:", error);
      setCustomerName("");
      setCustomerAddress("");
      setCustomerNationalId("");
      setCustomerId(null);
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  const handleCustomerPhoneChange = (e) => {
    const phone = e.target.value;
    setCustomerPhone(phone);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      searchCustomerByPhone(phone);
    }, 500);

    setSearchTimeout(timeout);
  };

  const createCustomer = async () => {
    try {
      const response = await axiosInstance.post("/api/Customers/Add", {
        name: customerFormData.name,
        phone: customerFormData.phone,
        address: customerFormData.address || "",
        nationalId: customerFormData.nationalId || "",
      });

      if (response.status === 200 && response.data) {
        setCustomerName(customerFormData.name);
        setCustomerAddress(customerFormData.address || "");
        setCustomerNationalId(customerFormData.nationalId || "");
        setCustomerId(response.data.id);
        setShowCustomerModal(false);
        setCustomerFormData({
          name: "",
          phone: "",
          address: "",
          nationalId: "",
        });
        toast.success("تم إضافة العميل بنجاح");
      }
    } catch (error) {
      console.error("خطأ في إنشاء العميل:", error);
      toast.error("حدث خطأ في إنشاء العميل");
    }
  };

  const updateCustomer = async () => {
    try {
      const response = await axiosInstance.put(
        `/api/Customers/UpDate/${customerId}`,
        {
          name: customerFormData.name,
          phone: customerFormData.phone,
          address: customerFormData.address || "",
          nationalId: customerFormData.nationalId || "",
        },
      );

      if (response.status === 200) {
        setCustomerName(customerFormData.name);
        setCustomerAddress(customerFormData.address || "");
        setCustomerNationalId(customerFormData.nationalId || "");
        setShowCustomerModal(false);
        setCustomerFormData({
          name: "",
          phone: "",
          address: "",
          nationalId: "",
        });
        toast.success("تم تحديث بيانات العميل بنجاح");
      }
    } catch (error) {
      console.error("خطأ في تحديث العميل:", error);
      toast.error("حدث خطأ في تحديث العميل");
    }
  };

  const openAddCustomerModal = () => {
    setIsEditingCustomer(false);
    setCustomerFormData({
      name: "",
      phone: customerPhone,
      address: "",
      nationalId: "",
    });
    setShowCustomerModal(true);
  };

  const openEditCustomerModal = () => {
    setIsEditingCustomer(true);
    setCustomerFormData({
      name: customerName,
      phone: customerPhone,
      address: customerAddress,
      nationalId: customerNationalId,
    });
    setShowCustomerModal(true);
  };

  const handleCustomerFormChange = (e) => {
    const { name, value } = e.target;
    setCustomerFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const getPaymentMethodIcon = (name) => {
    const nameLower = name?.toLowerCase() || "";
    if (
      nameLower.includes("كاش") ||
      nameLower.includes("cash") ||
      nameLower.includes("نقد")
    ) {
      return "💰";
    } else if (
      nameLower.includes("فيزا") ||
      nameLower.includes("visa") ||
      nameLower.includes("كارد") ||
      nameLower.includes("card")
    ) {
      return "💳";
    } else if (
      nameLower.includes("محفظة") ||
      nameLower.includes("wallet") ||
      nameLower.includes("فودافون") ||
      nameLower.includes("vodafone")
    ) {
      return "📱";
    } else if (
      nameLower.includes("تحويل") ||
      nameLower.includes("transfer") ||
      nameLower.includes("بنك")
    ) {
      return "🏦";
    } else {
      return "💵";
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

  const fetchHalls = async () => {
    if (hallsFetchedRef.current) {
      return;
    }

    try {
      setHallsLoading(true);
      const response = await axiosInstance.get("/api/Hall/GetAll");

      if (response.status === 200 && response.data) {
        setHalls(response.data);
        hallsFetchedRef.current = true;

        if (response.data.length > 0 && !selectedHall) {
          setSelectedHall(response.data[0]);
        }
      } else {
        toast.error("فشل في جلب بيانات الصالات");
      }
    } catch (error) {
      console.error("خطأ في جلب الصالات:", error);
      toast.error("حدث خطأ في جلب بيانات الصالات");
    } finally {
      setHallsLoading(false);
    }
  };

  const fetchTables = async () => {
    if (tablesFetchedRef.current) {
      return;
    }

    try {
      setTablesLoading(true);
      const response = await axiosInstance.get("/api/Table/GetAll");

      if (response.status === 200 && response.data) {
        setTables(response.data);
        tablesFetchedRef.current = true;
      } else {
        toast.error("فشل في جلب بيانات الطاولات");
      }
    } catch (error) {
      console.error("خطأ في جلب الطاولات:", error);
      toast.error("حدث خطأ في جلب بيانات الطاولات");
    } finally {
      setTablesLoading(false);
    }
  };

  const fetchMainCategories = async () => {
    if (mainCategoriesFetchedRef.current) {
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/api/MainCategories/GetAllMainCategories",
      );

      if (response.status === 200 && response.data) {
        const activeMainCategories = response.data.filter(
          (cat) => cat.isActive,
        );
        setMainCategories(activeMainCategories);

        const allSubCategories = [];
        const allProductsList = [];

        response.data.forEach((mainCategory) => {
          if (
            mainCategory.subCategories &&
            mainCategory.subCategories.length > 0
          ) {
            mainCategory.subCategories.forEach((subCategory) => {
              if (subCategory.isActive) {
                allSubCategories.push({
                  id: subCategory.id,
                  name: subCategory.name,
                  mainCategoryId: subCategory.mainCategoryId,
                  mainCategoryName: subCategory.mainCategoryName,
                  isActive: subCategory.isActive,
                  percentageDiscount: subCategory.percentageDiscount,
                  printIP: subCategory.printIP,
                });

                if (subCategory.items && subCategory.items.length > 0) {
                  subCategory.items.forEach((item) => {
                    if (item.isAvailable) {
                      allProductsList.push({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.imgUrl,
                        mainCategoryId: item.mainCategoryId,
                        subCategoryId: item.subCategoryId,
                        finalPrice: item.finalPrice,
                        isAvailable: item.isAvailable,
                        valueAddedTax: item.valueAddedTax,
                        isTaxInclusive: item.isTaxInclusive,
                      });
                    }
                  });
                }
              }
            });
          }
        });

        setSubCategories(allSubCategories);
        setAllProducts(allProductsList);
        mainCategoriesFetchedRef.current = true;

        if (activeMainCategories.length > 0) {
          setSelectedMainCategory(activeMainCategories[0]);
        }
      } else {
        toast.error("فشل في جلب الفئات الرئيسية");
      }
    } catch (error) {
      console.error("خطأ في جلب الفئات الرئيسية:", error);
      toast.error("حدث خطأ في جلب الفئات الرئيسية");
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async (pageNumber = 1) => {
    try {
      setOptionsLoading(true);
      const response = await axiosInstance.post("/api/Options/GetAll", {
        pageNumber: pageNumber,
        pageSize: optionsPerPage,
        skip: (pageNumber - 1) * optionsPerPage,
      });

      if (response.status === 200 && response.data) {
        const items = response.data.items || [];
        const activeOptions = items.filter((option) => option.isActive);
        setOptions(activeOptions);
        setOptionsTotalPages(response.data.totalPages || 1);
        setOptionsTotalCount(response.data.totalCount || 0);
        setOptionsCurrentPage(response.data.pageNumber || 1);
      }
    } catch (error) {
      console.error("خطأ في جلب الإضافات:", error);
      toast.error("حدث خطأ في جلب الإضافات");
      setOptions([]);
    } finally {
      setOptionsLoading(false);
    }
  };

  const fetchLastInvoice = async () => {
    try {
      const lastPage = totalPages;

      const response = await axiosInstance.post("/api/Invoices/GetAll/all", {
        pageNumber: lastPage,
        pageSize: pageSize,
        skip: lastPage - 1,
      });

      if (response.status === 200 && response.data) {
        const invoicesData = response.data.items || [];
        setInvoices(invoicesData);
        setTotalInvoicesCount(response.data.totalCount || 0);
        setTotalPages(response.data.totalPages || 1);
        setCurrentInvoicePage(response.data.pageNumber || 1);

        return invoicesData;
      }
    } catch (error) {
      console.error("خطأ في جلب آخر فاتورة:", error);
      toast.error("حدث خطأ في جلب آخر فاتورة");
    }
  };

  const fetchInvoiceByPage = async (pageNumber) => {
    try {
      const response = await axiosInstance.post("/api/Invoices/GetAll/all", {
        pageNumber: pageNumber,
        pageSize: pageSize,
        skip: pageNumber - 1,
      });

      if (response.status === 200 && response.data) {
        const invoicesData = response.data.items || [];
        setInvoices(invoicesData);
        setTotalInvoicesCount(response.data.totalCount || 0);
        setTotalPages(response.data.totalPages || 1);
        setCurrentInvoicePage(response.data.pageNumber || 1);

        if (invoicesData.length > 0) {
          const invoice = invoicesData[0];
          convertInvoiceToBill(invoice, 0);
          setIsNewBillActive(false);
        }

        invoicesFetchedRef.current = true;
      }
    } catch (error) {
      console.error(`خطأ في جلب الفواتير للصفحة ${pageNumber}:`, error);
      toast.error("حدث خطأ في جلب الفواتير");
    }
  };

  const convertInvoiceToBill = (invoice, index) => {
    const cartItems =
      invoice.items?.map((item) => ({
        id: item.itemId,
        name: item.itemName,
        price: item.itemPriceSnapShoot || 0,
        quantity: item.quantity,
        image: "",
        uniqueId: `${item.itemId}_${Date.now()}_${Math.random()}`,
        selectedOptions:
          item.invoiceItemOptions?.map((opt) => ({
            id: opt.optionId,
            name: opt.optionNameSnapShoot,
            price: opt.optionPriceSnapShoot || 0,
          })) || [],
        optionsTotal:
          item.invoiceItemOptions?.reduce(
            (sum, opt) => sum + (opt.optionPriceSnapShoot || 0),
            0,
          ) * item.quantity || 0,
        note: "",
      })) || [];

    const invoiceStatus = invoice.invoiceStatus;
    const isCompleted = invoiceStatus === InvoiceStatus.Done;
    const isPending =
      invoiceStatus === InvoiceStatus.Open ||
      invoiceStatus === InvoiceStatus.Suspended;
    const isReturned = invoiceStatus === InvoiceStatus.Returned;
    const isPartialPaid = invoiceStatus === InvoiceStatus.PartialPaid;

    const billType = "takeaway";

    const bill = {
      id: index + 1,
      cart: cartItems,
      tax:
        invoice.taxTotal > 0
          ? (invoice.taxTotal / (invoice.subTotal || 1)) * 100
          : 14,
      discount: invoice.invoiceDiscount || 0,
      discountType: invoice.invoiceDiscountType || 0,
      deliveryFee: invoice.deliveryFee || 0,
      billType: billType,
      customerName: invoice.customerName || "",
      customerPhone: invoice.customerPhone || "",
      customerAddress: "",
      customerNationalId: "",
      customerId: invoice.customerId || null,
      tableStatus: invoice.tableId ? "occupied" : null,
      generalNote: "",
      paymentMethod: null,
      completed: isCompleted,
      isReturned: isReturned,
      isPartialPaid: isPartialPaid,
      returnReason: "",
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      invoiceStatus: invoiceStatus,
      tableId: invoice.tableId || null,
      tableName: invoice.tableName || null,
      isPending: isPending,
      deliveryType: null,
      deliveryCompanyId: null,
      deliveryCompanyName: null,
      deliveryCompanyContact: null,
    };

    setBills((prev) => {
      const newBills = [...prev];
      if (newBills[index]) {
        newBills[index] = bill;
      } else {
        newBills.push(bill);
      }
      return newBills;
    });

    setCurrentBillIndex(index);
    setCart(cartItems);
    setTax(bill.tax);
    setDiscount(bill.discount);
    setDeliveryFee(bill.deliveryFee);
    setCustomerPhone(bill.customerPhone || "");
    setCustomerName(bill.customerName || "");
    setCustomerId(bill.customerId || null);
    setGeneralNote(bill.generalNote || "");

    if (invoice.tableId && invoice.tableName) {
      const table = tables.find((t) => t.id === invoice.tableId);
      const hall = table ? halls.find((h) => h.id === table.hallId) : null;

      if (table && hall) {
        setSelectedTable({
          id: table.id,
          number: table.name,
          status: "occupied",
        });
        setSelectedHall(hall);
        setShowTableInfo(true);
        setTableStatus("occupied");
      }
    } else {
      setSelectedTable(null);
      setSelectedHall(null);
      setShowTableInfo(false);
      setTableStatus("available");
    }
  };

  const addNewBill = () => {
    const newBill = {
      id: bills.length + 1,
      cart: [],
      tax: 14,
      discount: 0,
      discountType: 0,
      deliveryFee: 0,
      billType: "takeaway",
      customerPhone: "",
      customerName: "",
      customerAddress: "",
      customerNationalId: "",
      customerId: null,
      generalNote: "",
      paymentMethod: null,
      completed: false,
      completedDate: null,
      tableInfo: null,
      tableStatus: null,
      isReturned: false,
      isPartialPaid: false,
      returnReason: "",
      invoiceId: null,
      invoiceNumber: null,
      invoiceDate: null,
      invoiceStatus: InvoiceStatus.Open,
      tableId: null,
      tableName: null,
      isPending: true,
      deliveryType: null,
      deliveryCompanyId: null,
      deliveryCompanyName: null,
      deliveryCompanyContact: null,
    };

    setBills((prev) => [...prev, newBill]);
    setCurrentBillIndex(bills.length);
    setCart([]);
    setTax(14);
    setDiscount(0);
    setDeliveryFee(0);
    setCustomerPhone("");
    setCustomerName("");
    setCustomerAddress("");
    setCustomerNationalId("");
    setCustomerId(null);
    setGeneralNote("");
    setSelectedHall(null);
    setSelectedTable(null);
    setShowTableInfo(false);
    setTableStatus("available");
    setIsNewBillActive(true);
    setDeliveryType(null);
    setSelectedDeliveryCompany(null);
  };

  const createInvoice = async (isPending = true, paymentMethodId = null) => {
    const currentBill = bills[currentBillIndex];

    if (!currentShift?.shiftId) {
      toast.error("لا توجد وردية نشطة");
      return null;
    }

    const invoiceData = {
      shiftId: currentShift.shiftId,
      tableId: selectedTable?.id || null,
      customerId: customerId || null,
      isPending: isPending,
      type: getInvoiceTypeFromBillType(currentBill.billType),
      paidAmount: isPending ? 0 : total,
      paymentMethodId: paymentMethodId,
      items: cart.map((item) => ({
        itemId: item.id,
        quantity: item.quantity,
        discount: item.discount || 0,
        discountType: DiscountType.Percentage,
        notes: item.note || "",
        options:
          item.selectedOptions?.map((opt) => ({
            optionId: opt.id,
            quantity: item.quantity,
          })) || [],
      })),
    };

    try {
      const response = await axiosInstance.post(
        "/api/Invoices/CreateInvoice",
        invoiceData,
      );

      if (response.status === 200 && response.data) {
        shiftFetchedRef.current = false;
        await fetchShiftDetails();

        invoicesFetchedRef.current = false;
        await fetchLastInvoice();

        return response.data;
      }
    } catch (error) {
      console.error("خطأ في إنشاء الفاتورة:", error);
      throw error;
    }
  };

  const applyDiscount = async (invoiceId, discountValue, discountType) => {
    try {
      const response = await axiosInstance.put(
        `/api/Invoices/ApplyDiscount/${invoiceId}/discount`,
        {
          discount: discountValue,
          discountType: discountType,
        },
      );

      if (response.status === 200) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("خطأ في تطبيق الخصم:", error);
      throw error;
    }
  };

  const createFullReturn = async (invoiceNumber) => {
    try {
      const response = await axiosInstance.post(
        "/api/Invoices/CreateFullReturn/returns",
        {
          invoiceNumber: invoiceNumber,
        },
      );

      if (response.status === 200) {
        shiftFetchedRef.current = false;
        await fetchShiftDetails();
        invoicesFetchedRef.current = false;
        await fetchLastInvoice();

        return response.data;
      }
    } catch (error) {
      console.error("خطأ في إنشاء مرتجع:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    const initializeData = async () => {
      fetchShiftDetails();
      fetchHalls();
      fetchTables();
      fetchMainCategories();
      fetchPaymentMethods();
      fetchDeliveryCompanies();
      addNewBill();
    };

    initializeData();

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedMainCategory && subCategories.length > 0) {
      const filteredSubs = subCategories.filter(
        (sub) => sub.mainCategoryId === selectedMainCategory.id,
      );
      if (filteredSubs.length > 0) {
        setSelectedSubCategory(filteredSubs[0]);
      } else {
        setSelectedSubCategory(null);
      }
    }
  }, [selectedMainCategory, subCategories]);

  const filteredProducts = useMemo(() => {
    if (!selectedSubCategory) return [];

    return allProducts.filter(
      (product) => product.subCategoryId === selectedSubCategory.id,
    );
  }, [selectedSubCategory, allProducts]);

  const paginatedOptions = options;

  const handleNextOptionsPage = () => {
    if (optionsCurrentPage < optionsTotalPages) {
      fetchOptions(optionsCurrentPage + 1);
    }
  };

  const handlePrevOptionsPage = () => {
    if (optionsCurrentPage > 1) {
      fetchOptions(optionsCurrentPage - 1);
    }
  };

  const billTypes = [
    { value: "takeaway", label: "سفري", icon: "" },
    { value: "dinein", label: "طاولة", icon: "" },
    { value: "delivery", label: "دليفري", icon: "" },
  ];

  const getBillTypeLabel = (type) => {
    const billType = billTypes.find((t) => t.value === type);
    return billType ? `${billType.icon} ${billType.label}` : "غير محدد";
  };

  const getTablesForCurrentHall = () => {
    if (!selectedHall) return [];
    const hallTables = tables.filter(
      (table) => table.hallId === selectedHall.id,
    );

    return hallTables.map((table) => ({
      id: table.id,
      number: table.name,
      status: getTableStatusText(table.status),
      currentBillId: table.currentBillId || null,
    }));
  };

  const updateTableStatus = async (hallId, tableId, newStatus) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    try {
      const response = await axiosInstance.put(`/api/Table/Update/${tableId}`, {
        name: table.name,
        hallId: hallId,
        status: getTableStatusFromText(newStatus),
      });

      if (response.status === 200) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === tableId
              ? { ...t, status: getTableStatusFromText(newStatus) }
              : t,
          ),
        );
      }
    } catch (error) {
      console.error("خطأ في تحديث حالة الطاولة:", error);
      toast.error("حدث خطأ في تحديث حالة الطاولة");
    }
  };

  const handleOpenTableSelection = () => {
    setShowTableSelection(true);
    if (!selectedHall && halls.length > 0) {
      setSelectedHall(halls[0]);
    }
  };

  const handleBillTypeChange = (type) => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن تغيير نوع الفاتورة المكتملة");
      return;
    }

    const updatedBills = [...bills];

    if (type === "dinein") {
      setShowTableSelection(true);
      if (!selectedHall && halls.length > 0) {
        setSelectedHall(halls[0]);
      }
      return;
    } else if (type === "delivery") {
      setShowDeliveryTypeModal(true);
      setDeliveryType(null);
      setSelectedDeliveryCompany(null);
      setDeliveryFee(0);
    } else {
      if (selectedTable && selectedHall) {
        updateTableStatus(selectedHall.id, selectedTable.id, "available", null);
      }

      setSelectedTable(null);
      setSelectedHall(null);
      setShowTableInfo(false);
      setTableStatus("available");

      updatedBills[currentBillIndex] = {
        ...updatedBills[currentBillIndex],
        billType: type,
        deliveryFee: 0,
        tableInfo: null,
        tableStatus: null,
        tableId: null,
        tableName: null,
        deliveryType: null,
        deliveryCompanyId: null,
        deliveryCompanyName: null,
        deliveryCompanyContact: null,
      };
      setBills(updatedBills);

      setDeliveryFee(0);
      setDeliveryType(null);
      setSelectedDeliveryCompany(null);

      toast.info(`تم تغيير نوع الفاتورة إلى ${getBillTypeLabel(type)}`);
    }
  };

  const handleSelectHall = (hall) => {
    setSelectedHall(hall);
  };

  const handleSelectTable = (table) => {
    if (table.status === "occupied") {
      toast.info("جاري تحميل الفاتورة الخاصة بهذه الطاولة");

      const tableBillIndex = bills.findIndex(
        (bill) => bill.tableId === table.id && !bill.completed,
      );

      if (tableBillIndex !== -1) {
        const tableBill = bills[tableBillIndex];
        setCurrentBillIndex(tableBillIndex);
        setCart([...tableBill.cart]);
        setTax(tableBill.tax);
        setDiscount(tableBill.discount);
        setDeliveryFee(0);
        setCustomerPhone(tableBill.customerPhone || "");
        setCustomerName(tableBill.customerName || "");
        setCustomerAddress(tableBill.customerAddress || "");
        setCustomerNationalId(tableBill.customerNationalId || "");
        setCustomerId(tableBill.customerId || null);
        setSelectedHall(halls.find((h) => h.id === table.hallId));
        setSelectedTable(table);
        setShowTableInfo(true);
        setTableStatus(tableBill.tableStatus || "occupied");

        setShowTableSelection(false);
        toast.success(`تم تحميل فاتورة الطاولة ${table.number}`);
        return;
      } else {
        toast.error("لا توجد فاتورة نشطة لهذه الطاولة");
        return;
      }
    }

    setSelectedTable(table);

    const updatedBills = [...bills];
    updatedBills[currentBillIndex] = {
      ...updatedBills[currentBillIndex],
      billType: "dinein",
      tableInfo: {
        hallId: selectedHall.id,
        hallName: selectedHall.name,
        tableId: table.id,
        tableNumber: table.number,
      },
      tableId: table.id,
      tableName: table.number,
      tableStatus: "available",
    };
    setBills(updatedBills);

    updateTableStatus(
      selectedHall.id,
      table.id,
      "available",
      currentBillIndex + 1,
    );
    setTableStatus("available");

    setShowTableSelection(false);
    setShowTableInfo(true);

    toast.success(`تم اختيار ${table.number} في ${selectedHall.name}`);
  };

  const handleCloseTableSelection = () => {
    setShowTableSelection(false);

    if (bills[currentBillIndex]?.billType === "dinein" && !selectedTable) {
      const updatedBills = [...bills];
      updatedBills[currentBillIndex] = {
        ...updatedBills[currentBillIndex],
        billType: "takeaway",
        tableInfo: null,
        tableStatus: null,
        tableId: null,
        tableName: null,
      };
      setBills(updatedBills);

      toast.info("تم إلغاء اختيار الطاولة");
    }
  };

  const handleCloseDeliveryTypeModal = () => {
    setShowDeliveryTypeModal(false);
  };

  const handleSelectDeliveryType = (type) => {
    setDeliveryType(type);

    if (type === DeliveryType.Store) {
      setShowDeliveryCompanyModal(false);
      setShowDeliveryTypeModal(false);
      setDeliveryFee(25);
      setSelectedDeliveryCompany(null);

      const updatedBills = [...bills];
      updatedBills[currentBillIndex] = {
        ...updatedBills[currentBillIndex],
        billType: "delivery",
        deliveryFee: 25,
        deliveryType: DeliveryType.Store,
        deliveryCompanyId: null,
        deliveryCompanyName: null,
        deliveryCompanyContact: null,
      };
      setBills(updatedBills);

      toast.success("تم اختيار دليفري المحل");
    } else if (type === DeliveryType.Company) {
      setShowDeliveryCompanyModal(true);
    }
  };

  const handleSelectDeliveryCompany = (company) => {
    setSelectedDeliveryCompany(company);
    setDeliveryType(DeliveryType.Company);
    setDeliveryFee(company.deliveryCost || 0);
    setShowDeliveryCompanyModal(false);
    setShowDeliveryTypeModal(false);

    const updatedBills = [...bills];
    updatedBills[currentBillIndex] = {
      ...updatedBills[currentBillIndex],
      billType: "delivery",
      deliveryFee: company.deliveryCost || 0,
      deliveryType: DeliveryType.Company,
      deliveryCompanyId: company.id,
      deliveryCompanyName: company.name,
      deliveryCompanyContact: company.contactNumber,
    };
    setBills(updatedBills);

    toast.success(
      `تم اختيار شركة ${company.name} (رسوم التوصيل: ${company.deliveryCost || 0} ج.م)`,
    );
  };

  const handleRemoveTable = () => {
    if (!selectedTable || !selectedHall) {
      toast.error("لم يتم اختيار طاولة");
      return;
    }

    if (tableStatus === "available") {
      toast.error("الطاولة متاحة بالفعل");
      return;
    }

    const hasProducts = cart.length > 0;
    const productCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (hasProducts) {
      toast.info(
        <div className="p-3">
          <p className="font-bold mb-2">هل أنت متأكد من إزالة الطاولة؟</p>
          <p className="text-sm text-gray-600 mb-2">
            الطاولة: {selectedTable.number} ({selectedHall.name})
          </p>
          <p className="text-sm text-gray-600 mb-3">
            سيتم إزالة {productCount} منتج من الفاتورة
          </p>
          <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-3">
            <button
              onClick={() => {
                toast.dismiss();
                updateTableStatus(
                  selectedHall.id,
                  selectedTable.id,
                  "available",
                  null,
                );

                const updatedBills = [...bills];
                updatedBills[currentBillIndex] = {
                  ...updatedBills[currentBillIndex],
                  cart: [],
                  tableInfo: null,
                  tableStatus: null,
                  billType: "takeaway",
                  generalNote: "",
                  paymentMethod: null,
                  invoiceId: null,
                  invoiceNumber: null,
                  tableId: null,
                  tableName: null,
                };
                setBills(updatedBills);

                setCart([]);
                setTax(14);
                setDiscount(0);
                setDeliveryFee(0);
                setCustomerPhone("");
                setCustomerName("");
                setCustomerAddress("");
                setCustomerNationalId("");
                setCustomerId(null);
                setTableStatus("available");
                setSelectedTable(null);
                setSelectedHall(null);
                setShowTableInfo(false);

                toast.success(
                  <div>
                    <p className="font-bold">تم إزالة الطاولة</p>
                    <p className="text-sm mt-1">
                      تم إزالة جميع المنتجات من الفاتورة
                    </p>
                  </div>,
                );
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              نعم، إزالة
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
    } else {
      updateTableStatus(selectedHall.id, selectedTable.id, "available", null);

      const updatedBills = [...bills];
      updatedBills[currentBillIndex] = {
        ...updatedBills[currentBillIndex],
        tableInfo: null,
        tableStatus: null,
        billType: "takeaway",
        tableId: null,
        tableName: null,
      };
      setBills(updatedBills);

      setTableStatus("available");
      setSelectedTable(null);
      setSelectedHall(null);
      setShowTableInfo(false);

      toast.success("تم إزالة الطاولة وجعلها متاحة");
    }
  };

  useEffect(() => {
    const saveCurrentBill = () => {
      const currentBill = bills[currentBillIndex];
      const updatedBills = [...bills];
      updatedBills[currentBillIndex] = {
        id: currentBillIndex + 1,
        cart: [...cart],
        tax,
        discount,
        discountType: currentBill?.discountType || 0,
        deliveryFee: currentBill?.billType === "delivery" ? deliveryFee : 0,
        billType: currentBill?.billType || "takeaway",
        customerPhone: customerPhone,
        customerName: customerName,
        customerAddress: customerAddress,
        customerNationalId: customerNationalId,
        customerId: customerId,
        generalNote: generalNote,
        paymentMethod: currentBill?.paymentMethod || null,
        completed: currentBill?.completed || false,
        completedDate: currentBill?.completedDate || null,
        tableInfo: currentBill?.tableInfo || null,
        tableStatus: currentBill?.tableStatus || null,
        tableId: currentBill?.tableId || null,
        tableName: currentBill?.tableName || null,
        isReturned: currentBill?.isReturned || false,
        isPartialPaid: currentBill?.isPartialPaid || false,
        returnReason: currentBill?.returnReason || "",
        invoiceId: currentBill?.invoiceId || null,
        invoiceNumber: currentBill?.invoiceNumber || null,
        invoiceDate: currentBill?.invoiceDate || null,
        invoiceStatus: currentBill?.invoiceStatus || InvoiceStatus.Open,
        isPending: currentBill?.isPending !== false,
        deliveryType: currentBill?.deliveryType || deliveryType,
        deliveryCompanyId:
          currentBill?.deliveryCompanyId || selectedDeliveryCompany?.id,
        deliveryCompanyName:
          currentBill?.deliveryCompanyName || selectedDeliveryCompany?.name,
        deliveryCompanyContact:
          currentBill?.deliveryCompanyContact ||
          selectedDeliveryCompany?.contactNumber,
      };
      setBills(updatedBills);
    };

    saveCurrentBill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cart,
    tax,
    discount,
    deliveryFee,
    customerPhone,
    customerName,
    customerAddress,
    customerNationalId,
    customerId,
    generalNote,
    deliveryType,
    selectedDeliveryCompany,
  ]);

  useEffect(() => {
    const currentBill = bills[currentBillIndex];
    if (currentBill) {
      setCustomerPhone(currentBill.customerPhone || "");
      setCustomerName(currentBill.customerName || "");
      setCustomerAddress(currentBill.customerAddress || "");
      setCustomerNationalId(currentBill.customerNationalId || "");
      setCustomerId(currentBill.customerId || null);
      setGeneralNote(currentBill.generalNote || "");

      if (currentBill.billType === "delivery") {
        setDeliveryFee(currentBill.deliveryFee || 0);
        setDeliveryType(currentBill.deliveryType || null);
        if (currentBill.deliveryCompanyId) {
          const company = deliveryCompanies.find(
            (c) => c.id === currentBill.deliveryCompanyId,
          );
          setSelectedDeliveryCompany(company || null);
        }
      } else {
        setDeliveryFee(0);
        setDeliveryType(null);
        setSelectedDeliveryCompany(null);
      }

      if (currentBill.tableId) {
        const table = tables.find((t) => t.id === currentBill.tableId);
        const hall = table ? halls.find((h) => h.id === table.hallId) : null;

        if (table && hall) {
          setSelectedHall(hall);
          setSelectedTable({
            id: table.id,
            number: table.name,
            status: currentBill.tableStatus || "occupied",
          });
          setShowTableInfo(true);
          setTableStatus(currentBill.tableStatus || "occupied");
        }
      } else {
        setSelectedHall(null);
        setSelectedTable(null);
        setShowTableInfo(false);
        setTableStatus("available");
      }
    }
  }, [currentBillIndex, bills, halls, tables, deliveryCompanies]);

  const handleProductClick = (product) => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن إضافة منتجات إلى فاتورة مكتملة");
      return;
    }

    setSelectedProduct(product);
    setProductQuantity(1);
    setSelectedOptions([]);
    setOptionsCurrentPage(1);
    fetchOptions(1);
    setShowProductModal(true);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const optionsTotal = selectedOptions.reduce(
      (sum, option) => sum + option.price,
      0,
    );

    const existingItem = cart.find((item) => item.id === selectedProduct.id);

    if (existingItem) {
      const sameOptions =
        existingItem.selectedOptions &&
        JSON.stringify(existingItem.selectedOptions.map((o) => o.id).sort()) ===
          JSON.stringify(selectedOptions.map((o) => o.id).sort());

      if (sameOptions) {
        setCart(
          cart.map((item) =>
            item.id === selectedProduct.id
              ? {
                  ...item,
                  quantity: item.quantity + productQuantity,
                  optionsTotal:
                    (item.optionsTotal || 0) + optionsTotal * productQuantity,
                }
              : item,
          ),
        );
      } else {
        const newItem = {
          ...selectedProduct,
          uniqueId: `${selectedProduct.id}_${Date.now()}`,
          quantity: productQuantity,
          selectedOptions: selectedOptions,
          optionsTotal: optionsTotal * productQuantity,
          note: "",
        };
        setCart([...cart, newItem]);
      }
    } else {
      const newItem = {
        ...selectedProduct,
        uniqueId: `${selectedProduct.id}_${Date.now()}`,
        quantity: productQuantity,
        selectedOptions: selectedOptions,
        optionsTotal: optionsTotal * productQuantity,
        note: "",
      };
      setCart([...cart, newItem]);
    }

    const productName = selectedProduct.name;

    toast.success(
      <div>
        <p className="font-bold">
          تم إضافة {productQuantity} × {productName}
        </p>
        {selectedOptions.length > 0 && (
          <p className="text-xs mt-1 text-gray-600">
            الإضافات: {selectedOptions.map((o) => o.name).join(", ")}
          </p>
        )}
      </div>,
    );

    setShowProductModal(false);
    setSelectedProduct(null);
    setProductQuantity(1);
    setSelectedOptions([]);
  };

  const toggleOption = (option) => {
    const isSelected = selectedOptions.some((o) => o.id === option.id);

    if (isSelected) {
      setSelectedOptions(selectedOptions.filter((o) => o.id !== option.id));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const removeFromCart = (uniqueId) => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }

    const existingItem = cart.find((item) => item.uniqueId === uniqueId);

    if (existingItem.quantity > 1) {
      setCart(
        cart.map((item) =>
          item.uniqueId === uniqueId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        ),
      );
    } else {
      setCart(cart.filter((item) => item.uniqueId !== uniqueId));
    }
  };

  const deleteFromCart = (uniqueId) => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن حذف منتجات من فاتورة مكتملة");
      return;
    }

    setCart(cart.filter((item) => item.uniqueId !== uniqueId));
  };

  const handleAddNote = (uniqueId, note) => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }

    setCart(
      cart.map((item) =>
        item.uniqueId === uniqueId ? { ...item, note: note } : item,
      ),
    );
    setEditingNoteProductId(null);
    setTempNote("");

    if (note.trim()) {
      toast.info("تم حفظ الملاحظة");
    }
  };

  const startEditingNote = (uniqueId, currentNote) => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }

    setEditingNoteProductId(uniqueId);
    setTempNote(currentNote || "");
  };

  const startEditingGeneralNote = () => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }

    setIsEditingGeneralNote(true);
    setTempGeneralNote(generalNote || "");
  };

  const handleSaveGeneralNote = () => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }

    setGeneralNote(tempGeneralNote);
    setIsEditingGeneralNote(false);

    if (tempGeneralNote.trim()) {
      toast.info("تم حفظ الملاحظة العامة");
    }
  };

  const handleCancelGeneralNote = () => {
    setIsEditingGeneralNote(false);
    setTempGeneralNote("");
  };

  const openPaymentModal = () => {
    if (cart.length === 0) {
      toast.error("الفاتورة فارغة");
      return;
    }

    if (bills[currentBillIndex]?.billType === "dinein" && !selectedTable) {
      toast.error("يرجى اختيار طاولة أولاً");
      setShowTableSelection(true);
      return;
    }

    if (bills[currentBillIndex]?.billType === "delivery") {
      if (!customerPhone || customerPhone.length < 11) {
        toast.error("يرجى إدخال رقم هاتف صحيح للتوصيل");
        return;
      }
      if (!deliveryType) {
        toast.error("يرجى اختيار نوع التوصيل");
        setShowDeliveryTypeModal(true);
        return;
      }
    }

    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPaymentMethod(null);
  };

  const openDiscountModal = () => {
    if (cart.length === 0) {
      toast.error("الفاتورة فارغة");
      return;
    }

    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن تطبيق خصم على فاتورة مكتملة");
      return;
    }

    setDiscountValue(discount);
    setDiscountType(bills[currentBillIndex]?.discountType || 0);
    setShowDiscountModal(true);
  };

  const closeDiscountModal = () => {
    setShowDiscountModal(false);
  };

  const handleApplyDiscount = async () => {
    const currentBill = bills[currentBillIndex];

    if (discountValue < 0) {
      toast.error("قيمة الخصم يجب أن تكون أكبر من صفر");
      return;
    }

    if (discountType === DiscountType.Percentage && discountValue > 100) {
      toast.error("نسبة الخصم لا يمكن أن تزيد عن 100%");
      return;
    }

    if (discountType === DiscountType.Fixed && discountValue > subtotal) {
      toast.error("قيمة الخصم لا يمكن أن تزيد عن إجمالي الفاتورة");
      return;
    }

    if (currentBill.invoiceId) {
      try {
        const success = await applyDiscount(
          currentBill.invoiceId,
          discountValue,
          discountType,
        );

        if (success) {
          setDiscount(discountValue);

          const updatedBills = [...bills];
          updatedBills[currentBillIndex] = {
            ...currentBill,
            discount: discountValue,
            discountType: discountType,
          };
          setBills(updatedBills);

          setShowDiscountModal(false);
          toast.success("تم تطبيق الخصم بنجاح");
        }
      } catch (error) {
        console.error("خطأ في تطبيق الخصم:", error);
        toast.error("حدث خطأ في تطبيق الخصم");
      }
    } else {
      setDiscount(discountValue);

      const updatedBills = [...bills];
      updatedBills[currentBillIndex] = {
        ...currentBill,
        discount: discountValue,
        discountType: discountType,
      };
      setBills(updatedBills);

      setShowDiscountModal(false);
      toast.success("تم تطبيق الخصم بنجاح");
    }
  };

  const handleCompletePayment = async () => {
    if (!selectedPaymentMethod) {
      toast.error("يرجى اختيار طريقة الدفع");
      return;
    }

    try {
      const invoiceResponse = await createInvoice(false, selectedPaymentMethod);

      if (invoiceResponse) {
        const updatedBills = [...bills];
        updatedBills[currentBillIndex] = {
          ...updatedBills[currentBillIndex],
          completed: true,
          completedDate: new Date().toLocaleString(),
          paymentMethod: selectedPaymentMethod,
          isReturned: false,
          isPartialPaid: false,
          returnReason: "",
          invoiceId: invoiceResponse.id,
          invoiceNumber: invoiceResponse.invoiceNumber,
          invoiceStatus: InvoiceStatus.Done,
          isPending: false,
        };
        setBills(updatedBills);

        if (selectedTable && selectedHall) {
          updateTableStatus(
            selectedHall.id,
            selectedTable.id,
            "available",
            null,
          );
        }

        const currentBillType = bills[currentBillIndex]?.billType || "takeaway";
        const currentDeliveryFee =
          currentBillType === "delivery" ? deliveryFee : 0;

        const paymentMethod = paymentMethods.find(
          (p) => p.id === selectedPaymentMethod,
        );

        const discountAmount =
          discountType === DiscountType.Fixed
            ? discount
            : (subtotal * discount) / 100;

        toast.success(
          <div>
            <p className="font-bold">
              تم إتمام الفاتورة رقم{" "}
              {invoiceResponse.invoiceNumber || currentBillIndex + 1}
            </p>
            {selectedTable && (
              <p className="text-sm mt-1">
                الطاولة: {selectedTable.number} ({selectedHall.name})
              </p>
            )}
            <p className="text-sm mt-1">
              نوع الفاتورة: {getBillTypeLabel(currentBillType)}
            </p>
            {currentBillType === "delivery" && deliveryType && (
              <p className="text-sm mt-1">
                نوع التوصيل:{" "}
                {deliveryType === DeliveryType.Store
                  ? "دليفري المحل"
                  : selectedDeliveryCompany?.name}
                {deliveryType === DeliveryType.Company &&
                  selectedDeliveryCompany?.contactNumber && (
                    <span className="text-xs text-gray-600 mr-1">
                      (رقم: {selectedDeliveryCompany.contactNumber})
                    </span>
                  )}
              </p>
            )}
            <p className="text-sm mt-1">
              طريقة الدفع: {paymentMethod?.name || "غير معروفة"}{" "}
              {paymentMethod?.icon}
            </p>
            {customerName && (
              <p className="text-sm mt-1">العميل: {customerName}</p>
            )}
            {customerPhone && (
              <p className="text-xs text-gray-600 mt-1">
                هاتف: {customerPhone}
              </p>
            )}
            {customerAddress && (
              <p className="text-xs text-gray-600 mt-1">
                العنوان: {customerAddress}
              </p>
            )}
            {customerNationalId && (
              <p className="text-xs text-gray-600 mt-1">
                الرقم القومي: {customerNationalId}
              </p>
            )}
            {generalNote && (
              <p className="text-sm mt-1 text-blue-600">
                ملاحظة: {generalNote}
              </p>
            )}
            {currentDeliveryFee > 0 && (
              <p className="text-sm mt-1">
                رسوم التوصيل: {currentDeliveryFee.toFixed(2)} ج.م
              </p>
            )}
            {discount > 0 && (
              <p className="text-sm mt-1 text-green-600">
                الخصم: {discountAmount.toFixed(2)} ج.م
                {discountType === DiscountType.Percentage
                  ? ` (${discount}%)`
                  : ""}
              </p>
            )}
            <p className="text-sm mt-1">الإجمالي: {total.toFixed(2)} ج.م</p>
            <p className="text-xs text-gray-600 mt-1">
              تم حفظ الفاتورة في النظام
            </p>
          </div>,
          { autoClose: 5000 },
        );

        addNewBill();
        setShowPaymentModal(false);
        setSelectedPaymentMethod(null);
      }
    } catch (error) {
      console.error("خطأ في إتمام الدفع:", error);
      toast.error("حدث خطأ في إتمام عملية الدفع");
    }
  };

  const goToNextBill = async () => {
    if (isNewBillActive) {
      toast.info("أنت في الفاتورة الجديدة");
      return;
    }

    if (currentInvoicePage < totalPages) {
      const nextPage = currentInvoicePage + 1;
      await fetchInvoiceByPage(nextPage);
    } else {
      setIsNewBillActive(true);
      setCurrentInvoicePage(totalPages + 1);

      setCart([]);
      setTax(14);
      setDiscount(0);
      setDeliveryFee(0);
      setCustomerPhone("");
      setCustomerName("");
      setCustomerAddress("");
      setCustomerNationalId("");
      setCustomerId(null);
      setGeneralNote("");
      setSelectedHall(null);
      setSelectedTable(null);
      setShowTableInfo(false);
      setTableStatus("available");
      setDeliveryType(null);
      setSelectedDeliveryCompany(null);

      toast.info("فاتورة جديدة");
    }
  };

  const goToPreviousBill = async () => {
    if (isNewBillActive) {
      if (totalPages > 0) {
        await fetchInvoiceByPage(totalPages);
        setIsNewBillActive(false);
      } else {
        toast.warning("لا توجد فواتير سابقة");
      }
    } else {
      if (currentInvoicePage > 1) {
        const prevPage = currentInvoicePage - 1;
        await fetchInvoiceByPage(prevPage);
      } else {
        setIsNewBillActive(true);
        setCurrentInvoicePage(0);
        setCart([]);
        setTax(14);
        setDiscount(0);
        setDeliveryFee(0);
        setCustomerPhone("");
        setCustomerName("");
        setCustomerAddress("");
        setCustomerNationalId("");
        setCustomerId(null);
        setGeneralNote("");
        setSelectedHall(null);
        setSelectedTable(null);
        setShowTableInfo(false);
        setTableStatus("available");
        setDeliveryType(null);
        setSelectedDeliveryCompany(null);

        toast.info("فاتورة جديدة");
      }
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity + (item.optionsTotal || 0),
    0,
  );
  const totalTax = (subtotal * tax) / 100;
  const discountAmount =
    discountType === DiscountType.Fixed
      ? discount
      : (subtotal * discount) / 100;
  const total =
    subtotal +
    totalTax -
    discountAmount +
    (bills[currentBillIndex]?.billType === "delivery" ? deliveryFee : 0);

  const handlePrepareOrder = async () => {
    if (cart.length === 0) {
      toast.error("الفاتورة فارغة");
      return;
    }

    if (!selectedTable) {
      toast.error("لم يتم اختيار طاولة");
      return;
    }

    try {
      const invoiceResponse = await createInvoice(true, null);

      const updatedBills = [...bills];
      updatedBills[currentBillIndex] = {
        id: currentBillIndex + 1,
        cart: [...cart],
        tax,
        discount,
        discountType: bills[currentBillIndex]?.discountType || 0,
        deliveryFee:
          bills[currentBillIndex]?.billType === "delivery" ? deliveryFee : 0,
        billType: "dinein",
        customerPhone: customerPhone,
        customerName: customerName,
        customerAddress: customerAddress,
        customerNationalId: customerNationalId,
        customerId: customerId,
        generalNote: generalNote,
        paymentMethod: null,
        completed: false,
        completedDate: null,
        tableInfo: {
          hallId: selectedHall.id,
          hallName: selectedHall.name,
          tableId: selectedTable.id,
          tableNumber: selectedTable.number,
        },
        tableId: selectedTable.id,
        tableName: selectedTable.number,
        tableStatus: "occupied",
        isReturned: false,
        isPartialPaid: false,
        returnReason: "",
        invoiceId: invoiceResponse.id,
        invoiceNumber: invoiceResponse.invoiceNumber,
        invoiceStatus: InvoiceStatus.Open,
        isPending: true,
        deliveryType: null,
        deliveryCompanyId: null,
        deliveryCompanyName: null,
        deliveryCompanyContact: null,
      };

      updateTableStatus(
        selectedHall.id,
        selectedTable.id,
        "occupied",
        currentBillIndex + 1,
      );
      setTableStatus("occupied");

      addNewBill();

      toast.success(
        `تم تحضير طلب الطاولة ${selectedTable.number} وفتح فاتورة جديدة`,
      );
    } catch (error) {
      console.error("خطأ في تحضير الطلب:", error);
      toast.error("حدث خطأ في تحضير الطلب");
    }
  };

  const handleCompleteBill = () => {
    openPaymentModal();
  };

  const handleReturnBill = async () => {
    const currentBill = bills[currentBillIndex];

    if (!currentBill.completed) {
      toast.error("لا يمكن إرجاع فاتورة غير مكتملة");
      return;
    }

    if (currentBill.isReturned) {
      toast.error("هذه الفاتورة بالفعل مرتجعة");
      return;
    }

    if (!currentBill.invoiceNumber) {
      toast.error("لا يوجد رقم فاتورة للإرجاع");
      return;
    }

    const { value: returnReason, isConfirmed } = await Swal.fire({
      title: "إرجاع الفاتورة",
      html: `
        <div class="text-right">
          <p class="mb-3">فاتورة رقم #${currentBill.invoiceNumber}</p>
          <p class="mb-4 text-gray-600">المبلغ الإجمالي: ${total.toFixed(2)} ج.م</p>
          <div class="mb-4">
            <label class="block text-sm text-gray-700 mb-2">سبب الارتجاع (اختياري)</label>
            <textarea 
              id="return-reason" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-right" 
              rows="3" 
              placeholder="أدخل سبب الارتجاع..."
            ></textarea>
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "تأكيد الإرجاع",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
      preConfirm: () => {
        const reasonInput = document.getElementById("return-reason");
        return reasonInput ? reasonInput.value : "";
      },
    });

    if (!isConfirmed) {
      return;
    }

    const confirmation = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم تحويل الفاتورة إلى فاتورة مرتجعة ولن يمكن التراجع عن هذا الإجراء.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم، تأكيد الإرجاع",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      if (currentBill.invoiceNumber) {
        await createFullReturn(currentBill.invoiceNumber);
      }

      const updatedBills = [...bills];
      updatedBills[currentBillIndex] = {
        ...currentBill,
        isReturned: true,
        returnReason: returnReason || "بدون سبب",
        returnedDate: new Date().toLocaleString(),
        invoiceStatus: InvoiceStatus.Returned,
      };
      setBills(updatedBills);

      if (currentBill.tableId && selectedHall && selectedTable) {
        updateTableStatus(selectedHall.id, selectedTable.id, "available", null);
        setTableStatus("available");
      }

      Swal.fire({
        title: "تم الإرجاع بنجاح!",
        html: `
          <div class="text-right">
            <p>تم تحويل الفاتورة #${currentBill.invoiceNumber} إلى فاتورة مرتجعة</p>
            <p class="mt-2 text-gray-600">${returnReason ? `السبب: ${returnReason}` : "بدون سبب محدد"}</p>
            <p class="mt-2 text-sm text-gray-500">التاريخ: ${new Date().toLocaleString()}</p>
          </div>
        `,
        icon: "success",
        confirmButtonText: "تم",
        confirmButtonColor: "#10B981",
      });

      toast.success(`تم إرجاع الفاتورة رقم ${currentBill.invoiceNumber} بنجاح`);
    } catch (error) {
      console.error("خطأ في إرجاع الفاتورة:", error);
      toast.error("حدث خطأ في إرجاع الفاتورة");
    }
  };

  const handleReprintBill = () => {
    if (cart.length === 0) {
      toast.error("الفاتورة فارغة");
      return;
    }

    const billNumber =
      bills[currentBillIndex]?.invoiceNumber || currentBillIndex + 1;
    const currentBill = bills[currentBillIndex];
    const invoiceStatus = currentBill?.invoiceStatus;
    const currentBillType = currentBill?.billType || "takeaway";
    const currentDeliveryFee = currentBillType === "delivery" ? deliveryFee : 0;
    const currentPaymentMethod = currentBill?.paymentMethod;
    const paymentMethod = paymentMethods.find(
      (p) => p.id === currentPaymentMethod,
    );
    const paymentMethodName = paymentMethod?.name || "غير محدد";
    const paymentMethodIcon = paymentMethod?.icon || "";

    toast.info(
      <div>
        <p className="font-bold">فاتورة رقم {billNumber}</p>
        {invoiceStatus !== undefined && (
          <p className="text-xs text-gray-500 mb-1">
            الحالة: {getInvoiceStatusText(invoiceStatus)}
          </p>
        )}
        {currentBill.returnReason && (
          <p className="text-xs text-red-600 mb-1">
            سبب الارتجاع: {currentBill.returnReason}
          </p>
        )}
        {selectedTable && (
          <p className="text-xs text-gray-600 mb-1">
            الطاولة: {selectedTable.number} ({selectedHall?.name})
          </p>
        )}
        <p className="text-sm text-gray-600 mb-1">
          نوع الفاتورة: {getBillTypeLabel(currentBillType)}
        </p>
        {currentBillType === "delivery" && currentBill.deliveryType && (
          <p className="text-xs text-gray-600 mb-1">
            نوع التوصيل:{" "}
            {currentBill.deliveryType === DeliveryType.Store
              ? "دليفري المحل"
              : currentBill.deliveryCompanyName}
            {currentBill.deliveryType === DeliveryType.Company &&
              currentBill.deliveryCompanyContact && (
                <span className="text-[10px] text-gray-500 mr-1">
                  (رقم: {currentBill.deliveryCompanyContact})
                </span>
              )}
          </p>
        )}
        {customerName && (
          <p className="text-xs text-gray-600 mb-1">العميل: {customerName}</p>
        )}
        {customerPhone && (
          <p className="text-xs text-gray-600 mb-1">هاتف: {customerPhone}</p>
        )}
        {customerAddress && (
          <p className="text-xs text-gray-600 mb-1">
            العنوان: {customerAddress}
          </p>
        )}
        {customerNationalId && (
          <p className="text-xs text-gray-600 mb-1">
            الرقم القومي: {customerNationalId}
          </p>
        )}
        {generalNote && (
          <p className="text-xs text-blue-600 mb-1">ملاحظة: {generalNote}</p>
        )}
        {currentPaymentMethod && (
          <p className="text-xs text-green-600 mb-1">
            طريقة الدفع: {paymentMethodName} {paymentMethodIcon}
          </p>
        )}
        <div className="text-xs mt-2 max-h-32 overflow-y-auto">
          {cart.map((item, index) => (
            <div
              key={index}
              className="flex justify-between py-1 border-b border-gray-100"
            >
              <div className="flex-1">
                <span className="truncate max-w-[120px] block">
                  {item.name} × {item.quantity}
                </span>
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <span className="text-[10px] text-amber-600 block truncate max-w-[120px]">
                    إضافات: {item.selectedOptions.map((o) => o.name).join(", ")}
                  </span>
                )}
                {item.note && item.note.trim() && (
                  <span className="text-[10px] text-gray-500 block truncate max-w-[120px]">
                    ملاحظة: {item.note}
                  </span>
                )}
              </div>
              <span className="whitespace-nowrap">
                {item.price * item.quantity + (item.optionsTotal || 0)} ج.م
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex justify-between text-xs">
            <span>المجموع الفرعي:</span>
            <span>{subtotal.toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>الضريبة ({tax}%):</span>
            <span>{totalTax.toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>الخصم:</span>
            <span>
              {discountAmount.toFixed(2)} ج.م
              {discountType === DiscountType.Percentage
                ? ` (${discount}%)`
                : ""}
            </span>
          </div>
          {currentDeliveryFee > 0 && (
            <div className="flex justify-between text-xs">
              <span>رسوم التوصيل:</span>
              <span>{currentDeliveryFee.toFixed(2)} ج.م</span>
            </div>
          )}
          <div className="flex justify-between font-bold mt-1 text-sm">
            <span>الإجمالي:</span>
            <span>{total.toFixed(2)} ج.م</span>
          </div>
        </div>
      </div>,
      { autoClose: 6000 },
    );
  };

  const resetCart = () => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن إعادة تعيين فاتورة مكتملة");
      return;
    }

    if (cart.length === 0) {
      toast.info("الفاتورة فارغة بالفعل");
      return;
    }

    setCart([]);
    setTax(14);
    setDiscount(0);
    setDeliveryFee(0);
    setCustomerPhone("");
    setCustomerName("");
    setCustomerAddress("");
    setCustomerNationalId("");
    setCustomerId(null);
    setGeneralNote("");
    setDeliveryType(null);
    setSelectedDeliveryCompany(null);
    toast.info("تم إعادة تعيين الفاتورة");
  };

  const handleShiftClose = () => {
    setIsShiftOpen(false);
    toast.success("تم إغلاق الوردية بنجاح!");
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col bg-gradient-to-l from-gray-50 to-gray-100 overflow-hidden"
    >
      <Navbar
        isShiftOpen={isShiftOpen}
        onShiftClose={handleShiftClose}
        shiftSummary={shiftSummary}
      />

      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ color: "#193F94" }}>
                  تخصيص المنتج
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop&crop=center";
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">
                      {selectedProduct.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      السعر الأساسي: {selectedProduct.price} ج.م
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الكمية
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() =>
                      setProductQuantity(Math.max(1, productQuantity - 1))
                    }
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold"
                  >
                    -
                  </button>
                  <span className="mx-4 font-bold text-lg min-w-[40px] text-center">
                    {productQuantity}
                  </span>
                  <button
                    onClick={() => setProductQuantity(productQuantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {options.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      الإضافات المتاحة
                    </label>
                  </div>

                  <div className="relative flex items-center">
                    <button
                      onClick={handlePrevOptionsPage}
                      disabled={optionsCurrentPage === 1 || optionsLoading}
                      className={`absolute right-0 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        optionsCurrentPage === 1 || optionsLoading
                          ? "text-gray-300 cursor-not-allowed bg-gray-100"
                          : "text-gray-600 hover:bg-gray-200 hover:text-gray-800 bg-white shadow-md border border-gray-200"
                      }`}
                      style={{ transform: "translateX(50%)" }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>

                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 w-full mx-6 min-h-[120px]">
                      {optionsLoading ? (
                        <div className="flex items-center justify-center h-20">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-1">
                          {paginatedOptions.map((option) => {
                            const isSelected = selectedOptions.some(
                              (o) => o.id === option.id,
                            );
                            return (
                              <button
                                key={option.id}
                                onClick={() => toggleOption(option)}
                                className={`h-12 px-2 rounded-lg border-2 flex items-center justify-between transition-all w-full ${
                                  isSelected
                                    ? "border-blue-500 bg-blue-50 shadow-sm"
                                    : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center space-x-1 rtl:space-x-reverse overflow-hidden">
                                    <div
                                      className={`w-3 h-3 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                        isSelected
                                          ? "border-blue-500 bg-blue-500"
                                          : "border-gray-300"
                                      }`}
                                    >
                                      {isSelected && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                      )}
                                    </div>
                                    <span className="font-medium text-xs truncate max-w-[60px]">
                                      {option.name}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-gray-600 whitespace-nowrap mr-1 flex-shrink-0">
                                    +{option.price} ج.م
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleNextOptionsPage}
                      disabled={
                        optionsCurrentPage === optionsTotalPages ||
                        optionsLoading
                      }
                      className={`absolute left-0 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        optionsCurrentPage === optionsTotalPages ||
                        optionsLoading
                          ? "text-gray-300 cursor-not-allowed bg-gray-100"
                          : "text-gray-600 hover:bg-gray-200 hover:text-gray-800 bg-white shadow-md border border-gray-200"
                      }`}
                      style={{ transform: "translateX(-50%)" }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-bold">إجمالي المنتج:</span>
                  <span
                    className="font-bold text-lg"
                    style={{ color: "#193F94" }}
                  >
                    {(
                      selectedProduct.price * productQuantity +
                      selectedOptions.reduce((sum, o) => sum + o.price, 0) *
                        productQuantity
                    ).toFixed(2)}{" "}
                    ج.م
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  <div>
                    السعر الأساسي: {selectedProduct.price} ج.م ×{" "}
                    {productQuantity}
                  </div>
                  {selectedOptions.length > 0 && (
                    <div>
                      الإضافات: +
                      {selectedOptions.reduce((sum, o) => sum + o.price, 0)} ج.م
                      × {productQuantity}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-3 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 rounded-lg font-bold text-white transition-colors"
                  style={{ backgroundColor: "#193F94" }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#0f2a6b";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#193F94";
                  }}
                >
                  تأكيد الإضافة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold" style={{ color: "#193F94" }}>
                  تطبيق خصم
                </h3>
                <button
                  onClick={closeDiscountModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">المجموع الفرعي</p>
                      <p
                        className="text-xl font-bold"
                        style={{ color: "#193F94" }}
                      >
                        {subtotal.toFixed(2)} ج.م
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">الفاتورة الحالية</p>
                      <p className="text-xs text-gray-500">
                        {cart.length} منتج
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع الخصم
                    </label>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => setDiscountType(DiscountType.Percentage)}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                          discountType === DiscountType.Percentage
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        نسبة مئوية (%)
                      </button>
                      <button
                        onClick={() => setDiscountType(DiscountType.Fixed)}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                          discountType === DiscountType.Fixed
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        قيمة ثابتة (ج.م)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {discountType === DiscountType.Percentage
                        ? "نسبة الخصم (%)"
                        : "قيمة الخصم (ج.م)"}
                    </label>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                      min="0"
                      max={
                        discountType === DiscountType.Percentage
                          ? 100
                          : subtotal
                      }
                      step={discountType === DiscountType.Percentage ? 1 : 0.01}
                      dir="ltr"
                      autoFocus
                    />
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">قيمة الخصم:</span>
                      <span className="font-bold text-blue-600">
                        {discountType === DiscountType.Percentage
                          ? `${((subtotal * discountValue) / 100).toFixed(2)} ج.م (${discountValue}%)`
                          : `${discountValue.toFixed(2)} ج.م`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">
                        الإجمالي بعد الخصم:
                      </span>
                      <span className="font-bold text-green-600">
                        {discountType === DiscountType.Percentage
                          ? (
                              subtotal -
                              (subtotal * discountValue) / 100
                            ).toFixed(2)
                          : (subtotal - discountValue).toFixed(2)}{" "}
                        ج.م
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  onClick={closeDiscountModal}
                  className="flex-1 py-3 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleApplyDiscount}
                  className="flex-1 py-3 px-4 rounded-lg font-bold text-white transition-colors"
                  style={{ backgroundColor: "#193F94" }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#0f2a6b";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#193F94";
                  }}
                >
                  تطبيق الخصم
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#193F94" }}
                  >
                    {isEditingCustomer
                      ? "تعديل بيانات العميل"
                      : "إضافة عميل جديد"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {isEditingCustomer
                      ? "قم بتعديل بيانات العميل"
                      : "أدخل بيانات العميل الجديد"}
                  </p>
                </div>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isEditingCustomer) {
                    updateCustomer();
                  } else {
                    createCustomer();
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={customerFormData.name}
                      onChange={handleCustomerFormChange}
                      onFocus={() => handleFocus("name")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "name" || customerFormData.name
                          ? "-top-2.5 text-xs text-blue-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        اسم العميل *
                      </span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={customerFormData.phone}
                      onChange={handleCustomerFormChange}
                      onFocus={() => handleFocus("phone")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "phone" || customerFormData.phone
                          ? "-top-2.5 text-xs text-blue-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
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
                        رقم الهاتف *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="address"
                      value={customerFormData.address}
                      onChange={handleCustomerFormChange}
                      onFocus={() => handleFocus("address")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "address" || customerFormData.address
                          ? "-top-2.5 text-xs text-blue-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        العنوان
                      </span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      name="nationalId"
                      value={customerFormData.nationalId}
                      onChange={handleCustomerFormChange}
                      onFocus={() => handleFocus("nationalId")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "nationalId" ||
                        customerFormData.nationalId
                          ? "-top-2.5 text-xs text-blue-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
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
                            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                          />
                        </svg>
                        الرقم القومي
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowCustomerModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all flex items-center justify-center text-sm"
                  >
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center text-sm"
                    style={{ backgroundColor: "#193F94" }}
                  >
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {isEditingCustomer ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      )}
                    </svg>
                    {isEditingCustomer ? "حفظ التعديلات" : "إضافة عميل"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeliveryTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#193F94" }}
                  >
                    اختيار نوع التوصيل
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    اختر نوع التوصيل المناسب
                  </p>
                </div>
                <button
                  onClick={handleCloseDeliveryTypeModal}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleSelectDeliveryType(DeliveryType.Store)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-gray-50 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center border border-blue-300">
                      <span className="text-blue-700 font-bold text-xl">
                        🏪
                      </span>
                    </div>
                    <div className="mr-3 text-right">
                      <h4 className="font-bold text-gray-800">دليفري المحل</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        رسوم التوصيل: 25 ج.م (قابلة للتعديل)
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => handleSelectDeliveryType(DeliveryType.Company)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-gray-50 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center border border-purple-300">
                      <span className="text-purple-700 font-bold text-xl">
                        🚚
                      </span>
                    </div>
                    <div className="mr-3 text-right">
                      <h4 className="font-bold text-gray-800">شركة توصيل</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        اختر من شركات التوصيل المتاحة
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-gray-100">
                <button
                  onClick={handleCloseDeliveryTypeModal}
                  className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeliveryCompanyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#193F94" }}
                  >
                    اختيار شركة التوصيل
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    اختر شركة التوصيل المناسبة
                  </p>
                </div>
                <button
                  onClick={() => setShowDeliveryCompanyModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto pr-1">
                {deliveryCompaniesLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-2">
                      جاري تحميل الشركات...
                    </p>
                  </div>
                ) : deliveryCompanies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>لا توجد شركات توصيل متاحة</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {deliveryCompanies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => handleSelectDeliveryCompany(company)}
                        className={`p-4 border-2 rounded-xl transition-all flex items-center justify-between ${
                          selectedDeliveryCompany?.id === company.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center border border-purple-300">
                            <span className="text-purple-700 font-bold text-base">
                              🚚
                            </span>
                          </div>
                          <div className="mr-2 text-right">
                            <h4 className="font-bold text-gray-800 text-sm">
                              {company.name}
                            </h4>
                            <div className="flex flex-col items-start mt-1">
                              <p className="text-xs text-gray-600">
                                رسوم: {company.deliveryCost || 0} ج.م
                              </p>
                              {company.contactNumber && (
                                <p className="text-[10px] text-blue-600">
                                  {company.contactNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedDeliveryCompany?.id === company.id
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedDeliveryCompany?.id === company.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t-2 border-gray-100">
                <button
                  onClick={() => setShowDeliveryCompanyModal(false)}
                  className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTableSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold" style={{ color: "#193F94" }}>
                  اختيار الطاولة
                </h3>
                <button
                  onClick={handleCloseTableSelection}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mt-1">
                اختر الصالة ثم اختر الطاولة المناسبة
              </p>
            </div>

            <div className="flex-1 overflow-hidden flex">
              <div className="w-1/4 border-l bg-gray-50">
                <div className="p-3 border-b">
                  <h4 className="font-bold text-gray-700">الصالات</h4>
                </div>
                <div className="overflow-y-auto h-full">
                  {hallsLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      جاري تحميل الصالات...
                    </div>
                  ) : halls.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      لا توجد صالات متاحة
                    </div>
                  ) : (
                    halls.map((hall) => (
                      <button
                        key={hall.id}
                        onClick={() => handleSelectHall(hall)}
                        className={`w-full p-3 text-right border-b transition-all ${
                          selectedHall?.id === hall.id
                            ? "bg-blue-50 border-r-4"
                            : "hover:bg-gray-100"
                        }`}
                        style={{
                          borderRightColor:
                            selectedHall?.id === hall.id
                              ? "#3B82F6"
                              : "transparent",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: "#3B82F6" }}
                          />
                          <div className="flex-1 mr-2">
                            <p className="font-medium">{hall.name}</p>
                            <p className="text-xs text-gray-500">
                              {hall.isCompleted ? "محجوزة بالكامل" : "متاحة"}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                {selectedHall ? (
                  <>
                    <div className="mb-4">
                      <h4
                        className="font-bold text-lg"
                        style={{ color: "#3B82F6" }}
                      >
                        {selectedHall.name}
                      </h4>
                      <p className="text-gray-600">
                        اختر طاولة من القائمة التالية:
                      </p>
                    </div>
                    {tablesLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        جاري تحميل الطاولات...
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {getTablesForCurrentHall().map((table) => (
                          <button
                            key={table.id}
                            onClick={() => handleSelectTable(table)}
                            disabled={selectedHall?.isCompleted}
                            className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                              selectedHall?.isCompleted
                                ? "opacity-50 cursor-not-allowed"
                                : table.status === "occupied"
                                  ? "bg-red-50 border-red-300"
                                  : selectedTable?.id === table.id
                                    ? "bg-blue-50 border-blue-500"
                                    : "bg-white border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            <p className="font-bold text-lg">{table.number}</p>
                            <div
                              className={`mt-2 px-2 py-1 rounded-full text-xs ${
                                table.status === "available"
                                  ? "bg-green-100 text-green-800"
                                  : table.status === "occupied"
                                    ? "bg-red-100 text-red-800"
                                    : table.status === "reserved"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {table.status === "available"
                                ? "متاحة"
                                : table.status === "occupied"
                                  ? "مشغولة"
                                  : table.status === "reserved"
                                    ? "محجوزة"
                                    : "معطلة"}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <p className="text-lg">اختر صالة أولاً</p>
                    <p className="text-sm mt-2">
                      اختر صالة من القائمة على اليسار لرؤية الطاولات المتاحة
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  {selectedHall && (
                    <p className="text-sm text-gray-600">
                      الصالة المختارة:{" "}
                      <span className="font-medium">{selectedHall.name}</span>
                    </p>
                  )}
                  {selectedTable && (
                    <p className="text-sm text-gray-600">
                      الطاولة المختارة:{" "}
                      <span className="font-medium">
                        {selectedTable.number}
                      </span>
                    </p>
                  )}
                </div>
                <button
                  onClick={handleCloseTableSelection}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold" style={{ color: "#193F94" }}>
                  اختيار طريقة الدفع
                </h3>
                <button
                  onClick={closePaymentModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">إجمالي الفاتورة</p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "#193F94" }}
                      >
                        {total.toFixed(2)} ج.م
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        فاتورة #
                        {bills[currentBillIndex]?.invoiceNumber ||
                          (isNewBillActive ? "جديدة" : currentBillIndex + 1)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {cart.length} منتج
                      </p>
                    </div>
                  </div>
                  {discount > 0 && (
                    <div className="mt-2 text-xs text-green-600">
                      الخصم: {discountAmount.toFixed(2)} ج.م
                      {discountType === DiscountType.Percentage
                        ? ` (${discount}%)`
                        : ""}
                    </div>
                  )}
                </div>

                {paymentMethodsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-gray-500">
                      جاري تحميل طرق الدفع...
                    </p>
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>لا توجد طرق دفع متاحة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods
                      .filter((method) => method.isActive)
                      .map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`w-full p-4 rounded-lg border-2 flex items-center justify-between transition-all ${
                            selectedPaymentMethod === method.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{method.icon}</span>
                            <div className="text-right">
                              <p className="font-medium">{method.name}</p>
                            </div>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedPaymentMethod === method.id
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedPaymentMethod === method.id && (
                              <div className="w-3 h-3 rounded-full bg-white"></div>
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  onClick={closePaymentModal}
                  className="flex-1 py-3 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCompletePayment}
                  disabled={!selectedPaymentMethod || paymentMethodsLoading}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold text-white transition-colors ${
                    !selectedPaymentMethod || paymentMethodsLoading
                      ? "opacity-50 cursor-not-allowed bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  style={{
                    backgroundColor:
                      !selectedPaymentMethod || paymentMethodsLoading
                        ? ""
                        : "#193F94",
                  }}
                >
                  تأكيد الدفع
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 container mx-auto px-4 py-4 flex flex-col h-[calc(100vh-80px)]">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-4 h-full overflow-hidden flex flex-col">
              {loading || shiftLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="flex space-x-1 rtl:space-x-reverse mb-3 border-b border-gray-200 overflow-x-auto">
                      {mainCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedMainCategory(category)}
                          className={`flex items-center justify-center px-4 py-3 text-sm font-medium transition-all duration-300 whitespace-nowrap border-b-2 min-w-[120px] ${
                            selectedMainCategory?.id === category.id
                              ? "border-blue-500 text-blue-700 bg-blue-50 rounded-t-lg"
                              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                          style={{
                            borderBottomColor:
                              selectedMainCategory?.id === category.id
                                ? "#3B82F6"
                                : "transparent",
                          }}
                        >
                          <span className="text-center">{category.name}</span>
                        </button>
                      ))}
                    </div>

                    {selectedMainCategory && (
                      <div className="flex space-x-2 rtl:space-x-reverse mb-4 overflow-x-auto pb-1">
                        {subCategories
                          .filter(
                            (sub) =>
                              sub.mainCategoryId === selectedMainCategory.id,
                          )
                          .map((subCategory) => (
                            <button
                              key={subCategory.id}
                              onClick={() =>
                                setSelectedSubCategory(subCategory)
                              }
                              className={`flex items-center justify-center px-4 py-2 text-xs font-medium transition-all duration-300 whitespace-nowrap rounded-full border min-w-[100px] ${
                                selectedSubCategory?.id === subCategory.id
                                  ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 shadow-sm"
                                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                              }`}
                            >
                              <span className="text-center">
                                {subCategory.name}
                              </span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between items-center">
                      <h2
                        className="text-lg font-bold"
                        style={{ color: "#193F94" }}
                      >
                        المنتجات
                        {selectedSubCategory && (
                          <span className="text-sm font-normal text-gray-600 mr-2">
                            - {selectedSubCategory.name}
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {filteredProducts.length} منتج متاح
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2">
                    {filteredProducts.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                        <div className="text-4xl mb-4">📦</div>
                        <p className="text-sm">لا توجد منتجات في هذه الفئة</p>
                        <p className="text-xs mt-1">
                          اختر فئة أخرى لعرض المنتجات
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 gap-2">
                        {filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product)}
                            disabled={bills[currentBillIndex]?.completed}
                            className={`bg-gray-50 hover:bg-blue-50 rounded-lg p-2 flex items-center transition-all duration-300 transform active:scale-[0.98] border border-gray-200 h-20 ${
                              bills[currentBillIndex]?.completed
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden ml-2 flex-shrink-0">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop&crop=center";
                                }}
                              />
                            </div>

                            <div className="flex-1 text-right">
                              <h3 className="font-medium text-gray-800 text-xs mb-1 leading-tight">
                                {product.name}
                              </h3>
                              <p
                                className="text-sm font-bold"
                                style={{ color: "#193F94" }}
                              >
                                {product.price} ج.م
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 h-full flex flex-col">
            <div className="bg-white rounded-xl shadow-lg p-4 flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "#193F94" }}
                  >
                    الفاتورة
                  </h2>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <button
                      onClick={goToPreviousBill}
                      disabled={
                        !isNewBillActive &&
                        currentInvoicePage === 1 &&
                        totalPages === 0
                      }
                      className={`px-2 py-1 rounded text-xs transition-all ${
                        !isNewBillActive &&
                        currentInvoicePage === 1 &&
                        totalPages === 0
                          ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      }`}
                    >
                      السابق
                    </button>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <span
                          className="text-sm font-bold"
                          style={{ color: "#193F94" }}
                        >
                          فاتورة
                        </span>
                        {isNewBillActive ? (
                          <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                            جديدة
                          </span>
                        ) : (
                          <>
                            <span>
                              #
                              {bills[currentBillIndex]?.invoiceNumber ||
                                currentBillIndex + 1}
                            </span>
                            {bills[currentBillIndex]?.invoiceStatus !==
                              undefined && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full ${getInvoiceStatusStyle(bills[currentBillIndex].invoiceStatus)}`}
                              >
                                {getInvoiceStatusText(
                                  bills[currentBillIndex].invoiceStatus,
                                )}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={goToNextBill}
                      className="px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs transition-all"
                    >
                      التالي
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex space-x-1 rtl:space-x-reverse">
                    {billTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => handleBillTypeChange(type.value)}
                        disabled={bills[currentBillIndex]?.completed}
                        className={`flex-1 flex items-center justify-center py-1.5 rounded border transition-all text-xs ${
                          bills[currentBillIndex]?.billType === type.value
                            ? "bg-blue-100 border-blue-500 text-blue-700 font-medium"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                        } ${bills[currentBillIndex]?.completed ? "opacity-70 cursor-not-allowed" : ""}`}
                      >
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {showTableInfo && selectedTable && selectedHall && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-white p-3 rounded-xl border border-blue-200 shadow-sm">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center border border-blue-300">
                          <span className="text-blue-700 font-bold text-lg">
                            {selectedTable.number}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <span className="text-blue-800 font-bold text-sm">
                              {selectedHall.name}
                            </span>
                            <div
                              className={`mr-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                tableStatus === "occupied"
                                  ? "bg-red-100 text-red-700 border border-red-200"
                                  : "bg-green-100 text-green-700 border border-green-200"
                              }`}
                            >
                              {tableStatus === "occupied" ? "مشغولة" : "متاحة"}
                            </div>
                          </div>
                          <div className="text-xs text-blue-600 flex items-center">
                            <svg
                              className="w-3 h-3 ml-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            طاولة رقم {selectedTable.number}
                          </div>
                        </div>
                      </div>
                      {!bills[currentBillIndex]?.completed && (
                        <div className="flex space-x-1 rtl:space-x-reverse">
                          <button
                            onClick={handleOpenTableSelection}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-gray-300"
                          >
                            <svg
                              className="w-3 h-3 ml-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            تغيير
                          </button>
                          {tableStatus === "occupied" && (
                            <button
                              onClick={handleRemoveTable}
                              className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-red-200"
                            >
                              <svg
                                className="w-3 h-3 ml-1"
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
                              إزالة
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {bills[currentBillIndex]?.billType === "delivery" &&
                  deliveryType && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-white py-2 px-2 rounded-lg border border-amber-200 shadow-sm">
                        <div className="flex items-center">
                          <span className="text-amber-700 text-xs ml-1">
                            {deliveryType === DeliveryType.Store ? "🏪" : "🚚"}
                          </span>
                          <span className="text-amber-800 font-medium text-[13px]">
                            {deliveryType === DeliveryType.Store
                              ? "دليفري المحل"
                              : selectedDeliveryCompany?.name}
                          </span>
                          <span className="mr-1 px-1 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-medium">
                            {deliveryFee} ج.م
                          </span>
                        </div>
                        {!bills[currentBillIndex]?.completed && (
                          <button
                            onClick={() => setShowDeliveryTypeModal(true)}
                            className="text-[9px] bg-amber-100 hover:bg-amber-200 text-amber-700 px-1 py-1 rounded transition-colors flex items-center"
                          >
                            <svg
                              className="w-3 h-3 ml-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      {deliveryType === DeliveryType.Company &&
                        selectedDeliveryCompany?.contactNumber && (
                          <div className="text-[8px] text-amber-600 mt-0.5 mr-5 flex items-center">
                            <svg
                              className="w-2 h-2 ml-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            {selectedDeliveryCompany.contactNumber}
                          </div>
                        )}
                    </div>
                  )}

                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={handleCustomerPhoneChange}
                        onFocus={() => handleFocus("phone")}
                        onBlur={handleBlur}
                        disabled={bills[currentBillIndex]?.completed}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white disabled:bg-gray-100"
                        dir="rtl"
                      />
                      <label
                        className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                          focusedField === "phone" || customerPhone
                            ? "-top-2 text-xs text-blue-500 font-medium"
                            : "top-2 text-gray-400 text-sm"
                        }`}
                      >
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
                          رقم الهاتف
                        </span>
                      </label>
                      {isSearchingCustomer && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {customerId && (
                      <div className="flex items-center bg-gradient-to-r from-blue-50 to-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-blue-800">
                              {customerName}
                            </span>
                            {customerAddress && (
                              <span className="text-[10px] text-gray-600 truncate max-w-[150px]">
                                {customerAddress}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={openEditCustomerModal}
                            disabled={bills[currentBillIndex]?.completed}
                            className="p-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-all border border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="تعديل بيانات العميل"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {!customerId &&
                      customerPhone &&
                      customerPhone.length >= 11 && (
                        <button
                          onClick={openAddCustomerModal}
                          disabled={bills[currentBillIndex]?.completed}
                          className="p-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 transition-all border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="إضافة عميل جديد"
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
                              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            />
                          </svg>
                        </button>
                      )}
                  </div>
                </div>

                <div className="mb-3">
                  {isEditingGeneralNote ? (
                    <div>
                      <textarea
                        value={tempGeneralNote}
                        onChange={(e) => setTempGeneralNote(e.target.value)}
                        placeholder="اكتب ملاحظة عامة للفاتورة..."
                        className="w-full px-2 py-1.5 text-xs border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        rows="2"
                        autoFocus
                      />
                      <div className="flex justify-end space-x-1 rtl:space-x-reverse mt-1">
                        <button
                          onClick={handleCancelGeneralNote}
                          className="px-2 py-1 text-[10px] bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={handleSaveGeneralNote}
                          className="px-2 py-1 text-[10px] bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          حفظ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {generalNote ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 min-h-[40px]">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-xs text-blue-800">
                                {generalNote}
                              </p>
                            </div>
                            {!bills[currentBillIndex]?.completed && (
                              <button
                                onClick={startEditingGeneralNote}
                                className="text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md transition-colors flex items-center border border-blue-300 mr-2"
                              >
                                <svg
                                  className="w-2.5 h-2.5 ml-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                تعديل
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={startEditingGeneralNote}
                          disabled={bills[currentBillIndex]?.completed}
                          className={`w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-right flex items-center justify-between ${
                            bills[currentBillIndex]?.completed
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <span>إضافة ملاحظة عامة للفاتورة...</span>
                          <svg
                            className="w-3 h-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isNewBillActive
                        ? "bg-purple-100 text-purple-800"
                        : getInvoiceStatusStyle(
                            bills[currentBillIndex]?.invoiceStatus,
                          )
                    }`}
                  >
                    {cart.length} منتج
                    {isNewBillActive && " (جديدة)"}
                  </span>
                  {!isNewBillActive &&
                    bills[currentBillIndex]?.completedDate && (
                      <span className="text-[10px] text-gray-500">
                        {bills[currentBillIndex].completedDate}
                      </span>
                    )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mb-3 pr-2 min-h-0">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 py-4">
                    <div className="text-5xl mb-4">🛒</div>
                    <p className="text-sm">لا توجد منتجات</p>
                    <p className="text-xs mt-1">قم بإضافة منتجات من القائمة</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div
                        key={item.uniqueId || item.id}
                        className="bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-xs"
                      >
                        <div className="p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-300">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop&crop=center";
                                }}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-bold text-sm text-gray-800 truncate max-w-[120px]">
                                    {item.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {item.price} ج.م للوحدة
                                  </p>
                                </div>
                                <div className="text-left">
                                  <p
                                    className="font-bold text-sm"
                                    style={{ color: "#193F94" }}
                                  >
                                    {item.price * item.quantity +
                                      (item.optionsTotal || 0)}{" "}
                                    ج.م
                                  </p>
                                  <p className="text-[10px] text-gray-500">
                                    {item.quantity} × {item.price}
                                    {item.optionsTotal > 0 && ` + إضافات`}
                                  </p>
                                </div>
                              </div>

                              {item.selectedOptions &&
                                item.selectedOptions.length > 0 && (
                                  <div className="mt-1">
                                    <p className="text-[10px] text-amber-600">
                                      إضافات:{" "}
                                      {item.selectedOptions
                                        .map(
                                          (o) => `${o.name} (+${o.price} ج.م)`,
                                        )
                                        .join(", ")}
                                    </p>
                                  </div>
                                )}

                              <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center">
                                  <button
                                    onClick={() =>
                                      removeFromCart(item.uniqueId || item.id)
                                    }
                                    disabled={
                                      bills[currentBillIndex]?.completed
                                    }
                                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                                      bills[currentBillIndex]?.completed
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                    }`}
                                  >
                                    -
                                  </button>
                                  <span className="mx-1.5 font-bold text-sm min-w-[20px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const existingItem = cart.find(
                                        (i) =>
                                          (i.uniqueId || i.id) ===
                                          (item.uniqueId || item.id),
                                      );
                                      if (existingItem) {
                                        setCart(
                                          cart.map((i) =>
                                            (i.uniqueId || i.id) ===
                                            (item.uniqueId || item.id)
                                              ? {
                                                  ...i,
                                                  quantity: i.quantity + 1,
                                                  optionsTotal:
                                                    (i.optionsTotal || 0) +
                                                    (item.selectedOptions
                                                      ? item.selectedOptions.reduce(
                                                          (sum, o) =>
                                                            sum + o.price,
                                                          0,
                                                        )
                                                      : 0),
                                                }
                                              : i,
                                          ),
                                        );
                                      }
                                    }}
                                    disabled={
                                      bills[currentBillIndex]?.completed
                                    }
                                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                                      bills[currentBillIndex]?.completed
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                    }`}
                                  >
                                    +
                                  </button>
                                </div>

                                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                                  {!bills[currentBillIndex]?.completed && (
                                    <>
                                      {item.note && item.note.trim() ? (
                                        <button
                                          onClick={() =>
                                            startEditingNote(
                                              item.uniqueId || item.id,
                                              item.note,
                                            )
                                          }
                                          className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-md transition-colors flex items-center border border-blue-200"
                                        >
                                          <svg
                                            className="w-2.5 h-2.5 ml-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                          </svg>
                                          ملاحظة
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            startEditingNote(
                                              item.uniqueId || item.id,
                                              item.note,
                                            )
                                          }
                                          className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md transition-colors flex items-center border border-gray-300"
                                        >
                                          <svg
                                            className="w-2.5 h-2.5 ml-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                            />
                                          </svg>
                                          ملاحظة
                                        </button>
                                      )}
                                    </>
                                  )}
                                  {!bills[currentBillIndex]?.completed && (
                                    <button
                                      onClick={() =>
                                        deleteFromCart(item.uniqueId || item.id)
                                      }
                                      className="text-[10px] bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded-md transition-colors flex items-center border border-red-200"
                                    >
                                      <svg
                                        className="w-2.5 h-2.5 ml-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        {...{
                                          strokeLinecap: "round",
                                          strokeLinejoin: "round",
                                          strokeWidth: 2,
                                          d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
                                        }}
                                      />
                                      حذف
                                    </button>
                                  )}
                                </div>
                              </div>

                              {editingNoteProductId ===
                              (item.uniqueId || item.id) ? (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <textarea
                                    value={tempNote}
                                    onChange={(e) =>
                                      setTempNote(e.target.value)
                                    }
                                    placeholder="اكتب ملاحظة لهذا المنتج..."
                                    className="w-full px-2 py-1.5 text-xs border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                    rows="2"
                                    autoFocus
                                  />
                                  <div className="flex justify-end space-x-1 rtl:space-x-reverse mt-1">
                                    <button
                                      onClick={() => {
                                        setEditingNoteProductId(null);
                                        setTempNote("");
                                      }}
                                      className="px-2 py-1 text-[10px] bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                    >
                                      إلغاء
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleAddNote(
                                          item.uniqueId || item.id,
                                          tempNote,
                                        )
                                      }
                                      className="px-2 py-1 text-[10px] bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                      حفظ
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                item.note &&
                                item.note.trim() && (
                                  <div className="mt-1.5 pt-1.5 border-t border-gray-200">
                                    <div className="flex items-start">
                                      <svg
                                        className="w-2.5 h-2.5 text-blue-500 mt-0.5 ml-1 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <p className="text-xs text-blue-800 flex-1 line-clamp-2">
                                        {item.note}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-3 space-y-1.5 mt-auto">
                <div className="flex justify-between text-xs">
                  <span>المجموع الفرعي:</span>
                  <span className="font-bold">{subtotal.toFixed(2)} ج.م</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span>الضريبة:</span>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(Number(e.target.value))}
                      className="w-12 text-right px-1 py-1 border rounded mr-1.5 text-xs"
                      min="0"
                      max="100"
                      disabled={bills[currentBillIndex]?.completed}
                    />
                    <span className="font-bold">{totalTax.toFixed(2)} ج.م</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span>الخصم:</span>
                  <div className="flex items-center">
                    <button
                      onClick={openDiscountModal}
                      disabled={bills[currentBillIndex]?.completed}
                      className={`w-12 text-center px-1 py-1 border rounded mr-1.5 text-xs ${
                        bills[currentBillIndex]?.completed
                          ? "bg-gray-100 cursor-not-allowed"
                          : "bg-blue-50 hover:bg-blue-100 cursor-pointer border-blue-200"
                      }`}
                    >
                      {discount}
                    </button>
                    <span className="font-bold">
                      {discountAmount.toFixed(2)} ج.م
                      {discountType === DiscountType.Percentage &&
                        discount > 0 &&
                        ` (${discount}%)`}
                    </span>
                  </div>
                </div>

                {bills[currentBillIndex]?.billType === "delivery" && (
                  <div className="flex justify-between items-center text-xs">
                    <span>رسوم التوصيل:</span>
                    <div className="flex items-center">
                      {deliveryType === DeliveryType.Store ? (
                        <>
                          <input
                            type="number"
                            value={deliveryFee}
                            onChange={(e) =>
                              setDeliveryFee(Number(e.target.value))
                            }
                            className="w-12 text-right px-1 py-1 border rounded mr-1.5 text-xs"
                            min="0"
                            disabled={bills[currentBillIndex]?.completed}
                          />
                          <span className="font-bold">
                            {deliveryFee.toFixed(2)} ج.م
                          </span>
                        </>
                      ) : (
                        <span className="font-bold ml-1">
                          {deliveryFee.toFixed(2)} ج.م
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between border-t pt-1.5 mt-1.5 text-sm">
                  <span className="font-bold">الإجمالي:</span>
                  <span className="font-bold" style={{ color: "#193F94" }}>
                    {total.toFixed(2)} ج.م
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetCart}
                disabled={bills[currentBillIndex]?.completed}
                className={`py-2.5 px-3 rounded-lg font-medium border transition-all text-xs flex-1 ${
                  bills[currentBillIndex]?.completed
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                style={{ borderColor: "#193F94", color: "#193F94" }}
                onMouseEnter={(e) => {
                  if (!bills[currentBillIndex]?.completed) {
                    e.target.style.backgroundColor = "#193F94";
                    e.target.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!bills[currentBillIndex]?.completed) {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#193F94";
                  }
                }}
              >
                إعادة تعيين
              </button>

              {!isNewBillActive &&
              bills[currentBillIndex]?.completed &&
              !bills[currentBillIndex]?.isReturned ? (
                <button
                  onClick={handleReturnBill}
                  className="py-2.5 px-3 rounded-lg font-bold text-white transition-all duration-300 transform text-xs flex-1 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: "#EF4444" }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#DC2626";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#EF4444";
                  }}
                >
                  ارتجاع
                </button>
              ) : !isNewBillActive && bills[currentBillIndex]?.completed ? (
                <button
                  onClick={handleReprintBill}
                  className="py-2.5 px-3 rounded-lg font-bold text-white transition-all duration-300 transform text-xs flex-1 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: "#10B981" }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#059669";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#10B981";
                  }}
                >
                  عرض الفاتورة
                </button>
              ) : !isNewBillActive &&
                bills[currentBillIndex]?.billType === "dinein" &&
                selectedTable &&
                cart.length > 0 ? (
                tableStatus === "occupied" ? (
                  <button
                    onClick={handleCompleteBill}
                    disabled={cart.length === 0}
                    className={`py-2.5 px-3 rounded-lg font-bold text-white transition-all duration-300 transform text-xs flex-1 ${
                      cart.length === 0
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                    style={{ backgroundColor: "#20A4D4" }}
                    onMouseEnter={(e) => {
                      if (cart.length > 0) {
                        e.target.style.backgroundColor = "#1DC7E0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (cart.length > 0) {
                        e.target.style.backgroundColor = "#20A4D4";
                      }
                    }}
                  >
                    إتمام البيع
                  </button>
                ) : (
                  <button
                    onClick={handlePrepareOrder}
                    disabled={cart.length === 0}
                    className={`py-2.5 px-3 rounded-lg font-bold text-white transition-all duration-300 transform text-xs flex-1 ${
                      cart.length === 0
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                    style={{ backgroundColor: "#F59E0B" }}
                    onMouseEnter={(e) => {
                      if (cart.length > 0) {
                        e.target.style.backgroundColor = "#D97706";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (cart.length > 0) {
                        e.target.style.backgroundColor = "#F59E0B";
                      }
                    }}
                  >
                    تحضير الطلب
                  </button>
                )
              ) : (
                <button
                  onClick={handleCompleteBill}
                  disabled={cart.length === 0}
                  className={`py-2.5 px-3 rounded-lg font-bold text-white transition-all duration-300 transform text-xs flex-1 ${
                    cart.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                  style={{ backgroundColor: "#20A4D4" }}
                  onMouseEnter={(e) => {
                    if (cart.length > 0) {
                      e.target.style.backgroundColor = "#1DC7E0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (cart.length > 0) {
                      e.target.style.backgroundColor = "#20A4D4";
                    }
                  }}
                >
                  إتمام البيع
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
