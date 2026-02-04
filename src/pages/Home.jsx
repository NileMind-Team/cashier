import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import Navbar from "../components/layout/Navbar.jsx";

export default function Home() {
  const [isShiftOpen, setIsShiftOpen] = useState(true);
  const [shiftStartTime] = useState(new Date().toLocaleTimeString("ar-EG"));

  const [bills, setBills] = useState([
    {
      id: 1,
      cart: [],
      tax: 14,
      discount: 0,
      deliveryFee: 25,
      completed: false,
      billType: "takeaway",
      customerName: "",
      customerPhone: "",
      tableStatus: null,
      preparedItems: [],
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

  const halls = [
    { id: 1, name: "الصالة الرئيسية", color: "#3B82F6" },
    { id: 2, name: "الصالة الخارجية", color: "#10B981" },
    { id: 3, name: "الصالة VIP", color: "#8B5CF6" },
  ];

  const [tablesData, setTablesData] = useState({
    1: [
      { id: 1, number: "ط1", status: "available", currentBillId: null },
      { id: 2, number: "ط2", status: "available", currentBillId: null },
      { id: 3, number: "ط3", status: "available", currentBillId: null },
      { id: 4, number: "ط4", status: "available", currentBillId: null },
      { id: 5, number: "ط5", status: "available", currentBillId: null },
      { id: 6, number: "ط6", status: "available", currentBillId: null },
      { id: 7, number: "ط7", status: "available", currentBillId: null },
      { id: 8, number: "ط8", status: "available", currentBillId: null },
    ],
    2: [
      { id: 9, number: "ط9", status: "available", currentBillId: null },
      { id: 10, number: "ط10", status: "available", currentBillId: null },
      { id: 11, number: "ط11", status: "available", currentBillId: null },
      { id: 12, number: "ط12", status: "available", currentBillId: null },
      { id: 13, number: "ط13", status: "available", currentBillId: null },
    ],
    3: [
      { id: 14, number: "ط14", status: "available", currentBillId: null },
      { id: 15, number: "ط15", status: "available", currentBillId: null },
      { id: 16, number: "ط16", status: "available", currentBillId: null },
      { id: 17, number: "ط17", status: "available", currentBillId: null },
      { id: 18, number: "ط18", status: "available", currentBillId: null },
    ],
  });

  const shiftSummary = useMemo(() => {
    const totalBills = bills.length;
    const completedBills = bills.filter((bill) => bill.completed).length;
    const pendingBills = totalBills - completedBills;

    let totalSales = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let netRevenue = 0;

    bills.forEach((bill) => {
      if (bill.completed) {
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
      totalSales,
      totalTax,
      totalDiscount,
      netRevenue,
      startTime: shiftStartTime,
    };
  }, [bills, shiftStartTime]);

  const products = [
    {
      id: 1,
      name: "قهوة تركية",
      price: 15,
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 2,
      name: "شاي أخضر",
      price: 10,
      image:
        "https://images.unsplash.com/photo-1561047029-3000c68339ca?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 3,
      name: "عصير برتقال",
      price: 12,
      image:
        "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 4,
      name: "كابتشينو",
      price: 18,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 5,
      name: "إسبريسو",
      price: 12,
      image:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 6,
      name: "ساندويتش جبنة",
      price: 25,
      image:
        "https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 7,
      name: "ساندويتش دجاج",
      price: 30,
      image:
        "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 8,
      name: "ساندويتش لحم",
      price: 35,
      image:
        "https://images.unsplash.com/photo-1550317138-10000687a72b?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 9,
      name: "كرواسون",
      price: 8,
      image:
        "https://images.unsplash.com/photo-1550317138-10000687a72b?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 10,
      name: "دونات",
      price: 10,
      image:
        "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 11,
      name: "تشيز كيك",
      price: 20,
      image:
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 12,
      name: "كيك شوكولاتة",
      price: 22,
      image:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 13,
      name: "مياه معدنية",
      price: 5,
      image:
        "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 14,
      name: "مشروب غازي",
      price: 7,
      image:
        "https://images.unsplash.com/photo-1561758033-7e924f619b47?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 15,
      name: "عصير مانجو",
      price: 15,
      image:
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 16,
      name: "سلطة خضار",
      price: 22,
      image:
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 17,
      name: "بطاطس مقلية",
      price: 15,
      image:
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 18,
      name: "بيتزا صغيرة",
      price: 35,
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 19,
      name: "برجر لحم",
      price: 40,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 20,
      name: "سوشي",
      price: 45,
      image:
        "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 21,
      name: "آيس كريم",
      price: 12,
      image:
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 22,
      name: "قهوة مثلجة",
      price: 20,
      image:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 23,
      name: "شاي مثلج",
      price: 12,
      image:
        "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 24,
      name: "معكرونة",
      price: 28,
      image:
        "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 25,
      name: "ستيك لحم",
      price: 65,
      image:
        "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=150&h=150&fit=crop&crop=center",
    },
  ];

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
    return tablesData[selectedHall.id] || [];
  };

  const updateTableStatus = (hallId, tableId, newStatus, billId = null) => {
    setTablesData((prev) => {
      const updatedTables = { ...prev };
      const tableIndex = updatedTables[hallId]?.findIndex(
        (t) => t.id === tableId,
      );
      if (tableIndex !== -1 && updatedTables[hallId]) {
        updatedTables[hallId] = [...updatedTables[hallId]];
        updatedTables[hallId][tableIndex] = {
          ...updatedTables[hallId][tableIndex],
          status: newStatus,
          currentBillId: billId,
        };
      }
      return updatedTables;
    });
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
                };
                setBills(updatedBills);

                setCart([]);
                setTax(14);
                setDiscount(0);
                setDeliveryFee(0);
                setCustomerName("");
                setCustomerPhone("");
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
        completed: updatedBills[currentBillIndex]?.completed || false,
        completedDate: updatedBills[currentBillIndex]?.completedDate || null,
        tableInfo: updatedBills[currentBillIndex]?.tableInfo || null,
        tableStatus: updatedBills[currentBillIndex]?.tableStatus || null,
        preparedItems: updatedBills[currentBillIndex]?.preparedItems || [],
      };
      setBills(updatedBills);
    };

    saveCurrentBill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, tax, discount, deliveryFee, customerName, customerPhone]);

  useEffect(() => {
    const currentBill = bills[currentBillIndex];
    if (currentBill) {
      setCustomerName(currentBill.customerName || "");
      setCustomerPhone(currentBill.customerPhone || "");

      if (currentBill.billType === "delivery") {
        setDeliveryFee(currentBill.deliveryFee || 25);
      } else {
        setDeliveryFee(0);
      }

      if (currentBill.tableInfo) {
        const hall = halls.find((h) => h.id === currentBill.tableInfo.hallId);
        if (hall) {
          setSelectedHall(hall);
          const tables = tablesData[hall.id] || [];
          const table = tables.find(
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
  }, [currentBillIndex, bills]);

  const addToCart = (product) => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن إضافة منتجات إلى فاتورة مكتملة");
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, quantity: 1, note: "" }]);
    }

    toast.success(`تم إضافة ${product.name} إلى الفاتورة`);
  };

  const removeFromCart = (id) => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }

    const existingItem = cart.find((item) => item.id === id);

    if (existingItem.quantity > 1) {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        ),
      );
    } else {
      setCart(cart.filter((item) => item.id !== id));
    }
  };

  const deleteFromCart = (id) => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن حذف منتجات من فاتورة مكتملة");
      return;
    }

    setCart(cart.filter((item) => item.id !== id));
  };

  const handleAddNote = (id, note) => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }

    setCart(
      cart.map((item) => (item.id === id ? { ...item, note: note } : item)),
    );
    setEditingNoteProductId(null);
    setTempNote("");

    if (note.trim()) {
      toast.info("تم حفظ الملاحظة");
    }
  };

  const startEditingNote = (id, currentNote) => {
    if (bills[currentBillIndex]?.completed) {
      toast.error("لا يمكن تعديل فاتورة مكتملة");
      return;
    }

    setEditingNoteProductId(id);
    setTempNote(currentNote || "");
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
      completed: updatedBills[currentBillIndex]?.completed || false,
      completedDate: updatedBills[currentBillIndex]?.completedDate || null,
      tableInfo: updatedBills[currentBillIndex]?.tableInfo || null,
      tableStatus: updatedBills[currentBillIndex]?.tableStatus || null,
      preparedItems: updatedBills[currentBillIndex]?.preparedItems || [],
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

      if (nextBill.tableInfo) {
        const hall = halls.find((h) => h.id === nextBill.tableInfo.hallId);
        if (hall) {
          setSelectedHall(hall);
          const tables = tablesData[hall.id] || [];
          const table = tables.find((t) => t.id === nextBill.tableInfo.tableId);
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
        `الفاتورة رقم ${nextBill.id} (${getBillTypeLabel(nextBill.billType)})${nextBill.completed ? " (مكتملة)" : " (معلقة)"}`,
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
        completed: false,
        completedDate: null,
        tableInfo: null,
        tableStatus: null,
        preparedItems: [],
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
        completed: updatedBills[currentBillIndex]?.completed || false,
        completedDate: updatedBills[currentBillIndex]?.completedDate || null,
        tableInfo: updatedBills[currentBillIndex]?.tableInfo || null,
        tableStatus: updatedBills[currentBillIndex]?.tableStatus || null,
        preparedItems: updatedBills[currentBillIndex]?.preparedItems || [],
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

      if (prevBill.tableInfo) {
        const hall = halls.find((h) => h.id === prevBill.tableInfo.hallId);
        if (hall) {
          setSelectedHall(hall);
          const tables = tablesData[hall.id] || [];
          const table = tables.find((t) => t.id === prevBill.tableInfo.tableId);
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
        `الفاتورة رقم ${prevBill.id} (${getBillTypeLabel(prevBill.billType)})${prevBill.completed ? " (مكتملة)" : " (معلقة)"}`,
      );
    } else {
      toast.warning("هذه أول فاتورة");
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
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
      completed: false,
      completedDate: null,
      tableInfo: null,
      tableStatus: null,
      preparedItems: [],
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
    setSelectedHall(null);
    setSelectedTable(null);
    setShowTableInfo(false);
    setTableStatus("available");

    toast.success(
      `تم تحضير طلب الطاولة ${selectedTable.number} وفتح فاتورة جديدة`,
    );
  };

  const handleCompleteBill = () => {
    if (cart.length === 0) {
      toast.error("الفاتورة فارغة");
      return;
    }

    if (bills[currentBillIndex]?.billType === "dinein" && !selectedTable) {
      toast.error("يرجى اختيار طاولة أولاً");
      setShowTableSelection(true);
      return;
    }

    const updatedBills = [...bills];
    updatedBills[currentBillIndex] = {
      ...updatedBills[currentBillIndex],
      completed: true,
      completedDate: new Date().toLocaleString(),
    };
    setBills(updatedBills);

    if (selectedTable && selectedHall) {
      updateTableStatus(selectedHall.id, selectedTable.id, "available", null);
    }

    const currentBillType = bills[currentBillIndex]?.billType || "takeaway";
    const currentDeliveryFee = currentBillType === "delivery" ? deliveryFee : 0;

    const tableInfoText = selectedTable
      ? `\n      الطاولة: ${selectedTable.number} (${selectedHall.name})`
      : "";

    const cartItemsText = cart
      .map((item) => {
        let itemText = `• ${item.name} × ${item.quantity} = ${item.price * item.quantity} ج.م`;
        if (item.note && item.note.trim()) {
          itemText += `\n  (ملاحظة: ${item.note})`;
        }
        return itemText;
      })
      .join("\n");

    const receiptText = `
      فاتورة رقم #${currentBillIndex + 1}
      ${new Date().toLocaleString()}
      نوع الفاتورة: ${getBillTypeLabel(currentBillType)}${tableInfoText}
      العميل: ${customerName || "غير محدد"}
      الهاتف: ${customerPhone || "غير محدد"}
      ==============================
      ${cartItemsText}
      ==============================
      المجموع الفرعي: ${subtotal.toFixed(2)} ج.م
      الضريبة (${tax}%): ${totalTax.toFixed(2)} ج.م
      الخصم (${discount}%): ${totalDiscount.toFixed(2)} ج.م
      ${currentDeliveryFee > 0 ? `رسوم التوصيل: ${currentDeliveryFee.toFixed(2)} ج.م` : ""}
      الإجمالي النهائي: ${total.toFixed(2)} ج.م
      ==============================
      ✅ فاتورة مكتملة
      شكراً لزيارتكم!
    `;

    console.log("نص الفاتورة للرسالة:", receiptText);

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
        {customerName && <p className="text-sm mt-1">العميل: {customerName}</p>}
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
      completed: false,
      completedDate: null,
      tableInfo: null,
      tableStatus: null,
      preparedItems: [],
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
    setSelectedHall(null);
    setSelectedTable(null);
    setShowTableInfo(false);
    setTableStatus("available");
  };

  const handleReprintBill = () => {
    if (cart.length === 0) {
      toast.error("الفاتورة فارغة");
      return;
    }

    const billNumber = currentBillIndex + 1;
    const isCompleted = bills[currentBillIndex]?.completed || false;
    const currentBillType = bills[currentBillIndex]?.billType || "takeaway";
    const currentDeliveryFee = currentBillType === "delivery" ? deliveryFee : 0;

    const tableInfoText = selectedTable
      ? `\n      الطاولة: ${selectedTable.number} (${selectedHall.name})`
      : "";

    const cartItemsText = cart
      .map((item) => {
        let itemText = `• ${item.name} × ${item.quantity} = ${item.price * item.quantity} ج.م`;
        if (item.note && item.note.trim()) {
          itemText += `\n  (ملاحظة: ${item.note})`;
        }
        return itemText;
      })
      .join("\n");

    const receiptText = `
      فاتورة رقم #${billNumber} ${isCompleted ? "(مكتملة)" : "(معلقة)"}
      ${bills[currentBillIndex]?.completedDate || new Date().toLocaleString()}
      نوع الفاتورة: ${getBillTypeLabel(currentBillType)}${tableInfoText}
      العميل: ${customerName || "غير محدد"}
      الهاتف: ${customerPhone || "غير محدد"}
      ==============================
      ${cartItemsText}
      ==============================
      المجموع الفرعي: ${subtotal.toFixed(2)} ج.م
      الضريبة (${tax}%): ${totalTax.toFixed(2)} ج.م
      الخصم (${discount}%): ${totalDiscount.toFixed(2)} ج.م
      ${currentDeliveryFee > 0 ? `رسوم التوصيل: ${currentDeliveryFee.toFixed(2)} ج.م` : ""}
      الإجمالي النهائي: ${total.toFixed(2)} ج.م
      ==============================
      ${isCompleted ? "✅ فاتورة مكتملة" : "⏸️ فاتورة معلقة"}
    `;

    console.log("نص الفاتورة لإعادة العرض:", receiptText);

    toast.info(
      <div>
        <p className="font-bold">
          {isCompleted ? "فاتورة مكتملة" : "فاتورة معلقة"} رقم {billNumber}
        </p>
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
                {item.note && item.note.trim() && (
                  <span className="text-[10px] text-gray-500 block truncate max-w-[120px]">
                    ملاحظة: {item.note}
                  </span>
                )}
              </div>
              <span className="whitespace-nowrap">
                {item.price * item.quantity} ج.م
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
                  {halls.map((hall) => (
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
                            ? hall.color
                            : "transparent",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: hall.color }}
                        />
                        <div className="flex-1 mr-2">
                          <p className="font-medium">{hall.name}</p>
                          <p className="text-xs text-gray-500">
                            {tablesData[hall.id]?.length || 0} طاولة
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                {selectedHall ? (
                  <>
                    <div className="mb-4">
                      <h4
                        className="font-bold text-lg"
                        style={{ color: selectedHall.color }}
                      >
                        {selectedHall.name}
                      </h4>
                      <p className="text-gray-600">
                        اختر طاولة من القائمة التالية:
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {getTablesForCurrentHall().map((table) => (
                        <button
                          key={table.id}
                          onClick={() => handleSelectTable(table)}
                          className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                            table.status === "occupied"
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
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {table.status === "available" ? "متاحة" : "مشغولة"}
                          </div>
                        </button>
                      ))}
                    </div>
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

      <div className="flex-1 container mx-auto px-4 py-4 flex flex-col h-[calc(100vh-80px)]">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-full overflow-hidden flex flex-col">
              <div className="mb-6">
                <h2 className="text-xl font-bold" style={{ color: "#193F94" }}>
                  المنتجات
                </h2>
                <p className="text-gray-500">
                  اختر المنتجات لإضافتها إلى الفاتورة
                </p>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-5 gap-2">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
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
              </div>
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
                        {bills[currentBillIndex]?.completed && (
                          <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                            مكتملة
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

                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      bills[currentBillIndex]?.completed
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {cart.length} منتج
                    {bills[currentBillIndex]?.completed && " (مكتملة)"}
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
                        key={item.id}
                        className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
                      >
                        <div className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start flex-1 min-w-0">
                              <div className="w-14 h-14 rounded-xl overflow-hidden ml-2 flex-shrink-0 border border-gray-300">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-bold text-sm text-gray-800 truncate">
                                      {item.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {item.price} ج.م للوحدة
                                    </p>
                                  </div>
                                  <div className="text-left ml-2">
                                    <p
                                      className="font-bold text-sm"
                                      style={{ color: "#193F94" }}
                                    >
                                      {item.price * item.quantity} ج.م
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                      {item.quantity} × {item.price}
                                    </p>
                                  </div>
                                </div>

                                {editingNoteProductId === item.id ? (
                                  <div className="mt-2">
                                    <textarea
                                      value={tempNote}
                                      onChange={(e) =>
                                        setTempNote(e.target.value)
                                      }
                                      placeholder="اكتب ملاحظة لهذا المنتج..."
                                      className="w-full px-2 py-1.5 text-xs border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                      rows="2"
                                      autoFocus
                                    />
                                    <div className="flex justify-end space-x-1 rtl:space-x-reverse mt-1">
                                      <button
                                        onClick={() => {
                                          setEditingNoteProductId(null);
                                          setTempNote("");
                                        }}
                                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                      >
                                        إلغاء
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleAddNote(item.id, tempNote)
                                        }
                                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                      >
                                        حفظ
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-2 flex justify-between items-center">
                                    <div className="flex-1">
                                      {item.note && item.note.trim() ? (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                                          <div className="flex items-start">
                                            <svg
                                              className="w-3 h-3 text-blue-500 mt-0.5 ml-1 flex-shrink-0"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                            <p className="text-xs text-blue-800 flex-1">
                                              {item.note}
                                            </p>
                                          </div>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            startEditingNote(item.id, item.note)
                                          }
                                          disabled={
                                            bills[currentBillIndex]?.completed
                                          }
                                          className={`flex items-center text-xs ${
                                            bills[currentBillIndex]?.completed
                                              ? "text-gray-400 cursor-not-allowed"
                                              : "text-gray-600 hover:text-blue-600"
                                          }`}
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
                                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                            />
                                          </svg>
                                          إضافة ملاحظة
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                disabled={bills[currentBillIndex]?.completed}
                                className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${
                                  bills[currentBillIndex]?.completed
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                }`}
                              >
                                -
                              </button>
                              <span className="mx-2 font-bold text-sm min-w-[24px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => addToCart(item)}
                                disabled={bills[currentBillIndex]?.completed}
                                className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${
                                  bills[currentBillIndex]?.completed
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                }`}
                              >
                                +
                              </button>
                            </div>

                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              {!bills[currentBillIndex]?.completed &&
                                item.note &&
                                item.note.trim() && (
                                  <button
                                    onClick={() =>
                                      startEditingNote(item.id, item.note)
                                    }
                                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-lg transition-colors flex items-center border border-blue-200"
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
                                    تعديل
                                  </button>
                                )}
                              {!bills[currentBillIndex]?.completed && (
                                <button
                                  onClick={() => deleteFromCart(item.id)}
                                  className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded-lg transition-colors flex items-center border border-red-200"
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
                                  حذف
                                </button>
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

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={resetCart}
                disabled={bills[currentBillIndex]?.completed}
                className={`py-2.5 px-3 rounded-lg font-medium border transition-all text-xs ${
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

              {bills[currentBillIndex]?.completed ? (
                <button
                  onClick={handleReprintBill}
                  className="py-2.5 px-3 rounded-lg font-bold text-white transition-all duration-300 transform text-xs hover:scale-[1.02] active:scale-[0.98]"
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
                    className={`py-2.5 px-3 rounded-lg font-bold text-white transition-all duration-300 transform text-xs ${
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
                    className={`py-2.5 px-3 rounded-lg font-bold text-white transition-all duration-300 transform text-xs ${
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
                  className={`py-2.5 px-3 rounded-lg font-bold text-white transition-all duration-300 transform text-xs ${
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
