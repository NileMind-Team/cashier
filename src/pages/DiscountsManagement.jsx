import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import {
  FaPercentage,
  FaLayerGroup,
  FaBoxOpen,
  FaTag,
  FaTrash,
  FaArrowLeft,
} from "react-icons/fa";

export default function DiscountsManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("mainCategories");
  const [focusedField, setFocusedField] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountForm, setDiscountForm] = useState({
    id: "",
    name: "",
    type: "",
    discountValue: "",
    isPercentage: true,
    currentDiscount: 0,
  });

  const isFirstRender = useRef(true);
  const isFetching = useRef(false);

  const fetchAllData = async (showLoading = true) => {
    if (isFetching.current) {
      console.log("هناك طلب قيد التنفيذ بالفعل، تجاهل الطلب الجديد");
      return;
    }

    try {
      isFetching.current = true;
      if (showLoading) setLoading(true);

      const [mainCatsRes, subCatsRes, productsRes] = await Promise.all([
        axiosInstance.get("/api/MainCategories/GetAllMainCategories"),
        axiosInstance.get("/api/SubCategories/GetAllSubCategories"),
        axiosInstance.get("/api/Items/GetAllItems"),
      ]);

      if (mainCatsRes.status === 200 && Array.isArray(mainCatsRes.data)) {
        setMainCategories(mainCatsRes.data);
      }

      if (subCatsRes.status === 200 && Array.isArray(subCatsRes.data)) {
        setSubCategories(subCatsRes.data);
      }

      if (productsRes.status === 200 && Array.isArray(productsRes.data)) {
        setProducts(productsRes.data);
      }
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
      toast.error("حدث خطأ في جلب البيانات");
    } finally {
      isFetching.current = false;
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchAllData(true);
    }

    return () => {
      isFetching.current = false;
    };
  }, []);

  const getMainCategoriesWithDiscount = () => {
    return mainCategories.filter((cat) => cat.percentageDiscount > 0);
  };

  const getSubCategoriesWithDiscount = () => {
    return subCategories.filter((sub) => sub.percentageDiscount > 0);
  };

  const getProductsWithDiscount = () => {
    return products.filter(
      (prod) => prod.discount > 0 && prod.discount !== null,
    );
  };

  const handleEditDiscount = (item, type) => {
    let currentDiscount = 0;

    if (type === "mainCategory") {
      currentDiscount = item.percentageDiscount || 0;
    } else if (type === "subCategory") {
      currentDiscount = item.percentageDiscount || 0;
    } else if (type === "product") {
      currentDiscount = item.discount || 0;
    }

    setEditingDiscount({
      id: item.id,
      name: item.name,
      type: type,
      currentDiscount: currentDiscount,
    });

    setDiscountForm({
      id: item.id,
      name: item.name,
      type: type,
      discountValue: currentDiscount,
      isPercentage: true,
      currentDiscount: currentDiscount,
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDiscountForm((prev) => ({
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

  const handleSubmitDiscount = async (e) => {
    e.preventDefault();

    if (
      !discountForm.discountValue ||
      parseFloat(discountForm.discountValue) < 0
    ) {
      toast.error("يرجى إدخال قيمة خصم صحيحة");
      return;
    }

    const discountValue = parseFloat(discountForm.discountValue);
    if (discountValue < 0 || discountValue > 100) {
      toast.error("قيمة الخصم يجب أن تكون بين 0 و 100");
      return;
    }

    try {
      setLoading(true);
      let response;

      if (discountForm.type === "mainCategory") {
        response = await axiosInstance.put(
          `/api/Discounts/MainCategoryDiscount/${discountForm.id}`,
          null,
          {
            params: {
              percentageDiscount: discountValue,
            },
          },
        );
      } else if (discountForm.type === "subCategory") {
        response = await axiosInstance.put(
          `/api/Discounts/SubCategoryDiscount/${discountForm.id}`,
          null,
          {
            params: {
              percentageDiscount: discountValue,
            },
          },
        );
      } else if (discountForm.type === "product") {
        response = await axiosInstance.put(
          `/api/Discounts/ItemDiscount/${discountForm.id}`,
          null,
          {
            params: {
              discount: discountValue,
              isPercentage: discountForm.isPercentage,
            },
          },
        );
      }

      if (response?.status === 200) {
        toast.success(
          `تم ${discountValue === 0 ? "إلغاء" : "تحديث"} الخصم بنجاح`,
        );

        await fetchAllData(false);
        setEditingDiscount(null);
      } else {
        toast.error("فشل في تحديث الخصم");
      }
    } catch (error) {
      console.error("خطأ في تحديث الخصم:", error);
      if (error.response?.status === 200) {
        toast.success("تم تحديث الخصم بنجاح");
        await fetchAllData(false);
        setEditingDiscount(null);
      } else {
        toast.error("حدث خطأ في تحديث الخصم");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiscount = async (item, type) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم إلغاء الخصم بالكامل",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، إلغاء الخصم",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        let response;

        if (type === "mainCategory") {
          response = await axiosInstance.put(
            `/api/Discounts/MainCategoryDiscount/${item.id}`,
            null,
            { params: { percentageDiscount: 0 } },
          );
        } else if (type === "subCategory") {
          response = await axiosInstance.put(
            `/api/Discounts/SubCategoryDiscount/${item.id}`,
            null,
            { params: { percentageDiscount: 0 } },
          );
        } else if (type === "product") {
          response = await axiosInstance.put(
            `/api/Discounts/ItemDiscount/${item.id}`,
            null,
            { params: { discount: 0, isPercentage: true } },
          );
        }

        if (response?.status === 200) {
          toast.success("تم إلغاء الخصم بنجاح");
          await fetchAllData(false);
        } else {
          toast.error("فشل في إلغاء الخصم");
        }
      } catch (error) {
        console.error("خطأ في إلغاء الخصم:", error);
        if (error.response?.status === 200) {
          toast.success("تم إلغاء الخصم بنجاح");
          await fetchAllData(false);
        } else {
          toast.error("حدث خطأ في إلغاء الخصم");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const getTotalActiveDiscounts = () => {
    let total = 0;

    total += mainCategories.filter((c) => c.percentageDiscount > 0).length;
    total += subCategories.filter((s) => s.percentageDiscount > 0).length;
    total += products.filter(
      (p) => p.discount > 0 && p.discount !== null,
    ).length;

    return total;
  };

  // حساب نسبة الخصم للمنتج
  const calculateDiscountPercentage = (product) => {
    if (product.price && product.discount && product.discount > 0) {
      return ((product.discount / product.price) * 100).toFixed(1);
    }
    return 0;
  };

  const renderMainCategoryItem = (category, showActions = true) => (
    <div className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-200 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center ml-3 bg-gradient-to-br from-purple-400 to-purple-600 text-white font-bold text-lg shadow-md">
            {category.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-gray-900">{category.name}</div>
            <div className="text-xs text-gray-500">
              {category.isActive ? "نشط" : "غير نشط"} •{" "}
              {category.subCategories?.length || 0} فئة فرعية
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {category.percentageDiscount > 0 && (
            <div className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-bold border border-purple-200">
              خصم {category.percentageDiscount}%
            </div>
          )}
          {showActions && (
            <>
              <button
                onClick={() => handleEditDiscount(category, "mainCategory")}
                className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200"
                title="إضافة/تعديل الخصم"
              >
                <FaPercentage className="h-4 w-4" />
              </button>
              {category.percentageDiscount > 0 && (
                <button
                  onClick={() => handleRemoveDiscount(category, "mainCategory")}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors border border-red-200"
                  title="إلغاء الخصم"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  // عرض عنصر الفئة الفرعية
  const renderSubCategoryItem = (subCategory, showActions = true) => (
    <div className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-200 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center ml-3 bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-bold text-lg shadow-md">
            {subCategory.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-gray-900">{subCategory.name}</div>
            <div className="text-xs text-gray-500">
              {subCategory.mainCategoryName || "غير معروف"} •{" "}
              {subCategory.isActive ? "نشط" : "غير نشط"} •{" "}
              {subCategory.items?.length || 0} منتج
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {subCategory.percentageDiscount > 0 && (
            <div className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-bold border border-purple-200">
              خصم {subCategory.percentageDiscount}%
            </div>
          )}
          {showActions && (
            <>
              <button
                onClick={() => handleEditDiscount(subCategory, "subCategory")}
                className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200"
                title="إضافة/تعديل الخصم"
              >
                <FaPercentage className="h-4 w-4" />
              </button>
              {subCategory.percentageDiscount > 0 && (
                <button
                  onClick={() =>
                    handleRemoveDiscount(subCategory, "subCategory")
                  }
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors border border-red-200"
                  title="إلغاء الخصم"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  // عرض عنصر المنتج - معدل لاستخدام finalPrice و discount
  const renderProductItem = (product, showActions = true) => (
    <div className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-200 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-lg overflow-hidden ml-3 border border-gray-300 flex-shrink-0">
            <img
              src={
                product.imgUrl ||
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop&crop=center"
              }
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop&crop=center";
              }}
            />
          </div>
          <div>
            <div className="font-bold text-gray-900">{product.name}</div>
            <div className="text-xs text-gray-500">
              {product.mainCategoryName || "غير معروف"} •{" "}
              {product.subCategoryName || "غير معروف"}
            </div>
            <div className="flex items-center mt-1">
              {product.discount > 0 ? (
                <>
                  <div className="text-sm font-bold text-green-700">
                    {product.finalPrice?.toFixed(2)} ج.م
                  </div>
                  <div className="text-xs text-gray-400 line-through mr-2">
                    {product.price?.toFixed(2)} ج.م
                  </div>
                  <div className="text-xs text-purple-600 mr-2">
                    (خصم {product.discount?.toFixed(2)}{" "}
                    {discountForm.isPercentage ? "%" : "ج.م"})
                  </div>
                </>
              ) : (
                <div className="text-sm font-bold text-green-700">
                  {product.price?.toFixed(2)} ج.م
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {product.discount > 0 && (
            <div className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-bold border border-purple-200">
              خصم {calculateDiscountPercentage(product)}%
            </div>
          )}
          {showActions && (
            <>
              <button
                onClick={() => handleEditDiscount(product, "product")}
                className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200"
                title="إضافة/تعديل الخصم"
              >
                <FaPercentage className="h-4 w-4" />
              </button>
              {product.discount > 0 && (
                <button
                  onClick={() => handleRemoveDiscount(product, "product")}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors border border-red-200"
                  title="إلغاء الخصم"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

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
                <FaPercentage className="text-white text-lg" />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "#6B21A8" }}>
                نظام الكاشير - إدارة الخصومات
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
        {/* بطاقة إحصائية للخصومات */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 ml-4">
                <FaPercentage className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  إجمالي الخصومات النشطة
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {getTotalActiveDiscounts()}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <span className="text-purple-600 font-bold ml-1">
                {mainCategories.filter((c) => c.percentageDiscount > 0).length}
              </span>{" "}
              فئة رئيسية •{" "}
              <span className="text-purple-600 font-bold ml-1">
                {subCategories.filter((s) => s.percentageDiscount > 0).length}
              </span>{" "}
              فئة فرعية •{" "}
              <span className="text-purple-600 font-bold ml-1">
                {
                  products.filter((p) => p.discount > 0 && p.discount !== null)
                    .length
                }
              </span>{" "}
              منتج
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("mainCategories")}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-all relative ${
                  activeTab === "mainCategories"
                    ? "text-purple-700 border-b-2 border-purple-700 bg-purple-50/30"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <FaLayerGroup className="inline ml-2 h-4 w-4" />
                الفئات الرئيسية
                {mainCategories.filter((c) => c.percentageDiscount > 0).length >
                  0 && (
                  <span className="mr-2 bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                    {
                      mainCategories.filter((c) => c.percentageDiscount > 0)
                        .length
                    }
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("subCategories")}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-all relative ${
                  activeTab === "subCategories"
                    ? "text-purple-700 border-b-2 border-purple-700 bg-purple-50/30"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <FaTag className="inline ml-2 h-4 w-4" />
                الفئات الفرعية
                {subCategories.filter((s) => s.percentageDiscount > 0).length >
                  0 && (
                  <span className="mr-2 bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                    {
                      subCategories.filter((s) => s.percentageDiscount > 0)
                        .length
                    }
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-all relative ${
                  activeTab === "products"
                    ? "text-purple-700 border-b-2 border-purple-700 bg-purple-50/30"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <FaBoxOpen className="inline ml-2 h-4 w-4" />
                المنتجات
                {products.filter((p) => p.discount > 0 && p.discount !== null)
                  .length > 0 && (
                  <span className="mr-2 bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                    {
                      products.filter(
                        (p) => p.discount > 0 && p.discount !== null,
                      ).length
                    }
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content - مقسم إلى قسمين */}
          <div className="p-4">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-t-4 border-purple-600 border-solid rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">جاري تحميل البيانات...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* القسم الأيمن - كل العناصر */}
                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center ml-2">
                      <FaArrowLeft className="text-white text-sm" />
                    </div>
                    <h3 className="font-bold text-gray-700">
                      {activeTab === "mainCategories" && "جميع الفئات الرئيسية"}
                      {activeTab === "subCategories" && "جميع الفئات الفرعية"}
                      {activeTab === "products" && "جميع المنتجات"}
                    </h3>
                    <span className="mr-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                      {activeTab === "mainCategories" && mainCategories.length}
                      {activeTab === "subCategories" && subCategories.length}
                      {activeTab === "products" && products.length}
                    </span>
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pl-2">
                    {activeTab === "mainCategories" &&
                      (mainCategories.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">لا توجد فئات رئيسية</p>
                        </div>
                      ) : (
                        mainCategories.map((category) =>
                          renderMainCategoryItem(category, true),
                        )
                      ))}

                    {activeTab === "subCategories" &&
                      (subCategories.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">لا توجد فئات فرعية</p>
                        </div>
                      ) : (
                        subCategories.map((subCategory) =>
                          renderSubCategoryItem(subCategory, true),
                        )
                      ))}

                    {activeTab === "products" &&
                      (products.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">لا توجد منتجات</p>
                        </div>
                      ) : (
                        products.map((product) =>
                          renderProductItem(product, true),
                        )
                      ))}
                  </div>
                </div>

                {/* القسم الأيسر - العناصر التي عليها خصم */}
                <div className="bg-purple-50/30 rounded-xl p-4 border-2 border-purple-200">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center ml-2">
                      <FaPercentage className="text-white text-sm" />
                    </div>
                    <h3 className="font-bold text-purple-700">
                      العناصر التي عليها خصم
                    </h3>
                    <span className="mr-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      {activeTab === "mainCategories" &&
                        getMainCategoriesWithDiscount().length}
                      {activeTab === "subCategories" &&
                        getSubCategoriesWithDiscount().length}
                      {activeTab === "products" &&
                        getProductsWithDiscount().length}
                    </span>
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pl-2">
                    {activeTab === "mainCategories" &&
                      (getMainCategoriesWithDiscount().length === 0 ? (
                        <div className="text-center py-8 bg-white/50 rounded-xl">
                          <div className="text-purple-300 mb-2">
                            <FaPercentage className="h-12 w-12 mx-auto opacity-50" />
                          </div>
                          <p className="text-gray-500">
                            لا توجد فئات رئيسية عليها خصم
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            اضغط على أيقونة % في القائمة على اليمين لإضافة خصم
                          </p>
                        </div>
                      ) : (
                        getMainCategoriesWithDiscount().map((category) =>
                          renderMainCategoryItem(category, false),
                        )
                      ))}

                    {activeTab === "subCategories" &&
                      (getSubCategoriesWithDiscount().length === 0 ? (
                        <div className="text-center py-8 bg-white/50 rounded-xl">
                          <div className="text-purple-300 mb-2">
                            <FaPercentage className="h-12 w-12 mx-auto opacity-50" />
                          </div>
                          <p className="text-gray-500">
                            لا توجد فئات فرعية عليها خصم
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            اضغط على أيقونة % في القائمة على اليمين لإضافة خصم
                          </p>
                        </div>
                      ) : (
                        getSubCategoriesWithDiscount().map((subCategory) =>
                          renderSubCategoryItem(subCategory, false),
                        )
                      ))}

                    {activeTab === "products" &&
                      (getProductsWithDiscount().length === 0 ? (
                        <div className="text-center py-8 bg-white/50 rounded-xl">
                          <div className="text-purple-300 mb-2">
                            <FaPercentage className="h-12 w-12 mx-auto opacity-50" />
                          </div>
                          <p className="text-gray-500">
                            لا توجد منتجات عليها خصم
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            اضغط على أيقونة % في القائمة على اليمين لإضافة خصم
                          </p>
                        </div>
                      ) : (
                        getProductsWithDiscount().map((product) =>
                          renderProductItem(product, false),
                        )
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal تعديل الخصم */}
      {editingDiscount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#6B21A8" }}
                  >
                    تعديل الخصم
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingDiscount.name}
                  </p>
                </div>
                <button
                  onClick={() => setEditingDiscount(null)}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitDiscount}>
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="number"
                      name="discountValue"
                      value={discountForm.discountValue}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("discount")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm bg-white"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      dir="ltr"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "discount" ||
                        discountForm.discountValue
                          ? "-top-2.5 text-xs text-purple-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
                      <span className="flex items-center">
                        <FaPercentage className="w-4 h-4 ml-1" />
                        نسبة الخصم (%) *
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 mr-1">
                    أدخل 0 لإلغاء الخصم
                  </p>
                </div>

                {editingDiscount.type === "product" && (
                  <div className="mb-6">
                    <label className="flex items-center cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all">
                      <input
                        type="checkbox"
                        name="isPercentage"
                        checked={discountForm.isPercentage}
                        onChange={handleFormChange}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="mr-2 text-sm font-medium text-gray-700">
                        خصم نسبة مئوية (إذا لم يتم التحديد، خصم قيمة ثابتة)
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingDiscount(null)}
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
                    style={{ backgroundColor: "#6B21A8" }}
                  >
                    <FaPercentage className="h-4 w-4 ml-2" />
                    حفظ الخصم
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
