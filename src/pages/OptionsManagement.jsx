import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import {
  FaPizzaSlice,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

export default function OptionsManagement() {
  const navigate = useNavigate();
  const [optionTypes, setOptionTypes] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOptionTypeModal, setShowOptionTypeModal] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [editingOptionType, setEditingOptionType] = useState(null);
  const [editingOption, setEditingOption] = useState(null);
  const [selectedOptionType, setSelectedOptionType] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const hasFetched = useRef(false);

  const [optionTypeForm, setOptionTypeForm] = useState({
    name: "",
    canMultiSelect: true,
    isRequired: true,
  });

  const [optionForm, setOptionForm] = useState({
    name: "",
    price: "",
    optionTypeId: "",
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [optionTypesResponse, optionsResponse] = await Promise.all([
        axiosInstance.get("/api/OptionTypes/GetAll"),
        axiosInstance.get("/api/Options/GetAll"),
      ]);

      if (optionTypesResponse.status === 200 && optionTypesResponse.data) {
        setOptionTypes(optionTypesResponse.data);

        if (optionTypesResponse.data.length > 0) {
          if (selectedOptionType) {
            const stillExists = optionTypesResponse.data.some(
              (type) => type.id === selectedOptionType.id,
            );
            if (stillExists) {
              setSelectedOptionType(
                optionTypesResponse.data.find(
                  (type) => type.id === selectedOptionType.id,
                ),
              );
            } else {
              setSelectedOptionType(optionTypesResponse.data[0]);
            }
          } else {
            setSelectedOptionType(optionTypesResponse.data[0]);
          }
        } else {
          setSelectedOptionType(null);
        }
      } else {
        toast.error("فشل في جلب أنواع الإضافات");
      }

      if (optionsResponse.status === 200 && optionsResponse.data) {
        setOptions(optionsResponse.data);
      } else {
        toast.error("فشل في جلب الإضافات");
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

  const handleAddOptionType = () => {
    setShowOptionTypeModal(true);
    setEditingOptionType(null);
    setOptionTypeForm({
      name: "",
      canMultiSelect: true,
      isRequired: true,
    });
    setFocusedField(null);
  };

  const handleEditOptionType = (optionType) => {
    setEditingOptionType(optionType);
    setShowOptionTypeModal(true);
    setOptionTypeForm({
      name: optionType.name,
      canMultiSelect: optionType.canMultiSelect,
      isRequired: optionType.isRequired,
    });
    setFocusedField(null);
  };

  const handleAddOption = () => {
    if (optionTypes.length === 0) {
      toast.error("يجب إضافة نوع إضافة أولاً");
      return;
    }
    setShowOptionModal(true);
    setEditingOption(null);
    setOptionForm({
      name: "",
      price: "",
      optionTypeId: selectedOptionType?.id || optionTypes[0]?.id || "",
    });
    setFocusedField(null);
  };

  const handleEditOption = (option) => {
    setEditingOption(option);
    setShowOptionModal(true);
    setOptionForm({
      name: option.name,
      price: option.price,
      optionTypeId: option.optionTypeId,
    });
    setFocusedField(null);
  };

  const handleOptionTypeFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOptionTypeForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOptionFormChange = (e) => {
    const { name, value } = e.target;
    setOptionForm((prev) => ({
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

  const handleSubmitOptionType = async (e) => {
    e.preventDefault();

    if (!optionTypeForm.name.trim()) {
      toast.error("يرجى إدخال اسم نوع الإضافة");
      return;
    }

    try {
      if (editingOptionType) {
        const response = await axiosInstance.put(
          `/api/OptionTypes/Update/${editingOptionType.id}`,
          {
            name: optionTypeForm.name,
            canMultiSelect: optionTypeForm.canMultiSelect,
            isRequired: optionTypeForm.isRequired,
          },
        );

        if (response.status === 200) {
          await fetchAllData();
          toast.success("تم تحديث نوع الإضافة بنجاح");
          setShowOptionTypeModal(false);
          setEditingOptionType(null);
        } else {
          toast.error("فشل في تحديث نوع الإضافة");
        }
      } else {
        const response = await axiosInstance.post("/api/OptionTypes/Add", {
          name: optionTypeForm.name,
          canMultiSelect: optionTypeForm.canMultiSelect,
          isRequired: optionTypeForm.isRequired,
        });

        if (response.status === 201) {
          await fetchAllData();
          toast.success("تم إضافة نوع الإضافة بنجاح");
          setShowOptionTypeModal(false);
          setEditingOptionType(null);
        } else {
          toast.error("فشل في إضافة نوع الإضافة");
        }
      }
    } catch (error) {
      console.error("خطأ في حفظ نوع الإضافة:", error);
      if (error.response?.status === 201 || error.response?.status === 200) {
        await fetchAllData();
        toast.success("تم حفظ نوع الإضافة بنجاح");
        setShowOptionTypeModal(false);
        setEditingOptionType(null);
      } else {
        toast.error("حدث خطأ في حفظ نوع الإضافة");
      }
    }
  };

  const handleSubmitOption = async (e) => {
    e.preventDefault();

    if (!optionForm.name.trim()) {
      toast.error("يرجى إدخال اسم الإضافة");
      return;
    }

    if (!optionForm.optionTypeId) {
      toast.error("يرجى اختيار نوع الإضافة");
      return;
    }

    if (!optionForm.price || optionForm.price <= 0) {
      toast.error("يرجى إدخال سعر صحيح للإضافة");
      return;
    }

    try {
      if (editingOption) {
        const response = await axiosInstance.put(
          `/api/Options/Update/${editingOption.id}`,
          {
            name: optionForm.name,
            price: parseFloat(optionForm.price),
            optionTypeId: parseInt(optionForm.optionTypeId),
          },
        );

        if (response.status === 200) {
          await fetchAllData();
          toast.success("تم تحديث الإضافة بنجاح");
          setShowOptionModal(false);
          setEditingOption(null);
        } else {
          toast.error("فشل في تحديث الإضافة");
        }
      } else {
        const response = await axiosInstance.post("/api/Options/Add", {
          name: optionForm.name,
          price: parseFloat(optionForm.price),
          optionTypeId: parseInt(optionForm.optionTypeId),
        });

        if (response.status === 201) {
          await fetchAllData();
          toast.success("تم إضافة الإضافة بنجاح");
          setShowOptionModal(false);
          setEditingOption(null);
        } else {
          toast.error("فشل في إضافة الإضافة");
        }
      }
    } catch (error) {
      console.error("خطأ في حفظ الإضافة:", error);
      if (error.response?.status === 201 || error.response?.status === 200) {
        await fetchAllData();
        toast.success("تم حفظ الإضافة بنجاح");
        setShowOptionModal(false);
        setEditingOption(null);
      } else {
        toast.error("حدث خطأ في حفظ الإضافة");
      }
    }
  };

  const handleDeleteOptionType = async (optionTypeId) => {
    const hasOptions = options.some(
      (option) => option.optionTypeId === optionTypeId,
    );

    if (hasOptions) {
      toast.error("لا يمكن حذف نوع إضافة يحتوي على إضافات");
      return;
    }

    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذا النوع بشكل نهائي",
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
          `/api/OptionTypes/Delete/${optionTypeId}`,
        );

        if (response.status === 200 || response.status === 204) {
          await fetchAllData();
          toast.success("تم حذف نوع الإضافة بنجاح");
        } else {
          toast.error("فشل في حذف نوع الإضافة");
        }
      } catch (error) {
        console.error("خطأ في حذف نوع الإضافة:", error);
        toast.error("حدث خطأ في حذف نوع الإضافة");
      }
    }
  };

  const handleDeleteOption = async (optionId) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذه الإضافة بشكل نهائي",
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
          await fetchAllData();
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

  const getOptionsForOptionType = (optionTypeId) => {
    return options.filter((option) => option.optionTypeId === optionTypeId);
  };

  const formatPrice = (price) => {
    return Number(price).toFixed(2);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-l from-gray-50 to-gray-100"
    >
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center ml-3 shadow-md">
                <FaPizzaSlice className="text-white text-xl" />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Option Types Column */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                  أنواع الإضافات
                </h3>
                <p className="text-sm text-gray-600">
                  إضافة وتعديل أنواع الإضافات (مثل: المقاسات - الإضافات
                  الإضافية)
                </p>
              </div>
              <button
                onClick={handleAddOptionType}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center shadow-md"
              >
                <FaPlus className="h-4 w-4 ml-2" />
                إضافة نوع
              </button>
            </div>

            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-t-4 border-orange-600 border-solid rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4">
                  جاري تحميل أنواع الإضافات...
                </p>
              </div>
            ) : optionTypes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-3">
                  <FaPizzaSlice className="h-16 w-16 mx-auto" />
                </div>
                <p className="text-gray-500">لا توجد أنواع إضافات</p>
                <p className="text-sm text-gray-400 mt-1">
                  قم بإضافة نوع إضافة جديد لبدء التصنيف
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {optionTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedOptionType?.id === type.id
                        ? "border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedOptionType(type)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center ml-3 bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-lg shadow-md">
                          {type.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {type.name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center space-x-2 rtl:space-x-reverse">
                            <span
                              className={`flex items-center ${type.canMultiSelect ? "text-green-600" : "text-red-600"}`}
                            >
                              {type.canMultiSelect ? (
                                <>
                                  <FaCheck className="h-2 w-2 ml-1" />
                                  اختيار متعدد
                                </>
                              ) : (
                                <>
                                  <FaTimes className="h-2 w-2 ml-1" />
                                  اختيار واحد
                                </>
                              )}
                            </span>
                            <span className="mx-1">•</span>
                            <span
                              className={`flex items-center ${type.isRequired ? "text-blue-600" : "text-gray-500"}`}
                            >
                              {type.isRequired ? "إجباري" : "اختياري"}
                            </span>
                            <span className="mx-1">•</span>
                            <span>
                              {getOptionsForOptionType(type.id).length} إضافة
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOptionType(type);
                        }}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-blue-200"
                      >
                        <FaEdit className="h-3 w-3 ml-1" />
                        تعديل
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOptionType(type.id);
                        }}
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-red-200"
                      >
                        <FaTrash className="h-3 w-3 ml-1" />
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Options Column */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                  الإضافات
                </h3>
                <p className="text-sm text-gray-600">
                  إضافة وتعديل الإضافات داخل كل نوع
                </p>
                {selectedOptionType && (
                  <div className="mt-2 flex items-center bg-gradient-to-l from-orange-50 to-transparent p-2 rounded-lg">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center ml-2 bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm font-bold shadow-md">
                      {selectedOptionType.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {selectedOptionType.name}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleAddOption}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center shadow-md"
              >
                <FaPlus className="h-4 w-4 ml-2" />
                إضافة إضافة
              </button>
            </div>

            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-t-4 border-green-600 border-solid rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4">جاري تحميل الإضافات...</p>
              </div>
            ) : (
              <>
                {selectedOptionType ? (
                  getOptionsForOptionType(selectedOptionType.id).length ===
                  0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-3">
                        <FaPizzaSlice className="h-16 w-16 mx-auto" />
                      </div>
                      <p className="text-gray-500">لا توجد إضافات</p>
                      <p className="text-sm text-gray-400 mt-1">
                        قم بإضافة إضافات داخل {selectedOptionType.name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getOptionsForOptionType(selectedOptionType.id).map(
                        (option) => (
                          <div
                            key={option.id}
                            className="p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center ml-3 bg-gradient-to-br from-purple-400 to-purple-600 text-white font-bold text-lg shadow-md">
                                  {option.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900">
                                    {option.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    السعر:{" "}
                                    <span className="font-medium text-green-600">
                                      {formatPrice(option.price)} ج.م
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-3">
                              <button
                                onClick={() => handleEditOption(option)}
                                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-blue-200"
                              >
                                <FaEdit className="h-3 w-3 ml-1" />
                                تعديل
                              </button>
                              <button
                                onClick={() => handleDeleteOption(option.id)}
                                className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-red-200"
                              >
                                <FaTrash className="h-3 w-3 ml-1" />
                                حذف
                              </button>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-3">
                      <FaPizzaSlice className="h-16 w-16 mx-auto" />
                    </div>
                    <p className="text-gray-500">اختر نوع إضافة</p>
                    <p className="text-sm text-gray-400 mt-1">
                      اختر نوع إضافة لعرض الإضافات التابعة له
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Option Type Modal */}
      {showOptionTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-orange-600">
                    {editingOptionType ? "تعديل نوع إضافة" : "إضافة نوع إضافة"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingOptionType
                      ? "قم بتعديل بيانات نوع الإضافة"
                      : "أدخل بيانات نوع الإضافة الجديد"}
                  </p>
                </div>
                <button
                  onClick={() => setShowOptionTypeModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitOptionType}>
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={optionTypeForm.name}
                      onChange={handleOptionTypeFormChange}
                      onFocus={() => handleFocus("optionTypeName")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "optionTypeName" || optionTypeForm.name
                          ? "-top-2.5 text-xs text-orange-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
                      <span className="flex items-center">
                        <FaPizzaSlice className="w-4 h-4 ml-1" />
                        اسم نوع الإضافة *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-all">
                    <input
                      type="checkbox"
                      name="canMultiSelect"
                      checked={optionTypeForm.canMultiSelect}
                      onChange={handleOptionTypeFormChange}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="mr-2 text-sm font-medium text-gray-700">
                      يمكن اختيار أكثر من إضافة (اختيار متعدد)
                    </span>
                  </label>
                </div>

                <div className="mb-6">
                  <label className="flex items-center cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-all">
                    <input
                      type="checkbox"
                      name="isRequired"
                      checked={optionTypeForm.isRequired}
                      onChange={handleOptionTypeFormChange}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="mr-2 text-sm font-medium text-gray-700">
                      هذا النوع إجباري (يجب اختيار إضافة واحدة على الأقل)
                    </span>
                  </label>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowOptionTypeModal(false)}
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
                      {editingOptionType ? (
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
                    {editingOptionType ? "حفظ التعديلات" : "إضافة نوع"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Option Modal */}
      {showOptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-green-600">
                    {editingOption ? "تعديل إضافة" : "إضافة إضافة جديدة"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingOption
                      ? "قم بتعديل بيانات الإضافة"
                      : "أدخل بيانات الإضافة الجديدة"}
                  </p>
                </div>
                <button
                  onClick={() => setShowOptionModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitOption}>
                <div className="mb-4">
                  <div className="relative">
                    <select
                      name="optionTypeId"
                      value={optionForm.optionTypeId}
                      onChange={handleOptionFormChange}
                      onFocus={() => handleFocus("optionTypeSelect")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm bg-white appearance-none"
                      required
                    >
                      <option value="">اختر نوع الإضافة</option>
                      {optionTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "optionTypeSelect" ||
                        optionForm.optionTypeId
                          ? "-top-2.5 text-xs text-green-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
                      <span className="flex items-center">
                        <FaPizzaSlice className="w-4 h-4 ml-1" />
                        نوع الإضافة *
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
                      name="name"
                      value={optionForm.name}
                      onChange={handleOptionFormChange}
                      onFocus={() => handleFocus("optionName")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "optionName" || optionForm.name
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
                        اسم الإضافة *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      name="price"
                      value={optionForm.price}
                      onChange={handleOptionFormChange}
                      onFocus={() => handleFocus("optionPrice")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm bg-white"
                      required
                      dir="ltr"
                      inputMode="numeric"
                      pattern="\d*\.?\d*"
                      onWheel={(e) => e.target.blur()}
                      style={{ MozAppearance: "textfield" }}
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "optionPrice" || optionForm.price
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
                    onClick={() => setShowOptionModal(false)}
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
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
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
