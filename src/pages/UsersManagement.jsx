import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function UsersManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    email: "",
    phone: "",
    role: "cashier",
    permissions: [],
    isActive: true,
    joinDate: new Date().toISOString().split("T")[0],
  });

  const permissionsList = [
    {
      id: "sales",
      name: "إدارة المبيعات",
      description: "الوصول لشاشة المبيعات وإتمام الفواتير",
    },
    {
      id: "reports",
      name: "عرض التقارير",
      description: "عرض جميع تقارير النظام",
    },
    {
      id: "products",
      name: "إدارة المنتجات",
      description: "إضافة وتعديل المنتجات",
    },
    {
      id: "customers",
      name: "إدارة العملاء",
      description: "إدارة بيانات العملاء",
    },
    {
      id: "inventory",
      name: "إدارة المخزون",
      description: "مراقبة وتعديل المخزون",
    },
    {
      id: "users",
      name: "إدارة المستخدمين",
      description: "إدارة حسابات الموظفين",
    },
    {
      id: "settings",
      name: "إعدادات النظام",
      description: "تعديل إعدادات النظام",
    },
    {
      id: "finance",
      name: "الشؤون المالية",
      description: "الوصول للبيانات المالية",
    },
  ];

  const rolesList = [
    { id: "admin", name: "مدير النظام", description: "صلاحيات كاملة" },
    { id: "cashier", name: "كاشير", description: "صلاحيات بيع أساسية" },
  ];

  const initialUsers = [
    {
      id: 1,
      username: "admin",
      password: "admin123",
      fullName: "أحمد محمد",
      email: "admin@example.com",
      phone: "01012345678",
      role: "admin",
      permissions: [
        "sales",
        "reports",
        "products",
        "customers",
        "inventory",
        "users",
        "settings",
        "finance",
      ],
      isActive: true,
      lastLogin: "2026-01-15 14:30",
      joinDate: "2026-01-01",
      shiftsCount: 42,
      totalSales: 125000.75,
    },
    {
      id: 2,
      username: "cashier1",
      password: "cashier123",
      fullName: "سارة علي",
      email: "sara@example.com",
      phone: "01123456789",
      role: "cashier",
      permissions: ["sales", "products"],
      isActive: true,
      lastLogin: "2026-01-16 09:15",
      joinDate: "2026-01-10",
      shiftsCount: 12,
      totalSales: 45000.25,
    },
    {
      id: 3,
      username: "cashier2",
      password: "cashier456",
      fullName: "محمد خالد",
      email: "mohamed@example.com",
      phone: "01234567890",
      role: "cashier",
      permissions: ["sales"],
      isActive: true,
      lastLogin: "2026-01-15 16:45",
      joinDate: "2026-01-05",
      shiftsCount: 8,
      totalSales: 32000.5,
    },
    {
      id: 4,
      username: "cashier3",
      password: "cashier789",
      fullName: "فاطمة أحمد",
      email: "fatma@example.com",
      phone: "01098765432",
      role: "cashier",
      permissions: ["sales", "products"],
      isActive: false,
      lastLogin: "2026-01-10 14:15",
      joinDate: "2026-01-12",
      shiftsCount: 3,
      totalSales: 9500.75,
    },
    {
      id: 5,
      username: "cashier4",
      password: "cashier000",
      fullName: "علي حسن",
      email: "ali@example.com",
      phone: "01187654321",
      role: "cashier",
      permissions: ["sales", "reports"],
      isActive: true,
      lastLogin: "2026-01-14 11:30",
      joinDate: "2026-01-03",
      shiftsCount: 15,
      totalSales: 42000.5,
    },
    {
      id: 6,
      username: "cashier5",
      password: "cashier111",
      fullName: "ريم سعد",
      email: "reem@example.com",
      phone: "01276543210",
      role: "cashier",
      permissions: ["sales"],
      isActive: true,
      lastLogin: "2026-01-16 10:20",
      joinDate: "2026-01-08",
      shiftsCount: 18,
      totalSales: 28000.0,
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUsers(initialUsers);
      setLoading(false);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRoleInfo = (roleId) => {
    const role = rolesList.find((r) => r.id === roleId);
    return role || { name: "غير محدد", description: "دور غير معروف" };
  };

  const getRoleColor = (roleId) => {
    const colors = {
      admin: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
      },
      cashier: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
      },
    };
    return (
      colors[roleId] || {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-200",
      }
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-EG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatArabicDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAddUser = () => {
    setShowAddModal(true);
    setEditingUser(null);
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      phone: "",
      role: "cashier",
      permissions: ["sales"],
      isActive: true,
      joinDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowAddModal(true);
    setFormData({
      username: user.username,
      password: user.password,
      confirmPassword: user.password,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: [...user.permissions],
      isActive: user.isActive,
      joinDate: user.joinDate,
    });
  };

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذا المستخدم بشكل نهائي ولن يمكن استرجاع بياناته.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setUsers(users.filter((user) => user.id !== userId));
      toast.success("تم حذف المستخدم بنجاح");
    }
  };

  const handleToggleUserStatus = async (userId) => {
    const user = users.find((u) => u.id === userId);
    const action = user.isActive ? "تعطيل" : "تفعيل";

    const result = await Swal.fire({
      title: `هل أنت متأكد من ${action} هذا المستخدم؟`,
      text: user.isActive
        ? "لن يتمكن المستخدم من الدخول للنظام حتى يتم تفعيله مرة أخرى."
        : "سيتمكن المستخدم من الدخول للنظام واستخدام صلاحياته.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `نعم، ${action}`,
      cancelButtonText: "إلغاء",
      confirmButtonColor: user.isActive ? "#F59E0B" : "#10B981",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, isActive: !user.isActive } : user,
        ),
      );
      toast.success(`تم ${action} المستخدم بنجاح`);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePermissionChange = (permissionId, isChecked) => {
    if (isChecked) {
      setFormData((prev) => ({
        ...prev,
        permissions: [...prev.permissions, permissionId],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => p !== permissionId),
      }));
    }
  };

  const handleRoleChange = (roleId) => {
    let defaultPermissions = [];

    switch (roleId) {
      case "admin":
        defaultPermissions = permissionsList.map((p) => p.id);
        break;
      case "cashier":
        defaultPermissions = ["sales", "products"];
        break;
      default:
        defaultPermissions = ["sales"];
    }

    setFormData((prev) => ({
      ...prev,
      role: roleId,
      permissions: defaultPermissions,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error("يرجى إدخال اسم المستخدم");
      return;
    }

    if (!formData.password) {
      toast.error("يرجى إدخال كلمة المرور");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (!formData.fullName.trim()) {
      toast.error("يرجى إدخال الاسم الكامل");
      return;
    }

    if (editingUser) {
      const updatedUsers = users.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              username: formData.username,
              password: formData.password,
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              role: formData.role,
              permissions: formData.permissions,
              isActive: formData.isActive,
            }
          : user,
      );
      setUsers(updatedUsers);
      toast.success("تم تحديث بيانات المستخدم بنجاح");
    } else {
      const newUser = {
        id: users.length + 1,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        permissions: formData.permissions,
        isActive: formData.isActive,
        lastLogin: "-",
        joinDate: formData.joinDate,
        shiftsCount: 0,
        totalSales: 0,
      };
      setUsers([...users, newUser]);
      toast.success("تم إضافة المستخدم الجديد بنجاح");
    }

    setShowAddModal(false);
    setEditingUser(null);
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      phone: "",
      role: "cashier",
      permissions: ["sales"],
      isActive: true,
      joinDate: new Date().toISOString().split("T")[0],
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleResetPassword = async (userId) => {
    const result = await Swal.fire({
      title: "إعادة تعيين كلمة المرور",
      input: "password",
      inputLabel: "كلمة المرور الجديدة",
      inputPlaceholder: "أدخل كلمة المرور الجديدة",
      showCancelButton: true,
      confirmButtonText: "تعيين",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#193F94",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value) {
          return "يرجى إدخال كلمة المرور!";
        }
        if (value.length < 6) {
          return "كلمة المرور يجب أن تكون 6 أحرف على الأقل!";
        }
      },
    });

    if (result.isConfirmed) {
      const newPassword = result.value;
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, password: newPassword } : user,
        ),
      );
      toast.success("تم تعيين كلمة المرور الجديدة بنجاح");
    }
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.isActive).length,
    inactiveUsers: users.filter((u) => !u.isActive).length,
    totalShifts: users.reduce((sum, user) => sum + user.shiftsCount, 0),
    totalSales: users.reduce((sum, user) => sum + user.totalSales, 0),
    roleDistribution: users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {}),
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
                نظام الكاشير - إدارة المستخدمين
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
                <p className="text-sm text-blue-800">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {stats.totalUsers}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.activeUsers} نشط • {stats.inactiveUsers} غير نشط
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-bold">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800">المستخدمين النشطين</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {stats.activeUsers}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
                  من إجمالي المستخدمين
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
                <p className="text-sm text-purple-800">إجمالي الورديات</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {stats.totalShifts}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {stats.totalUsers > 0
                    ? (stats.totalShifts / stats.totalUsers).toFixed(1)
                    : 0}{" "}
                  وردية/مستخدم
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-purple-700 font-bold">🕒</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-800">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">
                  {formatCurrency(stats.totalSales)} ج.م
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {stats.totalUsers > 0
                    ? formatCurrency(stats.totalSales / stats.totalUsers)
                    : 0}{" "}
                  ج.م/مستخدم
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                <span className="text-amber-700 font-bold">💰</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                قائمة المستخدمين
              </h3>
              <p className="text-sm text-gray-600">
                إدارة حسابات المستخدمين في النظام
              </p>
            </div>
            <button
              onClick={handleAddUser}
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
              إضافة مستخدم جديد
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">جاري تحميل بيانات المستخدمين...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        المستخدم
                      </th>
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        الدور
                      </th>
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        الحالة
                      </th>
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        آخر دخول
                      </th>
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        الإحصائيات
                      </th>
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.length === 0 ? (
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
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0h-6m3.5 0a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z"
                              />
                            </svg>
                            <p className="text-lg font-medium text-gray-400">
                              لا يوجد مستخدمين
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              قم بإضافة مستخدم جديد لبدء العمل
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentUsers.map((user) => {
                        const roleInfo = getRoleInfo(user.role);
                        const roleColor = getRoleColor(user.role);

                        return (
                          <tr
                            key={user.id}
                            className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                          >
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ml-3 ${roleColor.bg} ${roleColor.text}`}
                                >
                                  <span className="font-bold text-lg">
                                    {user.fullName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900">
                                    {user.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.username}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {user.email}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {user.phone}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div
                                className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center ${roleColor.bg} ${roleColor.text} ${roleColor.border} border`}
                              >
                                <span className="ml-1">{roleInfo.name}</span>
                                <div className="w-2 h-2 rounded-full bg-current ml-1 opacity-70"></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {roleInfo.description}
                              </p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center">
                                <div
                                  className={`w-3 h-3 rounded-full ml-2 ${user.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                                ></div>
                                <span
                                  className={`font-medium ${user.isActive ? "text-green-700" : "text-red-700"}`}
                                >
                                  {user.isActive ? "نشط" : "معطل"}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                تاريخ الانضمام:{" "}
                                {formatArabicDate(user.joinDate)}
                              </p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="text-sm">
                                {user.lastLogin === "-"
                                  ? "لم يدخل بعد"
                                  : formatDate(user.lastLogin)}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {user.shiftsCount} وردية
                              </p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">
                                    الفواتير:
                                  </span>
                                  <span className="font-medium">
                                    {user.shiftsCount}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">
                                    المبيعات:
                                  </span>
                                  <span className="font-medium text-green-700">
                                    {formatCurrency(user.totalSales)} ج.م
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">
                                    الصلاحيات:
                                  </span>
                                  <span className="font-medium text-blue-700">
                                    {user.permissions.length}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex flex-col space-y-2">
                                <button
                                  onClick={() => handleEditUser(user)}
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
                                    handleToggleUserStatus(user.id)
                                  }
                                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border ${user.isActive ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200" : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"}`}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3 ml-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    {user.isActive ? (
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
                                  {user.isActive ? "تعطيل" : "تفعيل"}
                                </button>
                                <button
                                  onClick={() => handleResetPassword(user.id)}
                                  className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border border-gray-300"
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
                                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                  </svg>
                                  إعادة كلمة المرور
                                </button>
                                {user.username !== "admin" && (
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
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
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {users.length > itemsPerPage && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="text-sm text-gray-700 mb-2 md:mb-0">
                      عرض {indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, users.length)} من{" "}
                      {users.length} مستخدم
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold" style={{ color: "#193F94" }}>
                  {editingUser ? "تعديل بيانات المستخدم" : "إضافة مستخدم جديد"}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المستخدم *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      كلمة المرور *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تأكيد كلمة المرور *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    الدور *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {rolesList.map((role) => (
                      <div
                        key={role.id}
                        onClick={() => handleRoleChange(role.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.role === role.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div className="flex items-center mb-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ml-2 ${getRoleColor(role.id).bg} ${getRoleColor(role.id).text}`}
                          >
                            <span className="font-bold">
                              {role.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium">{role.name}</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {role.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    الصلاحيات
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {permissionsList.map((permission) => (
                        <div key={permission.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`permission-${permission.id}`}
                            checked={formData.permissions.includes(
                              permission.id,
                            )}
                            onChange={(e) =>
                              handlePermissionChange(
                                permission.id,
                                e.target.checked,
                              )
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`permission-${permission.id}`}
                            className="mr-2 text-sm text-gray-700 cursor-pointer"
                          >
                            <div className="font-medium">{permission.name}</div>
                            <div className="text-xs text-gray-500">
                              {permission.description}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
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
                      حساب نشط (يمكن للمستخدم الدخول للنظام)
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
                    {editingUser ? "حفظ التعديلات" : "إضافة مستخدم"}
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
