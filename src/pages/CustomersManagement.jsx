import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function CustomersManagement() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: {
      city: "",
      district: "",
      street: "",
      building: "",
      floor: "",
      apartment: "",
      additionalInfo: "",
    },
    isActive: true,
    joinDate: new Date().toISOString().split("T")[0],
  });

  const initialCustomers = [
    {
      id: 1,
      name: "أحمد محمد",
      phone: "01012345678",
      address: {
        city: "القاهرة",
        district: "مدينة نصر",
        street: "شارع النصر",
        building: "15",
        floor: "3",
        apartment: "شقة 302",
        additionalInfo: "بجوار مسجد النور",
      },
      totalPurchases: 125000,
      purchaseCount: 42,
      isActive: true,
      joinDate: "2026-01-01",
    },
    {
      id: 2,
      name: "سارة علي",
      phone: "01123456789",
      address: {
        city: "القاهرة",
        district: "المعادي",
        street: "شارع 9",
        building: "8",
        floor: "1",
        apartment: "شقة 101",
        additionalInfo: "عمارة الزهور",
      },
      totalPurchases: 85000,
      purchaseCount: 28,
      isActive: true,
      joinDate: "2026-01-05",
    },
    {
      id: 3,
      name: "محمد خالد",
      phone: "01234567890",
      address: {
        city: "الجيزة",
        district: "المهندسين",
        street: "شارع الهرم",
        building: "22",
        floor: "5",
        apartment: "شقة 504",
        additionalInfo: "",
      },
      totalPurchases: 32000,
      purchaseCount: 15,
      isActive: true,
      joinDate: "2026-01-10",
    },
    {
      id: 4,
      name: "فاطمة أحمد",
      phone: "01098765432",
      address: {
        city: "القاهرة",
        district: "مدينة السلام",
        street: "شارع السلام",
        building: "10",
        floor: "2",
        apartment: "شقة 203",
        additionalInfo: "مطعم فاطمة - الطابق الأرضي",
      },
      totalPurchases: 250000,
      purchaseCount: 68,
      isActive: true,
      joinDate: "2026-01-03",
    },
    {
      id: 5,
      name: "علي حسن",
      phone: "01187654321",
      address: {
        city: "القاهرة",
        district: "الزيتون",
        street: "شارع الثورة",
        building: "5",
        floor: "4",
        apartment: "شقة 401",
        additionalInfo: "",
      },
      totalPurchases: 18000,
      purchaseCount: 8,
      isActive: true,
      joinDate: "2026-01-08",
    },
    {
      id: 6,
      name: "ريم سعد",
      phone: "01276543210",
      address: {
        city: "القاهرة",
        district: "المقطم",
        street: "شارع القاهرة",
        building: "12",
        floor: "6",
        apartment: "شقة 601",
        additionalInfo: "تطلب دائماً توصيل للمنزل",
      },
      totalPurchases: 95000,
      purchaseCount: 35,
      isActive: true,
      joinDate: "2026-01-06",
    },
    {
      id: 7,
      name: "خالد وليد",
      phone: "01011112222",
      address: {
        city: "الجيزة",
        district: "الدقي",
        street: "شارع الجامعة",
        building: "18",
        floor: "3",
        apartment: "شقة 301",
        additionalInfo: "مدير شركة الأهرام",
      },
      totalPurchases: 120000,
      purchaseCount: 40,
      isActive: true,
      joinDate: "2026-01-04",
    },
    {
      id: 8,
      name: "نورا عمرو",
      phone: "01122223333",
      address: {
        city: "القاهرة",
        district: "الزمالك",
        street: "شارع النيل",
        building: "7",
        floor: "2",
        apartment: "شقة 202",
        additionalInfo: "طالبة جامعية",
      },
      totalPurchases: 15000,
      purchaseCount: 6,
      isActive: false,
      joinDate: "2026-01-12",
    },
    {
      id: 9,
      name: "ياسر سليم",
      phone: "01233334444",
      address: {
        city: "القاهرة",
        district: "العباسية",
        street: "شارع رمسيس",
        building: "30",
        floor: "1",
        apartment: "شقة 102",
        additionalInfo: "كافتيريا الجامعة",
      },
      totalPurchases: 180000,
      purchaseCount: 55,
      isActive: true,
      joinDate: "2026-01-02",
    },
    {
      id: 10,
      name: "هدى محمود",
      phone: "01044445555",
      address: {
        city: "الجيزة",
        district: "الهرم",
        street: "شارع الأهرام",
        building: "9",
        floor: "5",
        apartment: "شقة 502",
        additionalInfo: "تسدد دائماً بالفيزا",
      },
      totalPurchases: 75000,
      purchaseCount: 30,
      isActive: true,
      joinDate: "2026-01-07",
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCustomers(initialCustomers);
      setLoading(false);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-EG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAddress = (address) => {
    if (!address) return "لا يوجد عنوان";

    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.district) parts.push(address.district);
    if (address.street) parts.push(address.street);

    const buildingParts = [];
    if (address.building) buildingParts.push(`مبني ${address.building}`);
    if (address.floor) buildingParts.push(`الدور ${address.floor}`);
    if (address.apartment) buildingParts.push(address.apartment);

    if (buildingParts.length > 0) {
      parts.push(buildingParts.join("، "));
    }

    if (address.additionalInfo) {
      parts.push(`(${address.additionalInfo})`);
    }

    return parts.join(" - ");
  };

  const handleAddCustomer = () => {
    setShowAddModal(true);
    setEditingCustomer(null);
    setFormData({
      name: "",
      phone: "",
      address: {
        city: "",
        district: "",
        street: "",
        building: "",
        floor: "",
        apartment: "",
        additionalInfo: "",
      },
      isActive: true,
      joinDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowAddModal(true);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: {
        city: customer.address?.city || "",
        district: customer.address?.district || "",
        street: customer.address?.street || "",
        building: customer.address?.building || "",
        floor: customer.address?.floor || "",
        apartment: customer.address?.apartment || "",
        additionalInfo: customer.address?.additionalInfo || "",
      },
      isActive: customer.isActive,
      joinDate: customer.joinDate,
    });
  };

  const handleDeleteCustomer = async (customerId) => {
    const customer = customers.find((c) => c.id === customerId);

    const result = await Swal.fire({
      title: "هل أنت متأكد من حذف هذا العميل؟",
      html: `
        <div class="text-right">
          <p class="mb-3">العميل: <strong>${customer.name}</strong></p>
          <p class="mb-3">رقم الهاتف: <strong>${customer.phone}</strong></p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف العميل",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setCustomers(customers.filter((customer) => customer.id !== customerId));
      toast.success("تم حذف العميل بنجاح");
    }
  };

  const handleToggleCustomerStatus = async (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    const action = customer.isActive ? "تعطيل" : "تفعيل";

    const result = await Swal.fire({
      title: `هل أنت متأكد من ${action} هذا العميل؟`,
      text: customer.isActive
        ? "لن يتمكن العميل من الشراء حتى يتم تفعيله مرة أخرى."
        : "سيتمكن العميل من الشراء من النظام.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `نعم، ${action}`,
      cancelButtonText: "إلغاء",
      confirmButtonColor: customer.isActive ? "#F59E0B" : "#10B981",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setCustomers(
        customers.map((customer) =>
          customer.id === customerId
            ? { ...customer, isActive: !customer.isActive }
            : customer,
        ),
      );
      toast.success(`تم ${action} العميل بنجاح`);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم العميل");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }

    const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("يرجى إدخال رقم هاتف مصري صحيح (11 رقم)");
      return;
    }

    if (editingCustomer) {
      const updatedCustomers = customers.map((customer) =>
        customer.id === editingCustomer.id
          ? {
              ...customer,
              name: formData.name,
              phone: formData.phone,
              address: {
                city: formData.address.city,
                district: formData.address.district,
                street: formData.address.street,
                building: formData.address.building,
                floor: formData.address.floor,
                apartment: formData.address.apartment,
                additionalInfo: formData.address.additionalInfo,
              },
              isActive: formData.isActive,
            }
          : customer,
      );
      setCustomers(updatedCustomers);
      toast.success("تم تحديث بيانات العميل بنجاح");
    } else {
      const newCustomer = {
        id: customers.length + 1,
        name: formData.name,
        phone: formData.phone,
        address: {
          city: formData.address.city,
          district: formData.address.district,
          street: formData.address.street,
          building: formData.address.building,
          floor: formData.address.floor,
          apartment: formData.address.apartment,
          additionalInfo: formData.address.additionalInfo,
        },
        totalPurchases: 0,
        purchaseCount: 0,
        isActive: formData.isActive,
        joinDate: formData.joinDate,
      };
      setCustomers([...customers, newCustomer]);
      toast.success("تم إضافة العميل الجديد بنجاح");
    }

    setShowAddModal(false);
    setEditingCustomer(null);
  };

  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    const fullAddress = formatAddress(customer.address).toLowerCase();

    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchTerm) ||
      fullAddress.includes(searchLower) ||
      customer.address?.city?.toLowerCase().includes(searchLower) ||
      customer.address?.district?.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c) => c.isActive).length,
    totalPurchases: customers.reduce(
      (sum, customer) => sum + customer.totalPurchases,
      0,
    ),
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-l from-gray-50 to-gray-100"
    >
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                <span className="text-white font-bold">$</span>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "#193F94" }}>
                نظام الكاشير - إدارة العملاء
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {stats.totalCustomers}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.activeCustomers} نشط •{" "}
                  {stats.totalCustomers - stats.activeCustomers} غير نشط
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-bold">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800">إجمالي المشتريات</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {formatCurrency(stats.totalPurchases)} ج.م
                </p>
                <p className="text-xs text-green-600 mt-1">جميع العملاء</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-bold">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-800">أعلى شراء</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">
                  {stats.totalCustomers > 0
                    ? formatCurrency(
                        Math.max(...customers.map((c) => c.totalPurchases)),
                      )
                    : "0.00"}{" "}
                  ج.م
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  أفضل عميل من حيث المبيعات
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                <span className="text-amber-700 font-bold">🏆</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                قائمة العملاء
              </h3>
              <p className="text-sm text-gray-600">
                إدارة بيانات العملاء في النظام - يمكنك البحث بالاسم، رقم الهاتف،
                أو العنوان
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث باسم العميل أو رقم الهاتف..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full md:w-80 px-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-300 hover:border-blue-300 text-right"
                    dir="rtl"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </div>
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <div className="text-xs text-blue-600 mt-1 text-right">
                    {filteredCustomers.length} نتيجة للبحث: "{searchTerm}"
                  </div>
                )}
              </div>

              <button
                onClick={handleAddCustomer}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center whitespace-nowrap shadow-md"
                style={{ backgroundColor: "#193F94" }}
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                إضافة عميل جديد
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">جاري تحميل بيانات العملاء...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        العميل
                      </th>
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        العنوان التفصيلي
                      </th>
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        الإحصائيات
                      </th>
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        الحالة
                      </th>
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCustomers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-8 px-4 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-12 w-12 text-gray-300 mb-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            <p className="text-lg font-medium text-gray-400">
                              {searchTerm
                                ? "لا توجد نتائج للبحث"
                                : "لا يوجد عملاء"}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {searchTerm
                                ? "جرب بحثاً مختلفاً أو أضف عميلاً جديداً"
                                : "قم بإضافة عميل جديد لبدء العمل"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentCustomers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ml-3 text-blue-700 font-bold text-lg">
                                {customer.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">
                                  {customer.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {customer.phone}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  انضم في: {formatDate(customer.joinDate)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-800">
                                {customer.address?.city || "غير محدد"}
                                {customer.address?.district &&
                                  ` - ${customer.address.district}`}
                              </div>
                              {customer.address?.street && (
                                <div className="text-xs text-gray-600">
                                  {customer.address.street}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {customer.address?.building && (
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    مبني {customer.address.building}
                                  </span>
                                )}
                                {customer.address?.floor && (
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    الدور {customer.address.floor}
                                  </span>
                                )}
                                {customer.address?.apartment && (
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {customer.address.apartment}
                                  </span>
                                )}
                              </div>
                              {customer.address?.additionalInfo && (
                                <div className="text-xs text-blue-600 mt-1 italic">
                                  {customer.address.additionalInfo}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">
                                  إجمالي المشتريات:
                                </span>
                                <span className="font-bold text-green-700 text-sm">
                                  {formatCurrency(customer.totalPurchases)} ج.م
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">
                                  عدد المشتريات:
                                </span>
                                <span className="font-medium text-blue-700 text-sm">
                                  {customer.purchaseCount}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full ml-2 ${
                                  customer.isActive
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <span
                                className={`font-medium ${
                                  customer.isActive
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {customer.isActive ? "نشط" : "معطل"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => handleEditCustomer(customer)}
                                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border border-blue-200"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 ml-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
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
                              <button
                                onClick={() =>
                                  handleToggleCustomerStatus(customer.id)
                                }
                                className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border ${
                                  customer.isActive
                                    ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                                    : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                }`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 ml-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  {customer.isActive ? (
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                    />
                                  ) : (
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                  )}
                                </svg>
                                {customer.isActive ? "تعطيل" : "تفعيل"}
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteCustomer(customer.id)
                                }
                                className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border border-red-200"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 ml-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
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
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredCustomers.length > itemsPerPage && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="text-sm text-gray-700 mb-2 md:mb-0">
                      عرض {indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, filteredCustomers.length)} من{" "}
                      {filteredCustomers.length} عميل
                      {searchTerm && (
                        <span className="text-blue-600"> (نتائج البحث)</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1.5 rounded-lg text-sm ${
                          currentPage === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        السابق
                      </button>
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`px-3 py-1.5 rounded-lg text-sm ${
                                currentPage === pageNumber
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        },
                      )}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1.5 rounded-lg text-sm ${
                          currentPage === totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        التالي
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold" style={{ color: "#193F94" }}>
                  {editingCustomer ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم العميل *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
                      required
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
                      required
                      placeholder="01xxxxxxxxx"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <h4
                    className="text-lg font-bold mb-4"
                    style={{ color: "#193F94" }}
                  >
                    العنوان التفصيلي
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المدينة
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المنطقة/الحي
                      </label>
                      <input
                        type="text"
                        name="address.district"
                        value={formData.address.district}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اسم الشارع
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
                        dir="rtl"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          المبني
                        </label>
                        <input
                          type="text"
                          name="address.building"
                          value={formData.address.building}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
                          placeholder="رقم"
                          dir="rtl"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الدور
                        </label>
                        <input
                          type="text"
                          name="address.floor"
                          value={formData.address.floor}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
                          placeholder="رقم"
                          dir="rtl"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الشقة
                        </label>
                        <input
                          type="text"
                          name="address.apartment"
                          value={formData.address.apartment}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
                          placeholder="رقم"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        معلومات إضافية
                      </label>
                      <textarea
                        name="address.additionalInfo"
                        value={formData.address.additionalInfo}
                        onChange={handleFormChange}
                        rows="2"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none text-right"
                        placeholder="أي معلومات إضافية لتحديد العنوان بدقة..."
                        dir="rtl"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="mr-2 text-sm font-medium text-gray-700">
                      العميل نشط (يمكنه الشراء من النظام)
                    </span>
                  </label>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-lg font-bold text-white transition-colors"
                    style={{ backgroundColor: "#193F94" }}
                  >
                    {editingCustomer ? "حفظ التعديلات" : "إضافة عميل"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
