import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import {
  ArrowLeft,
  Save,
  Building2,
  Image,
  FileText,
  MapPin,
  Phone,
  Tag,
  Mail,
  Globe,
  Award,
  Upload,
  X,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";

export default function OrganizationManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);
  const hasFetched = useRef(false);

  const [formData, setFormData] = useState({
    name: "",
    commercialRegister: "",
    taxNumber: "",
    address: "",
    primaryPhone: "",
    secondaryPhone: "",
    slogan: "",
    logoUrl: "",
  });

  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchCompanyData();
    }
  }, []);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/Organization/Get");

      if (response.status === 200 && response.data) {
        const data = response.data;
        setCompanyData(data);
        setFormData({
          name: data.name || "",
          commercialRegister: data.commercialRegister || "",
          taxNumber: data.taxNumber || "",
          address: data.address || "",
          primaryPhone: data.primaryPhone || "",
          secondaryPhone: data.secondaryPhone || "",
          slogan: data.slogan || "",
          logoUrl: data.logoUrl || "",
        });
        if (data.logoUrl) {
          const logoFullUrl = `https://cashier.runasp.net/${data.logoUrl}`;
          setLogoPreview(logoFullUrl);
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("لم يتم العثور على بيانات المؤسسة - سيتم إنشاؤها لأول مرة");
        setCompanyData(null);
      } else {
        console.error("خطأ في جلب بيانات المؤسسة:", error);
        toast.error("حدث خطأ في جلب بيانات المؤسسة");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("الرجاء اختيار ملف صورة صالح");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن لا يتجاوز 2 ميجابايت");
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    setFormData((prev) => ({ ...prev, logoUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم المؤسسة");
      return;
    }

    setIsSaving(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append("Name", formData.name);
      if (formData.slogan) submitFormData.append("Slogan", formData.slogan);
      if (formData.taxNumber)
        submitFormData.append("TaxNumber", formData.taxNumber);
      if (formData.commercialRegister)
        submitFormData.append(
          "CommercialRegister",
          formData.commercialRegister,
        );
      if (formData.primaryPhone)
        submitFormData.append("PrimaryPhone", formData.primaryPhone);
      if (formData.secondaryPhone)
        submitFormData.append("SecondaryPhone", formData.secondaryPhone);
      if (formData.address) submitFormData.append("Address", formData.address);
      if (logoFile) {
        submitFormData.append("Logo", logoFile);
      }

      let response;
      if (companyData?.id) {
        response = await axiosInstance.put(
          `/api/Organization/Update/${companyData.id}`,
          submitFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );
      } else {
        toast.error("لم يتم العثور على معرف المؤسسة. يرجى تحديث الصفحة.");
        return;
      }

      if (response.status === 200 || response.status === 201) {
        toast.success("تم تحديث بيانات المؤسسة بنجاح");
        fetchCompanyData();
      } else {
        toast.error("فشل في حفظ البيانات");
      }
    } catch (error) {
      console.error("خطأ في حفظ بيانات المؤسسة:", error);
      toast.error(error.response?.data?.message || "حدث خطأ في حفظ البيانات");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-l from-gray-50 to-gray-100"
    >
      {/* Navbar */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center ml-3">
                <Building2 className="text-white text-lg" />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "#193F94" }}>
                نظام الكاشير - إدارة المنظمة
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
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl shadow-xl p-6 mb-6 text-white">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center ml-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">بيانات المؤسسة</h2>
              <p className="text-blue-100 mt-1">
                قم بإدخال بيانات مؤسستك لتظهر في الفواتير والتقارير
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {/* Logo Upload Section */}
              <div className="mb-8 pb-6 border-b border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  شعار المؤسسة
                </label>
                <div className="flex items-center gap-6">
                  <div
                    className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-400 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="شعار المؤسسة"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-500">رفع شعار</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center"
                      >
                        <X className="w-4 h-4 ml-1" />
                        حذف الشعار
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    الصيغ المدعومة: JPG, PNG, GIF (حد أقصى 2 ميجابايت)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name - Required */}
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("name")}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                    dir="rtl"
                    required
                  />
                  <label
                    className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                      focusedField === "name" || formData.name
                        ? "-top-2.5 text-xs text-blue-500 font-medium"
                        : "top-3 text-gray-400 text-sm"
                    }`}
                  >
                    <span className="flex items-center">
                      <Building2 className="w-4 h-4 ml-1" />
                      اسم المؤسسة <span className="text-red-500 mr-1">*</span>
                    </span>
                  </label>
                </div>

                {/* Slogan */}
                <div className="relative">
                  <input
                    type="text"
                    name="slogan"
                    value={formData.slogan}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("slogan")}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                    dir="rtl"
                  />
                  <label
                    className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                      focusedField === "slogan" || formData.slogan
                        ? "-top-2.5 text-xs text-blue-500 font-medium"
                        : "top-3 text-gray-400 text-sm"
                    }`}
                  >
                    <span className="flex items-center">
                      <Award className="w-4 h-4 ml-1" />
                      شعار المؤسسة
                    </span>
                  </label>
                </div>

                {/* Tax Number */}
                <div className="relative">
                  <input
                    type="text"
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("taxNumber")}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                    dir="rtl"
                  />
                  <label
                    className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                      focusedField === "taxNumber" || formData.taxNumber
                        ? "-top-2.5 text-xs text-blue-500 font-medium"
                        : "top-3 text-gray-400 text-sm"
                    }`}
                  >
                    <span className="flex items-center">
                      <Tag className="w-4 h-4 ml-1" />
                      الرقم الضريبي
                    </span>
                  </label>
                </div>

                {/* Commercial Register */}
                <div className="relative">
                  <input
                    type="text"
                    name="commercialRegister"
                    value={formData.commercialRegister}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("commercialRegister")}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                    dir="rtl"
                  />
                  <label
                    className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                      focusedField === "commercialRegister" ||
                      formData.commercialRegister
                        ? "-top-2.5 text-xs text-blue-500 font-medium"
                        : "top-3 text-gray-400 text-sm"
                    }`}
                  >
                    <span className="flex items-center">
                      <FileText className="w-4 h-4 ml-1" />
                      رقم السجل التجاري
                    </span>
                  </label>
                </div>

                {/* Primary Phone */}
                <div className="relative">
                  <input
                    type="tel"
                    name="primaryPhone"
                    value={formData.primaryPhone}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("primaryPhone")}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                    dir="rtl"
                  />
                  <label
                    className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                      focusedField === "primaryPhone" || formData.primaryPhone
                        ? "-top-2.5 text-xs text-blue-500 font-medium"
                        : "top-3 text-gray-400 text-sm"
                    }`}
                  >
                    <span className="flex items-center">
                      <Phone className="w-4 h-4 ml-1" />
                      رقم الهاتف الأساسي
                    </span>
                  </label>
                </div>

                {/* Secondary Phone */}
                <div className="relative">
                  <input
                    type="tel"
                    name="secondaryPhone"
                    value={formData.secondaryPhone}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("secondaryPhone")}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                    dir="rtl"
                  />
                  <label
                    className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                      focusedField === "secondaryPhone" ||
                      formData.secondaryPhone
                        ? "-top-2.5 text-xs text-blue-500 font-medium"
                        : "top-3 text-gray-400 text-sm"
                    }`}
                  >
                    <span className="flex items-center">
                      <Phone className="w-4 h-4 ml-1" />
                      رقم هاتف إضافي
                    </span>
                  </label>
                </div>

                {/* Address */}
                <div className="relative md:col-span-2">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("address")}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                    dir="rtl"
                  />
                  <label
                    className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                      focusedField === "address" || formData.address
                        ? "-top-2.5 text-xs text-blue-500 font-medium"
                        : "top-3 text-gray-400 text-sm"
                    }`}
                  >
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 ml-1" />
                      عنوان المؤسسة
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="w-5 h-5 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 ml-2" />
                    حفظ البيانات
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ml-3">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-blue-800 mb-1">معلومات مهمة</h4>
              <p className="text-sm text-blue-700">
                بيانات المؤسسة التي تدخلها هنا ستظهر تلقائياً في الفواتير
                والتقارير الصادرة من النظام. تأكد من صحة البيانات قبل الحفظ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
