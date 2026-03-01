import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaPrint, FaSave, FaEdit, FaPlus, FaTimes } from "react-icons/fa";
import axiosInstance from "../api/axiosInstance";

export default function PrintersManagement() {
  const navigate = useNavigate();
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const hasFetched = useRef(false);

  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    mainCategoryId: "",
    printIP: "",
    isActive: true,
  });

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/api/SubCategories/GetAllSubCategories",
      );

      if (response.status === 200 && response.data) {
        setSubCategories(response.data);
      } else {
        toast.error("فشل في جلب الفئات الفرعية");
      }
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
      toast.error("حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchSubCategories();
      hasFetched.current = true;
    }
  }, []);

  const handleEditClick = (subCategory) => {
    setEditingSubCategory(subCategory);
    setEditForm({
      id: subCategory.id,
      name: subCategory.name,
      mainCategoryId: subCategory.mainCategoryId,
      printIP: subCategory.printIP || "",
      isActive: subCategory.isActive,
    });
    setShowEditModal(true);
    setFocusedField(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
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

    if (!editForm.printIP.trim()) {
      toast.error("يرجى إدخال عنوان IP الطابعة");
      return;
    }

    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(editForm.printIP)) {
      toast.error("يرجى إدخال عنوان IP صحيح (مثال: 192.168.1.100)");
      return;
    }

    try {
      const response = await axiosInstance.put(
        `/api/SubCategories/UpdateSubCategory/${editForm.id}`,
        {
          name: editForm.name,
          mainCategoryId: parseInt(editForm.mainCategoryId),
          printIP: editForm.printIP,
        },
      );

      if (response.status === 200) {
        await fetchSubCategories();
        toast.success("تم تحديث عنوان IP الطابعة بنجاح");
        setShowEditModal(false);
        setEditingSubCategory(null);
      } else {
        toast.error("فشل في تحديث عنوان IP الطابعة");
      }
    } catch (error) {
      console.error("خطأ في تحديث عنوان IP الطابعة:", error);

      if (error.response?.status === 400 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        toast.error(errors[0]?.description || "حدث خطأ في تحديث عنوان IP");
      } else {
        toast.error("حدث خطأ في تحديث عنوان IP الطابعة");
      }
    }
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
              <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center ml-3">
                <FaPrint className="text-white text-xl" />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "#6B21A8" }}>
                نظام الكاشير - إدارة الطابعات
              </h1>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg font-medium border transition-all flex items-center"
              style={{ borderColor: "#6B21A8", color: "#6B21A8" }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#6B21A8";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#6B21A8";
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
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "#6B21A8" }}>
              إعدادات الطابعات للفئات الفرعية
            </h2>
            <p className="text-gray-600 mt-1">
              قم بتعيين عنوان IP لكل فئة فرعية لتحديد الطابعة المسؤولة عن طباعة
              طلباتها
            </p>
          </div>
        </div>

        {/* SubCategories List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-t-4 border-purple-600 border-solid rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4 text-lg">جاري تحميل الفئات...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-900 to-purple-700 text-white">
                    <th className="px-6 py-4 text-right text-sm font-bold">
                      الفئة الفرعية
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold">
                      الفئة الرئيسية
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold">
                      عنوان IP الطابعة
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold">
                      الحالة
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subCategories.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-gray-400 mb-3">
                          <FaPrint className="h-16 w-16 mx-auto" />
                        </div>
                        <p className="text-gray-500 text-lg">
                          لا توجد فئات فرعية
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          قم بإضافة فئات فرعية أولاً
                        </p>
                      </td>
                    </tr>
                  ) : (
                    subCategories.map((subCategory) => (
                      <tr
                        key={subCategory.id}
                        className="hover:bg-purple-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center ml-2 bg-gradient-to-br from-purple-400 to-purple-600 text-white font-bold text-sm shadow-md">
                              {subCategory.name.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">
                              {subCategory.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600">
                            {subCategory.mainCategoryName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {subCategory.printIP ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-1"></span>
                              {subCategory.printIP}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 ml-1"></span>
                              غير محدد
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              subCategory.isActive
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {subCategory.isActive ? "نشط" : "معطل"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleEditClick(subCategory)}
                              className={`p-2 rounded-lg transition-colors border ${
                                subCategory.printIP
                                  ? "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                                  : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              }`}
                              title={
                                subCategory.printIP
                                  ? "تعديل عنوان IP"
                                  : "إضافة عنوان IP"
                              }
                            >
                              {subCategory.printIP ? (
                                <FaEdit className="h-4 w-4" />
                              ) : (
                                <FaPlus className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingSubCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#6B21A8" }}
                  >
                    {editingSubCategory.printIP
                      ? "تعديل عنوان IP الطابعة"
                      : "إضافة عنوان IP الطابعة"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingSubCategory.printIP
                      ? "قم بتعديل عنوان IP للطابعة الخاصة بالفئة:"
                      : "قم بإضافة عنوان IP للطابعة الخاصة بالفئة:"}{" "}
                    <span className="font-bold text-purple-700">
                      {editingSubCategory.name}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
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
                      name="printIP"
                      value={editForm.printIP}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("printIP")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm bg-white"
                      placeholder="مثال: 192.168.1.100"
                      required
                      dir="ltr"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "printIP" || editForm.printIP
                          ? "-top-2.5 text-xs text-purple-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
                      <span className="flex items-center">
                        <FaPrint className="ml-1" />
                        عنوان IP الطابعة *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all flex items-center justify-center text-sm"
                  >
                    <FaTimes className="ml-2" />
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center text-sm"
                    style={{ backgroundColor: "#6B21A8" }}
                  >
                    <FaSave className="ml-2" />
                    {editingSubCategory.printIP
                      ? "حفظ التعديل"
                      : "إضافة العنوان"}
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
