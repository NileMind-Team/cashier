import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function UsersManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [currentEmployee, setCurrentEmployee] = useState(null);

  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    confirmPassword: "",
    role: "Cashier",
    roles: ["Cashier"],
  });

  const rolesList = [
    { id: "Admin", name: "مدير النظام" },
    { id: "Cashier", name: "كاشير" },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/Users/GetAll");
      if (response.status === 200 && response.data.isSuccess) {
        const formattedUsers = response.data.value.map((user) => ({
          id: user.id,
          username: user.userName,
          role: user.roles?.[0] || "Cashier",
          isActive: true,
        }));
        setUsers(formattedUsers);

        if (formattedUsers.length > 0) {
          setCurrentEmployee(formattedUsers[0]);
        }
      } else {
        toast.error("فشل في جلب الموظفين");
      }
    } catch (error) {
      console.error("خطأ في جلب الموظفين:", error);
      toast.error("حدث خطأ في جلب الموظفين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleInfo = (roleId) => {
    const role = rolesList.find((r) => r.id === roleId);
    return role || { name: "غير محدد" };
  };

  const getRoleColor = (roleId) => {
    const colors = {
      Admin: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
      },
      Cashier: {
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

  const handleAddUser = () => {
    setShowAddModal(true);
    setEditingUser(null);
    setFormData({
      userName: "",
      password: "",
      confirmPassword: "",
      role: "Cashier",
      roles: ["Cashier"],
    });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowAddModal(true);
    setFormData({
      userName: user.username,
      password: "",
      confirmPassword: "",
      role: user.role,
      roles: [user.role],
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (roleId) => {
    setFormData((prev) => ({
      ...prev,
      role: roleId,
      roles: [roleId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userName.trim()) {
      toast.error("يرجى إدخال اسم الموظف");
      return;
    }

    if (!formData.password && !editingUser) {
      toast.error("يرجى إدخال كلمة المرور");
      return;
    }

    if (!editingUser && formData.password !== formData.confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    if (!editingUser && formData.password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    try {
      if (editingUser) {
        toast.warning("تحديث الموظف غير مدعوم من الخادم حالياً");
        setShowAddModal(false);
        setEditingUser(null);
        return;
      } else {
        const userData = {
          userName: formData.userName,
          password: formData.password,
          roles: formData.roles,
        };

        const response = await axiosInstance.post("/api/Users/Add", userData);

        if (response.status === 200 && response.data.isSuccess) {
          const newUser = {
            id: response.data.value?.id || `user-${Date.now()}`,
            username: formData.userName,
            role: formData.role,
            isActive: true,
          };
          setUsers([...users, newUser]);
          toast.success("تم إضافة الموظف الجديد بنجاح");
        } else {
          toast.error(
            response.data.error?.description || "فشل في إضافة الموظف",
          );
        }
      }

      setShowAddModal(false);
      setEditingUser(null);
      setFormData({
        userName: "",
        password: "",
        confirmPassword: "",
        role: "Cashier",
        roles: ["Cashier"],
      });
    } catch (error) {
      console.error("خطأ في حفظ الموظف:", error);
      toast.error("حدث خطأ في حفظ الموظف");
    }
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

      try {
        const response = await axiosInstance.put(
          `/api/Users/ChangePassword?userId=${userId}`,
          {
            newPassword: newPassword,
            confirmPassword: newPassword,
          },
        );

        if (response.status === 200 && response.data.isSuccess) {
          toast.success("تم تعيين كلمة المرور الجديدة بنجاح");
        } else {
          toast.error(
            response.data.error?.description || "فشل في تغيير كلمة المرور",
          );
        }
      } catch (error) {
        console.error("خطأ في تغيير كلمة المرور:", error);
        toast.error("حدث خطأ في تغيير كلمة المرور");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذا الموظف بشكل نهائي!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.delete(
          `/api/Users/Delete/${userId}`,
        );

        if (response.status === 200 || response.status === 204) {
          setUsers(users.filter((user) => user.id !== userId));
          toast.success("تم حذف الموظف بنجاح");

          if (currentEmployee && currentEmployee.id === userId) {
            const remainingUsers = users.filter((user) => user.id !== userId);
            if (remainingUsers.length > 0) {
              setCurrentEmployee(remainingUsers[0]);
            } else {
              setCurrentEmployee(null);
            }
          }
        } else {
          toast.error("فشل في حذف الموظف");
        }
      } catch (error) {
        console.error("خطأ في حذف الموظف:", error);
        toast.error("حدث خطأ في حذف الموظف");
      }
    }
  };

  const handleToggleUserStatus = async (userId) => {
    const user = users.find((u) => u.id === userId);
    const action = user.isActive ? "تعطيل" : "تفعيل";

    const result = await Swal.fire({
      title: `هل أنت متأكد من ${action} هذا الموظف؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: user.isActive ? "#f59e0b" : "#10b981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `نعم، ${action}`,
      cancelButtonText: "إلغاء",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.put(
          `/api/Users/ToggleStatus/${userId}`,
          {
            isActive: !user.isActive,
          },
        );

        if (response.status === 200 && response.data.isSuccess) {
          setUsers(
            users.map((u) =>
              u.id === userId ? { ...u, isActive: !u.isActive } : u,
            ),
          );
          toast.success(`تم ${action} الموظف بنجاح`);
        } else {
          toast.error(
            response.data.error?.description || `فشل في ${action} الموظف`,
          );
        }
      } catch (error) {
        console.error(`خطأ في ${action} الموظف:`, error);
        toast.error(`حدث خطأ في ${action} الموظف`);
      }
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.isActive).length,
    inactiveUsers: users.filter((u) => !u.isActive).length,
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
                نظام الكاشير - إدارة الموظفين
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">إجمالي الموظفين</p>
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
                <p className="text-sm text-green-800">الموظفين النشطين</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {stats.activeUsers}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.totalUsers > 0
                    ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)
                    : 0}
                  % من إجمالي الموظفين
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
                <p className="text-sm text-purple-800">توزيع الأدوار</p>
                <div className="text-sm font-bold text-purple-900 mt-1">
                  <div>
                    مدير النظام:{" "}
                    {users.filter((u) => u.role === "Admin").length}
                  </div>
                  <div>
                    كاشير: {users.filter((u) => u.role === "Cashier").length}
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-purple-700 font-bold">🎭</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                قائمة الموظفين
              </h3>
              <p className="text-sm text-gray-600">
                إدارة حسابات الموظفين في النظام
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
              إضافة موظف جديد
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">جاري تحميل بيانات الموظفين...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        الموظف
                      </th>
                      <th className="py-4 px-4 text-right border-b border-gray-200 text-sm font-medium text-gray-700">
                        الدور
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
                    {currentUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
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
                              لا يوجد موظفين
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              قم بإضافة موظف جديد لبدء العمل
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentUsers.map((user) => {
                        const roleInfo = getRoleInfo(user.role);
                        const roleColor = getRoleColor(user.role);
                        const isCurrentEmployee =
                          currentEmployee && user.id === currentEmployee.id;

                        return (
                          <tr
                            key={user.id}
                            className={`hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                              isCurrentEmployee ? "bg-blue-50" : ""
                            }`}
                          >
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ml-3 ${roleColor.bg} ${roleColor.text} relative`}
                                >
                                  <span className="font-bold text-lg">
                                    {user.username.charAt(0)}
                                  </span>
                                  {isCurrentEmployee && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-2 w-2 text-white"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 flex items-center gap-2">
                                    {user.username}
                                    {isCurrentEmployee && (
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap border border-green-200">
                                        مسجل حالياً
                                      </span>
                                    )}
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
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center">
                                <div
                                  className={`w-3 h-3 rounded-full ml-2 ${user.isActive ? "bg-green-500" : "bg-red-500"}`}
                                ></div>
                                <span
                                  className={`font-medium ${user.isActive ? "text-green-700" : "text-red-700"}`}
                                >
                                  {user.isActive ? "نشط" : "معطل"}
                                </span>
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
                      {users.length} موظف
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
                  {editingUser ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
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
                      اسم الموظف *
                    </label>
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                      dir="ltr"
                      disabled={editingUser}
                    />
                  </div>

                  {!editingUser && (
                    <>
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
                          required={!editingUser}
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
                          required={!editingUser}
                          dir="ltr"
                        />
                      </div>
                    </>
                  )}
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
                      </div>
                    ))}
                  </div>
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
                    {editingUser ? "حفظ التعديلات" : "إضافة موظف"}
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
