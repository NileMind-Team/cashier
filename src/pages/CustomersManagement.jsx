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
        toast.warning("تحديث العميل غير مدعوم من الخادم حالياً");
        setShowAddModal(false);
        setEditingCustomer(null);
        return;
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
        {/* Stats Cards - العملاء فقط */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {stats.totalCustomers}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-bold text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800">العملاء النشطاء</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {stats.activeCustomers}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-bold text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-800">العملاء غير النشطاء</p>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {stats.inactiveCustomers}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                <span className="text-red-700 font-bold text-xl">⛔</span>
              </div>
            </div>
          </div>
        </div>

        {/* Header and Search - تعديل: تكبير عرض حقل البحث */}
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

      {/* Add/Edit Modal */}
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
                      disabled={editingCustomer}
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
                      disabled={editingCustomer}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
                      dir="rtl"
                      placeholder="العنوان بالكامل"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الرقم القومي
                    </label>
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
                      dir="rtl"
                      placeholder="14 رقم"
                    />
                  </div>
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
