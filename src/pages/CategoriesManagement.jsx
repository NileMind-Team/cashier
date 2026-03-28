import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  ArrowLeft,
  X,
  ChevronDown,
  FolderPlus,
  Save,
} from "lucide-react";

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
  const [isAddingMainCategory, setIsAddingMainCategory] = useState(false);
  const [isEditingMainCategory, setIsEditingMainCategory] = useState(false);
  const [isTogglingMainCategory, setIsTogglingMainCategory] = useState(false);
  const [isDeletingMainCategory, setIsDeletingMainCategory] = useState(false);
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [isEditingSubCategory, setIsEditingSubCategory] = useState(false);
  const [isTogglingSubCategory, setIsTogglingSubCategory] = useState(false);
  const [isDeletingSubCategory, setIsDeletingSubCategory] = useState(false);

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

    if (editingMainCategory) {
      setIsEditingMainCategory(true);
    } else {
      setIsAddingMainCategory(true);
    }

    try {
      if (editingMainCategory) {
        const response = await axiosInstance.put(
          `/api/MainCategories/Update/${editingMainCategory.id}`,
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

        if (response.status === 201 || response.status === 200) {
          await fetchAllData();
          toast.success("تم إضافة الفئة الرئيسية بنجاح");
          setShowMainCategoryModal(false);
        } else {
          toast.error("فشل في إضافة الفئة الرئيسية");
        }
      }
    } catch (error) {
      console.error("خطأ في حفظ الفئة الرئيسية:", error);

      if (error.response?.status === 409) {
        const errors = error.response?.data?.errors;
        if (errors && errors.length > 0) {
          const errorCode = errors[0].code;
          if (errorCode === "MainCategory.DuplicatedName") {
            toast.error("هذا الاسم موجود بالفعل. الرجاء استخدام اسم آخر");
          } else {
            toast.error(
              errors[0].description || "حدث خطأ في حفظ الفئة الرئيسية",
            );
          }
        } else {
          toast.error("حدث خطأ في حفظ الفئة الرئيسية");
        }
      } else {
        toast.error("حدث خطأ في حفظ الفئة الرئيسية");
      }
    } finally {
      setIsAddingMainCategory(false);
      setIsEditingMainCategory(false);
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

    if (editingSubCategory) {
      setIsEditingSubCategory(true);
    } else {
      setIsAddingSubCategory(true);
    }

    try {
      if (editingSubCategory) {
        const response = await axiosInstance.put(
          `/api/SubCategories/Update/${editingSubCategory.id}`,
          {
            name: subCategoryForm.name,
            mainCategoryId: parseInt(subCategoryForm.mainCategoryId),
            printIP: subCategoryForm.printIP || "",
          },
        );

        if (response.status === 200) {
          await fetchAllData();
          toast.success("تم تحديث الفئة الفرعية بنجاح");
          setShowSubCategoryModal(false);
          setEditingSubCategory(null);

          const updatedMainCategory = mainCategories.find(
            (cat) => cat.id === parseInt(subCategoryForm.mainCategoryId),
          );
          if (updatedMainCategory) {
            setSelectedMainCategory(updatedMainCategory);
          }
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

        if (response.status === 201 || response.status === 200) {
          await fetchAllData();
          toast.success("تم إضافة الفئة الفرعية بنجاح");
          setShowSubCategoryModal(false);

          const addedMainCategory = mainCategories.find(
            (cat) => cat.id === parseInt(subCategoryForm.mainCategoryId),
          );
          if (addedMainCategory) {
            setSelectedMainCategory(addedMainCategory);
          }
        } else {
          toast.error("فشل في إضافة الفئة الفرعية");
        }
      }
    } catch (error) {
      console.error("خطأ في حفظ الفئة الفرعية:", error);

      if (error.response?.status === 409) {
        const errors = error.response?.data?.errors;
        if (errors && errors.length > 0) {
          const errorCode = errors[0].code;
          if (errorCode === "subCategory.DuplicatedName") {
            toast.error("هذا الاسم موجود بالفعل. الرجاء استخدام اسم آخر");
          } else {
            toast.error(
              errors[0].description || "حدث خطأ في حفظ الفئة الفرعية",
            );
          }
        } else {
          toast.error("حدث خطأ في حفظ الفئة الفرعية");
        }
      } else {
        toast.error("حدث خطأ في حفظ الفئة الفرعية");
      }
    } finally {
      setIsAddingSubCategory(false);
      setIsEditingSubCategory(false);
    }
  };

  const handleDeleteMainCategory = async (categoryId) => {
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
      setIsDeletingMainCategory(true);
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

        if (error.response?.status === 400 && error.response?.data?.errors) {
          const errors = error.response.data.errors;
          const hasMainCategoryHasSubCategories = errors.some(
            (err) => err.code === "MainCategory.HasSubCategories",
          );

          if (hasMainCategoryHasSubCategories) {
            toast.error(
              "لا يمكن حذف الفئة الرئيسية لأنها تحتوي على فئات فرعية",
            );
          } else {
            toast.error("حدث خطأ في حذف الفئة الرئيسية");
          }
        } else {
          toast.error("حدث خطأ في حذف الفئة الرئيسية");
        }
      } finally {
        setIsDeletingMainCategory(false);
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
      setIsDeletingSubCategory(true);
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

        if (error.response?.status === 400 && error.response?.data?.errors) {
          const errors = error.response.data.errors;
          const hasSubCategoryHasItems = errors.some(
            (err) => err.code === "SubCategory.HasItems",
          );

          if (hasSubCategoryHasItems) {
            toast.error("لا يمكن حذف الفئة الفرعية لأنها تحتوي على منتجات");
          } else {
            toast.error("حدث خطأ في حذف الفئة الفرعية");
          }
        } else {
          toast.error("حدث خطأ في حذف الفئة الفرعية");
        }
      } finally {
        setIsDeletingSubCategory(false);
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
      setIsTogglingMainCategory(true);
      try {
        const response = await axiosInstance.put(
          `/api/MainCategories/SetActivation/${categoryId}/Active?isActive=${!category.isActive}`,
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
      } finally {
        setIsTogglingMainCategory(false);
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
      setIsTogglingSubCategory(true);
      try {
        const response = await axiosInstance.put(
          `/api/SubCategories/SetActivation/${subCategoryId}/Active?isActive=${!subCategory.isActive}`,
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
      } finally {
        setIsTogglingSubCategory(false);
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
              <ArrowLeft className="h-5 w-5 ml-2" />
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
                disabled={isAddingMainCategory}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: "#193F94" }}
              >
                {isAddingMainCategory ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    جاري الإضافة...
                  </div>
                ) : (
                  <>
                    <Plus className="h-5 w-5 ml-2" />
                    إضافة فئة رئيسية
                  </>
                )}
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
                  <FolderPlus className="h-16 w-16 mx-auto" />
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
                        disabled={isEditingMainCategory}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit className="h-3 w-3 ml-1" />
                        تعديل
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMainCategoryStatus(category.id);
                        }}
                        disabled={isTogglingMainCategory}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center border disabled:opacity-50 disabled:cursor-not-allowed ${
                          category.isActive
                            ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        }`}
                      >
                        {isTogglingMainCategory ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin ml-1"></div>
                        ) : category.isActive ? (
                          <PowerOff className="h-3 w-3 ml-1" />
                        ) : (
                          <Power className="h-3 w-3 ml-1" />
                        )}
                        {isTogglingMainCategory
                          ? "جاري..."
                          : category.isActive
                            ? "تعطيل"
                            : "تفعيل"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMainCategory(category.id);
                        }}
                        disabled={isDeletingMainCategory}
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeletingMainCategory ? (
                          <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin ml-1"></div>
                        ) : (
                          <Trash2 className="h-3 w-3 ml-1" />
                        )}
                        {isDeletingMainCategory ? "جاري الحذف..." : "حذف"}
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
                disabled={isAddingSubCategory}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isAddingSubCategory ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    جاري الإضافة...
                  </div>
                ) : (
                  <>
                    <Plus className="h-5 w-5 ml-2" />
                    إضافة فئة فرعية
                  </>
                )}
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
                        <FolderPlus className="h-16 w-16 mx-auto" />
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
                                disabled={isEditingSubCategory}
                                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Edit className="h-3 w-3 ml-1" />
                                تعديل
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleSubCategoryStatus(subCategory.id)
                                }
                                disabled={isTogglingSubCategory}
                                className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center border disabled:opacity-50 disabled:cursor-not-allowed ${
                                  subCategory.isActive
                                    ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                                    : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                }`}
                              >
                                {isTogglingSubCategory ? (
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin ml-1"></div>
                                ) : subCategory.isActive ? (
                                  <PowerOff className="h-3 w-3 ml-1" />
                                ) : (
                                  <Power className="h-3 w-3 ml-1" />
                                )}
                                {isTogglingSubCategory
                                  ? "جاري..."
                                  : subCategory.isActive
                                    ? "تعطيل"
                                    : "تفعيل"}
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteSubCategory(subCategory.id)
                                }
                                disabled={isDeletingSubCategory}
                                className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isDeletingSubCategory ? (
                                  <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin ml-1"></div>
                                ) : (
                                  <Trash2 className="h-3 w-3 ml-1" />
                                )}
                                {isDeletingSubCategory
                                  ? "جاري الحذف..."
                                  : "حذف"}
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
                      <FolderPlus className="h-16 w-16 mx-auto" />
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
                  <X className="h-6 w-6" />
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
                        <FolderPlus className="w-4 h-4 ml-1" />
                        اسم الفئة الرئيسية *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowMainCategoryModal(false)}
                    disabled={isAddingMainCategory || isEditingMainCategory}
                    className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingMainCategory || isEditingMainCategory}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                    style={{ backgroundColor: "#193F94" }}
                  >
                    {isAddingMainCategory || isEditingMainCategory ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                        {editingMainCategory
                          ? "جاري التحديث..."
                          : "جاري الإضافة..."}
                      </div>
                    ) : (
                      <>
                        {editingMainCategory ? (
                          <Save className="w-4 h-4 ml-2" />
                        ) : (
                          <Plus className="w-4 h-4 ml-2" />
                        )}
                        {editingMainCategory
                          ? "حفظ التعديلات"
                          : "إضافة فئة رئيسية"}
                      </>
                    )}
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
                  <X className="h-6 w-6" />
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
                        <FolderPlus className="w-4 h-4 ml-1" />
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
                        <FolderPlus className="w-4 h-4 ml-1" />
                        الفئة الرئيسية *
                      </span>
                    </label>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowSubCategoryModal(false)}
                    disabled={isAddingSubCategory || isEditingSubCategory}
                    className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingSubCategory || isEditingSubCategory}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                    style={{ backgroundColor: "#10B981" }}
                  >
                    {isAddingSubCategory || isEditingSubCategory ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                        {editingSubCategory
                          ? "جاري التحديث..."
                          : "جاري الإضافة..."}
                      </div>
                    ) : (
                      <>
                        {editingSubCategory ? (
                          <Save className="w-4 h-4 ml-2" />
                        ) : (
                          <Plus className="w-4 h-4 ml-2" />
                        )}
                        {editingSubCategory
                          ? "حفظ التعديلات"
                          : "إضافة فئة فرعية"}
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
