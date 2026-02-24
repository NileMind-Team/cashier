import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function OptionsManagement() {
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const hasFetched = useRef(false);
  const isFetchingOptions = useRef(false);

  const [stats, setStats] = useState({
    totalOptions: 0,
    activeOptions: 0,
    inactiveOptions: 0,
    totalValue: 0,
  });

  const [formData, setFormData] = useState({
    name: "",
    price: "",
  });

  const fetchOptions = async (
    pageNumber = pagination.currentPage,
    showLoading = true,
  ) => {
    if (isFetchingOptions.current) {
      console.log("هناك طلب إضافات قيد التنفيذ بالفعل، تجاهل الطلب الجديد");
      return;
    }

    try {
      isFetchingOptions.current = true;
      if (showLoading) setLoading(true);

      const response = await axiosInstance.post("/api/Options/GetAll", {
        pageNumber: pageNumber,
        pageSize: pagination.pageSize,
        skip: (pageNumber - 1) * pagination.pageSize,
      });

      if (response.status === 200 && response.data) {
        const items = response.data.items || [];

        const formattedOptions = items.map((option) => ({
          id: option.id,
          name: option.name || "",
          price: option.price || 0,
          isActive: option.isActive || false,
        }));

        setOptions(formattedOptions);
        setPagination({
          currentPage: response.data.pageNumber || 1,
          pageSize: response.data.pageSize || 5,
          totalCount: response.data.totalCount || 0,
          totalPages: response.data.totalPages || 1,
          hasNextPage: response.data.pageNumber < response.data.totalPages,
          hasPreviousPage: response.data.pageNumber > 1,
        });

        calculateStats(formattedOptions, response.data.totalCount || 0);
      } else {
        setOptions([]);
        calculateStats([], 0);
      }
    } catch (error) {
      console.error("خطأ في جلب الإضافات:", error);
      setOptions([]);
      calculateStats([], 0);
    } finally {
      isFetchingOptions.current = false;
      if (showLoading) setLoading(false);
    }
  };

  const calculateStats = (optionsData, totalCount = null) => {
    const totalOptions = totalCount !== null ? totalCount : optionsData.length;
    const activeOptions = optionsData.filter((opt) => opt.isActive).length;
    const inactiveOptions = totalOptions - activeOptions;
    const totalValue = optionsData.reduce(
      (sum, opt) => sum + (opt.price || 0),
      0,
    );

    setStats({
      totalOptions,
      activeOptions,
      inactiveOptions,
      totalValue,
    });
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchOptions(1, true);
      hasFetched.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-EG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleAddOption = () => {
    setShowAddModal(true);
    setEditingOption(null);
    setFormData({
      name: "",
      price: "",
    });
    setFocusedField(null);
  };

  const handleEditOption = (option) => {
    setEditingOption(option);
    setShowAddModal(true);
    setFormData({
      name: option.name || "",
      price: option.price || "",
    });
    setFocusedField(null);
  };

  const handleDeleteOption = async (optionId) => {
    const option = options.find((opt) => opt.id === optionId);

    const result = await Swal.fire({
      title: "هل أنت متأكد من حذف الإضافة؟",
      html: `
        <div class="text-right">
          <p class="mb-3">الإضافة: <strong>${option?.name}</strong></p>
          <p class="text-sm text-gray-600">السعر: ${formatCurrency(option?.price || 0)} ج.م</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.delete(
          `/api/Options/Delete/${optionId}`,
        );

        if (response.status === 200 || response.status === 204) {
          const newTotalCount = pagination.totalCount - 1;
          const newTotalPages = Math.ceil(newTotalCount / pagination.pageSize);
          const newPage =
            pagination.currentPage > newTotalPages
              ? newTotalPages
              : pagination.currentPage;

          await fetchOptions(newPage || 1, false);
          toast.success("تم حذف الإضافة بنجاح");
        } else {
          toast.error("فشل في حذف الإضافة");
        }
      } catch (error) {
        console.error("خطأ في حذف الإضافة:", error);
        toast.error("حدث خطأ في حذف الإضافة");
      }
    }
  };

  const handleToggleOptionStatus = async (optionId) => {
    const option = options.find((opt) => opt.id === optionId);
    const action = option.isActive ? "تعطيل" : "تفعيل";

    const result = await Swal.fire({
      title: `هل أنت متأكد من ${action} الإضافة؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `نعم، ${action}`,
      cancelButtonText: "إلغاء",
      confirmButtonColor: option.isActive ? "#F59E0B" : "#10B981",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.post(
          `/api/Options/ToggleActivation/${optionId}/toggle`,
        );

        if (response.status === 200) {
          await fetchOptions(pagination.currentPage, false);
          toast.success(`تم ${action} الإضافة بنجاح`);
        } else {
          toast.error(`فشل في ${action} الإضافة`);
        }
      } catch (error) {
        console.error(`خطأ في ${action} الإضافة:`, error);
        toast.error(`حدث خطأ في ${action} الإضافة`);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" ? (value === "" ? "" : parseFloat(value) || 0) : value,
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
      toast.error("يرجى إدخال اسم الإضافة");
      return;
    }

    if (!formData.price || formData.price <= 0) {
      toast.error("يرجى إدخال سعر صحيح للإضافة");
      return;
    }

    try {
      const optionData = {
        name: formData.name,
        price: parseFloat(formData.price),
      };

      if (editingOption) {
        const response = await axiosInstance.put(
          `/api/Options/Update/${editingOption.id}`,
          optionData,
        );

        if (response.status === 200) {
          await fetchOptions(pagination.currentPage, false);
          toast.success("تم تحديث بيانات الإضافة بنجاح");
        } else {
          toast.error("فشل في تحديث بيانات الإضافة");
        }
      } else {
        const response = await axiosInstance.post(
          "/api/Options/Add",
          optionData,
        );

        if (response.status === 201 || response.status === 200) {
          await fetchOptions(1, false);
          toast.success("تم إضافة الإضافة الجديدة بنجاح");
        } else {
          toast.error("فشل في إضافة الإضافة");
        }
      }

      setShowAddModal(false);
      setEditingOption(null);
    } catch (error) {
      console.error("خطأ في حفظ الإضافة:", error);
      toast.error("حدث خطأ في حفظ الإضافة");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
      fetchOptions(newPage, true);
      const tableElement = document.getElementById("options-table-container");
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

  const getOptionColor = (optionId) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-amber-100 text-amber-800 border-amber-200",
      "bg-red-100 text-red-800 border-red-200",
    ];
    return colors[optionId % colors.length];
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
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center ml-3">
                <span className="text-white font-bold">➕</span>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "#193F94" }}>
                نظام الكاشير - إدارة الإضافات
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
        {/* Professional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Options Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  إجمالي الإضافات
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalOptions}
                </p>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <span className="text-green-600 font-medium ml-1">
                    {stats.activeOptions} نشط
                  </span>
                  <span className="mx-1">•</span>
                  <span className="text-red-500 font-medium">
                    {stats.inactiveOptions} غير نشط
                  </span>
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Options Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  الإضافات النشطة
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.activeOptions}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  المتاحة للاستخدام حالياً
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Inactive Options Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  الإضافات غير النشطة
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.inactiveOptions}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  غير المتاحة للاستخدام حالياً
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

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                قائمة الإضافات
              </h3>
              <p className="text-sm text-gray-600">إدارة الإضافات في النظام</p>
            </div>

            <button
              onClick={handleAddOption}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center whitespace-nowrap shadow-md"
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
              إضافة إضافة جديدة
            </button>
          </div>
        </div>

        {/* Options Table */}
        <div
          id="options-table-container"
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-t-4 border-orange-600 border-solid rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">جاري تحميل بيانات الإضافات...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        الإضافة
                      </th>
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        السعر
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
                    {options.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
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
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            <p className="text-lg font-medium text-gray-400">
                              لا يوجد إضافات
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              قم بإضافة إضافة جديدة لبدء العمل
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      options.map((option) => (
                        <tr
                          key={option.id}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ml-3 ${getOptionColor(
                                  option.id,
                                )} border`}
                              >
                                <span className="font-bold text-lg">
                                  {option.name?.charAt(0) || "?"}
                                </span>
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">
                                  {option.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-bold text-green-700">
                              {formatCurrency(option.price)} ج.م
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full ml-2 ${
                                  option.isActive
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <span
                                className={`font-medium ${
                                  option.isActive
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {option.isActive ? "نشط" : "معطل"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => handleEditOption(option)}
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
                                  handleToggleOptionStatus(option.id)
                                }
                                className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border ${
                                  option.isActive
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
                                  {option.isActive ? (
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
                                {option.isActive ? "تعطيل" : "تفعيل"}
                              </button>
                              <button
                                onClick={() => handleDeleteOption(option.id)}
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

              {/* Enhanced Pagination with Professional Design */}
              {pagination.totalPages > 0 && (
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
                            d="M13 5l7 7-7 7M5 5l7 7-7 7"
                          />
                        </svg>
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
                                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:from-orange-600 hover:to-orange-700"
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

                      {/* Last Page Button */}
                      <button
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={!pagination.hasNextPage}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          pagination.hasNextPage
                            ? "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                            : "text-gray-300 cursor-not-allowed"
                        }`}
                        title="الصفحة الأخيرة"
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
                            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                          />
                        </svg>
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
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

      {/* Add/Edit Option Modal */}
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
                    {editingOption
                      ? "تعديل بيانات الإضافة"
                      : "إضافة إضافة جديدة"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingOption
                      ? "قم بتعديل بيانات الإضافة"
                      : "أدخل بيانات الإضافة الجديدة"}
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
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("name")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "name" || formData.name
                          ? "-top-2.5 text-xs text-orange-500 font-medium"
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
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                          />
                        </svg>
                        اسم الإضافة *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("price")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-sm bg-white"
                      required
                      dir="ltr"
                      inputMode="numeric"
                      pattern="\d*\.?\d*"
                      onWheel={(e) => e.target.blur()}
                      style={{ MozAppearance: "textfield" }}
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "price" || formData.price
                          ? "-top-2.5 text-xs text-orange-500 font-medium"
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
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        السعر (ج.م) *
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
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {editingOption ? (
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
                    {editingOption ? "حفظ التعديلات" : "إضافة إضافة"}
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
