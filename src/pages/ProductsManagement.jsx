import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function ProductsManagement() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    imgUrl: "",
    subCategoryId: "",
    isAvailable: true,
    valueAddedTax: null,
    isVatIncluded: true,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/Items/GetAllItems");

      if (response.status === 200 && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
        toast.info("لا يوجد منتجات في النظام");
      }
    } catch (error) {
      console.error("خطأ في جلب المنتجات:", error);
      if (error.response?.status === 404) {
        setProducts([]);
        toast.info("لا يوجد منتجات في النظام");
      } else {
        toast.error("حدث خطأ في جلب المنتجات");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMainCategories = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/MainCategories/GetAllMainCategories",
      );
      if (response.status === 200 && Array.isArray(response.data)) {
        setMainCategories(response.data);
        const activeMainCategories = response.data.filter(
          (cat) => cat.isActive,
        );
        if (activeMainCategories.length > 0 && !selectedMainCategoryId) {
          setSelectedMainCategoryId(activeMainCategories[0].id.toString());
        }
      }
    } catch (error) {
      console.error("خطأ في جلب الفئات الرئيسية:", error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/SubCategories/GetAllSubCategories",
      );
      if (response.status === 200 && Array.isArray(response.data)) {
        setSubCategories(response.data);
      }
    } catch (error) {
      console.error("خطأ في جلب الفئات الفرعية:", error);
    }
  };

  const fetchAllData = async () => {
    setCategoriesLoading(true);
    await Promise.all([
      fetchProducts(),
      fetchMainCategories(),
      fetchSubCategories(),
    ]);
    setCategoriesLoading(false);
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedMainCategoryId && !productForm.subCategoryId) {
      const filteredSubs = subCategories.filter(
        (sub) =>
          sub.mainCategoryId === parseInt(selectedMainCategoryId) &&
          sub.isActive,
      );
      if (filteredSubs.length > 0) {
        setProductForm((prev) => ({
          ...prev,
          subCategoryId: filteredSubs[0].id.toString(),
        }));
      }
    }
  }, [selectedMainCategoryId, subCategories, productForm.subCategoryId]);

  const handleAddProduct = () => {
    if (mainCategories.length === 0) {
      toast.error("يجب إضافة فئات أولاً");
      return;
    }
    setShowProductModal(true);
    setEditingProduct(null);

    const activeMainCategories = mainCategories.filter((cat) => cat.isActive);
    const defaultMainCategoryId =
      activeMainCategories.length > 0
        ? activeMainCategories[0].id.toString()
        : "";
    setSelectedMainCategoryId(defaultMainCategoryId);

    const filteredSubs = subCategories.filter(
      (sub) =>
        sub.mainCategoryId === parseInt(defaultMainCategoryId) && sub.isActive,
    );
    const defaultSubCategoryId =
      filteredSubs.length > 0 ? filteredSubs[0].id.toString() : "";

    setProductForm({
      name: "",
      price: "",
      imgUrl: "",
      subCategoryId: defaultSubCategoryId,
      isAvailable: true,
      valueAddedTax: null,
      isVatIncluded: true,
    });
    setFocusedField(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);

    setSelectedMainCategoryId(product.mainCategoryId?.toString() || "");

    setProductForm({
      name: product.name || "",
      price: product.price || "",
      imgUrl: product.imgUrl || "",
      subCategoryId: product.subCategoryId || "",
      isAvailable: product.isAvailable ?? true,
      valueAddedTax: product.valueAddedTax || null,
      isVatIncluded: product.isVatIncluded ?? true,
    });
    setFocusedField(null);
  };

  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price" ||
              name === "valueAddedTax" ||
              name === "subCategoryId"
            ? value
            : value,
    }));
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleMainCategoryChange = (e) => {
    const mainCategoryId = e.target.value;
    setSelectedMainCategoryId(mainCategoryId);

    const filteredSubs = subCategories.filter(
      (sub) => sub.mainCategoryId === parseInt(mainCategoryId) && sub.isActive,
    );
    const defaultSubCategoryId =
      filteredSubs.length > 0 ? filteredSubs[0].id.toString() : "";

    setProductForm((prev) => ({
      ...prev,
      subCategoryId: defaultSubCategoryId,
    }));
  };

  const getFilteredSubCategories = () => {
    if (!selectedMainCategoryId) return [];
    return subCategories.filter(
      (sub) =>
        sub.mainCategoryId === parseInt(selectedMainCategoryId) && sub.isActive,
    );
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    if (!productForm.name.trim()) {
      toast.error("يرجى إدخال اسم المنتج");
      return;
    }

    if (!productForm.price || parseFloat(productForm.price) <= 0) {
      toast.error("يرجى إدخال سعر صحيح للمنتج");
      return;
    }

    if (!selectedMainCategoryId) {
      toast.error("يرجى اختيار الفئة الرئيسية");
      return;
    }

    if (!productForm.subCategoryId) {
      toast.error("يرجى اختيار الفئة الفرعية");
      return;
    }

    try {
      const productData = {
        name: productForm.name,
        imgUrl: productForm.imgUrl || "",
        price: parseFloat(productForm.price),
        stockQuantity: null,
        isAvailable: productForm.isAvailable,
        valueAddedTax: parseFloat(productForm.valueAddedTax) || null,
        isVatIncluded: productForm.isVatIncluded,
        subCategoryId: parseInt(productForm.subCategoryId),
      };

      if (editingProduct) {
        const response = await axiosInstance.put(
          `/api/Items/Update/${editingProduct.id}`,
          productData,
        );

        if (response.status === 200) {
          toast.success("تم تحديث المنتج بنجاح");
          await fetchProducts();
          setShowProductModal(false);
          setEditingProduct(null);
        } else {
          toast.error("فشل في تحديث المنتج");
        }
      } else {
        const response = await axiosInstance.post(
          "/api/Items/Add",
          productData,
        );

        if (response.status === 201 || response.status === 200) {
          toast.success("تم إضافة المنتج بنجاح");
          await fetchProducts();
          setShowProductModal(false);
          setEditingProduct(null);
        } else {
          toast.error("فشل في إضافة المنتج");
        }
      }

      const activeMainCategories = mainCategories.filter((cat) => cat.isActive);
      const defaultMainCategoryId =
        activeMainCategories.length > 0
          ? activeMainCategories[0].id.toString()
          : "";
      setSelectedMainCategoryId(defaultMainCategoryId);

      const filteredSubs = subCategories.filter(
        (sub) =>
          sub.mainCategoryId === parseInt(defaultMainCategoryId) &&
          sub.isActive,
      );
      const defaultSubCategoryId =
        filteredSubs.length > 0 ? filteredSubs[0].id.toString() : "";

      setProductForm({
        name: "",
        price: "",
        imgUrl: "",
        subCategoryId: defaultSubCategoryId,
        isAvailable: true,
        valueAddedTax: null,
        isVatIncluded: true,
      });
    } catch (error) {
      console.error("خطأ في حفظ المنتج:", error);
      if (error.response?.status === 201 || error.response?.status === 200) {
        toast.success("تم حفظ المنتج بنجاح");
        await fetchProducts();
        setShowProductModal(false);
        setEditingProduct(null);
      } else {
        toast.error("حدث خطأ في حفظ المنتج");
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذا المنتج بشكل نهائي",
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
          `/api/Items/Delete/${productId}`,
        );

        if (response.status === 204 || response.status === 200) {
          toast.success("تم حذف المنتج بنجاح");
          await fetchProducts();
        } else {
          toast.error("فشل في حذف المنتج");
        }
      } catch (error) {
        console.error("خطأ في حذف المنتج:", error);
        toast.error("حدث خطأ في حذف المنتج");
      }
    }
  };

  const handleToggleProductStatus = async (productId) => {
    const product = products.find((p) => p.id === productId);
    const action = product.isAvailable ? "تعطيل" : "تفعيل";

    const result = await Swal.fire({
      title: `هل أنت متأكد من ${action} هذا المنتج؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `نعم، ${action}`,
      cancelButtonText: "إلغاء",
      confirmButtonColor: product.isAvailable ? "#f59e0b" : "#10b981",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.put(
          `/api/Items/Update/${productId}`,
          {
            ...product,
            isAvailable: !product.isAvailable,
          },
        );

        if (response.status === 200) {
          toast.success(
            `تم ${product.isAvailable ? "تعطيل" : "تفعيل"} المنتج بنجاح`,
          );
          await fetchProducts();
        } else {
          toast.error("فشل في تغيير حالة المنتج");
        }
      } catch (error) {
        console.error("خطأ في تغيير حالة المنتج:", error);
        toast.error("حدث خطأ في تغيير حالة المنتج");
      }
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-EG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.isAvailable).length,
    inactiveProducts: products.filter((p) => !p.isAvailable).length,
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
                نظام الكاشير - إدارة المنتجات
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
        {/* Professional Stats Cards with Modern Icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Total Products Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  إجمالي المنتجات
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalProducts}
                </p>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <span className="text-green-600 font-medium ml-1">
                    {stats.activeProducts} نشط
                  </span>
                  <span className="mx-1">•</span>
                  <span className="text-red-500 font-medium">
                    {stats.inactiveProducts} معطل
                  </span>
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Products Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  المنتجات النشطة
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.activeProducts}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="text-blue-600 font-medium">
                    {stats.totalProducts > 0
                      ? (
                          (stats.activeProducts / stats.totalProducts) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>{" "}
                  من إجمالي المنتجات
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                قائمة المنتجات
              </h3>
              <p className="text-sm text-gray-600">
                إدارة جميع المنتجات في النظام
              </p>
            </div>
            <button
              onClick={handleAddProduct}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center whitespace-nowrap shadow-md"
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
              إضافة منتج جديد
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading || categoriesLoading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">جاري تحميل المنتجات...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        المنتج
                      </th>
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        الفئة
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
                    {currentProducts.length === 0 ? (
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
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                            <p className="text-lg font-medium text-gray-400">
                              لا يوجد منتجات
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              قم بإضافة منتجات جديدة لبدء البيع
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center">
                              <div className="w-16 h-16 rounded-lg overflow-hidden ml-3 flex-shrink-0 border border-gray-300">
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
                                <div className="font-bold text-gray-900">
                                  {product.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-blue-700">
                                {product.mainCategoryName || "غير معروف"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {product.subCategoryName || "غير معروف"}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="text-sm">
                              <span className="font-bold text-green-700">
                                {formatCurrency(product.price)} ج.م
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full ml-2 ${
                                  product.isAvailable
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <span
                                className={`font-medium ${
                                  product.isAvailable
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {product.isAvailable ? "نشط" : "معطل"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => handleEditProduct(product)}
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
                                  handleToggleProductStatus(product.id)
                                }
                                className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border ${
                                  product.isAvailable
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
                                  {product.isAvailable ? (
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
                                {product.isAvailable ? "تعطيل" : "تفعيل"}
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
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

              {products.length > itemsPerPage && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="text-sm text-gray-700 mb-2 md:mb-0">
                      عرض {indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, products.length)} من{" "}
                      {products.length} منتج
                    </div>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1.5 rounded-lg text-sm ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"}`}
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
                              className={`px-3 py-1.5 rounded-lg text-sm ${currentPage === pageNumber ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                            >
                              {pageNumber}
                            </button>
                          );
                        },
                      )}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1.5 rounded-lg text-sm ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"}`}
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

      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#193F94" }}
                  >
                    {editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingProduct
                      ? "قم بتعديل بيانات المنتج"
                      : "أدخل بيانات المنتج الجديد"}
                  </p>
                </div>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitProduct}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleProductFormChange}
                      onFocus={() => handleFocus("name")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "name" || productForm.name
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        اسم المنتج *
                      </span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      name="price"
                      value={productForm.price}
                      onChange={handleProductFormChange}
                      onFocus={() => handleFocus("price")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      required
                      dir="ltr"
                      inputMode="numeric"
                      pattern="\d*\.?\d*"
                      onWheel={(e) => e.target.blur()}
                      style={{ MozAppearance: "textfield" }}
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "price" || productForm.price
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
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        السعر *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="url"
                      name="imgUrl"
                      value={productForm.imgUrl}
                      onChange={handleProductFormChange}
                      onFocus={() => handleFocus("imgUrl")}
                      onBlur={handleBlur}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      dir="ltr"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "imgUrl" || productForm.imgUrl
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        رابط الصورة
                      </span>
                    </label>
                  </div>
                  {productForm.imgUrl && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">
                        معاينة الصورة:
                      </div>
                      <img
                        src={productForm.imgUrl}
                        alt="معاينة"
                        className="w-20 h-20 rounded-lg object-cover border border-gray-300"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop&crop=center";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <select
                      value={selectedMainCategoryId}
                      onChange={handleMainCategoryChange}
                      onFocus={() => handleFocus("mainCategory")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white appearance-none"
                      required
                    >
                      {mainCategories
                        .filter((cat) => cat.isActive)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "mainCategory" ||
                        selectedMainCategoryId
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

                  <div className="relative">
                    <select
                      name="subCategoryId"
                      value={productForm.subCategoryId}
                      onChange={handleProductFormChange}
                      onFocus={() => handleFocus("subCategory")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white appearance-none"
                      required
                      disabled={
                        !selectedMainCategoryId ||
                        getFilteredSubCategories().length === 0
                      }
                    >
                      {getFilteredSubCategories().map((subCategory) => (
                        <option key={subCategory.id} value={subCategory.id}>
                          {subCategory.name}
                        </option>
                      ))}
                    </select>
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "subCategory" ||
                        productForm.subCategoryId
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
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                          />
                        </svg>
                        الفئة الفرعية *
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

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
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
                      {editingProduct ? (
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
                    {editingProduct ? "حفظ التعديلات" : "إضافة منتج"}
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
