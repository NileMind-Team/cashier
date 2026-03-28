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
  CreditCard,
  BarChart3,
  CheckCircle,
  DollarSign,
  Wallet,
} from "lucide-react";

export default function PaymentMethodsManagement() {
  const navigate = useNavigate();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const hasFetched = useRef(false);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [isEditingMethod, setIsEditingMethod] = useState(false);
  const [isTogglingMethod, setIsTogglingMethod] = useState(false);
  const [isDeletingMethod, setIsDeletingMethod] = useState(false);

  const [stats, setStats] = useState({
    totalPaymentMethods: 0,
    activePaymentMethods: 0,
    inactivePaymentMethods: 0,
    totalTransactions: 0,
    totalAmount: 0,
  });

  const [formData, setFormData] = useState({
    name: "",
  });

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/Payment/GetAll");

      if (response.status === 200 && Array.isArray(response.data)) {
        const formattedMethods = response.data.map((method) => ({
          id: method.id,
          name: method.name || "",
          isActive: method.isActive || false,
          transactionsCount: method.transactionsCount || 0,
          totalAmount: method.totalAmount || 0,
        }));
        setMethods(formattedMethods);
      } else {
        setMethods([]);
      }
    } catch (error) {
      console.error("خطأ في جلب طرق الدفع:", error);
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/Payment/GetStatistics/stats",
      );

      if (response.status === 200) {
        setStats({
          totalPaymentMethods: response.data.totalPaymentMethods || 0,
          activePaymentMethods: response.data.activePaymentMethods || 0,
          inactivePaymentMethods: response.data.inactivePaymentMethods || 0,
          totalTransactions: response.data.totalTransactions || 0,
          totalAmount: response.data.totalAmount || 0,
        });
      }
    } catch (error) {
      console.error("خطأ في جلب الإحصائيات:", error);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchMethods();
      fetchStatistics();
      hasFetched.current = true;
    }
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
    });
    setFocusedField(null);
  };

  const handleEditMethod = (method) => {
    setEditingMethod(method);
    setShowAddModal(true);
    setFormData({
      name: method.name || "",
    });
    setFocusedField(null);
  };

  const handleDeleteMethod = async (methodId) => {
    const method = methods.find((m) => m.id === methodId);

    const result = await Swal.fire({
      title: "هل أنت متأكد من حذف طريقة الدفع؟",
      html: `
        <div class="text-right">
          <p class="mb-3">طريقة الدفع: <strong>${method?.name}</strong></p>
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
      setIsDeletingMethod(true);
      try {
        const response = await axiosInstance.delete(
          `/api/Payment/Delete/${methodId}`,
        );

        if (response.status === 200 || response.status === 204) {
          setMethods(methods.filter((method) => method.id !== methodId));
          toast.success("تم حذف طريقة الدفع بنجاح");
          fetchStatistics();
        } else {
          toast.error("فشل في حذف طريقة الدفع");
        }
      } catch (error) {
        console.error("خطأ في حذف طريقة الدفع:", error);
        toast.error("حدث خطأ في حذف طريقة الدفع");
      } finally {
        setIsDeletingMethod(false);
      }
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
      setIsTogglingMethod(true);
      try {
        const response = await axiosInstance.patch(
          `/api/Payment/ToggleActivation/${methodId}/toggle`,
        );

        if (response.status === 200) {
          setMethods(
            methods.map((method) =>
              method.id === methodId
                ? { ...method, isActive: !method.isActive }
                : method,
            ),
          );
          toast.success(`تم ${action} طريقة الدفع بنجاح`);
          fetchStatistics();
        } else {
          toast.error(`فشل في ${action} طريقة الدفع`);
        }
      } catch (error) {
        console.error(`خطأ في ${action} طريقة الدفع:`, error);
        toast.error(`حدث خطأ في ${action} طريقة الدفع`);
      } finally {
        setIsTogglingMethod(false);
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
      toast.error("يرجى إدخال اسم طريقة الدفع");
      return;
    }

    if (editingMethod) {
      setIsEditingMethod(true);
    } else {
      setIsAddingMethod(true);
    }

    try {
      const methodData = {
        name: formData.name,
      };

      if (editingMethod) {
        const response = await axiosInstance.put(
          `/api/Payment/Update/${editingMethod.id}`,
          methodData,
        );

        if (response.status === 200) {
          setMethods(
            methods.map((method) =>
              method.id === editingMethod.id
                ? {
                    ...method,
                    name: formData.name,
                  }
                : method,
            ),
          );
          toast.success("تم تحديث بيانات طريقة الدفع بنجاح");
        } else {
          toast.error("فشل في تحديث بيانات طريقة الدفع");
        }
      } else {
        const response = await axiosInstance.post(
          "/api/Payment/Add",
          methodData,
        );

        if (response.status === 201 || response.status === 200) {
          const newMethod = {
            id: response.data.id || Date.now(),
            name: formData.name,
            isActive: true,
            totalTransactions: 0,
            totalAmount: 0,
          };
          setMethods([...methods, newMethod]);
          toast.success("تم إضافة طريقة الدفع الجديدة بنجاح");
        } else {
          toast.error("فشل في إضافة طريقة الدفع");
        }
      }

      fetchStatistics();
      setShowAddModal(false);
      setEditingMethod(null);
    } catch (error) {
      console.error("خطأ في حفظ طريقة الدفع:", error);
      toast.error("حدث خطأ في حفظ طريقة الدفع");
    } finally {
      setIsAddingMethod(false);
      setIsEditingMethod(false);
    }
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
      {/* Navbar */}
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
              <ArrowLeft className="h-5 w-5 ml-2" />
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Professional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Payment Methods Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  إجمالي طرق الدفع
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalPaymentMethods}
                </p>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <span className="text-green-600 font-medium ml-1">
                    {stats.activePaymentMethods} نشط
                  </span>
                  <span className="mx-1">•</span>
                  <span className="text-red-500 font-medium">
                    {stats.inactivePaymentMethods} غير نشط
                  </span>
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <CreditCard className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          {/* Total Transactions Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  إجمالي المعاملات
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalTransactions.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">جميع طرق الدفع</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          {/* Active Methods Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  طرق الدفع النشطة
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.activePaymentMethods}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  المتاحة للاستخدام حالياً
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          {/* Total Amount Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  إجمالي المبالغ
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {formatCurrency(stats.totalAmount)} ج.م
                </p>
                <p className="text-xs text-gray-500 mt-2">جميع المعاملات</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                قائمة طرق الدفع
              </h3>
              <p className="text-sm text-gray-600">إدارة طرق الدفع في النظام</p>
            </div>

            <button
              onClick={handleAddMethod}
              disabled={isAddingMethod}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center whitespace-nowrap shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ backgroundColor: "#193F94" }}
            >
              {isAddingMethod ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                  جاري الإضافة...
                </div>
              ) : (
                <>
                  <Plus className="h-5 w-5 ml-2" />
                  إضافة طريقة دفع جديدة
                </>
              )}
            </button>
          </div>
        </div>

        {/* Methods Table */}
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
                    {methods.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-8 px-4 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <Wallet className="h-12 w-12 text-gray-300 mb-3" />
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
                      methods.map((method) => (
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
                                  {method.name?.charAt(0) || "?"}
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
                                  {method.transactionsCount?.toLocaleString()}
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
                                disabled={isEditingMethod}
                                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Edit className="h-3 w-3 ml-1" />
                                تعديل
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleMethodStatus(method.id)
                                }
                                disabled={isTogglingMethod}
                                className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border disabled:opacity-50 disabled:cursor-not-allowed ${
                                  method.isActive
                                    ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                                    : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                }`}
                              >
                                {isTogglingMethod ? (
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin ml-1"></div>
                                ) : method.isActive ? (
                                  <PowerOff className="h-3 w-3 ml-1" />
                                ) : (
                                  <Power className="h-3 w-3 ml-1" />
                                )}
                                {isTogglingMethod
                                  ? "جاري..."
                                  : method.isActive
                                    ? "تعطيل"
                                    : "تفعيل"}
                              </button>
                              <button
                                onClick={() => handleDeleteMethod(method.id)}
                                disabled={isDeletingMethod}
                                className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isDeletingMethod ? (
                                  <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin ml-1"></div>
                                ) : (
                                  <Trash2 className="h-3 w-3 ml-1" />
                                )}
                                {isDeletingMethod ? "جاري الحذف..." : "حذف"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Method Modal */}
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
                    {editingMethod
                      ? "تعديل بيانات طريقة الدفع"
                      : "إضافة طريقة دفع جديدة"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingMethod
                      ? "قم بتعديل بيانات طريقة الدفع"
                      : "أدخل بيانات طريقة الدفع الجديدة"}
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
                <div className="mb-4">
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
                        <CreditCard className="w-4 h-4 ml-1" />
                        اسم طريقة الدفع *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={isAddingMethod || isEditingMethod}
                    className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingMethod || isEditingMethod}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#193F94" }}
                  >
                    {isAddingMethod || isEditingMethod ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                        {editingMethod ? "جاري التحديث..." : "جاري الإضافة..."}
                      </div>
                    ) : (
                      <>
                        {editingMethod ? (
                          <Edit className="w-4 h-4 ml-2" />
                        ) : (
                          <Plus className="w-4 h-4 ml-2" />
                        )}
                        {editingMethod ? "حفظ التعديلات" : "إضافة طريقة"}
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
