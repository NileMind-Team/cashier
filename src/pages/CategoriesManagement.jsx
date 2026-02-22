import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function CategoriesManagement() {
  const navigate = useNavigate();
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMainCategoryModal, setShowMainCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [editingMainCategory, setEditingMainCategory] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const hasFetched = useRef(false);

  const [mainCategoryForm, setMainCategoryForm] = useState({
    name: "",
    isActive: true,
  });

  const [subCategoryForm, setSubCategoryForm] = useState({
    name: "",
    mainCategoryId: "",
    isActive: true,
    printIP: "",
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [mainCategoriesResponse, subCategoriesResponse] = await Promise.all(
        [
          axiosInstance.get("/api/MainCategories/GetAllMainCategories"),
          axiosInstance.get("/api/SubCategories/GetAllSubCategories"),
        ],
      );

      if (
        mainCategoriesResponse.status === 200 &&
        mainCategoriesResponse.data
      ) {
        setMainCategories(mainCategoriesResponse.data);

        if (mainCategoriesResponse.data.length > 0) {
          if (selectedMainCategory) {
            const stillExists = mainCategoriesResponse.data.some(
              (cat) => cat.id === selectedMainCategory.id,
            );
            if (stillExists) {
              setSelectedMainCategory(
                mainCategoriesResponse.data.find(
                  (cat) => cat.id === selectedMainCategory.id,
                ),
              );
            } else {
              setSelectedMainCategory(mainCategoriesResponse.data[0]);
            }
          } else {
            setSelectedMainCategory(mainCategoriesResponse.data[0]);
          }
        } else {
          setSelectedMainCategory(null);
        }
      } else {
        toast.error("فشل في جلب الفئات الرئيسية");
      }

      if (subCategoriesResponse.status === 200 && subCategoriesResponse.data) {
        setSubCategories(subCategoriesResponse.data);
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
      fetchAllData();
      hasFetched.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddMainCategory = () => {
    setShowMainCategoryModal(true);
    setEditingMainCategory(null);
    setMainCategoryForm({
      name: "",
      isActive: true,
    });
    setFocusedField(null);
  };

  const handleEditMainCategory = (category) => {
    setEditingMainCategory(category);
    setShowMainCategoryModal(true);
    setMainCategoryForm({
      name: category.name,
      isActive: category.isActive,
    });
    setFocusedField(null);
  };

  const handleAddSubCategory = () => {
    if (mainCategories.length === 0) {
      toast.error("يجب إضافة فئة رئيسية أولاً");
      return;
    }
    setShowSubCategoryModal(true);
    setEditingSubCategory(null);
    setSubCategoryForm({
      name: "",
      mainCategoryId: selectedMainCategory?.id || mainCategories[0]?.id || "",
      isActive: true,
      printIP: "",
    });
    setFocusedField(null);
  };

  const handleEditSubCategory = (subCategory) => {
    setEditingSubCategory(subCategory);
    setShowSubCategoryModal(true);
    setSubCategoryForm({
      name: subCategory.name,
      mainCategoryId: subCategory.mainCategoryId,
      isActive: subCategory.isActive,
      printIP: subCategory.printIP || "",
    });
    setFocusedField(null);
  };

  const handleMainCategoryFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMainCategoryForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubCategoryFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSubCategoryForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmitMainCategory = async (e) => {
    e.preventDefault();

    if (!mainCategoryForm.name.trim()) {
      toast.error("يرجى إدخال اسم الفئة الرئيسية");
      return;
    }

    try {
      if (editingMainCategory) {
        const response = await axiosInstance.put(
          `/api/MainCategories/UpdateMainCategory/${editingMainCategory.id}`,
          {
            name: mainCategoryForm.name,
            isActive: mainCategoryForm.isActive,
          },
        );

        if (response.status === 200) {
          await fetchAllData();
          toast.success("تم تحديث الفئة الرئيسية بنجاح");
          setShowMainCategoryModal(false);
          setEditingMainCategory(null);
        } else {
          toast.error("فشل في تحديث الفئة الرئيسية");
        }
      } else {
        const response = await axiosInstance.post("/api/MainCategories/Add", {
          name: mainCategoryForm.name,
          iconName: null,
          isActive: mainCategoryForm.isActive,
        });

        if (response.status === 201) {
          await fetchAllData();
          toast.success("تم إضافة الفئة الرئيسية بنجاح");
          setShowMainCategoryModal(false);
          setEditingMainCategory(null);
        } else {
          toast.error("فشل في إضافة الفئة الرئيسية");
        }
      }
    } catch (error) {
      console.error("خطأ في حفظ الفئة الرئيسية:", error);
      if (error.response?.status === 201 || error.response?.status === 200) {
        await fetchAllData();
        toast.success("تم حفظ الفئة الرئيسية بنجاح");
        setShowMainCategoryModal(false);
        setEditingMainCategory(null);
      } else {
        toast.error("حدث خطأ في حفظ الفئة الرئيسية");
      }
    }
  };

  const handleSubmitSubCategory = async (e) => {
    e.preventDefault();

    if (!subCategoryForm.name.trim()) {
      toast.error("يرجى إدخال اسم الفئة الفرعية");
      return;
    }

    if (!subCategoryForm.mainCategoryId) {
      toast.error("يرجى اختيار الفئة الرئيسية");
      return;
    }

    try {
      if (editingSubCategory) {
        const response = await axiosInstance.put(
          `/api/SubCategories/UpdateSubCategory/${editingSubCategory.id}`,
          {
            name: subCategoryForm.name,
            isActive: subCategoryForm.isActive,
          },
        );

        if (response.status === 200) {
          await fetchAllData();
          toast.success("تم تحديث الفئة الفرعية بنجاح");
          setShowSubCategoryModal(false);
          setEditingSubCategory(null);
        } else {
          toast.error("فشل في تحديث الفئة الفرعية");
        }
      } else {
        const response = await axiosInstance.post("/api/SubCategories/Add", {
          name: subCategoryForm.name,
          mainCategoryId: parseInt(subCategoryForm.mainCategoryId),
          isActive: subCategoryForm.isActive,
          printIP: subCategoryForm.printIP || "",
        });

        if (response.status === 201) {
          await fetchAllData();
          toast.success("تم إضافة الفئة الفرعية بنجاح");
          setShowSubCategoryModal(false);
          setEditingSubCategory(null);
        } else {
          toast.error("فشل في إضافة الفئة الفرعية");
        }
      }
    } catch (error) {
      console.error("خطأ في حفظ الفئة الفرعية:", error);
      if (error.response?.status === 201 || error.response?.status === 200) {
        await fetchAllData();
        toast.success("تم حفظ الفئة الفرعية بنجاح");
        setShowSubCategoryModal(false);
        setEditingSubCategory(null);
      } else {
        toast.error("حدث خطأ في حفظ الفئة الفرعية");
      }
    }
  };

  const handleDeleteMainCategory = async (categoryId) => {
    const hasSubCategories = subCategories.some(
      (sub) => sub.mainCategoryId === categoryId,
    );

    if (hasSubCategories) {
      toast.error("لا يمكن حذف فئة تحتوي على فئات فرعية");
      return;
    }

    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذه الفئة الرئيسية بشكل نهائي",
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
          `/api/MainCategories/Delete/${categoryId}`,
        );

        if (response.status === 200 || response.status === 204) {
          await fetchAllData();
          toast.success("تم حذف الفئة الرئيسية بنجاح");
        } else {
          toast.error("فشل في حذف الفئة الرئيسية");
        }
      } catch (error) {
        console.error("خطأ في حذف الفئة الرئيسية:", error);
        toast.error("حدث خطأ في حذف الفئة الرئيسية");
      }
    }
  };

  const handleDeleteSubCategory = async (subCategoryId) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذه الفئة الفرعية بشكل نهائي",
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
          `/api/SubCategories/Delete/${subCategoryId}`,
        );

        if (response.status === 200 || response.status === 204) {
          await fetchAllData();
          toast.success("تم حذف الفئة الفرعية بنجاح");
        } else {
          toast.error("فشل في حذف الفئة الفرعية");
        }
      } catch (error) {
        console.error("خطأ في حذف الفئة الفرعية:", error);
        toast.error("حدث خطأ في حذف الفئة الفرعية");
      }
    }
  };

  const handleToggleMainCategoryStatus = async (categoryId) => {
    const category = mainCategories.find((cat) => cat.id === categoryId);
    const action = category.isActive ? "تعطيل" : "تفعيل";

    const result = await Swal.fire({
      title: `هل أنت متأكد من ${action} هذه الفئة؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: category.isActive ? "#f59e0b" : "#10b981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `نعم، ${action}`,
      cancelButtonText: "إلغاء",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.put(
          `/api/MainCategories/UpdateMainCategory/${categoryId}`,
          {
            name: category.name,
            isActive: !category.isActive,
          },
        );

        if (response.status === 200) {
          await fetchAllData();
          toast.success(`تم ${action} الفئة بنجاح`);
        } else {
          toast.error(`فشل في ${action} الفئة`);
        }
      } catch (error) {
        console.error(`خطأ في ${action} الفئة:`, error);
        toast.error(`حدث خطأ في ${action} الفئة`);
      }
    }
  };

  const handleToggleSubCategoryStatus = async (subCategoryId) => {
    const subCategory = subCategories.find((sub) => sub.id === subCategoryId);
    const action = subCategory.isActive ? "تعطيل" : "تفعيل";

    const result = await Swal.fire({
      title: `هل أنت متأكد من ${action} هذه الفئة الفرعية؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: subCategory.isActive ? "#f59e0b" : "#10b981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `نعم، ${action}`,
      cancelButtonText: "إلغاء",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.put(
          `/api/SubCategories/UpdateSubCategory/${subCategoryId}`,
          {
            name: subCategory.name,
            isActive: !subCategory.isActive,
          },
        );

        if (response.status === 200) {
          await fetchAllData();
          toast.success(`تم ${action} الفئة الفرعية بنجاح`);
        } else {
          toast.error(`فشل في ${action} الفئة الفرعية`);
        }
      } catch (error) {
        console.error(`خطأ في ${action} الفئة الفرعية:`, error);
        toast.error(`حدث خطأ في ${action} الفئة الفرعية`);
      }
    }
  };

  const getSubCategoriesForMainCategory = (mainCategoryId) => {
    return subCategories.filter((sub) => sub.mainCategoryId === mainCategoryId);
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
                نظام الكاشير - إدارة الفئات
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                  الفئات الرئيسية
                </h3>
                <p className="text-sm text-gray-600">
                  إضافة وتعديل الفئات الرئيسية للمنتجات
                </p>
              </div>
              <button
                onClick={handleAddMainCategory}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center shadow-md"
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
                إضافة فئة رئيسية
              </button>
            </div>

            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4">جاري تحميل الفئات...</p>
              </div>
            ) : mainCategories.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">لا توجد فئات رئيسية</p>
                <p className="text-sm text-gray-400 mt-1">
                  قم بإضافة فئة رئيسية جديدة لبدء التصنيف
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {mainCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedMainCategory?.id === category.id
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedMainCategory(category)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center ml-3 bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-lg shadow-md">
                          {category.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {category.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {
                              getSubCategoriesForMainCategory(category.id)
                                .length
                            }{" "}
                            فئة فرعية
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            category.isActive
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          <span className="flex items-center">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ml-1 ${category.isActive ? "bg-green-500" : "bg-red-500"}`}
                            ></span>
                            {category.isActive ? "نشط" : "معطل"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMainCategory(category);
                        }}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-blue-200"
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMainCategoryStatus(category.id);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center border ${
                          category.isActive
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
                          {category.isActive ? (
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
                        {category.isActive ? "تعطيل" : "تفعيل"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMainCategory(category.id);
                        }}
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-red-200"
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
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                  الفئات الفرعية
                </h3>
                <p className="text-sm text-gray-600">
                  إضافة وتعديل الفئات الفرعية داخل الفئات الرئيسية
                </p>
                {selectedMainCategory && (
                  <div className="mt-2 flex items-center bg-gradient-to-l from-blue-50 to-transparent p-2 rounded-lg">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center ml-2 bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm font-bold shadow-md">
                      {selectedMainCategory.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {selectedMainCategory.name}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleAddSubCategory}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center shadow-md"
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
                إضافة فئة فرعية
              </button>
            </div>

            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-t-4 border-green-600 border-solid rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4">
                  جاري تحميل الفئات الفرعية...
                </p>
              </div>
            ) : (
              <>
                {selectedMainCategory ? (
                  getSubCategoriesForMainCategory(selectedMainCategory.id)
                    .length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 mx-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500">لا توجد فئات فرعية</p>
                      <p className="text-sm text-gray-400 mt-1">
                        قم بإضافة فئات فرعية داخل {selectedMainCategory.name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getSubCategoriesForMainCategory(
                        selectedMainCategory.id,
                      ).map((subCategory) => {
                        const mainCat = mainCategories.find(
                          (cat) => cat.id === subCategory.mainCategoryId,
                        );
                        return (
                          <div
                            key={subCategory.id}
                            className="p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center ml-3 bg-gradient-to-br from-purple-400 to-purple-600 text-white font-bold text-lg shadow-md">
                                  {subCategory.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900">
                                    {subCategory.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    تابعة لـ{" "}
                                    <span className="font-medium text-blue-600">
                                      {mainCat?.name ||
                                        subCategory.mainCategoryName}
                                    </span>
                                    {subCategory.printIP && (
                                      <span className="text-purple-600 mr-1">
                                        • IP: {subCategory.printIP}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <div
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    subCategory.isActive
                                      ? "bg-green-100 text-green-800 border border-green-200"
                                      : "bg-red-100 text-red-800 border border-red-200"
                                  }`}
                                >
                                  <span className="flex items-center">
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ml-1 ${subCategory.isActive ? "bg-green-500" : "bg-red-500"}`}
                                    ></span>
                                    {subCategory.isActive ? "نشط" : "معطل"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-3">
                              <button
                                onClick={() =>
                                  handleEditSubCategory(subCategory)
                                }
                                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-blue-200"
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
                                  handleToggleSubCategoryStatus(subCategory.id)
                                }
                                className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center border ${
                                  subCategory.isActive
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
                                  {subCategory.isActive ? (
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
                                {subCategory.isActive ? "تعطيل" : "تفعيل"}
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteSubCategory(subCategory.id)
                                }
                                className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-red-200"
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
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500">اختر فئة رئيسية</p>
                    <p className="text-sm text-gray-400 mt-1">
                      اختر فئة رئيسية لعرض فئاتها الفرعية
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showMainCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#193F94" }}
                  >
                    {editingMainCategory
                      ? "تعديل فئة رئيسية"
                      : "إضافة فئة رئيسية"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingMainCategory
                      ? "قم بتعديل بيانات الفئة الرئيسية"
                      : "أدخل بيانات الفئة الرئيسية الجديدة"}
                  </p>
                </div>
                <button
                  onClick={() => setShowMainCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitMainCategory}>
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={mainCategoryForm.name}
                      onChange={handleMainCategoryFormChange}
                      onFocus={() => handleFocus("mainCategoryName")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "mainCategoryName" ||
                        mainCategoryForm.name
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
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                          />
                        </svg>
                        اسم الفئة الرئيسية *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={mainCategoryForm.isActive}
                      onChange={handleMainCategoryFormChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="mr-2 text-sm font-medium text-gray-700">
                      الفئة نشطة (ستظهر في النظام)
                    </span>
                  </label>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowMainCategoryModal(false)}
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
                      {editingMainCategory ? (
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
                    {editingMainCategory ? "حفظ التعديلات" : "إضافة فئة"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showSubCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#10B981" }}
                  >
                    {editingSubCategory ? "تعديل فئة فرعية" : "إضافة فئة فرعية"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingSubCategory
                      ? "قم بتعديل بيانات الفئة الفرعية"
                      : "أدخل بيانات الفئة الفرعية الجديدة"}
                  </p>
                </div>
                <button
                  onClick={() => setShowSubCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitSubCategory}>
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={subCategoryForm.name}
                      onChange={handleSubCategoryFormChange}
                      onFocus={() => handleFocus("subCategoryName")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "subCategoryName" ||
                        subCategoryForm.name
                          ? "-top-2.5 text-xs text-green-500 font-medium"
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
                        اسم الفئة الفرعية *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <select
                      name="mainCategoryId"
                      value={subCategoryForm.mainCategoryId}
                      onChange={handleSubCategoryFormChange}
                      onFocus={() => handleFocus("mainCategorySelect")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm bg-white appearance-none"
                      required
                    >
                      <option value="">اختر الفئة الرئيسية</option>
                      {mainCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "mainCategorySelect" ||
                        subCategoryForm.mainCategoryId
                          ? "-top-2.5 text-xs text-green-500 font-medium"
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
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        الفئة الرئيسية *
                      </span>
                    </label>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="printIP"
                      value={subCategoryForm.printIP}
                      onChange={handleSubCategoryFormChange}
                      onFocus={() => handleFocus("printIP")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm bg-white"
                      placeholder="مثال: 192.168.1.100"
                      dir="ltr"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "printIP" || subCategoryForm.printIP
                          ? "-top-2.5 text-xs text-green-500 font-medium"
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        عنوان IP للطابعة
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-green-300 transition-all">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={subCategoryForm.isActive}
                      onChange={handleSubCategoryFormChange}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="mr-2 text-sm font-medium text-gray-700">
                      الفئة الفرعية نشطة (ستظهر في النظام)
                    </span>
                  </label>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowSubCategoryModal(false)}
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
                    style={{ backgroundColor: "#10B981" }}
                  >
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {editingSubCategory ? (
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
                    {editingSubCategory ? "حفظ التعديلات" : "إضافة فئة فرعية"}
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
