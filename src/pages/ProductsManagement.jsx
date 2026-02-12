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

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    imgUrl: "",
    subCategoryId: "",
    isAvailable: true,
    valueAddedTax: 1,
    isVatIncluded: true,
    discountValue: null,
    isPercentage: true,
  });

  // Fetch all products
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

  // Fetch main categories
  const fetchMainCategories = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/MainCategories/GetAllMainCategories",
      );
      if (response.status === 200 && Array.isArray(response.data)) {
        setMainCategories(response.data);
      }
    } catch (error) {
      console.error("خطأ في جلب الفئات الرئيسية:", error);
    }
  };

  // Fetch sub categories
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

  // Fetch all initial data
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

  const handleAddProduct = () => {
    if (mainCategories.length === 0) {
      toast.error("يجب إضافة فئات أولاً");
      return;
    }
    setShowProductModal(true);
    setEditingProduct(null);
    setSelectedMainCategoryId("");
    setProductForm({
      name: "",
      price: "",
      imgUrl: "",
      subCategoryId: "",
      isAvailable: true,
      valueAddedTax: 1,
      isVatIncluded: true,
      discountValue: null,
      isPercentage: true,
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);

    const subCategory = subCategories.find(
      (sub) => sub.id === product.subCategoryId,
    );
    setSelectedMainCategoryId(subCategory?.mainCategoryId?.toString() || "");

    setProductForm({
      name: product.name || "",
      price: product.price || "",
      imgUrl: product.imgUrl || "",
      subCategoryId: product.subCategoryId || "",
      isAvailable: product.isAvailable ?? true,
      valueAddedTax: product.valueAddedTax || 1,
      isVatIncluded: product.isVatIncluded ?? true,
      discountValue: product.discountValue || null,
      isPercentage: product.isPercentage ?? true,
    });
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
            ? parseFloat(value) || ""
            : value,
    }));
  };

  const handleMainCategoryChange = (e) => {
    const mainCategoryId = e.target.value;
    setSelectedMainCategoryId(mainCategoryId);
    setProductForm((prev) => ({
      ...prev,
      subCategoryId: "",
    }));
  };

  const getFilteredSubCategories = () => {
    if (!selectedMainCategoryId) return [];
    return subCategories.filter(
      (sub) =>
        sub.mainCategoryId === parseInt(selectedMainCategoryId) && sub.isActive,
    );
  };

  const getMainCategoryName = (subCategoryId) => {
    const subCategory = subCategories.find((sub) => sub.id === subCategoryId);
    if (!subCategory) return "غير معروف";
    const mainCategory = mainCategories.find(
      (cat) => cat.id === subCategory.mainCategoryId,
    );
    return mainCategory ? mainCategory.name : "غير معروف";
  };

  const getSubCategoryName = (subCategoryId) => {
    const subCategory = subCategories.find((sub) => sub.id === subCategoryId);
    return subCategory ? subCategory.name : "غير معروف";
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
        discountValue: productForm.discountValue,
        isPercentage: productForm.isPercentage,
        stockQuantity: null,
        isAvailable: productForm.isAvailable,
        valueAddedTax: parseFloat(productForm.valueAddedTax) || 1,
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

      setProductForm({
        name: "",
        price: "",
        imgUrl: "",
        subCategoryId: "",
        isAvailable: true,
        valueAddedTax: 1,
        isVatIncluded: true,
        discountValue: null,
        isPercentage: true,
      });
      setSelectedMainCategoryId("");
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {stats.totalProducts}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.activeProducts} نشط • {stats.inactiveProducts} معطل
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-bold">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800">المنتجات النشطة</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {stats.activeProducts}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.totalProducts > 0
                    ? (
                        (stats.activeProducts / stats.totalProducts) *
                        100
                      ).toFixed(1)
                    : 0}
                  % من إجمالي المنتجات
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-bold">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-800">القيمة الإجمالية</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {formatCurrency(
                    products.reduce((sum, prod) => sum + (prod.price || 0), 0),
                  )}{" "}
                  ج.م
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-purple-700 font-bold">💰</span>
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors flex items-center whitespace-nowrap"
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
                              <div className="text-sm font-medium">
                                {getMainCategoryName(product.subCategoryId)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {getSubCategoryName(product.subCategoryId)}
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold" style={{ color: "#193F94" }}>
                  {editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitProduct}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المنتج *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleProductFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      السعر *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleProductFormChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رابط الصورة
                  </label>
                  <input
                    type="url"
                    name="imgUrl"
                    value={productForm.imgUrl}
                    onChange={handleProductFormChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الفئة الرئيسية *
                    </label>
                    <select
                      value={selectedMainCategoryId}
                      onChange={handleMainCategoryChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    >
                      <option value="">اختر الفئة الرئيسية</option>
                      {mainCategories
                        .filter((cat) => cat.isActive)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الفئة الفرعية *
                    </label>
                    <select
                      name="subCategoryId"
                      value={productForm.subCategoryId}
                      onChange={handleProductFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                      disabled={!selectedMainCategoryId}
                    >
                      <option value="">
                        {selectedMainCategoryId
                          ? "اختر الفئة الفرعية"
                          : "الرجاء اختيار الفئة الرئيسية أولاً"}
                      </option>
                      {getFilteredSubCategories().map((subCategory) => (
                        <option key={subCategory.id} value={subCategory.id}>
                          {subCategory.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ضريبة القيمة المضافة (%)
                    </label>
                    <input
                      type="number"
                      name="valueAddedTax"
                      value={productForm.valueAddedTax}
                      onChange={handleProductFormChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      قيمة الخصم
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={productForm.discountValue || ""}
                      onChange={handleProductFormChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={productForm.isAvailable}
                        onChange={handleProductFormChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="mr-2 text-sm font-medium text-gray-700">
                        المنتج متاح
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isVatIncluded"
                        checked={productForm.isVatIncluded}
                        onChange={handleProductFormChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="mr-2 text-sm font-medium text-gray-700">
                        الضريبة مضمنة في السعر
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isPercentage"
                        checked={productForm.isPercentage}
                        onChange={handleProductFormChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="mr-2 text-sm font-medium text-gray-700">
                        خصم نسبة مئوية
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 py-3 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-lg font-bold text-white transition-colors"
                    style={{ backgroundColor: "#193F94" }}
                  >
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
