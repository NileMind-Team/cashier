import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

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

  // دالة لتوليد لون عشوائي
  const generateRandomColor = () => {
    const colors = [
      "#3B82F6",
      "#10B981",
      "#8B5CF6",
      "#F59E0B",
      "#EF4444",
      "#EC4899",
      "#14B8A6",
      "#6366F1",
      "#0EA5E9",
      "#84CC16",
      "#F97316",
      "#8B5CF6",
      "#EC4899",
      "#06B6D4",
      "#22C55E",
      "#A855F7",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const initialMainCategories = [
    { id: 1, name: "المشروبات", color: generateRandomColor(), isActive: true },
    { id: 2, name: "الوجبات", color: generateRandomColor(), isActive: true },
    { id: 3, name: "الحلويات", color: generateRandomColor(), isActive: true },
    { id: 4, name: "المقبلات", color: generateRandomColor(), isActive: true },
    {
      id: 5,
      name: "المشروبات الغازية",
      color: generateRandomColor(),
      isActive: true,
    },
  ];

  const initialSubCategories = [
    { id: 1, name: "المشروبات الساخنة", mainCategoryId: 1, isActive: true },
    { id: 2, name: "المشروبات الباردة", mainCategoryId: 1, isActive: true },
    { id: 3, name: "العصائر", mainCategoryId: 1, isActive: true },
    { id: 4, name: "ساندويتشات", mainCategoryId: 2, isActive: true },
    { id: 5, name: "وجبات رئيسية", mainCategoryId: 2, isActive: true },
    { id: 6, name: "سلطات", mainCategoryId: 2, isActive: true },
    { id: 7, name: "كيك", mainCategoryId: 3, isActive: true },
    { id: 8, name: "حلويات شرقية", mainCategoryId: 3, isActive: true },
    { id: 9, name: "آيس كريم", mainCategoryId: 3, isActive: true },
    { id: 10, name: "مقبلات ساخنة", mainCategoryId: 4, isActive: true },
    { id: 11, name: "مقبلات باردة", mainCategoryId: 4, isActive: true },
    { id: 12, name: "مشروبات غازية", mainCategoryId: 5, isActive: true },
    { id: 13, name: "مياه معبأة", mainCategoryId: 5, isActive: true },
  ];

  const [mainCategoryForm, setMainCategoryForm] = useState({
    name: "",
    isActive: true,
  });

  const [subCategoryForm, setSubCategoryForm] = useState({
    name: "",
    mainCategoryId: "",
    isActive: true,
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setMainCategories(initialMainCategories);
      setSubCategories(initialSubCategories);
      if (initialMainCategories.length > 0) {
        setSelectedMainCategory(initialMainCategories[0]);
      }
      setLoading(false);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddMainCategory = () => {
    setShowMainCategoryModal(true);
    setEditingMainCategory(null);
    setMainCategoryForm({
      name: "",
      isActive: true,
    });
  };

  const handleEditMainCategory = (category) => {
    setEditingMainCategory(category);
    setShowMainCategoryModal(true);
    setMainCategoryForm({
      name: category.name,
      isActive: category.isActive,
    });
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
      mainCategoryId: selectedMainCategory?.id || mainCategories[0].id,
      isActive: true,
    });
  };

  const handleEditSubCategory = (subCategory) => {
    setEditingSubCategory(subCategory);
    setShowSubCategoryModal(true);
    setSubCategoryForm({
      name: subCategory.name,
      mainCategoryId: subCategory.mainCategoryId,
      isActive: subCategory.isActive,
    });
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

  const handleSubmitMainCategory = (e) => {
    e.preventDefault();

    if (!mainCategoryForm.name.trim()) {
      toast.error("يرجى إدخال اسم الفئة الرئيسية");
      return;
    }

    if (editingMainCategory) {
      const updatedCategories = mainCategories.map((cat) =>
        cat.id === editingMainCategory.id
          ? {
              ...cat,
              name: mainCategoryForm.name,
              isActive: mainCategoryForm.isActive,
            }
          : cat,
      );
      setMainCategories(updatedCategories);
      toast.success("تم تحديث الفئة الرئيسية بنجاح");
    } else {
      const newCategory = {
        id: mainCategories.length + 1,
        name: mainCategoryForm.name,
        color: generateRandomColor(),
        isActive: mainCategoryForm.isActive,
      };
      setMainCategories([...mainCategories, newCategory]);
      toast.success("تم إضافة الفئة الرئيسية بنجاح");
    }

    setShowMainCategoryModal(false);
    setEditingMainCategory(null);
  };

  const handleSubmitSubCategory = (e) => {
    e.preventDefault();

    if (!subCategoryForm.name.trim()) {
      toast.error("يرجى إدخال اسم الفئة الفرعية");
      return;
    }

    if (!subCategoryForm.mainCategoryId) {
      toast.error("يرجى اختيار الفئة الرئيسية");
      return;
    }

    if (editingSubCategory) {
      const updatedSubCategories = subCategories.map((subCat) =>
        subCat.id === editingSubCategory.id
          ? {
              ...subCat,
              name: subCategoryForm.name,
              mainCategoryId: parseInt(subCategoryForm.mainCategoryId),
              isActive: subCategoryForm.isActive,
            }
          : subCat,
      );
      setSubCategories(updatedSubCategories);
      toast.success("تم تحديث الفئة الفرعية بنجاح");
    } else {
      const newSubCategory = {
        id: subCategories.length + 1,
        name: subCategoryForm.name,
        mainCategoryId: parseInt(subCategoryForm.mainCategoryId),
        isActive: subCategoryForm.isActive,
      };
      setSubCategories([...subCategories, newSubCategory]);
      toast.success("تم إضافة الفئة الفرعية بنجاح");
    }

    setShowSubCategoryModal(false);
    setEditingSubCategory(null);
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
      setMainCategories(mainCategories.filter((cat) => cat.id !== categoryId));
      toast.success("تم حذف الفئة الرئيسية بنجاح");
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
      setSubCategories(subCategories.filter((sub) => sub.id !== subCategoryId));
      toast.success("تم حذف الفئة الفرعية بنجاح");
    }
  };

  const handleToggleMainCategoryStatus = (categoryId) => {
    setMainCategories(
      mainCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat,
      ),
    );
    toast.success("تم تغيير حالة الفئة بنجاح");
  };

  const handleToggleSubCategoryStatus = (subCategoryId) => {
    setSubCategories(
      subCategories.map((sub) =>
        sub.id === subCategoryId ? { ...sub, isActive: !sub.isActive } : sub,
      ),
    );
    toast.success("تم تغيير حالة الفئة الفرعية بنجاح");
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors flex items-center"
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
                    className={`p-4 rounded-xl border transition-all ${
                      selectedMainCategory?.id === category.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedMainCategory(category)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center ml-3"
                          style={{ backgroundColor: category.color }}
                        >
                          <span className="text-white font-bold">
                            {category.name.charAt(0)}
                          </span>
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
                          className={`px-2 py-1 rounded text-xs ${
                            category.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {category.isActive ? "نشط" : "معطل"}
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
                  <div className="mt-2 flex items-center">
                    <div
                      className="w-3 h-3 rounded-full ml-2"
                      style={{ backgroundColor: selectedMainCategory.color }}
                    ></div>
                    <span className="text-sm text-gray-700">
                      {selectedMainCategory.name}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleAddSubCategory}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors flex items-center"
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
                      ).map((subCategory) => (
                        <div
                          key={subCategory.id}
                          className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center ml-3 bg-gray-100"
                                style={{
                                  borderLeft: `4px solid ${selectedMainCategory.color}`,
                                }}
                              >
                                <span className="text-gray-700 font-bold">
                                  {subCategory.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">
                                  {subCategory.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  تابعة لـ {selectedMainCategory.name}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <div
                                className={`px-2 py-1 rounded text-xs ${
                                  subCategory.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {subCategory.isActive ? "نشط" : "معطل"}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-3">
                            <button
                              onClick={() => handleEditSubCategory(subCategory)}
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
                      ))}
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
                <h3 className="text-xl font-bold" style={{ color: "#193F94" }}>
                  {editingMainCategory
                    ? "تعديل فئة رئيسية"
                    : "إضافة فئة رئيسية"}
                </h3>
                <button
                  onClick={() => setShowMainCategoryModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitMainCategory}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الفئة الرئيسية *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={mainCategoryForm.name}
                      onChange={handleMainCategoryFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center cursor-pointer">
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
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowMainCategoryModal(false)}
                    className="flex-1 py-3 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-lg font-bold text-white transition-colors"
                    style={{ backgroundColor: "#193F94" }}
                  >
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
                <h3 className="text-xl font-bold" style={{ color: "#193F94" }}>
                  {editingSubCategory ? "تعديل فئة فرعية" : "إضافة فئة فرعية"}
                </h3>
                <button
                  onClick={() => setShowSubCategoryModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitSubCategory}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الفئة الفرعية *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={subCategoryForm.name}
                      onChange={handleSubCategoryFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الفئة الرئيسية *
                    </label>
                    <select
                      name="mainCategoryId"
                      value={subCategoryForm.mainCategoryId}
                      onChange={handleSubCategoryFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    >
                      <option value="">اختر الفئة الرئيسية</option>
                      {mainCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={subCategoryForm.isActive}
                        onChange={handleSubCategoryFormChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="mr-2 text-sm font-medium text-gray-700">
                        الفئة الفرعية نشطة (ستظهر في النظام)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowSubCategoryModal(false)}
                    className="flex-1 py-3 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-lg font-bold text-white transition-colors"
                    style={{ backgroundColor: "#10B981" }}
                  >
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
