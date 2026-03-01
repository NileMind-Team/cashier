import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Navbar from "../components/layout/Navbar.jsx";
import axiosInstance from "../api/axiosInstance";

export default function Home() {
  const [isShiftOpen, setIsShiftOpen] = useState(true);
  const [shiftStartTime] = useState(new Date().toLocaleTimeString("ar-EG"));
  const [loading, setLoading] = useState(false);
  const [hallsLoading, setHallsLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [optionsCurrentPage, setOptionsCurrentPage] = useState(1);
  const [optionsPerPage] = useState(8);

  const [bills, setBills] = useState([
    {
      id: 1,
      cart: [],
      tax: 14,
      discount: 0,
      deliveryFee: 25,
      completed: false,
      isReturned: false,
      returnReason: "",
      billType: "takeaway",
      customerName: "",
      customerPhone: "",
      tableStatus: null,
      preparedItems: [],
      generalNote: "",
      paymentMethod: null,
    },
  ]);
  const [currentBillIndex, setCurrentBillIndex] = useState(0);
  const [cart, setCart] = useState([]);
  const [tax, setTax] = useState(14);
  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(25);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
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
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [halls, setHalls] = useState([]);
  const [tables, setTables] = useState([]);

  const TableStatus = {
    Available: 0,
    Occupied: 1,
    Reserved: 2,
    OutOfService: 3,
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

  const shiftSummary = useMemo(() => {
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
        const billDiscount = (subtotal * bill.discount) / 100;
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
  }, [bills, shiftStartTime]);

  const fetchPaymentMethods = async () => {
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
    try {
      setHallsLoading(true);
      const response = await axiosInstance.get("/api/Hall/GetAll");

      if (response.status === 200 && response.data) {
        setHalls(response.data);

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
    try {
      setTablesLoading(true);
      const response = await axiosInstance.get("/api/Table/GetAll");

      if (response.status === 200 && response.data) {
        setTables(response.data);
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

  const fetchOptions = async () => {
    try {
      const response = await axiosInstance.post("/api/Options/GetAll", {
        pageNumber: 1,
        pageSize: 100,
        skip: 0,
      });

      if (response.status === 200 && response.data) {
        const items = response.data.items || [];
        const activeOptions = items.filter((option) => option.isActive);
        setOptions(activeOptions);
      }
    } catch (error) {
      console.error("خطأ في جلب الإضافات:", error);
    }
  };

  useEffect(() => {
    fetchHalls();
    fetchTables();
    fetchMainCategories();
    fetchPaymentMethods();
    fetchOptions();
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

  const paginatedOptions = useMemo(() => {
    const startIndex = (optionsCurrentPage - 1) * optionsPerPage;
    const endIndex = startIndex + optionsPerPage;
    return options.slice(startIndex, endIndex);
  }, [options, optionsCurrentPage, optionsPerPage]);

  const totalOptionsPages = Math.ceil(options.length / optionsPerPage);

  const handleNextOptionsPage = () => {
    if (optionsCurrentPage < totalOptionsPages) {
      setOptionsCurrentPage(optionsCurrentPage + 1);
    }
  };

  const handlePrevOptionsPage = () => {
    if (optionsCurrentPage > 1) {
      setOptionsCurrentPage(optionsCurrentPage - 1);
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
        deliveryFee: type === "delivery" ? deliveryFee : 0,
        tableInfo: null,
        tableStatus: null,
      };
      setBills(updatedBills);

      if (type === "delivery") {
        setDeliveryFee(25);
      } else {
        setDeliveryFee(0);
      }

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
        (bill) =>
          bill.tableInfo?.tableId === table.id &&
          bill.tableInfo?.hallId === selectedHall.id &&
          !bill.completed,
      );

      if (tableBillIndex !== -1) {
        const tableBill = bills[tableBillIndex];
        setCurrentBillIndex(tableBillIndex);
        setCart([...tableBill.cart]);
        setTax(tableBill.tax);
        setDiscount(tableBill.discount);
        setDeliveryFee(0);
        setCustomerName(tableBill.customerName || "");
        setCustomerPhone(tableBill.customerPhone || "");
        setGeneralNote(tableBill.generalNote || "");
        setSelectedHall(halls.find((h) => h.id === tableBill.tableInfo.hallId));
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
      tableStatus: "available",
      preparedItems: [],
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
      };
      setBills(updatedBills);

      toast.info("تم إلغاء اختيار الطاولة");
    }
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
                };
                setBills(updatedBills);

                setCart([]);
                setTax(14);
                setDiscount(0);
                setDeliveryFee(0);
                setCustomerName("");
                setCustomerPhone("");
                setGeneralNote("");
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
      const updatedBills = [...bills];
      updatedBills[currentBillIndex] = {
        id: currentBillIndex + 1,
        cart: [...cart],
        tax,
        discount,
        deliveryFee:
          bills[currentBillIndex]?.billType === "delivery" ? deliveryFee : 0,
        billType: updatedBills[currentBillIndex]?.billType || "takeaway",
        customerName: customerName,
        customerPhone: customerPhone,
        generalNote: generalNote,
        paymentMethod: updatedBills[currentBillIndex]?.paymentMethod || null,
        completed: updatedBills[currentBillIndex]?.completed || false,
        completedDate: updatedBills[currentBillIndex]?.completedDate || null,
        tableInfo: updatedBills[currentBillIndex]?.tableInfo || null,
        tableStatus: updatedBills[currentBillIndex]?.tableStatus || null,
        preparedItems: updatedBills[currentBillIndex]?.preparedItems || [],
        isReturned: updatedBills[currentBillIndex]?.isReturned || false,
        returnReason: updatedBills[currentBillIndex]?.returnReason || "",
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
    customerName,
    customerPhone,
    generalNote,
  ]);

  useEffect(() => {
    const currentBill = bills[currentBillIndex];
    if (currentBill) {
      setCustomerName(currentBill.customerName || "");
      setCustomerPhone(currentBill.customerPhone || "");
      setGeneralNote(currentBill.generalNote || "");

      if (currentBill.billType === "delivery") {
        setDeliveryFee(currentBill.deliveryFee || 25);
      } else {
        setDeliveryFee(0);
      }

      if (currentBill.tableInfo) {
        const hall = halls.find((h) => h.id === currentBill.tableInfo.hallId);
        if (hall) {
          setSelectedHall(hall);
          const tablesList = getTablesForCurrentHall();
          const table = tablesList.find(
            (t) => t.id === currentBill.tableInfo.tableId,
          );
          if (table) {
            setSelectedTable(table);
            setShowTableInfo(true);
            setTableStatus(currentBill.tableStatus || "available");
          }
        }
      } else {
        setSelectedHall(null);
        setSelectedTable(null);
        setShowTableInfo(false);
        setTableStatus("available");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBillIndex, bills, halls]);

  const handleProductClick = (product) => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن إضافة منتجات إلى فاتورة مكتملة");
      return;
    }

    setSelectedProduct(product);
    setProductQuantity(1);
    setSelectedOptions([]);
    setOptionsCurrentPage(1);
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

    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPaymentMethod(null);
  };

  const handleCompletePayment = () => {
    if (!selectedPaymentMethod) {
      toast.error("يرجى اختيار طريقة الدفع");
      return;
    }

    const updatedBills = [...bills];
    updatedBills[currentBillIndex] = {
      ...updatedBills[currentBillIndex],
      completed: true,
      completedDate: new Date().toLocaleString(),
      paymentMethod: selectedPaymentMethod,
      isReturned: false,
      returnReason: "",
    };
    setBills(updatedBills);

    if (selectedTable && selectedHall) {
      updateTableStatus(selectedHall.id, selectedTable.id, "available", null);
    }

    const currentBillType = bills[currentBillIndex]?.billType || "takeaway";
    const currentDeliveryFee = currentBillType === "delivery" ? deliveryFee : 0;

    const paymentMethod = paymentMethods.find(
      (p) => p.id === selectedPaymentMethod,
    );

    toast.success(
      <div>
        <p className="font-bold">
          تم إتمام الفاتورة رقم {currentBillIndex + 1}
        </p>
        {selectedTable && (
          <p className="text-sm mt-1">
            الطاولة: {selectedTable.number} ({selectedHall.name})
          </p>
        )}
        <p className="text-sm mt-1">
          نوع الفاتورة: {getBillTypeLabel(currentBillType)}
        </p>
        <p className="text-sm mt-1">
          طريقة الدفع: {paymentMethod?.name || "غير معروفة"}{" "}
          {paymentMethod?.icon}
        </p>
        {customerName && <p className="text-sm mt-1">العميل: {customerName}</p>}
        {generalNote && (
          <p className="text-sm mt-1 text-blue-600">ملاحظة: {generalNote}</p>
        )}
        {currentDeliveryFee > 0 && (
          <p className="text-sm mt-1">
            رسوم التوصيل: {currentDeliveryFee.toFixed(2)} ج.م
          </p>
        )}
        <p className="text-sm mt-1">الإجمالي: {total.toFixed(2)} ج.م</p>
        <p className="text-xs text-gray-600 mt-1">تم حفظ الفاتورة في النظام</p>
      </div>,
      { autoClose: 5000 },
    );

    const newBill = {
      id: bills.length + 1,
      cart: [],
      tax: 14,
      discount: 0,
      deliveryFee: 0,
      billType: "takeaway",
      customerName: "",
      customerPhone: "",
      generalNote: "",
      paymentMethod: null,
      completed: false,
      completedDate: null,
      tableInfo: null,
      tableStatus: null,
      preparedItems: [],
      isReturned: false,
      returnReason: "",
    };
    const newBills = [...updatedBills, newBill];
    setBills(newBills);
    setCurrentBillIndex(newBills.length - 1);
    setCart([]);
    setTax(14);
    setDiscount(0);
    setDeliveryFee(0);
    setCustomerName("");
    setCustomerPhone("");
    setGeneralNote("");
    setSelectedHall(null);
    setSelectedTable(null);
    setShowTableInfo(false);
    setTableStatus("available");
    setShowPaymentModal(false);
    setSelectedPaymentMethod(null);
  };

  const goToNextBill = () => {
    const updatedBills = [...bills];
    updatedBills[currentBillIndex] = {
      id: currentBillIndex + 1,
      cart: [...cart],
      tax,
      discount,
      deliveryFee:
        bills[currentBillIndex]?.billType === "delivery" ? deliveryFee : 0,
      billType: updatedBills[currentBillIndex]?.billType || "takeaway",
      customerName: customerName,
      customerPhone: customerPhone,
      generalNote: generalNote,
      paymentMethod: updatedBills[currentBillIndex]?.paymentMethod || null,
      completed: updatedBills[currentBillIndex]?.completed || false,
      completedDate: updatedBills[currentBillIndex]?.completedDate || null,
      tableInfo: updatedBills[currentBillIndex]?.tableInfo || null,
      tableStatus: updatedBills[currentBillIndex]?.tableStatus || null,
      preparedItems: updatedBills[currentBillIndex]?.preparedItems || [],
      isReturned: updatedBills[currentBillIndex]?.isReturned || false,
      returnReason: updatedBills[currentBillIndex]?.returnReason || "",
    };

    const nextIndex = currentBillIndex + 1;
    if (nextIndex < bills.length) {
      setCurrentBillIndex(nextIndex);
      const nextBill = bills[nextIndex];
      setCart([...nextBill.cart]);
      setTax(nextBill.tax);
      setDiscount(nextBill.discount);
      setDeliveryFee(
        nextBill.billType === "delivery" ? nextBill.deliveryFee : 0,
      );
      setCustomerName(nextBill.customerName || "");
      setCustomerPhone(nextBill.customerPhone || "");
      setGeneralNote(nextBill.generalNote || "");

      if (nextBill.tableInfo) {
        const hall = halls.find((h) => h.id === nextBill.tableInfo.hallId);
        if (hall) {
          setSelectedHall(hall);
          const tablesList = getTablesForCurrentHall();
          const table = tablesList.find(
            (t) => t.id === nextBill.tableInfo.tableId,
          );
          if (table) {
            setSelectedTable(table);
            setShowTableInfo(true);
            setTableStatus(nextBill.tableStatus || "available");
          }
        }
      } else {
        setSelectedHall(null);
        setSelectedTable(null);
        setShowTableInfo(false);
        setTableStatus("available");
      }

      toast.info(
        `الفاتورة رقم ${nextBill.id} (${getBillTypeLabel(nextBill.billType)})${nextBill.completed ? (nextBill.isReturned ? " (مرتجعة)" : " (مكتملة)") : " (معلقة)"}`,
      );
    } else {
      const newBill = {
        id: bills.length + 1,
        cart: [],
        tax: 14,
        discount: 0,
        deliveryFee: 0,
        billType: "takeaway",
        customerName: "",
        customerPhone: "",
        generalNote: "",
        paymentMethod: null,
        completed: false,
        completedDate: null,
        tableInfo: null,
        tableStatus: null,
        preparedItems: [],
        isReturned: false,
        returnReason: "",
      };
      const newBills = [...updatedBills, newBill];
      setBills(newBills);
      setCurrentBillIndex(nextIndex);
      setCart([]);
      setTax(14);
      setDiscount(0);
      setDeliveryFee(0);
      setCustomerName("");
      setCustomerPhone("");
      setGeneralNote("");
      setSelectedHall(null);
      setSelectedTable(null);
      setShowTableInfo(false);
      setTableStatus("available");
      toast.success(
        `فاتورة جديدة رقم ${newBill.id} (${getBillTypeLabel(newBill.billType)})`,
      );
    }
  };

  const goToPreviousBill = () => {
    if (currentBillIndex > 0) {
      const updatedBills = [...bills];
      updatedBills[currentBillIndex] = {
        id: currentBillIndex + 1,
        cart: [...cart],
        tax,
        discount,
        deliveryFee:
          bills[currentBillIndex]?.billType === "delivery" ? deliveryFee : 0,
        billType: updatedBills[currentBillIndex]?.billType || "takeaway",
        customerName: customerName,
        customerPhone: customerPhone,
        generalNote: generalNote,
        paymentMethod: updatedBills[currentBillIndex]?.paymentMethod || null,
        completed: updatedBills[currentBillIndex]?.completed || false,
        completedDate: updatedBills[currentBillIndex]?.completedDate || null,
        tableInfo: updatedBills[currentBillIndex]?.tableInfo || null,
        tableStatus: updatedBills[currentBillIndex]?.tableStatus || null,
        preparedItems: updatedBills[currentBillIndex]?.preparedItems || [],
        isReturned: updatedBills[currentBillIndex]?.isReturned || false,
        returnReason: updatedBills[currentBillIndex]?.returnReason || "",
      };
      setBills(updatedBills);

      const prevIndex = currentBillIndex - 1;
      setCurrentBillIndex(prevIndex);
      const prevBill = bills[prevIndex];
      setCart([...prevBill.cart]);
      setTax(prevBill.tax);
      setDiscount(prevBill.discount);
      setDeliveryFee(
        prevBill.billType === "delivery" ? prevBill.deliveryFee : 0,
      );
      setCustomerName(prevBill.customerName || "");
      setCustomerPhone(prevBill.customerPhone || "");
      setGeneralNote(prevBill.generalNote || "");

      if (prevBill.tableInfo) {
        const hall = halls.find((h) => h.id === prevBill.tableInfo.hallId);
        if (hall) {
          setSelectedHall(hall);
          const tablesList = getTablesForCurrentHall();
          const table = tablesList.find(
            (t) => t.id === prevBill.tableInfo.tableId,
          );
          if (table) {
            setSelectedTable(table);
            setShowTableInfo(true);
            setTableStatus(prevBill.tableStatus || "available");
          }
        }
      } else {
        setSelectedHall(null);
        setSelectedTable(null);
        setShowTableInfo(false);
        setTableStatus("available");
      }

      toast.info(
        `الفاتورة رقم ${prevBill.id} (${getBillTypeLabel(prevBill.billType)})${prevBill.completed ? (prevBill.isReturned ? " (مرتجعة)" : " (مكتملة)") : " (معلقة)"}`,
      );
    } else {
      toast.warning("هذه أول فاتورة");
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity + (item.optionsTotal || 0),
    0,
  );
  const totalTax = (subtotal * tax) / 100;
  const totalDiscount = (subtotal * discount) / 100;
  const total =
    subtotal +
    totalTax -
    totalDiscount +
    (bills[currentBillIndex]?.billType === "delivery" ? deliveryFee : 0);

  const handlePrepareOrder = () => {
    if (cart.length === 0) {
      toast.error("الفاتورة فارغة");
      return;
    }

    if (!selectedTable) {
      toast.error("لم يتم اختيار طاولة");
      return;
    }

    const updatedBills = [...bills];
    updatedBills[currentBillIndex] = {
      id: currentBillIndex + 1,
      cart: [...cart],
      tax,
      discount,
      deliveryFee:
        bills[currentBillIndex]?.billType === "delivery" ? deliveryFee : 0,
      billType: "dinein",
      customerName: customerName,
      customerPhone: customerPhone,
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
      tableStatus: "occupied",
      preparedItems: [...cart],
      isReturned: false,
      returnReason: "",
    };

    updateTableStatus(
      selectedHall.id,
      selectedTable.id,
      "occupied",
      currentBillIndex + 1,
    );
    setTableStatus("occupied");

    const newBill = {
      id: bills.length + 1,
      cart: [],
      tax: 14,
      discount: 0,
      deliveryFee: 0,
      billType: "takeaway",
      customerName: "",
      customerPhone: "",
      generalNote: "",
      paymentMethod: null,
      completed: false,
      completedDate: null,
      tableInfo: null,
      tableStatus: null,
      preparedItems: [],
      isReturned: false,
      returnReason: "",
    };
    const newBills = [...updatedBills, newBill];
    setBills(newBills);

    setCurrentBillIndex(newBills.length - 1);
    setCart([]);
    setTax(14);
    setDiscount(0);
    setDeliveryFee(0);
    setCustomerName("");
    setCustomerPhone("");
    setGeneralNote("");
    setSelectedHall(null);
    setSelectedTable(null);
    setShowTableInfo(false);
    setTableStatus("available");

    toast.success(
      `تم تحضير طلب الطاولة ${selectedTable.number} وفتح فاتورة جديدة`,
    );
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

    const { value: returnReason, isConfirmed } = await Swal.fire({
      title: "إرجاع الفاتورة",
      html: `
        <div class="text-right">
          <p class="mb-3">فاتورة رقم #${currentBill.id}</p>
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

    const updatedBills = [...bills];
    updatedBills[currentBillIndex] = {
      ...currentBill,
      isReturned: true,
      returnReason: returnReason || "بدون سبب",
      returnedDate: new Date().toLocaleString(),
    };
    setBills(updatedBills);

    if (currentBill.tableInfo && selectedHall && selectedTable) {
      updateTableStatus(selectedHall.id, selectedTable.id, "available", null);
      setTableStatus("available");
    }

    Swal.fire({
      title: "تم الإرجاع بنجاح!",
      html: `
        <div class="text-right">
          <p>تم تحويل الفاتورة #${currentBill.id} إلى فاتورة مرتجعة</p>
          <p class="mt-2 text-gray-600">${returnReason ? `السبب: ${returnReason}` : "بدون سبب محدد"}</p>
          <p class="mt-2 text-sm text-gray-500">التاريخ: ${new Date().toLocaleString()}</p>
        </div>
      `,
      icon: "success",
      confirmButtonText: "تم",
      confirmButtonColor: "#10B981",
    });

    toast.success(`تم إرجاع الفاتورة رقم ${currentBill.id} بنجاح`);
  };

  const handleReprintBill = () => {
    if (cart.length === 0) {
      toast.error("الفاتورة فارغة");
      return;
    }

    const billNumber = currentBillIndex + 1;
    const currentBill = bills[currentBillIndex];
    const isCompleted = currentBill?.completed || false;
    const isReturned = currentBill?.isReturned || false;
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
        <p className="font-bold">
          {isReturned
            ? "فاتورة مرتجعة"
            : isCompleted
              ? "فاتورة مكتملة"
              : "فاتورة معلقة"}{" "}
          رقم {billNumber}
        </p>
        {isReturned && currentBill.returnReason && (
          <p className="text-xs text-red-600 mb-1">
            سبب الارتجاع: {currentBill.returnReason}
          </p>
        )}
        {selectedTable && (
          <p className="text-xs text-gray-600 mb-1">
            الطاولة: {selectedTable.number} ({selectedHall.name})
          </p>
        )}
        <p className="text-sm text-gray-600 mb-1">
          نوع الفاتورة: {getBillTypeLabel(currentBillType)}
        </p>
        {customerName && (
          <p className="text-xs text-gray-600 mb-1">العميل: {customerName}</p>
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
            <span>الخصم ({discount}%):</span>
            <span>{totalDiscount.toFixed(2)} ج.م</span>
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
    setDeliveryFee(bills[currentBillIndex]?.billType === "delivery" ? 25 : 0);
    setCustomerName("");
    setCustomerPhone("");
    setGeneralNote("");
    toast.info("تم إعادة تعيين الفاتورة");
  };

  const handleCustomerNameChange = (e) => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }
    setCustomerName(e.target.value);
  };

  const handleCustomerPhoneChange = (e) => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }
    setCustomerPhone(e.target.value);
  };

  const handleDeliveryFeeChange = (e) => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }
    if (bills[currentBillIndex]?.billType === "delivery") {
      setDeliveryFee(Number(e.target.value));
    }
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

                  {/* Options Grid with Side Arrows */}
                  <div className="relative flex items-center">
                    {/* Left Arrow */}
                    <button
                      onClick={handlePrevOptionsPage}
                      disabled={optionsCurrentPage === 1}
                      className={`absolute right-0 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        optionsCurrentPage === 1
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

                    {/* Options Grid */}
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 w-full mx-6">
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
                    </div>

                    {/* Right Arrow */}
                    <button
                      onClick={handleNextOptionsPage}
                      disabled={optionsCurrentPage === totalOptionsPages}
                      className={`absolute left-0 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        optionsCurrentPage === totalOptionsPages
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
                        فاتورة #{currentBillIndex + 1}
                      </p>
                      <p className="text-xs text-gray-500">
                        {cart.length} منتج
                      </p>
                    </div>
                  </div>
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
              {loading ? (
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
                      disabled={currentBillIndex === 0}
                      className={`px-2 py-1 rounded text-xs transition-all ${
                        currentBillIndex === 0
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
                          فاتورة #{currentBillIndex + 1}
                        </span>
                        {bills[currentBillIndex]?.completed &&
                          !bills[currentBillIndex]?.isReturned && (
                            <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                              مكتملة
                            </span>
                          )}
                        {bills[currentBillIndex]?.isReturned && (
                          <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                            مرتجعة
                          </span>
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

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      اسم العميل
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={handleCustomerNameChange}
                      disabled={bills[currentBillIndex]?.completed}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="اسم العميل"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={handleCustomerPhoneChange}
                      disabled={bills[currentBillIndex]?.completed}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="رقم الهاتف"
                    />
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
                      bills[currentBillIndex]?.isReturned
                        ? "bg-red-100 text-red-800"
                        : bills[currentBillIndex]?.completed
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {cart.length} منتج
                    {bills[currentBillIndex]?.completed &&
                      (bills[currentBillIndex]?.isReturned
                        ? " (مرتجعة)"
                        : " (مكتملة)")}
                  </span>
                  {bills[currentBillIndex]?.completedDate && (
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
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-12 text-right px-1 py-1 border rounded mr-1.5 text-xs"
                      min="0"
                      max="100"
                      disabled={bills[currentBillIndex]?.completed}
                    />
                    <span className="font-bold">
                      {totalDiscount.toFixed(2)} ج.م
                    </span>
                  </div>
                </div>

                {bills[currentBillIndex]?.billType === "delivery" && (
                  <div className="flex justify-between items-center text-xs">
                    <span>رسوم التوصيل:</span>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={deliveryFee}
                        onChange={handleDeliveryFeeChange}
                        disabled={bills[currentBillIndex]?.completed}
                        className="w-16 text-right px-1 py-1 border rounded mr-1.5 text-xs"
                        min="0"
                      />
                      <span className="font-bold">
                        {deliveryFee.toFixed(2)} ج.م
                      </span>
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

              {bills[currentBillIndex]?.completed &&
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
              ) : bills[currentBillIndex]?.completed ? (
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
              ) : bills[currentBillIndex]?.billType === "dinein" &&
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
