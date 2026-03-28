import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import {
  FaArrowLeft,
  FaUsers,
  FaUserPlus,
  FaUserShield,
  FaKey,
  FaTrash,
  FaUserCheck,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaSpinner,
  FaTimes,
  FaSave,
  FaUser,
  FaUserCog,
  FaChartPie,
  FaLock,
} from "react-icons/fa";

export default function UsersManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const hasFetchedCurrentUser = useRef(false);
  const hasFetchedUsers = useRef(false);
  const hasReorderedUsers = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isOpeningRoleModal, setIsOpeningRoleModal] = useState(false);
  const [isOpeningAddModal, setIsOpeningAddModal] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    confirmPassword: "",
    roles: ["Cashier"],
  });

  const [focusedField, setFocusedField] = useState(null);

  const rolesList = [
    { id: "Admin", name: "مدير النظام" },
    { id: "Cashier", name: "كاشير" },
  ];

  const fetchCurrentUser = async () => {
    try {
      const response = await axiosInstance.get("/api/Users/GetProfile");
      if (response.status === 200 && response.data.isSuccess) {
        const userData = response.data.value;
        const currentUser = {
          id: userData.id,
          username: userData.userName,
          roles: userData.roles || ["Cashier"],
          isLocked: false,
        };
        setCurrentEmployee(currentUser);
        return currentUser;
      }
    } catch (error) {
      console.error("خطأ في جلب المستخدم الحالي:", error);
    }
    return null;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/Users/GetAll");
      if (response.status === 200 && response.data.isSuccess) {
        const formattedUsers = response.data.value.map((user) => ({
          id: user.id,
          username: user.userName,
          roles: user.roles || ["Cashier"],
          isLocked: user.isLocked || false,
        }));
        setUsers(formattedUsers);
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
    if (!hasFetchedCurrentUser.current) {
      hasFetchedCurrentUser.current = true;
      fetchCurrentUser();
    }

    if (!hasFetchedUsers.current) {
      hasFetchedUsers.current = true;
      fetchUsers();
    }
  }, []);

  useEffect(() => {
    if (currentEmployee && users.length > 0 && !hasReorderedUsers.current) {
      hasReorderedUsers.current = true;
      setUsers((prevUsers) => {
        const otherUsers = prevUsers.filter((u) => u.id !== currentEmployee.id);
        return [currentEmployee, ...otherUsers];
      });
    }
  }, [currentEmployee, users]);

  const getRoleInfo = (roleId) => {
    const role = rolesList.find((r) => r.id === roleId);
    return role || { name: roleId };
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
    setIsOpeningAddModal(true);
    setShowAddModal(true);
    setFormData({
      userName: "",
      password: "",
      confirmPassword: "",
      roles: ["Cashier"],
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFocusedField(null);
    setTimeout(() => setIsOpeningAddModal(false), 100);
  };

  const handleOpenRoleModal = (user) => {
    setIsOpeningRoleModal(true);
    setSelectedUserForRole(user);
    setSelectedRoles([...user.roles]);
    setShowRoleModal(true);
    setTimeout(() => setIsOpeningRoleModal(false), 100);
  };

  const handleFormChange = (e) => {
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

  const handleRoleToggle = (roleId) => {
    setFormData((prev) => ({
      ...prev,
      roles: [roleId],
    }));
  };

  const handleUserRoleToggle = (roleId) => {
    setSelectedRoles([roleId]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userName.trim()) {
      toast.error("يرجى إدخال اسم الموظف");
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

    if (formData.roles.length === 0) {
      return;
    }

    setIsAddingUser(true);

    try {
      const userData = {
        userName: formData.userName,
        password: formData.password,
        roles: formData.roles,
      };

      const response = await axiosInstance.post("/api/Users/Add", userData);

      if (response.status === 200) {
        const newUser = {
          id: response.data.id,
          username: response.data.userName,
          roles: response.data.roles || formData.roles,
          isLocked: response.data.isLocked || false,
        };

        setUsers((prevUsers) => {
          const filteredUsers = prevUsers.filter((u) => u.id !== newUser.id);
          if (currentEmployee) {
            const otherUsers = filteredUsers.filter(
              (u) => u.id !== currentEmployee.id,
            );
            return [currentEmployee, newUser, ...otherUsers];
          }
          return [newUser, ...filteredUsers];
        });

        toast.success("تم إضافة الموظف الجديد بنجاح");
        setShowAddModal(false);
        setFormData({
          userName: "",
          password: "",
          confirmPassword: "",
          roles: ["Cashier"],
        });
        setShowPassword(false);
        setShowConfirmPassword(false);
      } else {
        toast.error(response.data.error?.description || "فشل في إضافة الموظف");
      }
    } catch (error) {
      console.error("خطأ في حفظ الموظف:", error);
      toast.error("حدث خطأ في حفظ الموظف");
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUserForRole || selectedRoles.length === 0) return;

    setIsChangingRole(true);

    try {
      const response = await axiosInstance.put(
        `/api/Users/UpdateUserRoles?userId=${selectedUserForRole.id}`,
        {
          roles: selectedRoles,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200) {
        toast.success("تم تغيير صلاحيات الموظف بنجاح");
        setShowRoleModal(false);
        setSelectedUserForRole(null);
        setSelectedRoles([]);

        window.location.reload();
      } else {
        toast.error(
          response.data.error?.description || "فشل في تغيير صلاحيات الموظف",
        );
      }
    } catch (error) {
      console.error("خطأ في تغيير صلاحيات الموظف:", error);
      toast.error("حدث خطأ في تغيير صلاحيات الموظف");
    } finally {
      setIsChangingRole(false);
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
      setIsResettingPassword(true);

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
      } finally {
        setIsResettingPassword(false);
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
      setIsDeletingUser(true);
      try {
        const response = await axiosInstance.delete(
          `/api/Users/Delete/${userId}`,
        );

        if (response.status === 200 || response.status === 204) {
          setUsers((prevUsers) => {
            const filteredUsers = prevUsers.filter(
              (user) => user.id !== userId,
            );
            if (currentEmployee) {
              const otherUsers = filteredUsers.filter(
                (u) => u.id !== currentEmployee.id,
              );
              return [currentEmployee, ...otherUsers];
            }
            return filteredUsers;
          });

          toast.success("تم حذف الموظف بنجاح");
        } else {
          toast.error("فشل في حذف الموظف");
        }
      } catch (error) {
        console.error("خطأ في حذف الموظف:", error);
        toast.error("حدث خطأ في حذف الموظف");
      } finally {
        setIsDeletingUser(false);
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
    activeUsers: users.filter((u) => !u.isLocked).length,
    inactiveUsers: users.filter((u) => u.isLocked).length,
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
                <FaUsers className="text-white text-lg" />
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
              <FaArrowLeft className="h-5 w-5 ml-2" />
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Professional Stats Cards with Modern Icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
          {/* Total Users Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  إجمالي الموظفين
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <FaUsers className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          {/* Roles Distribution Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  توزيع الأدوار
                </p>
                <div className="space-y-1 mt-1">
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-red-500 rounded-full ml-2"></span>
                    <span className="text-gray-600">مدير النظام:</span>
                    <span className="font-bold text-gray-800 mr-2">
                      {users.filter((u) => u.roles.includes("Admin")).length}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                    <span className="text-gray-600">كاشير:</span>
                    <span className="font-bold text-gray-800 mr-2">
                      {users.filter((u) => u.roles.includes("Cashier")).length}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                <FaChartPie className="h-7 w-7 text-white" />
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
              disabled={isOpeningAddModal}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors flex items-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#193F94" }}
            >
              {isOpeningAddModal ? (
                <FaSpinner className="h-5 w-5 ml-2 animate-spin" />
              ) : (
                <FaUserPlus className="h-5 w-5 ml-2" />
              )}
              إضافة موظف جديد
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <FaSpinner className="w-16 h-16 text-blue-600 animate-spin mb-4" />
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
                        الصلاحيات
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
                            <FaUsers className="h-12 w-12 text-gray-300 mb-3" />
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
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ml-3 bg-blue-100 text-blue-800 relative`}
                                >
                                  <span className="font-bold text-lg">
                                    {user.username.charAt(0)}
                                  </span>
                                  {isCurrentEmployee && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                      <FaCheckCircle className="h-2 w-2 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 flex items-center gap-2">
                                    {user.username}
                                    {isCurrentEmployee && (
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap border border-green-200 flex items-center">
                                        <FaUserCheck className="h-2 w-2 ml-1" />
                                        مسجل حالياً
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex flex-wrap gap-2">
                                {user.roles.map((role) => {
                                  const roleInfo = getRoleInfo(role);
                                  const roleColor = getRoleColor(role);
                                  return (
                                    <div
                                      key={role}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center ${roleColor.bg} ${roleColor.text} ${roleColor.border} border`}
                                    >
                                      <span className="ml-1">
                                        {roleInfo.name}
                                      </span>
                                      <div className="w-2 h-2 rounded-full bg-current ml-1 opacity-70"></div>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex flex-col space-y-2">
                                <button
                                  onClick={() => handleOpenRoleModal(user)}
                                  disabled={isOpeningRoleModal}
                                  className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isOpeningRoleModal ? (
                                    <FaSpinner className="h-3 w-3 ml-1 animate-spin" />
                                  ) : (
                                    <FaUserCog className="h-3 w-3 ml-1" />
                                  )}
                                  الصلاحيات
                                </button>
                                <button
                                  onClick={() => handleResetPassword(user.id)}
                                  disabled={isResettingPassword}
                                  className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isResettingPassword ? (
                                    <FaSpinner className="h-3 w-3 ml-1 animate-spin" />
                                  ) : (
                                    <FaKey className="h-3 w-3 ml-1" />
                                  )}
                                  كلمة المرور
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={isDeletingUser}
                                  className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isDeletingUser ? (
                                    <FaSpinner className="h-3 w-3 ml-1 animate-spin" />
                                  ) : (
                                    <FaTrash className="h-3 w-3 ml-1" />
                                  )}
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

      {/* Add User Modal with Professional Floating Labels */}
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
                    إضافة موظف جديد
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    أدخل بيانات الموظف الجديد وصلاحياته
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={isAddingUser}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors disabled:opacity-50"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("userName")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "userName" || formData.userName
                          ? "-top-2.5 text-xs text-blue-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
                      <span className="flex items-center">
                        <FaUser className="w-4 h-4 ml-1" />
                        اسم الموظف *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("password")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "password" || formData.password
                          ? "-top-2.5 text-xs text-blue-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
                      <span className="flex items-center">
                        <FaLock className="w-4 h-4 ml-1" />
                        كلمة المرور *
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5" />
                      ) : (
                        <FaEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      onFocus={() => handleFocus("confirmPassword")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "confirmPassword" ||
                        formData.confirmPassword
                          ? "-top-2.5 text-xs text-blue-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
                      <span className="flex items-center">
                        <FaUserShield className="w-4 h-4 ml-1" />
                        تأكيد كلمة المرور *
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="h-5 w-5" />
                      ) : (
                        <FaEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <div className="w-1 h-6 bg-blue-500 rounded-full ml-2"></div>
                    <label className="text-sm font-medium text-gray-700">
                      الصلاحيات *
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {rolesList.map((role) => (
                      <div
                        key={role.id}
                        onClick={() => handleRoleToggle(role.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.roles.includes(role.id)
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ml-2 ${
                              getRoleColor(role.id).bg
                            } ${getRoleColor(role.id).text}`}
                          >
                            <span className="font-bold text-sm">
                              {role.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-sm">
                            {role.name}
                          </span>
                          {formData.roles.includes(role.id) && (
                            <div className="mr-auto bg-blue-500 rounded-full p-0.5">
                              <FaCheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={isAddingUser}
                    className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaTimes className="w-4 h-4 ml-2" />
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingUser}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                    style={{ backgroundColor: "#193F94" }}
                  >
                    {isAddingUser ? (
                      <>
                        <FaSpinner className="w-4 h-4 ml-2 animate-spin" />
                        جاري الإضافة...
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="w-4 h-4 ml-2" />
                        إضافة موظف
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Change Roles Modal */}
      {showRoleModal && selectedUserForRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold" style={{ color: "#193F94" }}>
                  تغيير صلاحيات الموظف
                </h3>
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUserForRole(null);
                    setSelectedRoles([]);
                  }}
                  disabled={isChangingRole}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors disabled:opacity-50"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-gradient-to-l from-blue-50 to-transparent p-3 rounded-xl mb-4">
                  <p className="text-sm text-gray-600">
                    الموظف:{" "}
                    <span className="font-bold text-gray-900 mr-2">
                      {selectedUserForRole.username}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    الصلاحيات الحالية:{" "}
                    <span className="font-bold text-blue-600 mr-2">
                      {selectedUserForRole.roles
                        .map((r) => getRoleInfo(r).name)
                        .join("، ")}
                    </span>
                  </p>
                </div>

                <div className="flex items-center mb-3">
                  <div className="w-1 h-6 bg-purple-500 rounded-full ml-2"></div>
                  <label className="text-sm font-medium text-gray-700">
                    اختر الصلاحية الجديدة
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {rolesList.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => handleUserRoleToggle(role.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedRoles.includes(role.id)
                          ? "border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ml-2 ${
                            getRoleColor(role.id).bg
                          } ${getRoleColor(role.id).text}`}
                        >
                          <span className="font-bold text-sm">
                            {role.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-sm">{role.name}</span>
                        {selectedRoles.includes(role.id) && (
                          <div className="mr-auto bg-purple-500 rounded-full p-0.5">
                            <FaCheckCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUserForRole(null);
                    setSelectedRoles([]);
                  }}
                  disabled={isChangingRole}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTimes className="w-4 h-4 ml-2" />
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleChangeRole}
                  disabled={!selectedRoles.length || isChangingRole}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                  style={
                    selectedRoles.length && !isChangingRole
                      ? { backgroundColor: "#193F94" }
                      : {}
                  }
                >
                  {isChangingRole ? (
                    <>
                      <FaSpinner className="w-4 h-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4 ml-2" />
                      حفظ التغييرات
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
