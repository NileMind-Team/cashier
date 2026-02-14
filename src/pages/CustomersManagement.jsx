import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function CustomersManagement() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const hasFetched = useRef(false);
  const searchTimeout = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    nationalId: "",
  });

  const [focusedField, setFocusedField] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/Customers/GetAll");

      if (response.status === 200) {
        if (Array.isArray(response.data)) {
          const formattedCustomers = response.data.map((customer) => ({
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
          if (formattedCustomers.length === 0) {
            toast.info("لا يوجد عملاء في النظام");
          }
        } else if (
          response.data.isSuccess === true ||
          response.data.isSuccess === undefined
        ) {
          let customersData = [];

          if (Array.isArray(response.data.value)) {
            customersData = response.data.value;
          } else if (Array.isArray(response.data.data)) {
            customersData = response.data.data;
          } else if (Array.isArray(response.data)) {
            customersData = response.data;
          }

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

          if (formattedCustomers.length === 0) {
            toast.info("لا يوجد عملاء في النظام");
          }
        } else {
          setCustomers([]);
          toast.info("لا يوجد عملاء في النظام");
        }
      } else {
        toast.error("فشل في جلب العملاء");
        setCustomers([]);
      }
    } catch (error) {
      console.error("خطأ في جلب العملاء:", error);
      if (error.response?.status === 404) {
        toast.info("لا يوجد عملاء في النظام");
        setCustomers([]);
      } else {
        toast.error("حدث خطأ في جلب العملاء");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchCustomers();
      hasFetched.current = true;
    }
  }, []);

  const searchCustomers = async (term) => {
    if (!term.trim()) {
      fetchCustomers();
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/Customers/Search/${term}`);

      if (response.status === 200) {
        let customersData = [];

        // Check if response.data is a single object (has id property)
        if (
          response.data &&
          typeof response.data === "object" &&
          "id" in response.data
        ) {
          customersData = [response.data];
        }
        // Check if response.data is an array
        else if (Array.isArray(response.data)) {
          customersData = response.data;
        }
        // Check if response.data has value property that's an array
        else if (
          response.data.isSuccess === true &&
          Array.isArray(response.data.value)
        ) {
          customersData = response.data.value;
        }
        // Check if response.data has data property that's an array
        else if (Array.isArray(response.data.data)) {
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
          toast.success(`تم العثور على ${formattedCustomers.length} عميل`);
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
      setLoading(false);
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
      try {
        const response = await axiosInstance.delete(
          `/api/Customers/Delete/${customerId}`,
        );

        if (response.status === 200) {
          if (response.data.isSuccess !== false) {
            setCustomers(
              customers.filter((customer) => customer.id !== customerId),
            );
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
              setCustomers(
                customers.map((c) =>
                  c.id === editingCustomer.id ? { ...c, ...customerData } : c,
                ),
              );
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
          setCustomers(
            customers.map((c) =>
              c.id === editingCustomer.id ? { ...c, ...customerData } : c,
            ),
          );
          toast.success("تم تحديث بيانات العميل محلياً");
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
            fetchCustomers();
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
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (term.length > 0) {
        searchCustomers(term);
      } else {
        fetchCustomers();
      }
    }, 300);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    fetchCustomers();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = customers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(customers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c) => c.isActive).length,
    inactiveCustomers: customers.filter((c) => !c.isActive).length,
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-l from-gray-50 to-gray-100"
    >
      {/* Navbar */}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
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
                  </div>
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
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

        {/* Customers Table */}
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
                                {customer.name?.charAt(0) || "?"}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">
                                  {customer.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {customer.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="text-sm text-gray-800 max-w-xs">
                              {customer.address || "لا يوجد عنوان"}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="text-sm text-gray-800">
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

              {/* Pagination */}
              {customers.length > itemsPerPage && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="text-sm text-gray-700 mb-2 md:mb-0">
                      عرض {indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, customers.length)} من{" "}
                      {customers.length} عميل
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
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                >
                  ×
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
                    onClick={() => setShowAddModal(false)}
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
                      {editingCustomer ? (
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
