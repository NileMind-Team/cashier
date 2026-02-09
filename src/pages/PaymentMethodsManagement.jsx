import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function PaymentMethodsManagement() {
  const navigate = useNavigate();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    name: "",
    isActive: true,
  });

  const initialMethods = [
    {
      id: 1,
      name: "كاش",
      isActive: true,
      totalTransactions: 1250,
      totalAmount: 45000.75,
    },
    {
      id: 2,
      name: "فيزا",
      isActive: true,
      totalTransactions: 850,
      totalAmount: 32000.5,
    },
    {
      id: 3,
      name: "محفظة إلكترونية",
      isActive: true,
      totalTransactions: 420,
      totalAmount: 15000.25,
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setMethods(initialMethods);
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

  const handleAddMethod = () => {
    setShowAddModal(true);
    setEditingMethod(null);
    setFormData({
      name: "",
      isActive: true,
    });
  };

  const handleEditMethod = (method) => {
    setEditingMethod(method);
    setShowAddModal(true);
    setFormData({
      name: method.name,
      isActive: method.isActive,
    });
  };

  const handleDeleteMethod = async (methodId) => {
    const method = methods.find((m) => m.id === methodId);

    const result = await Swal.fire({
      title: "هل أنت متأكد من حذف طريقة الدفع؟",
      html: `
        <div class="text-right">
          <p class="mb-3">طريقة الدفع: <strong>${method.name}</strong></p>
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
      setMethods(methods.filter((method) => method.id !== methodId));
      toast.success("تم حذف طريقة الدفع بنجاح");
    }
  };

  const handleToggleMethodStatus = async (methodId) => {
    const method = methods.find((m) => m.id === methodId);
    const action = method.isActive ? "تعطيل" : "تفعيل";

    const result = await Swal.fire({
      title: `هل أنت متأكد من ${action} طريقة الدفع؟`,
      text: method.isActive
        ? "لن يتمكن العملاء من استخدام هذه الطريقة حتى يتم تفعيلها مرة أخرى."
        : "سيتم تفعيل طريقة الدفع وجعلها متاحة للاستخدام.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `نعم، ${action}`,
      cancelButtonText: "إلغاء",
      confirmButtonColor: method.isActive ? "#F59E0B" : "#10B981",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setMethods(
        methods.map((method) =>
          method.id === methodId
            ? { ...method, isActive: !method.isActive }
            : method,
        ),
      );
      toast.success(`تم ${action} طريقة الدفع بنجاح`);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم طريقة الدفع");
      return;
    }

    if (editingMethod) {
      const updatedMethods = methods.map((method) =>
        method.id === editingMethod.id
          ? {
              ...method,
              name: formData.name,
              isActive: formData.isActive,
            }
          : method,
      );
      setMethods(updatedMethods);
      toast.success("تم تحديث بيانات طريقة الدفع بنجاح");
    } else {
      const newMethod = {
        id: methods.length + 1,
        name: formData.name,
        isActive: formData.isActive,
        totalTransactions: 0,
        totalAmount: 0,
      };
      setMethods([...methods, newMethod]);
      toast.success("تم إضافة طريقة الدفع الجديدة بنجاح");
    }

    setShowAddModal(false);
    setEditingMethod(null);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMethods = methods.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(methods.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const stats = {
    totalMethods: methods.length,
    activeMethods: methods.filter((m) => m.isActive).length,
    totalTransactions: methods.reduce(
      (sum, method) => sum + method.totalTransactions,
      0,
    ),
    totalAmount: methods.reduce((sum, method) => sum + method.totalAmount, 0),
  };

  const getMethodColor = (methodId) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-amber-100 text-amber-800 border-amber-200",
      "bg-red-100 text-red-800 border-red-200",
    ];
    return colors[methodId % colors.length];
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
                <span className="text-white font-bold">💳</span>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "#193F94" }}>
                نظام الكاشير - إدارة طرق الدفع
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">إجمالي طرق الدفع</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {stats.totalMethods}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.activeMethods} نشط •{" "}
                  {stats.totalMethods - stats.activeMethods} غير نشط
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-bold">💳</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800">إجمالي المعاملات</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {stats.totalTransactions.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">جميع طرق الدفع</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-bold">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-800">المعاملات النشطة</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {stats.activeMethods}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  طرق الدفع المتاحة
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-purple-700 font-bold">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-800">إجمالي المبالغ</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">
                  {formatCurrency(stats.totalAmount)} ج.م
                </p>
                <p className="text-xs text-amber-600 mt-1">جميع المعاملات</p>
              </div>
              <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                <span className="text-amber-700 font-bold">💵</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                قائمة طرق الدفع
              </h3>
              <p className="text-sm text-gray-600">إدارة طرق الدفع في النظام</p>
            </div>

            <button
              onClick={handleAddMethod}
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
              إضافة طريقة دفع جديدة
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">جاري تحميل بيانات طرق الدفع...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        طريقة الدفع
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
                    {currentMethods.length === 0 ? (
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
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                            <p className="text-lg font-medium text-gray-400">
                              لا يوجد طرق دفع
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              قم بإضافة طريقة دفع جديدة لبدء العمل
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentMethods.map((method) => (
                        <tr
                          key={method.id}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ml-3 ${getMethodColor(
                                  method.id,
                                )} border`}
                              >
                                <span className="font-bold text-lg">
                                  {method.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">
                                  {method.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">
                                  المعاملات:
                                </span>
                                <span className="font-bold">
                                  {method.totalTransactions.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">
                                  المبالغ:
                                </span>
                                <span className="font-bold text-green-700">
                                  {formatCurrency(method.totalAmount)} ج.م
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full ml-2 ${
                                  method.isActive
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <span
                                className={`font-medium ${
                                  method.isActive
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {method.isActive ? "نشط" : "معطل"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => handleEditMethod(method)}
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
                                  handleToggleMethodStatus(method.id)
                                }
                                className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border ${
                                  method.isActive
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
                                  {method.isActive ? (
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
                                {method.isActive ? "تعطيل" : "تفعيل"}
                              </button>
                              <button
                                onClick={() => handleDeleteMethod(method.id)}
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

              {methods.length > itemsPerPage && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="text-sm text-gray-700 mb-2 md:mb-0">
                      عرض {indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, methods.length)} من{" "}
                      {methods.length} طريقة
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold" style={{ color: "#193F94" }}>
                  {editingMethod
                    ? "تعديل بيانات طريقة الدفع"
                    : "إضافة طريقة دفع جديدة"}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم طريقة الدفع *
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
                      طريقة الدفع نشطة (يمكن استخدامها)
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
                    {editingMethod ? "حفظ التعديلات" : "إضافة طريقة"}
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
