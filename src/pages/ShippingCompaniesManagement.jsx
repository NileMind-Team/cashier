import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function ShippingCompaniesManagement() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const hasFetched = useRef(false);

  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    averageDeliveryPrice: 0,
    totalShipments: 0,
    bestCompanyName: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    imgUrl: "",
    deliveryCost: "",
    contactNumber: "",
    websiteUrl: "",
    commercialRegistrationNumber: "",
    taxRegisterNumber: "",
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/DeliveryCompany/GetAll");

      if (response.status === 200 && Array.isArray(response.data)) {
        const formattedCompanies = response.data.map((company) => ({
          id: company.id,
          name: company.name || "",
          phone: company.contactNumber || "",
          deliveryRate: company.deliveryCost || 0,
          isActive: company.isActive || false,
          totalDeliveries: 0,
          imgUrl: company.imgUrl || "",
          websiteUrl: company.websiteUrl || "",
          commercialRegistrationNumber:
            company.commercialRegistrationNumber || "",
          taxRegisterNumber: company.taxRegisterNumber || "",
        }));
        setCompanies(formattedCompanies);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error("خطأ في جلب شركات التوصيل:", error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/DeliveryCompany/GetStatistics/stats",
      );

      if (response.status === 200) {
        setStats({
          totalCompanies: response.data.totalCompanies || 0,
          activeCompanies: response.data.activeCompanies || 0,
          averageDeliveryPrice: response.data.averageDeliveryPrice || 0,
          totalShipments: response.data.totalShipments || 0,
          bestCompanyName: response.data.bestCompanyName || "لا يوجد",
        });
      }
    } catch (error) {
      console.error("خطأ في جلب الإحصائيات:", error);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchCompanies();
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

  const handleAddCompany = () => {
    setShowAddModal(true);
    setEditingCompany(null);
    setFormData({
      name: "",
      imgUrl: "",
      deliveryCost: "",
      contactNumber: "",
      websiteUrl: "",
      commercialRegistrationNumber: "",
      taxRegisterNumber: "",
    });
    setFocusedField(null);
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setShowAddModal(true);
    setFormData({
      name: company.name || "",
      imgUrl: company.imgUrl || "",
      deliveryCost: company.deliveryRate || "",
      contactNumber: company.phone || "",
      websiteUrl: company.websiteUrl || "",
      commercialRegistrationNumber: company.commercialRegistrationNumber || "",
      taxRegisterNumber: company.taxRegisterNumber || "",
    });
    setFocusedField(null);
  };

  const handleDeleteCompany = async (companyId) => {
    const company = companies.find((c) => c.id === companyId);

    const result = await Swal.fire({
      title: "هل أنت متأكد من حذف شركة التوصيل؟",
      html: `
        <div class="text-right">
          <p class="mb-3">الشركة: <strong>${company?.name}</strong></p>
          <p class="mb-3">هاتف: <strong>${company?.phone}</strong></p>
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
      try {
        const response = await axiosInstance.delete(
          `/api/DeliveryCompany/Delete/${companyId}`,
        );

        if (response.status === 200 || response.status === 204) {
          setCompanies(companies.filter((company) => company.id !== companyId));
          toast.success("تم حذف شركة التوصيل بنجاح");
          fetchStatistics();
        } else {
          toast.error("فشل في حذف شركة التوصيل");
        }
      } catch (error) {
        console.error("خطأ في حذف شركة التوصيل:", error);
        toast.error("حدث خطأ في حذف شركة التوصيل");
      }
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
      try {
        const response = await axiosInstance.patch(
          `/api/DeliveryCompany/ToggleActivation/${companyId}/toggle`,
        );

        if (response.status === 200) {
          setCompanies(
            companies.map((company) =>
              company.id === companyId
                ? { ...company, isActive: !company.isActive }
                : company,
            ),
          );
          toast.success(`تم ${action} شركة التوصيل بنجاح`);
          fetchStatistics();
        } else {
          toast.error(`فشل في ${action} شركة التوصيل`);
        }
      } catch (error) {
        console.error(`خطأ في ${action} شركة التوصيل:`, error);
        toast.error(`حدث خطأ في ${action} شركة التوصيل`);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "deliveryCost"
          ? value === ""
            ? ""
            : parseFloat(value)
          : value,
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
      toast.error("يرجى إدخال اسم الشركة");
      return;
    }

    if (!formData.contactNumber.trim()) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }

    try {
      const companyData = {
        name: formData.name,
        imgUrl: formData.imgUrl || null,
        deliveryCost: formData.deliveryCost
          ? parseFloat(formData.deliveryCost)
          : 0,
        contactNumber: formData.contactNumber,
        websiteUrl: formData.websiteUrl || null,
        commercialRegistrationNumber:
          formData.commercialRegistrationNumber || null,
        taxRegisterNumber: formData.taxRegisterNumber || null,
      };

      if (editingCompany) {
        const response = await axiosInstance.put(
          `/api/DeliveryCompany/Update/${editingCompany.id}`,
          companyData,
        );

        if (response.status === 200) {
          setCompanies(
            companies.map((company) =>
              company.id === editingCompany.id
                ? {
                    ...company,
                    name: formData.name,
                    phone: formData.contactNumber,
                    deliveryRate: formData.deliveryCost
                      ? parseFloat(formData.deliveryCost)
                      : 0,
                    imgUrl: formData.imgUrl,
                    websiteUrl: formData.websiteUrl,
                    commercialRegistrationNumber:
                      formData.commercialRegistrationNumber,
                    taxRegisterNumber: formData.taxRegisterNumber,
                  }
                : company,
            ),
          );
          toast.success("تم تحديث بيانات الشركة بنجاح");
        } else {
          toast.error("فشل في تحديث بيانات الشركة");
        }
      } else {
        const response = await axiosInstance.post(
          "/api/DeliveryCompany/Add",
          companyData,
        );

        if (response.status === 201 || response.status === 200) {
          const newCompany = {
            id: response.data.id || Date.now(),
            name: formData.name,
            phone: formData.contactNumber,
            deliveryRate: formData.deliveryCost
              ? parseFloat(formData.deliveryCost)
              : 0,
            isActive: true,
            totalDeliveries: 0,
            imgUrl: formData.imgUrl,
            websiteUrl: formData.websiteUrl,
            commercialRegistrationNumber: formData.commercialRegistrationNumber,
            taxRegisterNumber: formData.taxRegisterNumber,
          };
          setCompanies([...companies, newCompany]);
          toast.success("تم إضافة شركة التوصيل الجديدة بنجاح");
        } else {
          toast.error("فشل في إضافة الشركة");
        }
      }

      fetchStatistics();
      setShowAddModal(false);
      setEditingCompany(null);
    } catch (error) {
      console.error("خطأ في حفظ شركة التوصيل:", error);
      toast.error("حدث خطأ في حفظ شركة التوصيل");
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
        {/* Professional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Companies Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  إجمالي شركات التوصيل
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalCompanies}
                </p>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <span className="text-green-600 font-medium ml-1">
                    {stats.activeCompanies} نشط
                  </span>
                  <span className="mx-1">•</span>
                  <span className="text-red-500 font-medium">
                    {stats.totalCompanies - stats.activeCompanies} غير نشط
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
                    d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM12 8h4l2 5h2a2 2 0 012 2v3a2 2 0 01-2 2h-2.5M7 14h.01M9.5 19H7a2 2 0 01-2-2v-3a2 2 0 012-2h2.5"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  الشركات النشطة
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.activeCompanies}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="text-blue-600 font-medium">
                    {stats.totalCompanies > 0
                      ? (
                          (stats.activeCompanies / stats.totalCompanies) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>{" "}
                  من إجمالي الشركات
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

          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  الشركات الغير نشطة
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalCompanies - stats.activeCompanies}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="text-red-600 font-medium">
                    {stats.totalCompanies > 0
                      ? (
                          ((stats.totalCompanies - stats.activeCompanies) /
                            stats.totalCompanies) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>{" "}
                  من إجمالي الشركات
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
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
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Shipments Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  إجمالي عمليات التوصيل
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalShipments.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  جميع الشركات مجتمعة
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                قائمة شركات التوصيل
              </h3>
              <p className="text-sm text-gray-600">
                إدارة شركات التوصيل في النظام
              </p>
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

        {/* Companies Table */}
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
                    {companies.length === 0 ? (
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
                              لا يوجد شركات توصيل
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              قم بإضافة شركة توصيل جديدة لبدء العمل
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      companies.map((company) => (
                        <tr
                          key={company.id}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center">
                              {company.imgUrl ? (
                                <div className="w-12 h-12 rounded-full overflow-hidden ml-3 flex-shrink-0 border-2 border-gray-200">
                                  <img
                                    src={company.imgUrl}
                                    alt={company.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = "none";
                                      e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-lg">${company.name?.charAt(0) || "?"}</div>`;
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center ml-3 text-blue-700 font-bold text-lg border-2 border-blue-200">
                                  {company.name?.charAt(0) || "?"}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-gray-900">
                                  {company.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="space-y-1">
                              <div className="text-sm text-gray-800 flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 ml-1 text-gray-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  />
                                </svg>
                                {company.phone || "لا يوجد"}
                              </div>
                              {company.websiteUrl && (
                                <div className="text-sm text-gray-800 flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 ml-1 text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
                                    />
                                  </svg>
                                  {company.websiteUrl}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-green-700">
                                  {formatCurrency(company.deliveryRate)} ج.م
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="space-y-1">
                              <div className="text-sm text-gray-800">
                                إجمالي الشحنات:{" "}
                                {company.totalDeliveries?.toLocaleString() || 0}
                              </div>
                              {company.commercialRegistrationNumber && (
                                <div className="text-xs text-gray-500">
                                  سجل تجاري:{" "}
                                  {company.commercialRegistrationNumber}
                                </div>
                              )}
                              {company.taxRegisterNumber && (
                                <div className="text-xs text-gray-500">
                                  الرقم الضريبي: {company.taxRegisterNumber}
                                </div>
                              )}
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
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Company Modal */}
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
                    {editingCompany
                      ? "تعديل بيانات شركة التوصيل"
                      : "إضافة شركة توصيل جديدة"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingCompany
                      ? "قم بتعديل بيانات شركة التوصيل"
                      : "أدخل بيانات شركة التوصيل الجديدة"}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        اسم الشركة *
                      </span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("contactNumber")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "contactNumber" ||
                        formData.contactNumber
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        رقم الهاتف *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <input
                      type="number"
                      name="deliveryCost"
                      value={formData.deliveryCost}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("deliveryCost")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      dir="rtl"
                      min="0"
                      step="0.01"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "deliveryCost" || formData.deliveryCost
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
                        سعر التوصيل (ج.م)
                      </span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="url"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("websiteUrl")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      dir="ltr"
                      placeholder="https://example.com"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "websiteUrl" || formData.websiteUrl
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
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
                          />
                        </svg>
                        الموقع الإلكتروني
                      </span>
                    </label>
                  </div>
                </div>

                {/* Image URL Field - Full Width with Preview */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="url"
                      name="imgUrl"
                      value={formData.imgUrl}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("imgUrl")}
                      onBlur={handleBlur}
                      placeholder="https://example.com/logo.jpg"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      dir="ltr"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "imgUrl" || formData.imgUrl
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
                  {formData.imgUrl && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">
                        معاينة الصورة:
                      </div>
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                        <img
                          src={formData.imgUrl}
                          alt="معاينة"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML =
                              '<div class="w-full h-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-lg">?</div>';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      name="commercialRegistrationNumber"
                      value={formData.commercialRegistrationNumber}
                      onChange={handleFormChange}
                      onFocus={() =>
                        handleFocus("commercialRegistrationNumber")
                      }
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "commercialRegistrationNumber" ||
                        formData.commercialRegistrationNumber
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        رقم السجل التجاري
                      </span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      name="taxRegisterNumber"
                      value={formData.taxRegisterNumber}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("taxRegisterNumber")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "taxRegisterNumber" ||
                        formData.taxRegisterNumber
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
                            d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                          />
                        </svg>
                        الرقم الضريبي
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
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
                      {editingCompany ? (
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
