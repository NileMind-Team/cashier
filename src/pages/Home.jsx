import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Navbar from "../components/layout/Navbar.jsx";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Plus,
  Minus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  MapPin,
  CreditCard,
  ShoppingBag,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Clock,
  Truck,
  Store,
  Table,
  FileText,
  DollarSign,
  Save,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
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
  // eslint-disable-next-line no-unused-vars
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
  const [discountValue, setDiscountValue] = useState("");
  const [discountType, setDiscountType] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [invoices, setInvoices] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [totalInvoicesCount, setTotalInvoicesCount] = useState(0);
  const [currentInvoicePage, setCurrentInvoicePage] = useState(1);
  const [pageSize] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentBillData, setCurrentBillData] = useState({
    cart: [],
    tax: 0,
    discount: "",
    discountType: 0,
    deliveryFee: "",
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
    remainingAmount: null,
    paidAmount: null,
  });
  const [cart, setCart] = useState([]);
  const [originalCart, setOriginalCart] = useState([]);
  const [hasCartChanges, setHasCartChanges] = useState(false);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
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
  const [payments, setPayments] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState(0);
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
  const [orderPrepared, setOrderPrepared] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [excessAmount, setExcessAmount] = useState(0);
  const [isEditingExistingInvoice, setIsEditingExistingInvoice] =
    useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [currentInvoiceRemainingAmount, setCurrentInvoiceRemainingAmount] =
    useState(0);
  // eslint-disable-next-line no-unused-vars
  const [currentBillIndex, setCurrentBillIndex] = useState(0);
  const [productsLoading, setProductsLoading] = useState(true);
  const isRefreshingRef = useRef(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isPreparingOrder, setIsPreparingOrder] = useState(false);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);
  const [isRemovingTable, setIsRemovingTable] = useState(false);
  const [isResettingBill, setIsResettingBill] = useState(false);
  const [isReturningBill, setIsReturningBill] = useState(false);
  const [isGoingToPreviousBill, setIsGoingToPreviousBill] = useState(false);
  const [isGoingToNextBill, setIsGoingToNextBill] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [isResumingFromPending, setIsResumingFromPending] = useState(false);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState(null);
  const [totalInvoiceCount, setTotalInvoiceCount] = useState(0);

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

  const formatInvoiceNumber = (number) => {
    return `#INV-${number}`;
  };

  const calculateNextInvoiceNumber = (totalInvoice) => {
    if (!totalInvoice && totalInvoice !== 0) return null;
    const nextNumber = totalInvoice + 1;
    return formatInvoiceNumber(nextNumber);
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
        setTotalInvoiceCount(totalInvoice);
        setTotalPages(totalInvoice);

        const nextNumber = calculateNextInvoiceNumber(totalInvoice);
        setNextInvoiceNumber(nextNumber);

        return response.data;
      } else {
        toast.error("فشل في جلب بيانات الوردية");
        return null;
      }
    } catch (error) {
      console.error("خطأ في جلب بيانات الوردية:", error);

      const isShiftNotFoundError =
        error.response?.status === 404 &&
        error.response?.data?.errors?.some(
          (err) => err.code === "ShiftOpen.NotFound",
        );

      if (isShiftNotFoundError) {
        toast.error("لا توجد وردية مفتوحة");
        navigate("/login");
        return null;
      }

      toast.error("حدث خطأ في جلب بيانات الوردية");
      return null;
    } finally {
      setShiftLoading(false);
    }
  };

  const updateNextInvoiceNumberLocally = () => {
    const newTotalInvoice = totalInvoiceCount + 1;
    setTotalInvoiceCount(newTotalInvoice);
    const nextNumber = calculateNextInvoiceNumber(newTotalInvoice);
    setNextInvoiceNumber(nextNumber);
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

    return {
      totalBills: 0,
      completedBills: 0,
      pendingBills: 0,
      returnedBills: 0,
      totalSales: 0,
      totalTax: 0,
      totalDiscount: 0,
      netRevenue: 0,
      startTime: shiftStartTime,
    };
  }, [currentShift, shiftStartTime]);

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
        const customerAddress = response.data.address || "";

        setCustomerName(response.data.name || "");
        setCustomerAddress(customerAddress);
        setCustomerNationalId(response.data.nationalId || "");
        setCustomerId(response.data.id);

        if (
          currentBillData.billType === "delivery" &&
          (!customerAddress || customerAddress.trim() === "")
        ) {
          toast.error("يرجى إدخال عنوان العميل للتوصيل");
        }
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
      setIsCreatingCustomer(true);
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
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const updateCustomer = async () => {
    try {
      setIsUpdatingCustomer(true);
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
    } finally {
      setIsUpdatingCustomer(false);
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
      setProductsLoading(true);
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
                      const finalPrice =
                        item.finalPrice ||
                        (item.percentageDiscount
                          ? item.price -
                            (item.price * item.percentageDiscount) / 100
                          : item.discount
                            ? item.price - item.discount
                            : item.price);

                      allProductsList.push({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        finalPrice: finalPrice,
                        discount: item.discount || 0,
                        percentageDiscount: item.percentageDiscount || 0,
                        image: item.imgUrl,
                        mainCategoryId: item.mainCategoryId,
                        subCategoryId: item.subCategoryId,
                        isAvailable: item.isAvailable,
                        valueAddedTax: item.valueAddedTax || 0,
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
      setProductsLoading(false);
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
        skip: (lastPage - 1) * pageSize,
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
        skip: (pageNumber - 1) * pageSize,
      });

      if (response.status === 200 && response.data) {
        const invoicesData = response.data.items || [];
        setInvoices(invoicesData);
        setTotalInvoicesCount(response.data.totalCount || 0);
        setTotalPages(response.data.totalPages || 1);
        setCurrentInvoicePage(response.data.pageNumber || 1);

        if (invoicesData.length > 0) {
          const invoice = invoicesData[0];
          convertInvoiceToBill(invoice);
          setIsNewBillActive(false);
          setIsEditingExistingInvoice(true);
          setOrderPrepared(false);
        }

        invoicesFetchedRef.current = true;
      }
    } catch (error) {
      console.error(`خطأ في جلب الفواتير للصفحة ${pageNumber}:`, error);
      toast.error("حدث خطأ في جلب الفواتير");
    }
  };

  const fetchInvoiceByTableId = async (tableId) => {
    try {
      const response = await axiosInstance.get(
        `/api/Invoices/GetInvoiceByTable/table/${tableId}`,
      );

      if (response.status === 200 && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("خطأ في جلب فاتورة الطاولة:", error);
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  };

  const calculateTaxFromInvoice = (invoice) => {
    const subtotal = invoice.subTotal || 0;
    const discount = invoice.invoiceDiscount || 0;
    const deliveryFee = invoice.deliveryFee || 0;
    const totalAmount = invoice.totalAmount || 0;
    const taxAmount = totalAmount - subtotal + discount - deliveryFee;
    const taxableAmount = subtotal - discount;

    if (taxableAmount <= 0 || taxAmount <= 0) {
      return 0;
    }

    const taxPercentage = (taxAmount / taxableAmount) * 100;
    return Math.max(0, taxPercentage);
  };

  const convertInvoiceToBill = (invoice) => {
    const cartItems =
      invoice.items?.map((item) => {
        let finalPrice = item.itemPriceSnapShoot || 0;
        let discountAmount = 0;
        let discountPercentage = 0;

        if (item.discount && item.discount > 0) {
          if (item.isPercentage) {
            discountPercentage = item.discount;
            discountAmount = (finalPrice * discountPercentage) / 100;
            finalPrice = finalPrice - discountAmount;
          } else {
            discountAmount = item.discount;
            finalPrice = finalPrice - discountAmount;
          }
        }

        if (finalPrice < 0) finalPrice = 0;
        if (finalPrice > (item.itemPriceSnapShoot || 0))
          finalPrice = item.itemPriceSnapShoot || 0;

        return {
          id: item.itemId,
          name: item.itemName,
          price: finalPrice,
          originalPrice: item.itemPriceSnapShoot || 0,
          quantity: item.quantity,
          image: item.imageUrl || "",
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
          note: item.notesItem || "",
          isTaxInclusive: item.isTaxInclusive || false,
          valueAddedTax: item.valueAddedTax || 0,
          discount: discountAmount,
          isPercentage: item.isPercentage || false,
          discountPercentage: discountPercentage,
        };
      }) || [];

    const invoiceStatus = invoice.invoiceStatus;
    const isCompleted = invoiceStatus === InvoiceStatus.Done;
    const isPending =
      invoiceStatus === InvoiceStatus.Open ||
      invoiceStatus === InvoiceStatus.Suspended;
    const isReturned = invoiceStatus === InvoiceStatus.Returned;
    const isPartialPaid = invoiceStatus === InvoiceStatus.PartialPaid;

    let billType = "takeaway";
    if (invoice.tableId && invoice.tableId > 0) {
      billType = "dinein";
    } else if (invoice.deliveryFee && invoice.deliveryFee > 0) {
      billType = "delivery";
    }

    const taxPercentage = calculateTaxFromInvoice(invoice);

    setCurrentBillData({
      cart: cartItems,
      tax: taxPercentage,
      discount: invoice.invoiceDiscount || "",
      discountType: invoice.invoiceDiscountType || 0,
      deliveryFee: invoice.deliveryFee || "",
      billType: billType,
      customerName: invoice.customerName || "",
      customerPhone: invoice.customerPhone || "",
      customerAddress: invoice.customerAddress || "",
      customerNationalId: invoice.customerNationalId || "",
      customerId: invoice.customerId || null,
      tableStatus: invoice.tableId ? "occupied" : null,
      generalNote: invoice.notosinvoice || "",
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
      remainingAmount: invoice.remainingAmount || null,
      paidAmount: invoice.paidAmount || null,
    });

    setCart(cartItems);
    setOriginalCart(JSON.parse(JSON.stringify(cartItems)));
    setTax(taxPercentage);
    setDiscount(invoice.invoiceDiscount || "");
    setDeliveryFee(invoice.deliveryFee || "");
    setCustomerPhone(invoice.customerPhone || "");
    setCustomerName(invoice.customerName || "");
    setCustomerAddress(invoice.customerAddress || "");
    setCustomerNationalId(invoice.customerNationalId || "");
    setCustomerId(invoice.customerId || null);
    setGeneralNote(invoice.notosinvoice || "");

    if (isPartialPaid && invoice.remainingAmount) {
      setCurrentInvoiceRemainingAmount(invoice.remainingAmount);
    } else {
      setCurrentInvoiceRemainingAmount(0);
    }

    if (invoice.tableId && invoice.tableId > 0) {
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

  const refreshCurrentBill = async () => {
    if (currentBillData.invoiceId && !isNewBillActive) {
      await refreshTablesAndHalls();
    } else if (isNewBillActive) {
      resetBillData();
    }
  };

  const refreshTablesAndHalls = async () => {
    if (isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;

    try {
      hallsFetchedRef.current = false;
      tablesFetchedRef.current = false;
      await Promise.all([fetchHalls(), fetchTables()]);
    } catch (error) {
      console.error("خطأ في تحديث بيانات الصالات والطاولات:", error);
    } finally {
      isRefreshingRef.current = false;
    }
  };

  const createInvoice = async (isPending = true, paymentsData = null) => {
    if (!currentShift?.shiftId) {
      toast.error("لا توجد وردية نشطة");
      return null;
    }

    const invoiceData = {
      shiftId: currentShift.shiftId,
      tableId: selectedTable?.id || null,
      customerId: customerId || null,
      isPending: isPending,
      notes: generalNote || null,
      invoiceDiscount: discount && discount > 0 ? discount : null,
      invoiceDiscountType: discountType,
      type: getInvoiceTypeFromBillType(currentBillData.billType),
      deliveryCompanyId: selectedDeliveryCompany?.id || null,
      deliveryFee:
        currentBillData.billType === "delivery" && deliveryFee
          ? deliveryFee
          : null,
      payments: isPending ? [] : paymentsData,
      items: cart.map((item) => {
        let itemDiscount = null;
        let itemDiscountType = null;

        if (item.originalPrice && item.originalPrice > item.price) {
          const discountAmount = item.originalPrice - item.price;

          if (item.isPercentage && item.discountPercentage > 0) {
            itemDiscount = item.discountPercentage;
            itemDiscountType = DiscountType.Percentage;
          } else if (discountAmount > 0) {
            itemDiscount = discountAmount;
            itemDiscountType = DiscountType.Fixed;
          }
        }

        return {
          itemId: item.id,
          quantity: item.quantity,
          discount: itemDiscount,
          discountType: itemDiscountType,
          notes: item.note || "",
          options:
            item.selectedOptions?.map((opt) => ({
              optionId: opt.id,
              quantity: item.quantity,
            })) || [],
        };
      }),
    };

    const cleanInvoiceData = JSON.parse(
      JSON.stringify(invoiceData, (key, value) => {
        if (value === null || value === undefined || value === "") {
          return undefined;
        }
        return value;
      }),
    );

    try {
      const response = await axiosInstance.post(
        "/api/Invoices/CreateInvoice",
        cleanInvoiceData,
      );

      if (response.status === 200 && response.data) {
        shiftFetchedRef.current = false;
        await fetchShiftDetails();

        invoicesFetchedRef.current = false;
        await fetchLastInvoice();

        updateNextInvoiceNumberLocally();

        return response.data;
      }
    } catch (error) {
      console.error("خطأ في إنشاء الفاتورة:", error);

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
            toast.error("المبلغ المدفوع أكثر من إجمالي الفاتورة");
            return null;
          }

          if (
            paymentError.description.includes(
              "Paid amount is less than invoice total",
            )
          ) {
            toast.error("المبلغ المدفوع أقل من إجمالي الفاتورة");
            return null;
          }
        }

        const customerError = errors.find(
          (err) => err.code === "Invoice.CustomerRequired",
        );

        if (customerError) {
          toast.error("يجب اختيار عميل للفاتورة");
          return null;
        }
      }

      throw error;
    }
  };

  const updateExistingInvoice = async (
    isPending = true,
    paymentsData = null,
  ) => {
    if (!currentBillData.invoiceId) {
      toast.error("لا يوجد رقم فاتورة للتحديث");
      return null;
    }

    const invoiceData = {
      tableId: selectedTable?.id || null,
      customerId: customerId || null,
      notes: generalNote || null,
      isPending: isPending,
      invoiceDiscount: discount && discount > 0 ? discount : null,
      type: getInvoiceTypeFromBillType(currentBillData.billType),
      deliveryCompanyId: selectedDeliveryCompany?.id || null,
      deliveryFee:
        currentBillData.billType === "delivery" && deliveryFee
          ? deliveryFee
          : null,
      invoiceDiscountType: discountType,
      items: cart.map((item) => {
        let itemDiscount = null;
        let itemDiscountType = null;

        if (item.originalPrice && item.originalPrice > item.price) {
          const discountAmount = item.originalPrice - item.price;

          if (item.isPercentage && item.discount) {
            itemDiscount = item.discount;
            itemDiscountType = DiscountType.Percentage;
          } else {
            itemDiscount = discountAmount;
            itemDiscountType = DiscountType.Fixed;
          }
        }

        return {
          itemId: item.id,
          quantity: item.quantity,
          discount: itemDiscount,
          discountType: itemDiscountType,
          notes: item.note || "",
          options:
            item.selectedOptions?.map((opt) => ({
              optionId: opt.id,
              quantity: item.quantity,
            })) || [],
        };
      }),
      payments: isPending ? [] : paymentsData,
    };

    const cleanInvoiceData = JSON.parse(
      JSON.stringify(invoiceData, (key, value) => {
        if (value === null || value === undefined || value === "") {
          return undefined;
        }
        return value;
      }),
    );

    try {
      const response = await axiosInstance.put(
        `/api/Invoices/UpdateInvoice/${currentBillData.invoiceId}/update`,
        cleanInvoiceData,
      );

      if (response.status === 200) {
        shiftFetchedRef.current = false;
        await fetchShiftDetails();

        invoicesFetchedRef.current = false;
        await fetchLastInvoice();

        await refreshCurrentBill();

        return { id: currentBillData.invoiceId, success: true };
      }

      return null;
    } catch (error) {
      console.error("خطأ في تحديث الفاتورة:", error);

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
            toast.error("المبلغ المدفوع أكثر من إجمالي الفاتورة");
            return null;
          }

          if (
            paymentError.description.includes(
              "Paid amount is less than invoice total",
            )
          ) {
            toast.error("المبلغ المدفوع أقل من إجمالي الفاتورة");
            return null;
          }
        }

        const customerError = errors.find(
          (err) => err.code === "Invoice.CustomerRequired",
        );

        if (customerError) {
          toast.error("يجب اختيار عميل للفاتورة");
          return null;
        }
      }

      throw error;
    }
  };

  const payCustomerInvoice = async (customerId, paymentsData) => {
    try {
      const response = await axiosInstance.post(
        "/api/Invoices/PayCustomerInvoices",
        {
          customerId: customerId,
          payments: paymentsData,
        },
      );

      if (response.status === 200) {
        return { success: true };
      }
      return null;
    } catch (error) {
      console.error("خطأ في استكمال الدفع:", error);
      throw error;
    }
  };

  const applyDiscount = async (invoiceId, discountValue, discountType) => {
    try {
      setIsApplyingDiscount(true);
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
    } finally {
      setIsApplyingDiscount(false);
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

  const resumeInvoiceFromPage = async (pageNumber) => {
    if (!pageNumber || pageNumber < 1) {
      toast.error("رقم الفاتورة غير صحيح");
      return false;
    }

    setIsResumingFromPending(true);
    try {
      await fetchInvoiceByPage(pageNumber);
      setIsNewBillActive(false);
      setIsEditingExistingInvoice(true);
      setOrderPrepared(false);
      toast.success(`تم استئناف الفاتورة رقم ${pageNumber}`);
      return true;
    } catch (error) {
      console.error("خطأ في استئناف الفاتورة:", error);
      toast.error("حدث خطأ في استئناف الفاتورة");
      return false;
    } finally {
      setIsResumingFromPending(false);
    }
  };

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    const initializeData = async () => {
      setIsPageLoading(true);

      try {
        const shiftData = await fetchShiftDetails();

        if (!shiftData) {
          return;
        }

        await Promise.all([
          fetchHalls(),
          fetchTables(),
          fetchMainCategories(),
          fetchPaymentMethods(),
          fetchDeliveryCompanies(),
        ]);

        resetBillData();

        const resumeInvoiceId = location.state?.resumeInvoiceId;
        if (resumeInvoiceId) {
          await resumeInvoiceFromPage(resumeInvoiceId);
          navigate(location.pathname, { replace: true, state: {} });
        }
      } catch (error) {
        console.error("خطأ في تحميل البيانات:", error);
        toast.error("حدث خطأ في تحميل البيانات");
      } finally {
        setIsPageLoading(false);
      }
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

  useEffect(() => {
    if (
      !isNewBillActive &&
      currentBillData.isPending &&
      currentBillData.billType === "dinein"
    ) {
      const hasChanges = JSON.stringify(cart) !== JSON.stringify(originalCart);
      setHasCartChanges(hasChanges);
    } else {
      setHasCartChanges(false);
    }
  }, [
    cart,
    originalCart,
    isNewBillActive,
    currentBillData.isPending,
    currentBillData.billType,
  ]);

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
    { value: "takeaway", label: "سفري", icon: "takeaway" },
    { value: "dinein", label: "طاولة", icon: "dinein" },
    { value: "delivery", label: "دليفري", icon: "delivery" },
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
        await refreshTablesAndHalls();
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
    if (!isNewBillActive) {
      toast.error("لا يمكن تغيير نوع الفاتورة أثناء عرض فاتورة قديمة");
      return;
    }

    if (currentBillData.completed) {
      toast.error("لا يمكن تغيير نوع الفاتورة المكتملة");
      return;
    }

    if (currentBillData.isPartialPaid) {
      toast.error("لا يمكن تغيير نوع الفاتورة الآجلة");
      return;
    }

    if (type !== "dinein") {
      if (selectedTable && selectedHall) {
        updateTableStatus(selectedHall.id, selectedTable.id, "available");
      }
      setSelectedTable(null);
      setSelectedHall(null);
      setShowTableInfo(false);
      setTableStatus("available");
    }

    if (type === "dinein") {
      setShowTableSelection(true);
      if (!selectedHall && halls.length > 0) {
        setSelectedHall(halls[0]);
      }
    } else if (type === "delivery") {
      if (deliveryCompanies.length === 0) {
        setDeliveryType(DeliveryType.Store);
        setDeliveryFee(25);
        setSelectedDeliveryCompany(null);

        setCurrentBillData({
          ...currentBillData,
          billType: "delivery",
          deliveryFee: 25,
          deliveryType: DeliveryType.Store,
          deliveryCompanyId: null,
          deliveryCompanyName: null,
          deliveryCompanyContact: null,
          tableId: null,
          tableName: null,
          tableStatus: null,
        });

        toast.success("تم اختيار دليفري المحل تلقائياً (لا توجد شركات توصيل)");
      } else {
        setShowDeliveryTypeModal(true);
        setDeliveryType(null);
        setSelectedDeliveryCompany(null);
        setDeliveryFee("");
      }
    } else {
      setCurrentBillData({
        ...currentBillData,
        billType: type,
        deliveryFee: "",
        tableId: null,
        tableName: null,
        deliveryType: null,
        deliveryCompanyId: null,
        deliveryCompanyName: null,
        deliveryCompanyContact: null,
      });

      setDeliveryFee("");
      setDeliveryType(null);
      setSelectedDeliveryCompany(null);
      setOrderPrepared(false);

      toast.info(`تم تغيير نوع الفاتورة إلى ${getBillTypeLabel(type)}`);
    }
  };

  const handleSelectHall = (hall) => {
    setSelectedHall(hall);
  };

  const handleSelectTable = async (table) => {
    if (currentBillData.isPartialPaid) {
      toast.error("لا يمكن اختيار طاولة للفاتورة الآجلة");
      return;
    }

    if (table.status === "occupied") {
      toast.info("جاري تحميل الفاتورة الخاصة بهذه الطاولة");

      try {
        const invoice = await fetchInvoiceByTableId(table.id);

        if (invoice) {
          const tableInfo = tables.find((t) => t.id === table.id);
          const hall = tableInfo
            ? halls.find((h) => h.id === tableInfo.hallId)
            : null;

          if (hall) {
            setSelectedHall(hall);
            setSelectedTable({
              id: table.id,
              number: table.number,
              status: "occupied",
            });
            setShowTableInfo(true);
            setTableStatus("occupied");
          }

          convertInvoiceToBill(invoice);
          setIsNewBillActive(false);
          setIsEditingExistingInvoice(true);
          setShowTableSelection(false);
          toast.success(`تم تحميل فاتورة الطاولة ${table.number}`);
          return;
        } else {
          toast.error("لا توجد فاتورة نشطة لهذه الطاولة");
          return;
        }
      } catch (error) {
        console.error("خطأ في تحميل فاتورة الطاولة:", error);
        toast.error("حدث خطأ في تحميل فاتورة الطاولة");
        return;
      }
    }

    setSelectedTable(table);

    setCurrentBillData({
      ...currentBillData,
      billType: "dinein",
      tableId: table.id,
      tableName: table.number,
      tableStatus: "available",
      deliveryType: null,
      deliveryCompanyId: null,
      deliveryCompanyName: null,
      deliveryCompanyContact: null,
      deliveryFee: "",
    });

    setTableStatus("available");

    setShowTableSelection(false);
    setShowTableInfo(true);

    toast.success(`تم اختيار ${table.number} في ${selectedHall.name}`);
  };

  const handleCloseTableSelection = () => {
    setShowTableSelection(false);

    if (currentBillData.billType === "dinein" && !selectedTable) {
      setCurrentBillData({
        ...currentBillData,
        billType: "takeaway",
        tableId: null,
        tableName: null,
      });

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

      setCurrentBillData({
        ...currentBillData,
        billType: "delivery",
        deliveryFee: 25,
        deliveryType: DeliveryType.Store,
        deliveryCompanyId: null,
        deliveryCompanyName: null,
        deliveryCompanyContact: null,
        tableId: null,
        tableName: null,
        tableStatus: null,
      });

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

    setCurrentBillData({
      ...currentBillData,
      billType: "delivery",
      deliveryFee: company.deliveryCost || 0,
      deliveryType: DeliveryType.Company,
      deliveryCompanyId: company.id,
      deliveryCompanyName: company.name,
      deliveryCompanyContact: company.contactNumber,
      tableId: null,
      tableName: null,
      tableStatus: null,
    });

    toast.success(
      `تم اختيار شركة ${company.name} (رسوم التوصيل: ${company.deliveryCost || 0} ج.م)`,
    );
  };

  const handleRemoveTable = async () => {
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
    const tableNumber = selectedTable.number;
    const hallName = selectedHall.name;

    const result = await Swal.fire({
      title: "هل أنت متأكد من إزالة الطاولة؟",
      html: `
        <div class="text-right">
          <p class="font-bold mb-2">الطاولة: ${tableNumber} (${hallName})</p>
          ${hasProducts ? `<p class="text-sm text-gray-600 mb-3">سيتم إزالة ${productCount} منتج من الفاتورة</p>` : ""}
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، إزالة",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setIsRemovingTable(true);
      try {
        await updateTableStatus(selectedHall.id, selectedTable.id, "available");
        hallsFetchedRef.current = false;
        tablesFetchedRef.current = false;
        shiftFetchedRef.current = false;
        invoicesFetchedRef.current = false;

        await Promise.all([
          fetchShiftDetails(),
          fetchHalls(),
          fetchTables(),
          fetchLastInvoice(),
        ]);

        if (hasProducts) {
          resetBillData();
        } else {
          setCurrentBillData({
            ...currentBillData,
            tableId: null,
            tableName: null,
            billType: "takeaway",
          });
          setTableStatus("available");
          setSelectedTable(null);
          setSelectedHall(null);
          setShowTableInfo(false);
          setOrderPrepared(false);
        }

        setIsNewBillActive(true);
        setIsEditingExistingInvoice(false);

        toast.success("تم إزالة الطاولة وجعلها متاحة");
      } catch (error) {
        console.error("خطأ في إزالة الطاولة:", error);
        toast.error("حدث خطأ في إزالة الطاولة");
      } finally {
        setIsRemovingTable(false);
      }
    }
  };

  useEffect(() => {
    const refreshCurrentBillData = async () => {
      if (currentBillData.invoiceId && !isNewBillActive) {
        await refreshCurrentBill();
      }
    };

    refreshCurrentBillData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBillData.invoiceId, isNewBillActive]);

  const handleProductClick = (product) => {
    if (currentBillData.completed) {
      toast.error("لا يمكن إضافة منتجات إلى فاتورة مكتملة");
      return;
    }

    if (currentBillData.isPartialPaid) {
      toast.error("لا يمكن إضافة منتجات إلى فاتورة آجلة");
      return;
    }

    setSelectedProduct(product);
    setProductQuantity(1);
    setSelectedOptions([]);
    setOptionsCurrentPage(1);
    fetchOptions(1);
    setShowProductModal(true);
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    const optionsTotal = selectedOptions.reduce(
      (sum, option) => sum + option.price,
      0,
    );

    const productPrice = selectedProduct.finalPrice || selectedProduct.price;
    const discountAmount = selectedProduct.originalPrice
      ? selectedProduct.originalPrice - productPrice
      : 0;
    const discountPercentage = selectedProduct.percentageDiscount || 0;

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
          price: productPrice,
          originalPrice: selectedProduct.price,
          uniqueId: `${selectedProduct.id}_${Date.now()}`,
          quantity: productQuantity,
          selectedOptions: selectedOptions,
          optionsTotal: optionsTotal * productQuantity,
          note: "",
          discount: discountAmount,
          isPercentage: discountPercentage > 0,
          discountPercentage: discountPercentage,
        };
        setCart([...cart, newItem]);
      }
    } else {
      const newItem = {
        ...selectedProduct,
        price: productPrice,
        originalPrice: selectedProduct.price,
        uniqueId: `${selectedProduct.id}_${Date.now()}`,
        quantity: productQuantity,
        selectedOptions: selectedOptions,
        optionsTotal: optionsTotal * productQuantity,
        note: "",
        discount: discountAmount,
        isPercentage: discountPercentage > 0,
        discountPercentage: discountPercentage,
      };
      setCart([...cart, newItem]);
    }

    const productName = selectedProduct.name;
    const hasDiscount =
      selectedProduct.finalPrice &&
      selectedProduct.finalPrice < selectedProduct.price;

    toast.success(
      <div>
        <p className="font-bold">
          تم إضافة {productQuantity} × {productName}
        </p>
        {hasDiscount && (
          <p className="text-xs mt-1 text-green-600">
            السعر بعد الخصم: {productPrice} ج.م (الأصلي: {selectedProduct.price}{" "}
            ج.م)
            {selectedProduct.percentageDiscount && (
              <span className="text-xs mr-1">
                (خصم {selectedProduct.percentageDiscount}%)
              </span>
            )}
          </p>
        )}
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
    if (currentBillData.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }

    if (currentBillData.isPartialPaid) {
      toast.error("لا يمكن تعديل فاتورة آجلة");
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
    if (currentBillData.completed) {
      toast.error("لا يمكن حذف منتجات من فاتورة مكتملة");
      return;
    }

    if (currentBillData.isPartialPaid) {
      toast.error("لا يمكن حذف منتجات من فاتورة آجلة");
      return;
    }

    setCart(cart.filter((item) => item.uniqueId !== uniqueId));
  };

  const handleAddNote = (uniqueId, note) => {
    if (currentBillData.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }

    if (currentBillData.isPartialPaid) {
      toast.error("لا يمكن تعديل فاتورة آجلة");
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
    if (currentBillData.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }

    if (currentBillData.isPartialPaid) {
      toast.error("لا يمكن تعديل فاتورة آجلة");
      return;
    }

    setEditingNoteProductId(uniqueId);
    setTempNote(currentNote || "");
  };

  const startEditingGeneralNote = () => {
    if (currentBillData.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }

    if (currentBillData.isPartialPaid) {
      toast.error("لا يمكن تعديل فاتورة آجلة");
      return;
    }

    setIsEditingGeneralNote(true);
    setTempGeneralNote(generalNote || "");
  };

  const handleSaveGeneralNote = () => {
    if (currentBillData.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }

    if (currentBillData.isPartialPaid) {
      toast.error("لا يمكن تعديل فاتورة آجلة");
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
    if (cart.length === 0 && !currentBillData.isPartialPaid) {
      toast.error("الفاتورة فارغة");
      return;
    }

    if (
      currentBillData.billType === "dinein" &&
      !selectedTable &&
      !currentBillData.isPartialPaid
    ) {
      toast.error("يرجى اختيار طاولة أولاً");
      setShowTableSelection(true);
      return;
    }

    if (currentBillData.billType === "delivery") {
      if (!customerId) {
        toast.error("يرجى إدخال عميل للتوصيل");
        return;
      }
      if (!deliveryType) {
        toast.error("يرجى اختيار نوع التوصيل");
        setShowDeliveryTypeModal(true);
        return;
      }

      if (customerId && (!customerAddress || customerAddress.trim() === "")) {
        toast.error("يرجى إدخال عنوان العميل للتوصيل");
        return;
      }
    }

    setIsPartialPayment(false);
    setPayments([]);

    if (currentBillData.isPartialPaid && currentBillData.remainingAmount) {
      setRemainingAmount(currentBillData.remainingAmount);
    } else {
      setRemainingAmount(total);
    }

    setExcessAmount(0);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPayments([]);
    setRemainingAmount(0);
    setExcessAmount(0);
    setIsPartialPayment(false);
  };

  const handlePartialPayment = () => {
    setIsPartialPayment(true);
    setPayments([]);
    if (currentBillData.isPartialPaid && currentBillData.remainingAmount) {
      setRemainingAmount(currentBillData.remainingAmount);
    } else {
      setRemainingAmount(total);
    }
    setExcessAmount(0);
  };

  const handleAddPayment = (paymentMethodId) => {
    if (isPartialPayment) {
      setIsPartialPayment(false);
    }

    const existingPaymentIndex = payments.findIndex(
      (p) => p.paymentMethodId === paymentMethodId,
    );

    if (existingPaymentIndex !== -1) {
      const newPayments = payments.filter(
        (_, index) => index !== existingPaymentIndex,
      );
      setPayments(newPayments);

      const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
      const invoiceTotal =
        currentBillData.isPartialPaid && currentBillData.remainingAmount
          ? currentBillData.remainingAmount
          : total;
      setRemainingAmount(invoiceTotal - totalPaid);
      setExcessAmount(totalPaid > invoiceTotal ? totalPaid - invoiceTotal : 0);
    } else {
      const totalPaidSoFar = payments.reduce((sum, p) => sum + p.amount, 0);
      const invoiceTotal =
        currentBillData.isPartialPaid && currentBillData.remainingAmount
          ? currentBillData.remainingAmount
          : total;
      const currentRemaining = invoiceTotal - totalPaidSoFar;

      const newPaymentAmount = currentRemaining > 0 ? currentRemaining : 0;

      const newPayments = [
        ...payments,
        { paymentMethodId, amount: newPaymentAmount },
      ];
      setPayments(newPayments);
      setRemainingAmount(currentRemaining - newPaymentAmount);
      setExcessAmount(0);
    }
  };

  const handlePaymentAmountChange = (paymentMethodId, amount) => {
    if (isPartialPayment) {
      setIsPartialPayment(false);
    }

    const newAmount = parseFloat(amount) || 0;

    const updatedPayments = payments.map((payment) =>
      payment.paymentMethodId === paymentMethodId
        ? { ...payment, amount: newAmount }
        : payment,
    );
    setPayments(updatedPayments);

    const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
    const invoiceTotal =
      currentBillData.isPartialPaid && currentBillData.remainingAmount
        ? currentBillData.remainingAmount
        : total;

    const newRemaining = invoiceTotal - totalPaid;
    setRemainingAmount(newRemaining);
    setExcessAmount(totalPaid > invoiceTotal ? totalPaid - invoiceTotal : 0);
  };

  const handleRemovePayment = (paymentMethodId) => {
    if (isPartialPayment) {
      setIsPartialPayment(false);
    }

    const newPayments = payments.filter(
      (p) => p.paymentMethodId !== paymentMethodId,
    );
    setPayments(newPayments);

    const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
    const invoiceTotal =
      currentBillData.isPartialPaid && currentBillData.remainingAmount
        ? currentBillData.remainingAmount
        : total;
    setRemainingAmount(invoiceTotal - totalPaid);
    setExcessAmount(totalPaid > invoiceTotal ? totalPaid - invoiceTotal : 0);
  };

  const openDiscountModal = () => {
    if (cart.length === 0) {
      toast.error("الفاتورة فارغة");
      return;
    }

    if (currentBillData.completed) {
      toast.error("لا يمكن تطبيق خصم على فاتورة مكتملة");
      return;
    }

    if (currentBillData.isPartialPaid) {
      toast.error("لا يمكن تطبيق خصم على فاتورة آجلة");
      return;
    }

    setDiscountValue(discount === "" ? "" : discount);
    setDiscountType(currentBillData.discountType || 0);
    setShowDiscountModal(true);
  };

  const closeDiscountModal = () => {
    setShowDiscountModal(false);
  };

  const handleApplyDiscount = async () => {
    const discountNum = parseFloat(discountValue) || 0;

    if (discountNum < 0) {
      toast.error("قيمة الخصم يجب أن تكون أكبر من صفر");
      return;
    }

    if (discountType === DiscountType.Percentage && discountNum > 100) {
      toast.error("نسبة الخصم لا يمكن أن تزيد عن 100%");
      return;
    }

    if (discountType === DiscountType.Fixed && discountNum > subtotal) {
      toast.error("قيمة الخصم لا يمكن أن تزيد عن إجمالي الفاتورة");
      return;
    }

    if (currentBillData.invoiceId && !isEditingExistingInvoice) {
      try {
        const success = await applyDiscount(
          currentBillData.invoiceId,
          discountNum,
          discountType,
        );

        if (success) {
          setDiscount(discountNum);
          setCurrentBillData({
            ...currentBillData,
            discount: discountNum,
            discountType: discountType,
          });
          setShowDiscountModal(false);
          toast.success("تم تطبيق الخصم بنجاح");
        }
      } catch (error) {
        console.error("خطأ في تطبيق الخصم:", error);
        toast.error("حدث خطأ في تطبيق الخصم");
      }
    } else {
      setDiscount(discountNum);
      setCurrentBillData({
        ...currentBillData,
        discount: discountNum,
        discountType: discountType,
      });
      setShowDiscountModal(false);
      toast.success("تم تطبيق الخصم بنجاح");
    }
  };

  const handleCompletePayment = async () => {
    if (isPartialPayment) {
      if (isProcessingPayment) {
        return;
      }

      setIsProcessingPayment(true);

      try {
        let invoiceResponse;

        if (isEditingExistingInvoice && currentBillData?.invoiceId) {
          invoiceResponse = await updateExistingInvoice(false, []);

          if (invoiceResponse) {
            setCurrentBillData({
              ...currentBillData,
              completed: false,
              isPartialPaid: true,
              paymentMethod: "partial",
              invoiceId: currentBillData.invoiceId,
              invoiceNumber: currentBillData.invoiceNumber,
              invoiceStatus: InvoiceStatus.PartialPaid,
              isPending: false,
              remainingAmount: total,
              paidAmount: 0,
            });
          }
        } else {
          invoiceResponse = await createInvoice(false, []);

          if (invoiceResponse) {
            setCurrentBillData({
              ...currentBillData,
              completed: false,
              isPartialPaid: true,
              paymentMethod: "partial",
              invoiceId: invoiceResponse.id,
              invoiceNumber: invoiceResponse.invoiceNumber,
              invoiceStatus: InvoiceStatus.PartialPaid,
              isPending: false,
              remainingAmount: total,
              paidAmount: 0,
            });
          }
        }

        if (invoiceResponse) {
          toast.success(
            `تم تأجيل المبلغ كاملاً للفاتورة رقم ${currentBillData.invoiceNumber || invoiceResponse.invoiceNumber}`,
          );

          setShowPaymentModal(false);
          setPayments([]);
          setRemainingAmount(0);
          setExcessAmount(0);
          setIsPartialPayment(false);
          resetBillData();
          setIsNewBillActive(true);
          setIsEditingExistingInvoice(false);
        }

        await fetchShiftDetails();
        await fetchLastInvoice();
      } catch (error) {
        console.error("خطأ في تأجيل المبلغ:", error);
        toast.error("حدث خطأ في تأجيل المبلغ");
      } finally {
        setIsProcessingPayment(false);
      }
      return;
    }

    if (payments.length === 0) {
      toast.error("يرجى اختيار طريقة دفع واحدة على الأقل");
      return;
    }

    if (isProcessingPayment) {
      return;
    }

    setIsProcessingPayment(true);

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const invoiceTotal =
      currentBillData.isPartialPaid && currentBillData.remainingAmount
        ? currentBillData.remainingAmount
        : total;

    try {
      if (currentBillData.isPartialPaid && currentBillData.customerId) {
        const result = await payCustomerInvoice(
          currentBillData.customerId,
          payments,
        );

        if (result && result.success) {
          setCurrentBillData({
            ...currentBillData,
            completed: true,
            completedDate: new Date().toLocaleString(),
            paymentMethod: payments.map((p) => p.paymentMethodId).join(","),
            isReturned: false,
            isPartialPaid: false,
            returnReason: "",
            invoiceStatus: InvoiceStatus.Done,
            isPending: false,
            remainingAmount: 0,
            paidAmount: (currentBillData.paidAmount || 0) + totalPaid,
          });

          if (selectedTable && selectedHall) {
            await updateTableStatus(
              selectedHall.id,
              selectedTable.id,
              "available",
            );
          }

          toast.success(
            `تم استكمال دفع المبلغ المتبقي بنجاح للفاتورة رقم ${currentBillData.invoiceNumber}`,
          );

          setShowPaymentModal(false);
          setPayments([]);
          setRemainingAmount(0);
          setExcessAmount(0);
          setIsPartialPayment(false);
          resetBillData();
          setIsNewBillActive(true);
          setIsEditingExistingInvoice(false);

          await fetchShiftDetails();
          await fetchLastInvoice();
        } else {
          toast.error("حدث خطأ في استكمال الدفع");
        }
      } else {
        let invoiceResponse;
        let isPartialPaid = false;
        let isOverPaid = false;

        if (isEditingExistingInvoice && currentBillData?.invoiceId) {
          invoiceResponse = await updateExistingInvoice(false, payments);

          if (invoiceResponse) {
            isPartialPaid =
              Math.abs(totalPaid - invoiceTotal) > 0.01 &&
              totalPaid < invoiceTotal;
            isOverPaid = totalPaid > invoiceTotal;

            const updatedInvoiceStatus = isPartialPaid
              ? InvoiceStatus.PartialPaid
              : isOverPaid
                ? InvoiceStatus.Done
                : InvoiceStatus.Done;

            setCurrentBillData({
              ...currentBillData,
              completed: !isPartialPaid && !isOverPaid,
              completedDate:
                !isPartialPaid && !isOverPaid
                  ? new Date().toLocaleString()
                  : null,
              paymentMethod: payments.map((p) => p.paymentMethodId).join(","),
              isReturned: false,
              isPartialPaid: isPartialPaid,
              returnReason: "",
              invoiceId: currentBillData.invoiceId,
              invoiceNumber: currentBillData.invoiceNumber,
              invoiceStatus: updatedInvoiceStatus,
              isPending: false,
              remainingAmount: isPartialPaid ? invoiceTotal - totalPaid : null,
              paidAmount: totalPaid,
            });

            if (selectedTable && selectedHall && !isPartialPaid) {
              await updateTableStatus(
                selectedHall.id,
                selectedTable.id,
                "available",
              );
            }

            if (isPartialPaid) {
              toast.success(
                `تم دفع ${totalPaid.toFixed(2)} ج.م من إجمالي ${invoiceTotal.toFixed(2)} ج.م للفاتورة رقم ${
                  currentBillData.invoiceNumber
                } (باقي ${(invoiceTotal - totalPaid).toFixed(2)} ج.م)`,
              );
            } else if (isOverPaid) {
              toast.success(
                `تم دفع ${totalPaid.toFixed(2)} ج.م (زيادة ${(totalPaid - invoiceTotal).toFixed(2)} ج.م) للفاتورة رقم ${
                  currentBillData.invoiceNumber
                }`,
              );
            } else {
              toast.success(
                `تم إتمام البيع للفاتورة رقم ${currentBillData.invoiceNumber}`,
              );
            }

            setShowPaymentModal(false);
            setPayments([]);
            setRemainingAmount(0);
            setExcessAmount(0);
            setIsPartialPayment(false);
            resetBillData();
            setIsNewBillActive(true);
            setIsEditingExistingInvoice(false);
          }
        } else {
          invoiceResponse = await createInvoice(false, payments);

          if (invoiceResponse) {
            isPartialPaid =
              Math.abs(totalPaid - invoiceTotal) > 0.01 &&
              totalPaid < invoiceTotal;
            isOverPaid = totalPaid > invoiceTotal;

            const updatedInvoiceStatus = isPartialPaid
              ? InvoiceStatus.PartialPaid
              : isOverPaid
                ? InvoiceStatus.Done
                : InvoiceStatus.Done;

            setCurrentBillData({
              ...currentBillData,
              completed: !isPartialPaid && !isOverPaid,
              completedDate:
                !isPartialPaid && !isOverPaid
                  ? new Date().toLocaleString()
                  : null,
              paymentMethod: payments.map((p) => p.paymentMethodId).join(","),
              isReturned: false,
              isPartialPaid: isPartialPaid,
              returnReason: "",
              invoiceId: invoiceResponse.id,
              invoiceNumber: invoiceResponse.invoiceNumber,
              invoiceStatus: updatedInvoiceStatus,
              isPending: false,
              remainingAmount: isPartialPaid ? invoiceTotal - totalPaid : null,
              paidAmount: totalPaid,
            });

            if (selectedTable && selectedHall && !isPartialPaid) {
              await updateTableStatus(
                selectedHall.id,
                selectedTable.id,
                "available",
              );
            }

            if (isPartialPaid) {
              toast.success(
                `تم دفع ${totalPaid.toFixed(2)} ج.م من إجمالي ${invoiceTotal.toFixed(2)} ج.م للفاتورة رقم ${
                  invoiceResponse.invoiceNumber
                } (باقي ${(invoiceTotal - totalPaid).toFixed(2)} ج.م)`,
              );
            } else if (isOverPaid) {
              toast.success(
                `تم دفع ${totalPaid.toFixed(2)} ج.م (زيادة ${(totalPaid - invoiceTotal).toFixed(2)} ج.م) للفاتورة رقم ${
                  invoiceResponse.invoiceNumber
                }`,
              );
            } else {
              toast.success(
                `تم إتمام البيع للفاتورة رقم ${invoiceResponse.invoiceNumber}`,
              );
            }

            setShowPaymentModal(false);
            setPayments([]);
            setRemainingAmount(0);
            setExcessAmount(0);
            setIsPartialPayment(false);
            resetBillData();
            setIsNewBillActive(true);
            setIsEditingExistingInvoice(false);
          }
        }

        await fetchShiftDetails();
        await fetchLastInvoice();
      }
    } catch (error) {
      console.error("خطأ في إتمام الدفع:", error);

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
            toast.error("المبلغ المدفوع أكثر من إجمالي الفاتورة");
            return null;
          }

          if (
            paymentError.description.includes(
              "Paid amount is less than invoice total",
            )
          ) {
            toast.error("المبلغ المدفوع أقل من إجمالي الفاتورة");
            return null;
          }
        }

        const customerError = errors.find(
          (err) => err.code === "Invoice.CustomerRequired",
        );

        if (customerError) {
          toast.error("يجب اختيار عميل للفاتورة");
          return null;
        }
      } else {
        toast.error("حدث خطأ في إتمام عملية الدفع");
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const goToNextBill = async () => {
    if (isGoingToNextBill) return;

    if (isNewBillActive) {
      if (cart.length === 0) {
        toast.error("الفاتورة فارغة، أضف منتجات أولاً");
        return;
      }

      if (currentBillData.billType === "delivery") {
        if (!customerPhone || customerPhone.length < 11) {
          toast.error("يرجى إدخال رقم هاتف صحيح للتوصيل");
          return;
        }
        if (!deliveryType) {
          toast.error("يرجى اختيار نوع التوصيل");
          setShowDeliveryTypeModal(true);
          return;
        }

        if (customerId && (!customerAddress || customerAddress.trim() === "")) {
          toast.error("يرجى إدخال عنوان العميل للتوصيل");
          return;
        }
      }

      if (currentBillData.billType === "dinein" && !selectedTable) {
        toast.error("يرجى اختيار طاولة أولاً");
        setShowTableSelection(true);
        return;
      }

      try {
        setIsGoingToNextBill(true);
        let invoiceResponse;

        if (isEditingExistingInvoice && currentBillData?.invoiceId) {
          invoiceResponse = await updateExistingInvoice(true, []);
        } else {
          invoiceResponse = await createInvoice(true, []);
        }

        if (invoiceResponse) {
          if (
            selectedTable &&
            selectedHall &&
            currentBillData.billType === "dinein"
          ) {
            await updateTableStatus(
              selectedHall.id,
              selectedTable.id,
              "occupied",
            );
          }

          toast.success(
            `تم تعليق الفاتورة رقم ${invoiceResponse.invoiceNumber}`,
          );

          resetBillData();

          await fetchShiftDetails();
          await fetchLastInvoice();
          setIsNewBillActive(true);
          setIsEditingExistingInvoice(false);
          setOrderPrepared(false);
          setHasCartChanges(false);
          toast.info("فاتورة جديدة");
        }
      } catch (error) {
        console.error("خطأ في إنشاء/تحديث الفاتورة المعلقة:", error);
        toast.error("حدث خطأ في إنشاء/تحديث الفاتورة المعلقة");
      } finally {
        setIsGoingToNextBill(false);
      }
    } else {
      if (currentInvoicePage < totalPages) {
        setIsGoingToNextBill(true);
        const nextPage = currentInvoicePage + 1;
        await fetchInvoiceByPage(nextPage);
        setIsGoingToNextBill(false);
      } else {
        setIsGoingToNextBill(true);
        resetBillData();
        setIsNewBillActive(true);
        setIsEditingExistingInvoice(false);
        setOrderPrepared(false);
        setHasCartChanges(false);
        toast.info("فاتورة جديدة");
        setIsGoingToNextBill(false);
      }
    }
  };

  const goToPreviousBill = async () => {
    if (isGoingToPreviousBill) return;

    if (isNewBillActive) {
      if (totalPages > 0) {
        setIsGoingToPreviousBill(true);
        await fetchInvoiceByPage(totalPages);
        setIsNewBillActive(false);
        setIsEditingExistingInvoice(true);
        setOrderPrepared(false);
        setIsGoingToPreviousBill(false);
      } else {
        toast.warning("لا توجد فواتير سابقة");
      }
    } else {
      if (currentInvoicePage > 1) {
        setIsGoingToPreviousBill(true);
        const prevPage = currentInvoicePage - 1;
        await fetchInvoiceByPage(prevPage);
        setIsGoingToPreviousBill(false);
      } else {
        setIsGoingToPreviousBill(true);
        setIsNewBillActive(true);
        setIsEditingExistingInvoice(false);
        setCurrentInvoicePage(0);
        resetBillData();
        toast.info("فاتورة جديدة");
        setIsGoingToPreviousBill(false);
      }
    }
  };

  const goToNewBill = async () => {
    if (isGoingToNextBill) return;

    setIsGoingToNextBill(true);
    setIsNewBillActive(true);
    setIsEditingExistingInvoice(false);
    setCurrentInvoicePage(totalPages + 1);
    resetBillData();
    toast.info("فاتورة جديدة");
    setIsGoingToNextBill(false);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity + (item.optionsTotal || 0),
    0,
  );

  const totalTax = cart.reduce((sum, item) => {
    const itemSubtotal = item.price * item.quantity;
    const optionsValue = item.optionsTotal || 0;
    const taxableAmount = itemSubtotal + optionsValue;
    const itemTaxRate = item.valueAddedTax || tax;

    if (itemTaxRate === 0) {
      return sum;
    }

    if (item.isTaxInclusive) {
      const itemTax = (taxableAmount * itemTaxRate) / (100 + itemTaxRate);
      return sum + itemTax;
    } else {
      const itemTax = (taxableAmount * itemTaxRate) / 100;
      return sum + itemTax;
    }
  }, 0);

  const totalWithTax = cart.reduce((sum, item) => {
    const itemSubtotal = item.price * item.quantity;
    const optionsValue = item.optionsTotal || 0;
    const itemTotal = itemSubtotal + optionsValue;
    const itemTaxRate = item.valueAddedTax || tax;

    if (itemTaxRate === 0) {
      return sum + itemTotal;
    }

    if (item.isTaxInclusive) {
      return sum + itemTotal;
    } else {
      const itemTax = (itemTotal * itemTaxRate) / 100;
      return sum + itemTotal + itemTax;
    }
  }, 0);

  const discountAmountCalc =
    discount && discount !== ""
      ? discountType === DiscountType.Fixed
        ? discount
        : (subtotal * discount) / 100
      : 0;

  const total =
    totalWithTax -
    discountAmountCalc +
    (currentBillData.billType === "delivery" && deliveryFee ? deliveryFee : 0);

  const handlePrepareOrder = async () => {
    if (isPreparingOrder) return;

    if (cart.length === 0) {
      toast.error("الفاتورة فارغة");
      return;
    }

    if (!selectedTable) {
      toast.error("لم يتم اختيار طاولة");
      return;
    }

    try {
      setIsPreparingOrder(true);
      let invoiceResponse;

      if (isEditingExistingInvoice && currentBillData?.invoiceId) {
        invoiceResponse = await updateExistingInvoice(true, []);

        if (invoiceResponse) {
          setCurrentBillData({
            ...currentBillData,
            invoiceStatus: InvoiceStatus.Open,
            isPending: true,
            completed: false,
            isReturned: false,
            isPartialPaid: false,
            completedDate: null,
          });

          await updateTableStatus(
            selectedHall.id,
            selectedTable.id,
            "occupied",
          );
          setTableStatus("occupied");

          setOrderPrepared(true);
          setHasCartChanges(false);
          setOriginalCart(JSON.parse(JSON.stringify(cart)));

          toast.success(`تم تحضير طلب الطاولة ${selectedTable.number} بنجاح`);
        }
      } else if (isNewBillActive) {
        invoiceResponse = await createInvoice(true, []);

        if (invoiceResponse) {
          setCurrentBillData({
            id: currentBillIndex + 1,
            cart: [...cart],
            tax,
            discount: discount === "" ? null : discount,
            discountType: currentBillData.discountType || 0,
            deliveryFee:
              currentBillData.billType === "delivery" && deliveryFee
                ? deliveryFee
                : null,
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
          });

          await updateTableStatus(
            selectedHall.id,
            selectedTable.id,
            "occupied",
          );
          setTableStatus("occupied");
          setOrderPrepared(true);
          setHasCartChanges(false);
          setOriginalCart(JSON.parse(JSON.stringify(cart)));

          resetBillData();

          toast.success(
            `تم تحضير طلب الطاولة ${selectedTable.number} وفتح فاتورة جديدة`,
          );
        }
      }

      if (!isNewBillActive && invoiceResponse) {
        setIsNewBillActive(true);
        setIsEditingExistingInvoice(false);
        resetBillData();
      }
    } catch (error) {
      console.error("خطأ في تحضير الطلب:", error);
      toast.error("حدث خطأ في تحضير الطلب");
    } finally {
      setIsPreparingOrder(false);
    }
  };

  const handleCompleteBill = () => {
    openPaymentModal();
  };

  const handleReturnBill = async () => {
    if (isReturningBill) return;

    if (!currentBillData.completed) {
      toast.error("لا يمكن إرجاع فاتورة غير مكتملة");
      return;
    }

    if (currentBillData.isReturned) {
      toast.error("هذه الفاتورة بالفعل مرتجعة");
      return;
    }

    if (!currentBillData.invoiceNumber) {
      toast.error("لا يوجد رقم فاتورة للإرجاع");
      return;
    }

    const { value: returnReason, isConfirmed } = await Swal.fire({
      title: "إرجاع الفاتورة",
      html: `
        <div class="text-right">
          <p class="mb-3">فاتورة رقم #${currentBillData.invoiceNumber}</p>
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
      setIsReturningBill(true);
      if (currentBillData.invoiceNumber) {
        await createFullReturn(currentBillData.invoiceNumber);
      }

      setCurrentBillData({
        ...currentBillData,
        isReturned: true,
        returnReason: returnReason || "بدون سبب",
        returnedDate: new Date().toLocaleString(),
        invoiceStatus: InvoiceStatus.Returned,
      });

      if (currentBillData.tableId && selectedHall && selectedTable) {
        await updateTableStatus(selectedHall.id, selectedTable.id, "available");
        setTableStatus("available");
      }

      Swal.fire({
        title: "تم الإرجاع بنجاح!",
        html: `
          <div class="text-right">
            <p>تم تحويل الفاتورة #${currentBillData.invoiceNumber} إلى فاتورة مرتجعة</p>
            <p class="mt-2 text-gray-600">${returnReason ? `السبب: ${returnReason}` : "بدون سبب محدد"}</p>
            <p class="mt-2 text-sm text-gray-500">التاريخ: ${new Date().toLocaleString()}</p>
          </div>
        `,
        icon: "success",
        confirmButtonText: "تم",
        confirmButtonColor: "#10B981",
      });

      toast.success(
        `تم إرجاع الفاتورة رقم ${currentBillData.invoiceNumber} بنجاح`,
      );
    } catch (error) {
      console.error("خطأ في إرجاع الفاتورة:", error);
      toast.error("حدث خطأ في إرجاع الفاتورة");
    } finally {
      setIsReturningBill(false);
    }
  };

  const handleReprintBill = () => {
    if (cart.length === 0) {
      toast.error("الفاتورة فارغة");
      return;
    }
    setShowInvoiceModal(true);
  };

  const resetCartOnly = () => {
    if (isResettingBill) return;

    if (currentBillData.completed) {
      toast.error("لا يمكن إعادة تعيين فاتورة مكتملة");
      return;
    }

    if (currentBillData.isPartialPaid) {
      toast.error("لا يمكن إعادة تعيين فاتورة آجلة");
      return;
    }

    if (cart.length === 0) {
      toast.info("الفاتورة فارغة بالفعل");
      return;
    }

    setIsResettingBill(true);

    const currentBillType = currentBillData.billType;
    const currentDeliveryType = currentBillData.deliveryType;
    const currentDeliveryFee = currentBillData.deliveryFee;
    const currentDeliveryCompanyId = currentBillData.deliveryCompanyId;
    const currentDeliveryCompanyName = currentBillData.deliveryCompanyName;
    const currentDeliveryCompanyContact =
      currentBillData.deliveryCompanyContact;
    const currentTableId = currentBillData.tableId;
    const currentTableName = currentBillData.tableName;
    const currentSelectedHall = selectedHall;
    const currentSelectedTable = selectedTable;
    const currentShowTableInfo = showTableInfo;
    const currentTableStatus = tableStatus;
    const currentDeliveryTypeState = deliveryType;
    const currentSelectedDeliveryCompany = selectedDeliveryCompany;
    const currentInvoiceId = currentBillData.invoiceId;
    const currentInvoiceNumber = currentBillData.invoiceNumber;
    const currentInvoiceDate = currentBillData.invoiceDate;
    const currentInvoiceStatus = currentBillData.invoiceStatus;
    const currentIsPending = currentBillData.isPending;
    const currentIsReturned = currentBillData.isReturned;
    const currentCompleted = currentBillData.completed;
    const currentIsPartialPaid = currentBillData.isPartialPaid;
    const currentRemainingAmount = currentBillData.remainingAmount;
    const currentPaidAmount = currentBillData.paidAmount;
    const currentDiscount = currentBillData.discount;
    const currentDiscountType = currentBillData.discountType;

    setCurrentBillData({
      cart: [],
      tax: 0,
      discount: currentDiscount,
      discountType: currentDiscountType,
      deliveryFee: currentBillType === "delivery" ? currentDeliveryFee : "",
      completed: currentCompleted,
      isReturned: currentIsReturned,
      returnReason: "",
      billType: currentBillType,
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      customerNationalId: "",
      customerId: null,
      tableStatus: currentBillType === "dinein" ? currentTableStatus : null,
      generalNote: "",
      paymentMethod: null,
      invoiceId: currentInvoiceId,
      isPending: currentIsPending,
      invoiceNumber: currentInvoiceNumber,
      invoiceDate: currentInvoiceDate,
      invoiceStatus: currentInvoiceStatus,
      tableId: currentBillType === "dinein" ? currentTableId : null,
      tableName: currentBillType === "dinein" ? currentTableName : null,
      deliveryType: currentBillType === "delivery" ? currentDeliveryType : null,
      deliveryCompanyId:
        currentBillType === "delivery" ? currentDeliveryCompanyId : null,
      deliveryCompanyName:
        currentBillType === "delivery" ? currentDeliveryCompanyName : null,
      deliveryCompanyContact:
        currentBillType === "delivery" ? currentDeliveryCompanyContact : null,
      remainingAmount: currentRemainingAmount,
      paidAmount: currentPaidAmount,
      isPartialPaid: currentIsPartialPaid,
    });

    setCart([]);
    setOriginalCart([]);
    setHasCartChanges(false);
    setTax(0);
    setDiscount(currentDiscount);
    setDeliveryFee(currentBillType === "delivery" ? currentDeliveryFee : "");
    setCustomerPhone("");
    setCustomerName("");
    setCustomerAddress("");
    setCustomerNationalId("");
    setCustomerId(null);
    setGeneralNote("");

    if (currentBillType === "dinein") {
      setSelectedHall(currentSelectedHall);
      setSelectedTable(currentSelectedTable);
      setShowTableInfo(currentShowTableInfo);
      setTableStatus(currentTableStatus);
    } else {
      setSelectedHall(null);
      setSelectedTable(null);
      setShowTableInfo(false);
      setTableStatus("available");
    }

    if (currentBillType === "delivery") {
      setDeliveryType(currentDeliveryTypeState);
      setSelectedDeliveryCompany(currentSelectedDeliveryCompany);
    } else {
      setDeliveryType(null);
      setSelectedDeliveryCompany(null);
    }

    setOrderPrepared(false);
    setCurrentInvoiceRemainingAmount(0);

    toast.info("تم إعادة تعيين الفاتورة");
    setIsResettingBill(false);
  };

  const resetBillData = () => {
    setCurrentBillData({
      cart: [],
      tax: 0,
      discount: "",
      discountType: 0,
      deliveryFee: "",
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
      remainingAmount: null,
      paidAmount: null,
    });
    setCart([]);
    setOriginalCart([]);
    setHasCartChanges(false);
    setTax(0);
    setDiscount("");
    setDeliveryFee("");
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
    setOrderPrepared(false);
    setCurrentInvoiceRemainingAmount(0);
  };
  const resetCart = async () => {
    resetCartOnly();
  };

  const handleShiftClose = () => {
    setIsShiftOpen(false);
    toast.success("تم إغلاق الوردية بنجاح!");
  };

  const shouldShowPrepareOrderButton = () => {
    if (currentBillData.billType !== "dinein") {
      return false;
    }

    if (!selectedTable) {
      return false;
    }

    if (cart.length === 0) {
      return false;
    }

    if (currentBillData.isPartialPaid) {
      return false;
    }

    if (!isNewBillActive && currentBillData.isPending) {
      return hasCartChanges && !orderPrepared;
    }

    if (isNewBillActive) {
      return !orderPrepared;
    }

    return false;
  };

  const shouldShowCompleteBillButton = () => {
    if (!currentBillData) return false;

    if (!isNewBillActive && currentBillData.isPending && !hasCartChanges) {
      return true;
    }

    if (currentBillData.isPartialPaid && currentBillData.remainingAmount > 0) {
      return true;
    }

    if (
      cart.length > 0 &&
      !currentBillData.completed &&
      !currentBillData.isPartialPaid
    ) {
      return true;
    }

    return false;
  };

  const getCompleteBillButtonText = () => {
    if (currentBillData.isPartialPaid && currentBillData.remainingAmount > 0) {
      return "استكمال الدفع";
    }
    return "إتمام البيع";
  };

  if (isPageLoading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-l from-gray-50 to-gray-100"
      >
        <div className="text-center">
          <FaSpinner className="w-16 h-16 text-blue-600 animate-spin mb-4" />
        </div>
      </div>
    );
  }

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
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
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
                    {selectedProduct.finalPrice &&
                    selectedProduct.finalPrice < selectedProduct.price ? (
                      <>
                        <p className="text-sm text-gray-600 line-through">
                          السعر الأصلي: {selectedProduct.price} ج.م
                        </p>
                        <p className="text-sm text-green-600 font-bold">
                          السعر بعد الخصم: {selectedProduct.finalPrice} ج.م
                          {selectedProduct.percentageDiscount && (
                            <span className="text-xs mr-1">
                              (خصم {selectedProduct.percentageDiscount}%)
                            </span>
                          )}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">
                        السعر: {selectedProduct.price} ج.م
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedProduct.isTaxInclusive
                        ? "السعر شامل الضريبة"
                        : `السعر غير شامل الضريبة (الضريبة ${selectedProduct.valueAddedTax}%)`}
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
                    <Minus size={18} />
                  </button>
                  <input
                    type="text"
                    value={productQuantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1) {
                        setProductQuantity(value);
                      } else if (e.target.value === "") {
                        setProductQuantity(1);
                      }
                    }}
                    onBlur={(e) => {
                      if (
                        e.target.value === "" ||
                        parseInt(e.target.value) < 1
                      ) {
                        setProductQuantity(1);
                      }
                    }}
                    min="1"
                    className="mx-4 w-16 h-10 text-center font-bold text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    dir="ltr"
                  />
                  <button
                    onClick={() => setProductQuantity(productQuantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold"
                  >
                    <Plus size={18} />
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
                      <ChevronRight size={18} />
                    </button>

                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 w-full mx-6 min-h-[120px]">
                      {optionsLoading ? (
                        <div className="flex items-center justify-center h-20">
                          <FaSpinner className="w-6 h-6 text-blue-600 animate-spin" />
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
                      <ChevronLeft size={18} />
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
                      (selectedProduct.finalPrice || selectedProduct.price) *
                        productQuantity +
                      selectedOptions.reduce((sum, o) => sum + o.price, 0) *
                        productQuantity
                    ).toFixed(2)}{" "}
                    ج.م
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  <div>
                    السعر: {selectedProduct.finalPrice || selectedProduct.price}{" "}
                    ج.م × {productQuantity}
                  </div>
                  {selectedProduct.finalPrice &&
                    selectedProduct.finalPrice < selectedProduct.price && (
                      <div className="text-green-600">
                        توفير:{" "}
                        {(selectedProduct.price - selectedProduct.finalPrice) *
                          productQuantity}{" "}
                        ج.م
                      </div>
                    )}
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
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
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
                      onChange={(e) => setDiscountValue(e.target.value)}
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
                        {discountType === DiscountType.Percentage &&
                        discountValue
                          ? `${((subtotal * parseFloat(discountValue)) / 100).toFixed(2)} ج.م (${discountValue}%)`
                          : discountType === DiscountType.Fixed && discountValue
                            ? `${parseFloat(discountValue).toFixed(2)} ج.م`
                            : "0.00 ج.م"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">
                        الإجمالي بعد الخصم:
                      </span>
                      <span className="font-bold text-green-600">
                        {discountType === DiscountType.Percentage &&
                        discountValue
                          ? (
                              subtotal -
                              (subtotal * parseFloat(discountValue)) / 100
                            ).toFixed(2)
                          : discountType === DiscountType.Fixed && discountValue
                            ? (subtotal - parseFloat(discountValue)).toFixed(2)
                            : subtotal.toFixed(2)}{" "}
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
                  disabled={isApplyingDiscount}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold text-white transition-colors flex items-center justify-center ${
                    isApplyingDiscount
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:opacity-90"
                  }`}
                  style={{ backgroundColor: "#193F94" }}
                >
                  {isApplyingDiscount ? (
                    <>
                      <FaSpinner className="w-4 h-4 ml-2 animate-spin" />
                      جاري التطبيق...
                    </>
                  ) : (
                    "تطبيق الخصم"
                  )}
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
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={28} />
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
                        <User size={16} className="ml-1" />
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
                        <Phone size={16} className="ml-1" />
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
                        <MapPin size={16} className="ml-1" />
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
                        <CreditCard size={16} className="ml-1" />
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
                    <X size={16} className="ml-2" />
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCustomer || isUpdatingCustomer}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center text-sm ${
                      isCreatingCustomer || isUpdatingCustomer
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:opacity-90"
                    }`}
                    style={{ backgroundColor: "#193F94" }}
                  >
                    {isCreatingCustomer || isUpdatingCustomer ? (
                      <>
                        <FaSpinner className="w-4 h-4 ml-2 animate-spin" />
                        {isEditingCustomer
                          ? "جاري التحديث..."
                          : "جاري الإضافة..."}
                      </>
                    ) : (
                      <>
                        <Save size={16} className="ml-2" />
                        {isEditingCustomer ? "حفظ التعديلات" : "إضافة عميل"}
                      </>
                    )}
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
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleSelectDeliveryType(DeliveryType.Store)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-gray-50 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center border border-blue-300">
                      <Store size={24} className="text-blue-700" />
                    </div>
                    <div className="mr-3 text-right">
                      <h4 className="font-bold text-gray-800">دليفري المحل</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        رسوم التوصيل: 25 ج.م (قابلة للتعديل)
                      </p>
                    </div>
                  </div>
                  <ChevronLeft size={20} className="text-gray-400" />
                </button>

                <button
                  onClick={() => handleSelectDeliveryType(DeliveryType.Company)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-gray-50 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center border border-purple-300">
                      <Truck size={24} className="text-purple-700" />
                    </div>
                    <div className="mr-3 text-right">
                      <h4 className="font-bold text-gray-800">شركة توصيل</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        اختر من شركات التوصيل المتاحة
                      </p>
                    </div>
                  </div>
                  <ChevronLeft size={20} className="text-gray-400" />
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
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto pr-1">
                {deliveryCompaniesLoading ? (
                  <div className="text-center py-8">
                    <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
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
                            <Truck size={20} className="text-purple-700" />
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
                            <Check size={12} className="text-white" />
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
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
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
                      <FaSpinner className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
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
                        <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                  طرق الدفع
                </h3>
                <button
                  onClick={closePaymentModal}
                  disabled={isProcessingPayment}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">المبلغ المطلوب</p>
                      <p
                        className="text-xl font-bold"
                        style={{ color: "#193F94" }}
                      >
                        {currentBillData.isPartialPaid &&
                        currentBillData.remainingAmount
                          ? currentBillData.remainingAmount.toFixed(2)
                          : total.toFixed(2)}{" "}
                        ج.م
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-600">
                        #
                        {currentBillData.invoiceNumber ||
                          (isNewBillActive ? "جديدة" : currentBillIndex + 1)}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {cart.length} منتج
                      </p>
                    </div>
                  </div>
                  {discount && discount > 0 && (
                    <div className="mt-1 text-[10px] text-green-600">
                      الخصم: {discountAmountCalc.toFixed(2)} ج.م
                      {discountType === DiscountType.Percentage
                        ? ` (${discount}%)`
                        : ""}
                    </div>
                  )}
                  {currentBillData.isPartialPaid &&
                    currentBillData.paidAmount && (
                      <div className="mt-1 text-[10px] text-blue-600">
                        تم دفعه سابقاً: {currentBillData.paidAmount.toFixed(2)}{" "}
                        ج.م
                      </div>
                    )}
                </div>

                {!isPartialPayment && payments.length > 0 && (
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
                              type="text"
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
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isPartialPayment && (
                  <div className="mb-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Clock size={20} className="text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-yellow-800">
                            تأجيل المبلغ كاملاً
                          </p>
                          <p className="text-xs text-yellow-700">
                            سيتم حفظ الفاتورة كآجل والمبلغ{" "}
                            {currentBillData.isPartialPaid &&
                            currentBillData.remainingAmount
                              ? currentBillData.remainingAmount.toFixed(2)
                              : total.toFixed(2)}{" "}
                            ج.م سيتم تحصيله لاحقاً
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!isPartialPayment && (
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
                    {remainingAmount < 0 && payments.length > 0 && (
                      <p className="text-[10px] text-green-600 mt-0.5">
                        ✓ تم دفع مبلغ إضافي قدره{" "}
                        {Math.abs(remainingAmount).toFixed(2)} ج.م
                      </p>
                    )}
                    {remainingAmount > 0 && payments.length > 0 && (
                      <p className="text-[10px] text-yellow-600 mt-0.5">
                        ✓ سيتم حفظ الفاتورة كـ "آجل" (باقي{" "}
                        {remainingAmount.toFixed(2)} ج.م)
                      </p>
                    )}
                    {Math.abs(remainingAmount) < 0.01 &&
                      payments.length > 0 && (
                        <p className="text-[10px] text-green-600 mt-0.5">
                          ✓ تم تغطية كامل المبلغ
                        </p>
                      )}
                  </div>
                )}

                {!isPartialPayment && (
                  <>
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
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    isSelected
                                      ? "border-blue-500 bg-blue-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <Check size={10} className="text-white" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </>
                )}

                {!isPartialPayment && (
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <button
                      onClick={handlePartialPayment}
                      disabled={isProcessingPayment}
                      className="w-full py-2 px-3 rounded-lg border-2 border-yellow-400 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Clock size={14} />
                      تأجيل المبلغ كاملاً (آجل)
                    </button>
                  </div>
                )}

                {isPartialPayment && (
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => setIsPartialPayment(false)}
                      disabled={isProcessingPayment}
                      className="w-full py-2 px-3 rounded-lg border-2 border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-all text-xs disabled:opacity-50"
                    >
                      إلغاء التأجيل والدفع العادي
                    </button>
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
                  disabled={
                    (!isPartialPayment && payments.length === 0) ||
                    isProcessingPayment
                  }
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-white transition-colors text-xs flex items-center justify-center ${
                    (!isPartialPayment && payments.length === 0) ||
                    isProcessingPayment
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:opacity-90"
                  }`}
                  style={{
                    backgroundColor:
                      (!isPartialPayment && payments.length === 0) ||
                      isProcessingPayment
                        ? "#9CA3AF"
                        : "#193F94",
                  }}
                >
                  {isProcessingPayment ? (
                    <>
                      <FaSpinner className="w-3 h-3 ml-1 animate-spin" />
                      جاري تأكيد الدفع...
                    </>
                  ) : isPartialPayment ? (
                    "تأكيد التأجيل"
                  ) : (
                    getCompleteBillButtonText()
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: "#193F94" }}
                  >
                    تفاصيل الفاتورة
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    فاتورة رقم #
                    {currentBillData.invoiceNumber || currentBillIndex + 1}
                  </p>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">رقم الفاتورة</p>
                      <p className="font-bold">
                        #{currentBillData.invoiceNumber || currentBillIndex + 1}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">التاريخ</p>
                      <p className="font-bold">
                        {currentBillData.completedDate ||
                          new Date().toLocaleString()}
                      </p>
                    </div>
                    {selectedTable && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">الصالة</p>
                          <p className="font-bold">{selectedHall?.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">الطاولة</p>
                          <p className="font-bold">{selectedTable.number}</p>
                        </div>
                      </>
                    )}
                    {currentBillData.billType === "delivery" &&
                      deliveryType && (
                        <>
                          <div>
                            <p className="text-sm text-gray-600">نوع التوصيل</p>
                            <p className="font-bold">
                              {deliveryType === DeliveryType.Store
                                ? "دليفري المحل"
                                : selectedDeliveryCompany?.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              رسوم التوصيل
                            </p>
                            <p className="font-bold">{deliveryFee} ج.م</p>
                          </div>
                        </>
                      )}
                    <div>
                      <p className="text-sm text-gray-600">حالة الفاتورة</p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getInvoiceStatusStyle(currentBillData.invoiceStatus)}`}
                      >
                        {getInvoiceStatusText(currentBillData.invoiceStatus)}
                      </span>
                    </div>
                    {customerName && (
                      <div>
                        <p className="text-sm text-gray-600">العميل</p>
                        <p className="font-bold">{customerName}</p>
                        {customerPhone && (
                          <p className="text-xs text-gray-500">
                            {customerPhone}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                          المنتج
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">
                          الكمية
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                          السعر
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                          الإجمالي
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cart.map((item, index) => {
                        const itemTotal =
                          item.price * item.quantity + (item.optionsTotal || 0);
                        return (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                {item.selectedOptions &&
                                  item.selectedOptions.length > 0 && (
                                    <p className="text-xs text-gray-500">
                                      إضافات:{" "}
                                      {item.selectedOptions
                                        .map((o) => o.name)
                                        .join(", ")}
                                    </p>
                                  )}
                                {item.note && (
                                  <p className="text-xs text-blue-600">
                                    ملاحظة: {item.note}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-left">
                              {item.price} ج.م
                            </td>
                            <td className="px-4 py-3 text-left font-medium">
                              {itemTotal} ج.م
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>المجموع الفرعي:</span>
                      <span>{subtotal.toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>إجمالي الضريبة:</span>
                      <span>{totalTax.toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الخصم:</span>
                      <span className="text-green-600">
                        {discountAmountCalc.toFixed(2)} ج.م{" "}
                        {discountType === DiscountType.Percentage &&
                          discount &&
                          discount > 0 &&
                          `(${discount}%)`}
                      </span>
                    </div>
                    {currentBillData.billType === "delivery" &&
                      deliveryFee &&
                      deliveryFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>رسوم التوصيل:</span>
                          <span>{deliveryFee.toFixed(2)} ج.م</span>
                        </div>
                      )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>الإجمالي:</span>
                      <span style={{ color: "#193F94" }}>
                        {total.toFixed(2)} ج.م
                      </span>
                    </div>
                  </div>
                </div>

                {generalNote && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ملاحظة عامة: {generalNote}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  إغلاق
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
              {loading || shiftLoading || productsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <FaSpinner className="w-12 h-12 text-blue-600 animate-spin" />
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
                        <ShoppingBag size={48} className="mb-4" />
                        <p className="text-sm">لا توجد منتجات في هذه الفئة</p>
                        <p className="text-xs mt-1">
                          اختر فئة أخرى لعرض المنتجات
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 gap-2">
                        {filteredProducts.map((product) => {
                          const hasDiscount =
                            product.finalPrice &&
                            product.finalPrice < product.price;
                          return (
                            <button
                              key={product.id}
                              onClick={() => handleProductClick(product)}
                              disabled={
                                currentBillData.completed ||
                                currentBillData.isPartialPaid
                              }
                              className={`bg-gray-50 hover:bg-blue-50 rounded-lg p-2 flex items-center transition-all duration-300 transform active:scale-[0.98] border border-gray-200 h-20 ${
                                currentBillData.completed ||
                                currentBillData.isPartialPaid
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
                                {hasDiscount ? (
                                  <>
                                    <p className="text-sm font-bold text-green-600">
                                      {product.finalPrice} ج.م
                                    </p>
                                    <p className="text-[8px] text-gray-400 line-through">
                                      {product.price} ج.م
                                    </p>
                                    {product.percentageDiscount && (
                                      <p className="text-[8px] text-green-500">
                                        خصم {product.percentageDiscount}%
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <p
                                    className="text-sm font-bold"
                                    style={{ color: "#193F94" }}
                                  >
                                    {product.price} ج.م
                                  </p>
                                )}
                                <p className="text-[8px] text-gray-500">
                                  {product.isTaxInclusive
                                    ? "شامل الضريبة"
                                    : `غير شامل الضريبة (${product.valueAddedTax}%)`}
                                </p>
                              </div>
                            </button>
                          );
                        })}
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
                        isGoingToPreviousBill ||
                        (!isNewBillActive && currentInvoicePage === 1) ||
                        (isNewBillActive && totalPages === 0)
                      }
                      className={`px-2 py-1 rounded text-xs transition-all flex items-center ${
                        isGoingToPreviousBill ||
                        (!isNewBillActive && currentInvoicePage === 1) ||
                        (isNewBillActive && totalPages === 0)
                          ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      }`}
                    >
                      {isGoingToPreviousBill ? (
                        <FaSpinner className="w-3 h-3 ml-1 animate-spin" />
                      ) : (
                        <>
                          <ArrowRight size={12} className="ml-1" />
                          السابق
                        </>
                      )}
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
                          <>
                            {nextInvoiceNumber && (
                              <span
                                className="text-sm font-bold"
                                style={{ color: "#193F94" }}
                              >
                                {nextInvoiceNumber}
                              </span>
                            )}
                            <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full mr-1">
                              جديدة
                            </span>
                          </>
                        ) : (
                          <>
                            <span
                              className="text-sm font-bold"
                              style={{ color: "#193F94" }}
                            >
                              #
                              {currentBillData.invoiceNumber ||
                                currentBillIndex + 1}
                            </span>
                            {currentBillData.invoiceStatus !== undefined && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full mr-1 ${getInvoiceStatusStyle(currentBillData.invoiceStatus)}`}
                              >
                                {getInvoiceStatusText(
                                  currentBillData.invoiceStatus,
                                )}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={goToNextBill}
                      disabled={isGoingToNextBill}
                      className={`px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs transition-all flex items-center ${
                        isGoingToNextBill ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isGoingToNextBill ? (
                        <FaSpinner className="w-3 h-3 ml-1 animate-spin" />
                      ) : (
                        <>
                          التالي
                          <ArrowLeft size={12} className="mr-1" />
                        </>
                      )}
                    </button>
                    <button
                      onClick={goToNewBill}
                      disabled={isGoingToNextBill}
                      className={`px-2 py-1 rounded text-xs transition-all flex items-center ${
                        isGoingToNextBill
                          ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                      title="فاتورة جديدة"
                    >
                      {isGoingToNextBill ? (
                        <FaSpinner className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          جديد
                          <Plus size={12} className="mr-1" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex space-x-1 rtl:space-x-reverse">
                    {billTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => handleBillTypeChange(type.value)}
                        disabled={
                          currentBillData.completed ||
                          currentBillData.isPartialPaid ||
                          !isNewBillActive
                        }
                        className={`flex-1 flex items-center justify-center py-1.5 rounded border transition-all text-xs ${
                          currentBillData.billType === type.value
                            ? "bg-blue-100 border-blue-500 text-blue-700 font-medium"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                        } ${currentBillData.completed || currentBillData.isPartialPaid || !isNewBillActive ? "opacity-70 cursor-not-allowed" : ""}`}
                      >
                        {type.value === "takeaway" && (
                          <ShoppingBag size={12} className="ml-1" />
                        )}
                        {type.value === "dinein" && (
                          <Table size={12} className="ml-1" />
                        )}
                        {type.value === "delivery" && (
                          <Truck size={12} className="ml-1" />
                        )}
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
                          <Table size={20} className="text-blue-700" />
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
                            <MapPin size={10} className="ml-1" />
                            طاولة رقم {selectedTable.number}
                          </div>
                        </div>
                      </div>
                      {!currentBillData.completed &&
                        !currentBillData.isPartialPaid && (
                          <div className="flex space-x-1 rtl:space-x-reverse">
                            <button
                              onClick={handleOpenTableSelection}
                              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-gray-300"
                            >
                              <Edit2 size={12} className="ml-1" />
                              تغيير
                            </button>
                            {tableStatus === "occupied" && (
                              <button
                                onClick={handleRemoveTable}
                                disabled={isRemovingTable}
                                className={`text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-red-200 ${
                                  isRemovingTable
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                {isRemovingTable ? (
                                  <FaSpinner className="w-3 h-3 ml-1 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 size={12} className="ml-1" />
                                    إزالة
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {currentBillData.billType === "delivery" && deliveryType && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-white py-2 px-2 rounded-lg border border-amber-200 shadow-sm">
                      <div className="flex items-center">
                        {deliveryType === DeliveryType.Store ? (
                          <Store size={14} className="text-amber-700 ml-1" />
                        ) : (
                          <Truck size={14} className="text-amber-700 ml-1" />
                        )}
                        <span className="text-amber-800 font-medium text-[13px]">
                          {deliveryType === DeliveryType.Store
                            ? "دليفري المحل"
                            : selectedDeliveryCompany?.name}
                        </span>
                        <span className="mr-1 px-1 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-medium">
                          {deliveryFee} ج.م
                        </span>
                      </div>
                      {!currentBillData.completed &&
                        !currentBillData.isPartialPaid && (
                          <button
                            onClick={() => setShowDeliveryTypeModal(true)}
                            className="text-[9px] bg-amber-100 hover:bg-amber-200 text-amber-700 px-1 py-1 rounded transition-colors flex items-center"
                          >
                            <Edit2 size={12} />
                          </button>
                        )}
                    </div>
                    {deliveryType === DeliveryType.Company &&
                      selectedDeliveryCompany?.contactNumber && (
                        <div className="text-[8px] text-amber-600 mt-0.5 mr-5 flex items-center">
                          <Phone size={8} className="ml-0.5" />
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
                        disabled={
                          currentBillData.completed ||
                          currentBillData.isPartialPaid
                        }
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
                          <Phone size={14} className="ml-1" />
                          رقم الهاتف
                        </span>
                      </label>
                      {isSearchingCustomer && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <FaSpinner className="w-4 h-4 text-blue-600 animate-spin" />
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
                            disabled={
                              currentBillData.completed ||
                              currentBillData.isPartialPaid
                            }
                            className="p-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-all border border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="تعديل بيانات العميل"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}

                    {!customerId &&
                      customerPhone &&
                      customerPhone.length >= 11 && (
                        <button
                          onClick={openAddCustomerModal}
                          disabled={
                            currentBillData.completed ||
                            currentBillData.isPartialPaid
                          }
                          className="p-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 transition-all border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="إضافة عميل جديد"
                        >
                          <User size={16} />
                          <Plus
                            size={12}
                            className="absolute bottom-0 right-0"
                          />
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
                            {!currentBillData.completed &&
                              !currentBillData.isPartialPaid && (
                                <button
                                  onClick={startEditingGeneralNote}
                                  className="text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md transition-colors flex items-center border border-blue-300 mr-2"
                                >
                                  <Edit2 size={10} className="ml-1" />
                                  تعديل
                                </button>
                              )}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={startEditingGeneralNote}
                          disabled={
                            currentBillData.completed ||
                            currentBillData.isPartialPaid
                          }
                          className={`w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-right flex items-center justify-between ${
                            currentBillData.completed ||
                            currentBillData.isPartialPaid
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <span>إضافة ملاحظة عامة للفاتورة...</span>
                          <Edit2 size={12} className="text-gray-400" />
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
                        : getInvoiceStatusStyle(currentBillData.invoiceStatus)
                    }`}
                  >
                    {cart.length} منتج
                    {isNewBillActive && " (جديدة)"}
                  </span>
                  {!isNewBillActive && currentBillData.completedDate && (
                    <span className="text-[10px] text-gray-500">
                      {currentBillData.completedDate}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mb-3 pr-2 min-h-0">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 py-4">
                    <ShoppingBag size={48} className="mb-4" />
                    <p className="text-sm">لا توجد منتجات</p>
                    <p className="text-xs mt-1">قم بإضافة منتجات من القائمة</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => {
                      const itemSubtotal = item.price * item.quantity;
                      const optionsValue = item.optionsTotal || 0;
                      const taxableAmount = itemSubtotal + optionsValue;
                      const itemTaxRate = item.valueAddedTax || tax;
                      const itemTax = item.isTaxInclusive
                        ? (taxableAmount * itemTaxRate) / (100 + itemTaxRate)
                        : (taxableAmount * itemTaxRate) / 100;
                      const hasDiscount =
                        item.originalPrice && item.originalPrice > item.price;

                      return (
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
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {hasDiscount ? (
                                        <>
                                          <span className="text-green-600 font-medium">
                                            {item.price} ج.م
                                          </span>
                                          <span className="mr-1 text-[10px] text-gray-400 line-through">
                                            {item.originalPrice} ج.م
                                          </span>
                                        </>
                                      ) : (
                                        <span>{item.price} ج.م</span>
                                      )}
                                      <span className="mr-1 text-[10px] text-gray-600">
                                        ({itemTaxRate}%{" "}
                                        {item.isTaxInclusive
                                          ? "شامل الضريبة"
                                          : "غير شامل الضريبة"}
                                        )
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-blue-600 mt-0.5">
                                      قيمة الضريبة: {itemTax.toFixed(2)} ج.م
                                    </div>
                                  </div>
                                  <div className="text-left">
                                    <p
                                      className="font-bold text-sm"
                                      style={{ color: "#193F94" }}
                                    >
                                      {item.price * item.quantity +
                                        (item.optionsTotal || 0)}{" "}
                                      ج.م
                                      {!item.isTaxInclusive && (
                                        <span className="text-[8px] text-gray-500 block">
                                          +{itemTax.toFixed(2)} ضريبة
                                        </span>
                                      )}
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
                                            (o) =>
                                              `${o.name} (+${o.price} ج.م)`,
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
                                        currentBillData.completed ||
                                        currentBillData.isPartialPaid
                                      }
                                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                                        currentBillData.completed ||
                                        currentBillData.isPartialPaid
                                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                      }`}
                                    >
                                      <Minus size={12} />
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
                                        currentBillData.completed ||
                                        currentBillData.isPartialPaid
                                      }
                                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                                        currentBillData.completed ||
                                        currentBillData.isPartialPaid
                                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                      }`}
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>

                                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                                    {!currentBillData.completed &&
                                      !currentBillData.isPartialPaid && (
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
                                              <Edit2
                                                size={10}
                                                className="ml-1"
                                              />
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
                                              <Edit2
                                                size={10}
                                                className="ml-1"
                                              />
                                              ملاحظة
                                            </button>
                                          )}
                                        </>
                                      )}
                                    {!currentBillData.completed &&
                                      !currentBillData.isPartialPaid && (
                                        <button
                                          onClick={() =>
                                            deleteFromCart(
                                              item.uniqueId || item.id,
                                            )
                                          }
                                          className="text-[10px] bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded-md transition-colors flex items-center border border-red-200"
                                        >
                                          <Trash2 size={10} className="ml-1" />
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
                                        <AlertCircle
                                          size={10}
                                          className="text-blue-500 mt-0.5 ml-1 flex-shrink-0"
                                        />
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
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t pt-3 space-y-1.5 mt-auto">
                <div className="flex justify-between text-xs">
                  <span>المجموع الفرعي:</span>
                  <span className="font-bold">{subtotal.toFixed(2)} ج.م</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span>إجمالي الضريبة:</span>
                  <span className="font-bold">{totalTax.toFixed(2)} ج.م</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span>الخصم:</span>
                  <div className="flex items-center">
                    <button
                      onClick={openDiscountModal}
                      disabled={
                        currentBillData.completed ||
                        currentBillData.isPartialPaid ||
                        isApplyingDiscount
                      }
                      className={`w-12 text-center px-1 py-1 border rounded mr-1.5 text-xs ${
                        currentBillData.completed ||
                        currentBillData.isPartialPaid ||
                        isApplyingDiscount
                          ? "bg-gray-100 cursor-not-allowed"
                          : "bg-blue-50 hover:bg-blue-100 cursor-pointer border-blue-200"
                      }`}
                    >
                      {isApplyingDiscount ? (
                        <FaSpinner className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : discount === "" ? (
                        0
                      ) : (
                        discount
                      )}
                    </button>
                    <span className="font-bold">
                      {discountAmountCalc.toFixed(2)} ج.م
                      {discountType === DiscountType.Percentage &&
                        discount &&
                        discount > 0 &&
                        ` (${discount}%)`}
                    </span>
                  </div>
                </div>

                {currentBillData.billType === "delivery" && (
                  <div className="flex justify-between items-center text-xs">
                    <span>رسوم التوصيل:</span>
                    <div className="flex items-center">
                      {deliveryType === DeliveryType.Store ? (
                        <>
                          <input
                            type="number"
                            value={deliveryFee}
                            onChange={(e) => setDeliveryFee(e.target.value)}
                            className="w-12 text-right px-1 py-1 border rounded mr-1.5 text-xs"
                            min="0"
                            disabled={
                              currentBillData.completed ||
                              currentBillData.isPartialPaid
                            }
                          />
                          <span className="font-bold">
                            {deliveryFee
                              ? parseFloat(deliveryFee).toFixed(2)
                              : "0.00"}{" "}
                            ج.م
                          </span>
                        </>
                      ) : (
                        <span className="font-bold ml-1">
                          {deliveryFee
                            ? parseFloat(deliveryFee).toFixed(2)
                            : "0.00"}{" "}
                          ج.م
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
                disabled={
                  currentBillData.completed ||
                  currentBillData.isPartialPaid ||
                  isResettingBill
                }
                className={`py-2.5 px-3 rounded-lg font-medium border transition-all text-xs flex-1 flex items-center justify-center ${
                  currentBillData.completed ||
                  currentBillData.isPartialPaid ||
                  isResettingBill
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                style={{ borderColor: "#193F94", color: "#193F94" }}
                onMouseEnter={(e) => {
                  if (
                    !currentBillData.completed &&
                    !currentBillData.isPartialPaid &&
                    !isResettingBill
                  ) {
                    e.target.style.backgroundColor = "#193F94";
                    e.target.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (
                    !currentBillData.completed &&
                    !currentBillData.isPartialPaid &&
                    !isResettingBill
                  ) {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#193F94";
                  }
                }}
              >
                {isResettingBill ? (
                  <FaSpinner className="w-3 h-3 ml-1 animate-spin" />
                ) : (
                  <>
                    <RefreshCw size={12} className="ml-1" />
                    إعادة تعيين
                  </>
                )}
              </button>

              {!isNewBillActive &&
              currentBillData.completed &&
              !currentBillData.isReturned ? (
                <button
                  onClick={handleReturnBill}
                  disabled={isReturningBill}
                  className={`py-2.5 px-3 rounded-lg font-bold text-white transition-all duration-300 transform text-xs flex-1 flex items-center justify-center ${
                    isReturningBill
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                  style={{ backgroundColor: "#EF4444" }}
                  onMouseEnter={(e) => {
                    if (!isReturningBill) {
                      e.target.style.backgroundColor = "#DC2626";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isReturningBill) {
                      e.target.style.backgroundColor = "#EF4444";
                    }
                  }}
                >
                  {isReturningBill ? (
                    <FaSpinner className="w-3 h-3 ml-1 animate-spin" />
                  ) : (
                    <>
                      <ArrowLeft size={12} className="ml-1" />
                      ارتجاع
                    </>
                  )}
                </button>
              ) : !isNewBillActive &&
                currentBillData.invoiceStatus === InvoiceStatus.Returned ? (
                <button
                  onClick={handleReprintBill}
                  className="py-2.5 px-3 rounded-lg font-bold text-white transition-all duration-300 transform text-xs flex-1 flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: "#10B981" }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#059669";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#10B981";
                  }}
                >
                  <FileText size={12} className="ml-1" />
                  عرض الفاتورة
                </button>
              ) : shouldShowPrepareOrderButton() ? (
                <button
                  onClick={handlePrepareOrder}
                  disabled={isPreparingOrder}
                  className={`py-2.5 px-3 rounded-lg font-bold text-white transition-all duration-300 transform text-xs flex-1 flex items-center justify-center ${
                    isPreparingOrder
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                  style={{ backgroundColor: "#F59E0B" }}
                  onMouseEnter={(e) => {
                    if (!isPreparingOrder) {
                      e.target.style.backgroundColor = "#D97706";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPreparingOrder) {
                      e.target.style.backgroundColor = "#F59E0B";
                    }
                  }}
                >
                  {isPreparingOrder ? (
                    <FaSpinner className="w-3 h-3 ml-1 animate-spin" />
                  ) : (
                    <>
                      <Check size={12} className="ml-1" />
                      تحضير الطلب
                    </>
                  )}
                </button>
              ) : shouldShowCompleteBillButton() ? (
                <button
                  onClick={handleCompleteBill}
                  disabled={isProcessingPayment}
                  className={`py-2.5 px-3 rounded-lg font-bold text-white transition-all duration-300 transform text-xs flex-1 flex items-center justify-center ${
                    isProcessingPayment
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                  style={{ backgroundColor: "#20A4D4" }}
                  onMouseEnter={(e) => {
                    if (!isProcessingPayment) {
                      e.target.style.backgroundColor = "#1DC7E0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isProcessingPayment) {
                      e.target.style.backgroundColor = "#20A4D4";
                    }
                  }}
                >
                  <DollarSign size={12} className="ml-1" />
                  {getCompleteBillButtonText()}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
