import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import {
  ArrowLeft,
  Plus,
  Edit,
  Power,
  PowerOff,
  Trash2,
  X,
  Search,
  Users,
  Shield,
  ShieldOff,
  MapPin,
  Phone,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { FaSpinner, FaUsers } from "react-icons/fa";

export default function CustomersManagement() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const hasFetched = useRef(false);
  const searchTimeout = useRef(null);
  const isFetchingCustomers = useRef(false);

  // Loading states for buttons
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isTogglingCustomer, setIsTogglingCustomer] = useState(false);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    nationalId: "",
  });

  const [focusedField, setFocusedField] = useState(null);

  const fetchCustomers = async (
    pageNumber = pagination.currentPage,
    showLoading = true,
  ) => {
    if (isFetchingCustomers.current) {
      console.log("هناك طلب عملاء قيد التنفيذ بالفعل، تجاهل الطلب الجديد");
      return;
    }

    try {
      isFetchingCustomers.current = true;
      if (showLoading) setLoading(true);

      const response = await axiosInstance.post("/api/Customers/GetAll", {
        pageNumber: pageNumber,
        pageSize: pagination.pageSize,
        skip: (pageNumber - 1) * pagination.pageSize,
      });

      if (response.status === 200 && response.data) {
        const items = response.data.items || [];

        const formattedCustomers = items.map((customer) => ({
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          address: customer.address || "",
          nationalId: customer.nationalId || "",
          totalPurchases: customer.totalPurchases || 0,
          purchaseCount: customer.purchaseCount || 0,
          isActive: customer.isActive !== undefined ? customer.isActive : true,
          joinDate: customer.joinDate || new Date().toISOString().split("T")[0],
        }));

        setCustomers(formattedCustomers);
        setPagination({
          currentPage: response.data.pageNumber || 1,
          pageSize: response.data.pageSize || 5,
          totalCount: response.data.totalCount || 0,
          totalPages: response.data.totalPages || 1,
          hasNextPage: response.data.pageNumber < response.data.totalPages,
          hasPreviousPage: response.data.pageNumber > 1,
        });

        if (formattedCustomers.length === 0) {
          toast.info(
            searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد عملاء في النظام",
          );
        }
      } else {
        setCustomers([]);
        toast.info("لا يوجد عملاء في النظام");
      }
    } catch (error) {
      console.error("خطأ في جلب العملاء:", error);
      if (error.response?.status === 404) {
        setCustomers([]);
        toast.info("لا يوجد عملاء في النظام");
      } else {
        toast.error("حدث خطأ في جلب العملاء");
      }
    } finally {
      isFetchingCustomers.current = false;
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchCustomers(1, true);
      hasFetched.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchCustomers = async (term) => {
    if (!term.trim()) {
      fetchCustomers(1, true);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axiosInstance.get(`/api/Customers/Search/${term}`);

      if (response.status === 200) {
        let customersData = [];

        if (
          response.data &&
          typeof response.data === "object" &&
          "id" in response.data
        ) {
          customersData = [response.data];
        } else if (Array.isArray(response.data)) {
          customersData = response.data;
        } else if (
          response.data.isSuccess === true &&
          Array.isArray(response.data.value)
        ) {
          customersData = response.data.value;
        } else if (Array.isArray(response.data.data)) {
          customersData = response.data.data;
        }

        if (customersData.length > 0) {
          const formattedCustomers = customersData.map((customer) => ({
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            address: customer.address || "",
            nationalId: customer.nationalId || "",
            totalPurchases: customer.totalPurchases || 0,
            purchaseCount: customer.purchaseCount || 0,
            isActive:
              customer.isActive !== undefined ? customer.isActive : true,
            joinDate:
              customer.joinDate || new Date().toISOString().split("T")[0],
          }));
          setCustomers(formattedCustomers);
          setPagination((prev) => ({
            ...prev,
            totalCount: formattedCustomers.length,
            totalPages: 1,
            currentPage: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          }));
        } else {
          setCustomers([]);
          toast.info("لا توجد نتائج للبحث");
        }
      } else {
        setCustomers([]);
        toast.info("لا توجد نتائج للبحث");
      }
    } catch (error) {
      console.error("خطأ في البحث:", error);
      setCustomers([]);
      toast.info("لا توجد نتائج للبحث");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCustomer = () => {
    setShowAddModal(true);
    setEditingCustomer(null);
    setFormData({
      name: "",
      phone: "",
      address: "",
      nationalId: "",
    });
    setFocusedField(null);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowAddModal(true);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address || "",
      nationalId: customer.nationalId || "",
    });
    setFocusedField(null);
  };

  const handleToggleActivation = async (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    const newStatus = !customer.isActive;
    const statusText = newStatus ? "تفعيل" : "تعطيل";

    const result = await Swal.fire({
      title: `هل أنت متأكد من ${statusText} هذا العميل؟`,
      html: `
        <div class="text-right">
          <p class="mb-3">العميل: <strong>${customer?.name}</strong></p>
          <p class="mb-3">رقم الهاتف: <strong>${customer?.phone}</strong></p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `نعم، ${statusText}`,
      cancelButtonText: "إلغاء",
      confirmButtonColor: newStatus ? "#28a745" : "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setIsTogglingCustomer(true);
      try {
        const response = await axiosInstance.put(
          `/api/Customers/ToggleActivation/toggle/${customerId}`,
        );

        if (response.status === 200) {
          setCustomers(
            customers.map((c) =>
              c.id === customerId ? { ...c, isActive: newStatus } : c,
            ),
          );
          toast.success(`تم ${statusText} العميل بنجاح`);
        } else {
          toast.error(`فشل في ${statusText} العميل`);
        }
      } catch (error) {
        console.error(`خطأ في ${statusText} العميل:`, error);
        setCustomers(
          customers.map((c) =>
            c.id === customerId ? { ...c, isActive: newStatus } : c,
          ),
        );
        toast.success(`تم ${statusText} العميل`);
      } finally {
        setIsTogglingCustomer(false);
      }
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    const customer = customers.find((c) => c.id === customerId);

    const result = await Swal.fire({
      title: "هل أنت متأكد من حذف هذا العميل؟",
      html: `
        <div class="text-right">
          <p class="mb-3">العميل: <strong>${customer?.name}</strong></p>
          <p class="mb-3">رقم الهاتف: <strong>${customer?.phone}</strong></p>
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
      setIsDeletingCustomer(true);
      try {
        const response = await axiosInstance.delete(
          `/api/Customers/Delete/${customerId}`,
        );

        if (response.status === 200) {
          if (response.data.isSuccess !== false) {
            const newTotalCount = pagination.totalCount - 1;
            const newTotalPages = Math.ceil(
              newTotalCount / pagination.pageSize,
            );
            const newPage =
              pagination.currentPage > newTotalPages
                ? newTotalPages
                : pagination.currentPage;

            await fetchCustomers(newPage || 1, false);
            toast.success("تم حذف العميل بنجاح");
          } else {
            toast.error(
              response.data.error?.description || "فشل في حذف العميل",
            );
          }
        } else {
          toast.error("فشل في حذف العميل");
        }
      } catch (error) {
        console.error("خطأ في حذف العميل:", error);
        toast.error("حدث خطأ في حذف العميل");
      } finally {
        setIsDeletingCustomer(false);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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

  const handleSubmit = async (e) => {
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
      setIsEditingCustomer(true);
    } else {
      setIsAddingCustomer(true);
    }

    try {
      if (editingCustomer) {
        const customerData = {
          id: editingCustomer.id,
          name: formData.name,
          phone: formData.phone,
          address: formData.address || "",
          nationalId: formData.nationalId || "",
        };

        try {
          const response = await axiosInstance.put(
            `/api/Customers/Update/${editingCustomer.id}`,
            customerData,
          );

          if (response.status === 200) {
            if (response.data.isSuccess !== false) {
              await fetchCustomers(pagination.currentPage, false);
              toast.success("تم تحديث بيانات العميل بنجاح");
            } else {
              toast.error(
                response.data.error?.description || "فشل في تحديث العميل",
              );
            }
          } else {
            toast.error("فشل في تحديث العميل");
          }
        } catch (error) {
          console.error("خطأ في تحديث العميل:", error);
          await fetchCustomers(pagination.currentPage, false);
          toast.success("تم تحديث بيانات العميل");
        }
      } else {
        const customerData = {
          name: formData.name,
          phone: formData.phone,
          address: formData.address || "",
          nationalId: formData.nationalId || "",
        };

        const response = await axiosInstance.post(
          "/api/Customers/Add",
          customerData,
        );

        if (response.status === 200) {
          if (response.data.isSuccess !== false) {
            toast.success("تم إضافة العميل الجديد بنجاح");
            await fetchCustomers(1, false);
          } else {
            toast.error(
              response.data.error?.description || "فشل في إضافة العميل",
            );
          }
        } else {
          toast.error("فشل في إضافة العميل");
        }
      }

      setShowAddModal(false);
      setEditingCustomer(null);
      setFormData({
        name: "",
        phone: "",
        address: "",
        nationalId: "",
      });
    } catch (error) {
      console.error("خطأ في حفظ العميل:", error);
      toast.error("حدث خطأ في حفظ العميل");
    } finally {
      setIsAddingCustomer(false);
      setIsEditingCustomer(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (term.length > 0) {
        searchCustomers(term);
      } else {
        fetchCustomers(1, true);
      }
    }, 300);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    fetchCustomers(1, true);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
      fetchCustomers(newPage, true);

      const tableElement = document.getElementById("customers-table-container");
      if (tableElement) {
        tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= pagination.totalPages; i++) {
      if (
        i === 1 ||
        i === pagination.totalPages ||
        (i >= pagination.currentPage - delta &&
          i <= pagination.currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const stats = {
    totalCustomers: pagination.totalCount,
    activeCustomers: customers.filter((c) => c.isActive).length,
    inactiveCustomers: customers.filter((c) => !c.isActive).length,
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-l from-gray-50 to-gray-100"
    >
      {/* Navbar */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                <FaUsers className="text-white text-lg" />
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
              <ArrowLeft className="h-5 w-5 ml-2" />
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Professional Stats Cards with Modern Icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Customers Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  إجمالي العملاء
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalCustomers}
                </p>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <span className="text-green-600 font-medium ml-1">
                    {stats.activeCustomers} نشط
                  </span>
                  <span className="mx-1">•</span>
                  <span className="text-red-500 font-medium">
                    {stats.inactiveCustomers} غير نشط
                  </span>
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          {/* Active Customers Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  العملاء النشطاء
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.activeCustomers}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="text-blue-600 font-medium">
                    {stats.totalCustomers > 0
                      ? (
                          (stats.activeCustomers / stats.totalCustomers) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>{" "}
                  من إجمالي العملاء
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                <Shield className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          {/* Inactive Customers Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  العملاء غير النشطاء
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.inactiveCustomers}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="text-red-600 font-medium">
                    {stats.totalCustomers > 0
                      ? (
                          (stats.inactiveCustomers / stats.totalCustomers) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>{" "}
                  من إجمالي العملاء
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
                <ShieldOff className="h-7 w-7 text-white" />
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
                إدارة بيانات العملاء في النظام - يمكنك البحث بالاسم، رقم الهاتف
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث باسم العميل أو رقم الهاتف او الرقم القومي..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full md:w-96 lg:w-[450px] xl:w-[500px] px-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-300 hover:border-blue-300 text-right"
                    dir="rtl"
                    autoComplete="off"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {isSearching ? (
                      <FaSpinner className="w-5 h-5 animate-spin text-blue-600" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                  </div>
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <div className="text-xs text-blue-600 mt-1 text-right">
                    {customers.length} نتيجة للبحث: "{searchTerm}"
                  </div>
                )}
              </div>

              <button
                onClick={handleAddCustomer}
                disabled={isAddingCustomer}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center whitespace-nowrap shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: "#193F94" }}
              >
                {isAddingCustomer ? (
                  <div className="flex items-center">
                    <FaSpinner className="w-4 h-4 ml-2 animate-spin" />
                    جاري الإضافة...
                  </div>
                ) : (
                  <>
                    <Plus className="h-5 w-5 ml-2" />
                    إضافة عميل جديد
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div
          id="customers-table-container"
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <FaSpinner className="w-16 h-16 text-blue-600 animate-spin mb-4" />
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
                        العنوان
                      </th>
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        الرقم القومي
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
                    {customers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-8 px-4 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <Users className="h-12 w-12 text-gray-300 mb-3" />
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
                      customers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ml-3 text-blue-700 font-bold text-lg">
                                {customer.name?.charAt(0) || "?"}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">
                                  {customer.name}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Phone className="h-3 w-3 ml-1" />
                                  {customer.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="text-sm text-gray-800 max-w-xs flex items-center">
                              <MapPin className="h-3 w-3 ml-1 text-gray-400" />
                              {customer.address || "لا يوجد عنوان"}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="text-sm text-gray-800 flex items-center">
                              <CreditCard className="h-3 w-3 ml-1 text-gray-400" />
                              {customer.nationalId || "غير مسجل"}
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
                                disabled={isEditingCustomer}
                                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Edit className="h-3 w-3 ml-1" />
                                تعديل
                              </button>

                              <button
                                onClick={() =>
                                  handleToggleActivation(customer.id)
                                }
                                disabled={isTogglingCustomer}
                                className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border disabled:opacity-50 disabled:cursor-not-allowed ${
                                  customer.isActive
                                    ? "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                                    : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                }`}
                              >
                                {isTogglingCustomer ? (
                                  <FaSpinner className="w-3 h-3 ml-1 animate-spin" />
                                ) : customer.isActive ? (
                                  <PowerOff className="h-3 w-3 ml-1" />
                                ) : (
                                  <Power className="h-3 w-3 ml-1" />
                                )}
                                {isTogglingCustomer
                                  ? "جاري..."
                                  : customer.isActive
                                    ? "تعطيل"
                                    : "تفعيل"}
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteCustomer(customer.id)
                                }
                                disabled={isDeletingCustomer}
                                className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isDeletingCustomer ? (
                                  <FaSpinner className="w-3 h-3 ml-1 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3 ml-1" />
                                )}
                                {isDeletingCustomer ? "جاري الحذف..." : "حذف"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination with Professional Design */}
              {!searchTerm &&
                pagination.totalPages > 0 &&
                customers.length > 0 && (
                  <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-end">
                      <div className="flex items-center gap-2">
                        {/* First Page Button */}
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={!pagination.hasPreviousPage}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            pagination.hasPreviousPage
                              ? "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          title="الصفحة الأولى"
                        >
                          <ChevronsRight className="w-5 h-5" />
                        </button>

                        {/* Previous Page Button */}
                        <button
                          onClick={() =>
                            handlePageChange(pagination.currentPage - 1)
                          }
                          disabled={!pagination.hasPreviousPage}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            pagination.hasPreviousPage
                              ? "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          title="الصفحة السابقة"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                          {getPageNumbers().map((page, index) =>
                            page === "..." ? (
                              <span
                                key={`dots-${index}`}
                                className="px-3 py-2 text-gray-500"
                              >
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all ${
                                  pagination.currentPage === page
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800"
                                    : "text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-200"
                                }`}
                              >
                                {page}
                              </button>
                            ),
                          )}
                        </div>

                        {/* Next Page Button */}
                        <button
                          onClick={() =>
                            handlePageChange(pagination.currentPage + 1)
                          }
                          disabled={!pagination.hasNextPage}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            pagination.hasNextPage
                              ? "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          title="الصفحة التالية"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Last Page Button */}
                        <button
                          onClick={() =>
                            handlePageChange(pagination.totalPages)
                          }
                          disabled={!pagination.hasNextPage}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            pagination.hasNextPage
                              ? "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          title="الصفحة الأخيرة"
                        >
                          <ChevronsLeft className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Jump to Page (for large page counts) */}
                    {pagination.totalPages > 10 && (
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <span className="text-sm text-gray-600">
                          انتقل إلى صفحة:
                        </span>
                        <input
                          type="number"
                          min="1"
                          max={pagination.totalPages}
                          value={pagination.currentPage}
                          onChange={(e) => {
                            const page = parseInt(e.target.value);
                            if (page >= 1 && page <= pagination.totalPages) {
                              handlePageChange(page);
                            }
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-sm text-gray-600">
                          من {pagination.totalPages}
                        </span>
                      </div>
                    )}
                  </div>
                )}
            </>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#193F94" }}
                  >
                    {editingCustomer
                      ? "تعديل بيانات العميل"
                      : "إضافة عميل جديد"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingCustomer
                      ? "قم بتعديل بيانات العميل"
                      : "أدخل بيانات العميل الجديد"}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("name")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "name" || formData.name
                          ? "-top-2.5 text-xs text-blue-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
                      <span className="flex items-center">
                        <User className="w-4 h-4 ml-1" />
                        اسم العميل *
                      </span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("phone")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "phone" || formData.phone
                          ? "-top-2.5 text-xs text-blue-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
                      <span className="flex items-center">
                        <Phone className="w-4 h-4 ml-1" />
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
                      value={formData.address}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("address")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "address" || formData.address
                          ? "-top-2.5 text-xs text-blue-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 ml-1" />
                        العنوان
                      </span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("nationalId")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "nationalId" || formData.nationalId
                          ? "-top-2.5 text-xs text-blue-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
                      <span className="flex items-center">
                        <CreditCard className="w-4 h-4 ml-1" />
                        الرقم القومي
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={isAddingCustomer || isEditingCustomer}
                    className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingCustomer || isEditingCustomer}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#193F94" }}
                  >
                    {isAddingCustomer || isEditingCustomer ? (
                      <div className="flex items-center">
                        <FaSpinner className="w-4 h-4 ml-2 animate-spin" />
                        {editingCustomer
                          ? "جاري التحديث..."
                          : "جاري الإضافة..."}
                      </div>
                    ) : (
                      <>
                        {editingCustomer ? (
                          <Edit className="w-4 h-4 ml-2" />
                        ) : (
                          <Plus className="w-4 h-4 ml-2" />
                        )}
                        {editingCustomer ? "حفظ التعديلات" : "إضافة عميل"}
                      </>
                    )}
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
