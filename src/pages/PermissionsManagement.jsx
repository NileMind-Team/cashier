import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function PermissionsManagement() {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // تعريف الصلاحيات مع تصنيفها وأيقونات احترافية
  const permissions = {
    categories: {
      title: "إدارة الفئات والمنتجات",
      color: "#3B82F6",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      items: [
        {
          id: "add_main_category",
          name: "إضافة فئة رئيسية",
          defaultActive: true,
        },
        {
          id: "add_sub_category",
          name: "إضافة فئة فرعية",
          defaultActive: true,
        },
        { id: "add_product", name: "إضافة منتج", defaultActive: true },
        { id: "edit_product", name: "تعديل منتج", defaultActive: true },
        { id: "delete_product", name: "حذف منتج", defaultActive: true },
        { id: "disable_product", name: "تعطيل منتج", defaultActive: true },
      ],
    },
    customers: {
      title: "إدارة العملاء",
      color: "#10B981",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      items: [
        { id: "add_customer", name: "إضافة عميل", defaultActive: true },
        { id: "edit_customer", name: "تعديل عميل", defaultActive: true },
        { id: "delete_customer", name: "حذف عميل", defaultActive: true },
        { id: "disable_customer", name: "تعطيل عميل", defaultActive: true },
      ],
    },
    shipping: {
      title: "إدارة شركات التوصيل",
      color: "#F59E0B",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
          />
        </svg>
      ),
      items: [
        { id: "add_shipping", name: "إضافة شركة توصيل", defaultActive: false },
        { id: "edit_shipping", name: "تعديل شركة توصيل", defaultActive: false },
        { id: "delete_shipping", name: "حذف شركة توصيل", defaultActive: false },
      ],
    },
    payment: {
      title: "إدارة طرق الدفع",
      color: "#8B5CF6",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      items: [
        { id: "add_payment", name: "إضافة طريقة دفع", defaultActive: false },
        { id: "delete_payment", name: "حذف طريقة دفع", defaultActive: false },
        {
          id: "disable_payment",
          name: "تعطيل طريقة دفع",
          defaultActive: false,
        },
      ],
    },
    reports: {
      title: "التقارير والإحصائيات",
      color: "#EF4444",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      items: [
        {
          id: "view_shift_reports",
          name: "عرض تقارير الورديات",
          defaultActive: false,
        },
        {
          id: "view_sales_reports",
          name: "عرض تقارير المبيعات",
          defaultActive: false,
        },
        {
          id: "view_products_reports",
          name: "عرض تقارير المنتجات",
          defaultActive: false,
        },
        {
          id: "view_customers_reports",
          name: "عرض تقارير العملاء",
          defaultActive: false,
        },
        {
          id: "view_payment_reports",
          name: "عرض تقارير طرق الدفع",
          defaultActive: false,
        },
        {
          id: "view_pending_bills",
          name: "عرض تقارير الفواتير المعلقة",
          defaultActive: false,
        },
        {
          id: "view_returns_reports",
          name: "عرض تقارير المرتجعات",
          defaultActive: false,
        },
      ],
    },
  };

  // حالة الصلاحيات الحالية
  const [permissionsState, setPermissionsState] = useState({});

  // تهيئة الصلاحيات عند تحميل المكون
  useEffect(() => {
    const initialPermissions = {};
    Object.keys(permissions).forEach((categoryKey) => {
      permissions[categoryKey].items.forEach((item) => {
        initialPermissions[item.id] = item.defaultActive;
      });
    });
    setPermissionsState(initialPermissions);

    // جلب قائمة الموظفين (محاكاة)
    fetchEmployees();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const mockEmployees = [
        {
          id: 1,
          name: "أحمد محمد",
          username: "ahmed",
          role: "employee",
          isActive: true,
        },
        {
          id: 2,
          name: "محمد علي",
          username: "mohamed",
          role: "employee",
          isActive: true,
        },
        {
          id: 3,
          name: "سارة أحمد",
          username: "sara",
          role: "employee",
          isActive: true,
        },
        {
          id: 4,
          name: "خالد حسن",
          username: "khaled",
          role: "employee",
          isActive: false,
        },
      ];
      setEmployees(mockEmployees);
    } catch (error) {
      console.error("خطأ في جلب الموظفين:", error);
      toast.error("حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  // جلب صلاحيات الموظف المحدد
  const fetchEmployeePermissions = async (employeeId) => {
    setLoading(true);
    try {
      // هذا مجرد مثال - سيتم استبداله بطلب API حقيقي
      // محاكاة جلب الصلاحيات من API
      setTimeout(() => {
        // في حالة موظف جديد، نستخدم الصلاحيات الافتراضية
        if (employeeId === 1) {
          const defaultPermissions = {};
          Object.keys(permissions).forEach((categoryKey) => {
            permissions[categoryKey].items.forEach((item) => {
              defaultPermissions[item.id] = item.defaultActive;
            });
          });
          setPermissionsState(defaultPermissions);
        } else if (employeeId === 2) {
          // صلاحيات مختلفة لمحمد علي
          setPermissionsState({
            add_main_category: true,
            add_sub_category: true,
            add_product: true,
            edit_product: true,
            delete_product: false,
            disable_product: true,
            add_customer: true,
            edit_customer: true,
            delete_customer: false,
            disable_customer: true,
            add_shipping: false,
            edit_shipping: false,
            delete_shipping: false,
            add_payment: false,
            delete_payment: false,
            disable_payment: false,
            view_shift_reports: true,
            view_sales_reports: true,
            view_products_reports: false,
            view_customers_reports: false,
            view_payment_reports: false,
            view_pending_bills: false,
            view_returns_reports: false,
          });
        }
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("خطأ في جلب الصلاحيات:", error);
      toast.error("حدث خطأ في جلب الصلاحيات");
      setLoading(false);
    }
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    fetchEmployeePermissions(employee.id);
  };

  const handlePermissionChange = (permissionId) => {
    setPermissionsState((prev) => ({
      ...prev,
      [permissionId]: !prev[permissionId],
    }));
  };

  const handleSelectAllInCategory = (categoryKey, selectAll) => {
    const newPermissions = { ...permissionsState };
    permissions[categoryKey].items.forEach((item) => {
      newPermissions[item.id] = selectAll;
    });
    setPermissionsState(newPermissions);
  };

  const handleSavePermissions = async () => {
    if (!selectedEmployee) {
      toast.error("الرجاء اختيار الموظف أولاً");
      return;
    }

    try {
      setLoading(true);
      // هنا سيتم إرسال الصلاحيات إلى API
      console.log("حفظ الصلاحيات لـ:", selectedEmployee.name, permissionsState);

      // محاكاة تأخير API
      setTimeout(() => {
        toast.success(`تم حفظ صلاحيات ${selectedEmployee.name} بنجاح`);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("خطأ في حفظ الصلاحيات:", error);
      toast.error("حدث خطأ في حفظ الصلاحيات");
      setLoading(false);
    }
  };

  const handleResetToDefault = () => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم إعادة تعيين الصلاحيات إلى الإعدادات الافتراضية",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#193F94",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، إعادة تعيين",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const defaultPermissions = {};
        Object.keys(permissions).forEach((categoryKey) => {
          permissions[categoryKey].items.forEach((item) => {
            defaultPermissions[item.id] = item.defaultActive;
          });
        });
        setPermissionsState(defaultPermissions);
        toast.info("تم إعادة تعيين الصلاحيات إلى الإعدادات الافتراضية");
      }
    });
  };

  const handleCopyPermissions = () => {
    Swal.fire({
      title: "نسخ الصلاحيات",
      html: `
        <div class="text-right">
          <p class="mb-3">اختر الموظف الذي تريد نسخ صلاحياته:</p>
          <select id="copy-employee" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            ${employees
              .filter((c) => c.id !== selectedEmployee?.id && c.isActive)
              .map((c) => `<option value="${c.id}">${c.name}</option>`)
              .join("")}
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "نسخ",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#193F94",
      reverseButtons: true,
      preConfirm: () => {
        const copyId = document.getElementById("copy-employee").value;
        return parseInt(copyId);
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const copyId = result.value;
        // هنا سيتم جلب صلاحيات الموظف المحدد
        fetchEmployeePermissions(copyId);
        toast.success("تم نسخ الصلاحيات بنجاح");
      }
    });
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
                نظام الكاشير - إدارة صلاحيات الموظفين
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
        {/* Employee Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                اختر الموظف
              </h3>
              <p className="text-sm text-gray-600">
                حدد الموظف الذي تريد تعديل صلاحياته
              </p>
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[200px]"
                value={selectedEmployee?.id || ""}
                onChange={(e) => {
                  const employee = employees.find(
                    (c) => c.id === parseInt(e.target.value),
                  );
                  handleEmployeeSelect(employee);
                }}
              >
                <option value="">اختر الموظف...</option>
                {employees
                  .filter((c) => c.isActive)
                  .map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.username})
                    </option>
                  ))}
              </select>
              {selectedEmployee && (
                <button
                  onClick={handleResetToDefault}
                  className="px-4 py-2 border border-amber-500 text-amber-500 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium"
                >
                  إعادة تعيين
                </button>
              )}
              {selectedEmployee &&
                employees.filter(
                  (c) => c.id !== selectedEmployee?.id && c.isActive,
                ).length > 0 && (
                  <button
                    onClick={handleCopyPermissions}
                    className="px-4 py-2 border border-purple-500 text-purple-500 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                  >
                    نسخ الصلاحيات
                  </button>
                )}
            </div>
          </div>

          {selectedEmployee && (
            <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center ml-3">
                  <span className="text-white font-bold text-lg">
                    {selectedEmployee.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {selectedEmployee.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    اسم المستخدم: {selectedEmployee.username} | الحالة:
                    <span
                      className={`mr-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        selectedEmployee.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedEmployee.isActive ? "نشط" : "معطل"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Permissions Sections */}
        {selectedEmployee ? (
          <div className="space-y-6">
            {Object.entries(permissions).map(([categoryKey, category]) => (
              <div
                key={categoryKey}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 hover:shadow-xl transition-all duration-300"
                style={{
                  borderTopColor: category.color,
                  borderTopWidth: "4px",
                }}
              >
                {/* Category Header */}
                <div className="px-6 py-4 bg-gradient-to-l from-gray-50 to-white border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center ml-3 text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h3
                          className="text-lg font-bold"
                          style={{ color: category.color }}
                        >
                          {category.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {category.items.length} صلاحية
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleSelectAllInCategory(categoryKey, true)
                        }
                        className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-green-200"
                      >
                        <svg
                          className="w-3 h-3 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        تحديد الكل
                      </button>
                      <button
                        onClick={() =>
                          handleSelectAllInCategory(categoryKey, false)
                        }
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-red-200"
                      >
                        <svg
                          className="w-3 h-3 ml-1"
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
                        مسح الكل
                      </button>
                    </div>
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items.map((permission) => (
                      <label
                        key={permission.id}
                        className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          permissionsState[permission.id]
                            ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100/30 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={permissionsState[permission.id] || false}
                            onChange={() =>
                              handlePermissionChange(permission.id)
                            }
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          {permission.defaultActive && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <div className="mr-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              {permission.name}
                            </span>
                            {permission.defaultActive && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mr-2">
                                افتراضي
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            permissionsState[permission.id]
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {permissionsState[permission.id] ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Save Button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={handleSavePermissions}
                disabled={loading}
                className={`px-8 py-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center shadow-lg ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{ backgroundColor: "#193F94" }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin ml-2"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    حفظ الصلاحيات
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              اختر الموظف
            </h3>
            <p className="text-gray-500 mb-6">
              قم باختيار الموظف من القائمة أعلاه لإدارة صلاحياته
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
