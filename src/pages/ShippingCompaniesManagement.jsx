import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function ShippingCompaniesManagement() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    deliveryRate: "",
    isActive: true,
  });

  const initialCompanies = [
    {
      id: 1,
      name: "أرامكس",
      phone: "19009",
      deliveryRate: 25.0,
      isActive: true,
      totalDeliveries: 1250,
    },
    {
      id: 2,
      name: "دي إتش إل",
      phone: "19006",
      deliveryRate: 30.0,
      isActive: true,
      totalDeliveries: 850,
    },
    {
      id: 3,
      name: "ماكسيم",
      phone: "19991",
      deliveryRate: 15.0,
      isActive: true,
      totalDeliveries: 3200,
    },
    {
      id: 4,
      name: "بوسطة",
      phone: "16565",
      deliveryRate: 20.0,
      isActive: true,
      totalDeliveries: 1800,
    },
    {
      id: 5,
      name: "واصل",
      phone: "16160",
      deliveryRate: 18.0,
      isActive: false,
      totalDeliveries: 950,
    },
    {
      id: 6,
      name: "شايني",
      phone: "19333",
      deliveryRate: 22.0,
      isActive: true,
      totalDeliveries: 1200,
    },
    {
      id: 7,
      name: "فلاي فاي",
      phone: "01005556677",
      deliveryRate: 35.0,
      isActive: true,
      totalDeliveries: 2800,
    },
    {
      id: 8,
      name: "كارجو",
      phone: "0223456789",
      deliveryRate: 40.0,
      isActive: true,
      totalDeliveries: 750,
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCompanies(initialCompanies);
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

  const handleAddCompany = () => {
    setShowAddModal(true);
    setEditingCompany(null);
    setFormData({
      name: "",
      phone: "",
      deliveryRate: "",
      isActive: true,
    });
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setShowAddModal(true);
    setFormData({
      name: company.name,
      phone: company.phone,
      deliveryRate: company.deliveryRate,
      isActive: company.isActive,
    });
  };

  const handleDeleteCompany = async (companyId) => {
    const company = companies.find((c) => c.id === companyId);

    const result = await Swal.fire({
      title: "هل أنت متأكد من حذف شركة التوصيل؟",
      html: `
        <div class="text-right">
          <p class="mb-3">الشركة: <strong>${company.name}</strong></p>
          <p class="mb-3">هاتف: <strong>${company.phone}</strong></p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف الشركة",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setCompanies(companies.filter((company) => company.id !== companyId));
      toast.success("تم حذف شركة التوصيل بنجاح");
    }
  };

  const handleToggleCompanyStatus = async (companyId) => {
    const company = companies.find((c) => c.id === companyId);
    const action = company.isActive ? "تعطيل" : "تفعيل";

    const result = await Swal.fire({
      title: `هل أنت متأكد من ${action} شركة التوصيل؟`,
      text: company.isActive
        ? "لن يتم استخدام هذه الشركة في التوصيل حتى يتم تفعيلها مرة أخرى."
        : "سيتم تفعيل الشركة وجعلها متاحة للاستخدام.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `نعم، ${action}`,
      cancelButtonText: "إلغاء",
      confirmButtonColor: company.isActive ? "#F59E0B" : "#10B981",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setCompanies(
        companies.map((company) =>
          company.id === companyId
            ? { ...company, isActive: !company.isActive }
            : company,
        ),
      );
      toast.success(`تم ${action} شركة التوصيل بنجاح`);
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
      toast.error("يرجى إدخال اسم الشركة");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }

    if (!formData.deliveryRate || parseFloat(formData.deliveryRate) <= 0) {
      toast.error("يرجى إدخال سعر التوصيل صحيح");
      return;
    }

    if (editingCompany) {
      const updatedCompanies = companies.map((company) =>
        company.id === editingCompany.id
          ? {
              ...company,
              name: formData.name,
              phone: formData.phone,
              deliveryRate: parseFloat(formData.deliveryRate),
              isActive: formData.isActive,
            }
          : company,
      );
      setCompanies(updatedCompanies);
      toast.success("تم تحديث بيانات الشركة بنجاح");
    } else {
      const newCompany = {
        id: companies.length + 1,
        name: formData.name,
        phone: formData.phone,
        deliveryRate: parseFloat(formData.deliveryRate),
        isActive: formData.isActive,
        totalDeliveries: 0,
      };
      setCompanies([...companies, newCompany]);
      toast.success("تم إضافة شركة التوصيل الجديدة بنجاح");
    }

    setShowAddModal(false);
    setEditingCompany(null);
  };

  const filteredCompanies = companies.filter((company) => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      company.name.toLowerCase().includes(searchLower) ||
      company.phone.includes(searchTerm)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = filteredCompanies.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const stats = {
    totalCompanies: companies.length,
    activeCompanies: companies.filter((c) => c.isActive).length,
    averageDeliveryRate:
      companies.reduce((sum, company) => sum + company.deliveryRate, 0) /
      companies.length,
    totalDeliveries: companies.reduce(
      (sum, company) => sum + company.totalDeliveries,
      0,
    ),
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
                <span className="text-white font-bold">🚚</span>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "#193F94" }}>
                نظام الكاشير - إدارة شركات التوصيل
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
                <p className="text-sm text-blue-800">إجمالي شركات التوصيل</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {stats.totalCompanies}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.activeCompanies} نشط •{" "}
                  {stats.totalCompanies - stats.activeCompanies} غير نشط
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-bold">🚚</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800">متوسط سعر التوصيل</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {formatCurrency(stats.averageDeliveryRate || 0)} ج.م
                </p>
                <p className="text-xs text-green-600 mt-1">
                  جميع شركات التوصيل
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-bold">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-800">إجمالي عمليات التوصيل</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {stats.totalDeliveries.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  جميع الشركات مجتمعة
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-purple-700 font-bold">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-800">أفضل شركة</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">
                  {companies.length > 0
                    ? companies.reduce((prev, current) =>
                        prev.totalDeliveries > current.totalDeliveries
                          ? prev
                          : current,
                      ).name
                    : "لا يوجد"}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  أعلى عدد عمليات توصيل
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                <span className="text-amber-700 font-bold">🏆</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                قائمة شركات التوصيل
              </h3>
              <p className="text-sm text-gray-600">
                إدارة شركات التوصيل في النظام - يمكنك البحث بالاسم أو رقم الهاتف
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث باسم الشركة أو رقم الهاتف..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full md:w-80 px-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-300 hover:border-blue-300 text-right"
                    dir="rtl"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </div>
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <div className="text-xs text-blue-600 mt-1 text-right">
                    {filteredCompanies.length} نتيجة للبحث: "{searchTerm}"
                  </div>
                )}
              </div>

              <button
                onClick={handleAddCompany}
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
                إضافة شركة توصيل جديدة
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">
                جاري تحميل بيانات شركات التوصيل...
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        الشركة
                      </th>
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        معلومات الاتصال
                      </th>
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        سعر التوصيل
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
                    {currentCompanies.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
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
                                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM12 8h4l2 5h2a2 2 0 012 2v3a2 2 0 01-2 2h-2.5M7 14h.01M9.5 19H7a2 2 0 01-2-2v-3a2 2 0 012-2h2.5"
                              />
                            </svg>
                            <p className="text-lg font-medium text-gray-400">
                              {searchTerm
                                ? "لا توجد نتائج للبحث"
                                : "لا يوجد شركات توصيل"}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {searchTerm
                                ? "جرب بحثاً مختلفاً أو أضف شركة توصيل جديدة"
                                : "قم بإضافة شركة توصيل جديدة لبدء العمل"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentCompanies.map((company) => (
                        <tr
                          key={company.id}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ml-3 text-blue-700 font-bold text-lg">
                                {company.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">
                                  {company.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="space-y-1">
                              <div className="text-xs text-gray-600">
                                📞 {company.phone}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">
                                  سعر التوصيل:
                                </span>
                                <span className="font-bold text-green-700 text-sm">
                                  {formatCurrency(company.deliveryRate)} ج.م
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">
                                  إجمالي الشحنات:
                                </span>
                                <span className="font-bold">
                                  {company.totalDeliveries.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full ml-2 ${
                                  company.isActive
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <span
                                className={`font-medium ${
                                  company.isActive
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {company.isActive ? "نشط" : "معطل"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => handleEditCompany(company)}
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
                                  handleToggleCompanyStatus(company.id)
                                }
                                className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border ${
                                  company.isActive
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
                                  {company.isActive ? (
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
                                {company.isActive ? "تعطيل" : "تفعيل"}
                              </button>
                              <button
                                onClick={() => handleDeleteCompany(company.id)}
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

              {filteredCompanies.length > itemsPerPage && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="text-sm text-gray-700 mb-2 md:mb-0">
                      عرض {indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, filteredCompanies.length)} من{" "}
                      {filteredCompanies.length} شركة
                      {searchTerm && (
                        <span className="text-blue-600"> (نتائج البحث)</span>
                      )}
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
                  {editingCompany
                    ? "تعديل بيانات شركة التوصيل"
                    : "إضافة شركة توصيل جديدة"}
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
                      اسم الشركة *
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
                      required
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سعر التوصيل (ج.م) *
                    </label>
                    <input
                      type="number"
                      name="deliveryRate"
                      value={formData.deliveryRate}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
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
                      الشركة نشطة (يمكن استخدامها في التوصيل)
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
                    {editingCompany ? "حفظ التعديلات" : "إضافة شركة"}
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
