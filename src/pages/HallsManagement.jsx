import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import {
  FaChair,
  FaTable,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCircle,
} from "react-icons/fa";

export default function HallsManagement() {
  const navigate = useNavigate();
  const [halls, setHalls] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedHall, setSelectedHall] = useState(null);
  const [showHallModal, setShowHallModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingHall, setEditingHall] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const hasFetched = useRef(false);

  const [hallForm, setHallForm] = useState({
    name: "",
  });

  const [tableForm, setTableForm] = useState({
    name: "",
    hallId: "",
    status: 0,
  });

  const TableStatus = {
    Available: 0,
    Occupied: 1,
    Reserved: 2,
    OutOfService: 3,
  };

  const getTableStatusText = (status) => {
    switch (status) {
      case TableStatus.Available:
        return "متاحة";
      case TableStatus.Occupied:
        return "مشغولة";
      case TableStatus.Reserved:
        return "محجوزة";
      case TableStatus.OutOfService:
        return "معطلة";
      default:
        return "غير معروفة";
    }
  };

  const getTableStatusColor = (status) => {
    switch (status) {
      case TableStatus.Available:
        return "bg-green-100 text-green-800 border border-green-200";
      case TableStatus.Occupied:
        return "bg-red-100 text-red-800 border border-red-200";
      case TableStatus.Reserved:
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case TableStatus.OutOfService:
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getTableStatusDot = (status) => {
    switch (status) {
      case TableStatus.Available:
        return "bg-green-500";
      case TableStatus.Occupied:
        return "bg-red-500";
      case TableStatus.Reserved:
        return "bg-yellow-500";
      case TableStatus.OutOfService:
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [hallsResponse, tablesResponse] = await Promise.all([
        axiosInstance.get("/api/Hall/GetAll"),
        axiosInstance.get("/api/Table/GetAll"),
      ]);

      if (hallsResponse.status === 200 && hallsResponse.data) {
        setHalls(hallsResponse.data);

        if (hallsResponse.data.length > 0) {
          if (selectedHall) {
            const stillExists = hallsResponse.data.some(
              (hall) => hall.id === selectedHall.id,
            );
            if (stillExists) {
              setSelectedHall(
                hallsResponse.data.find((hall) => hall.id === selectedHall.id),
              );
            } else {
              setSelectedHall(hallsResponse.data[0]);
            }
          } else {
            setSelectedHall(hallsResponse.data[0]);
          }
        } else {
          setSelectedHall(null);
        }
      } else {
        toast.error("فشل في جلب بيانات الصالات");
      }

      if (tablesResponse.status === 200 && tablesResponse.data) {
        setTables(tablesResponse.data);
      } else {
        toast.error("فشل في جلب بيانات الطاولات");
      }
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
      toast.error("حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchAllData();
      hasFetched.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddHall = () => {
    setEditingHall(null);
    setHallForm({
      name: "",
    });
    setShowHallModal(true);
    setFocusedField(null);
  };

  const handleEditHall = (hall) => {
    setEditingHall(hall);
    setHallForm({
      name: hall.name,
    });
    setShowHallModal(true);
    setFocusedField(null);
  };

  const handleHallFormChange = (e) => {
    const { name, value } = e.target;
    setHallForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitHall = async (e) => {
    e.preventDefault();

    if (!hallForm.name.trim()) {
      toast.error("يرجى إدخال اسم الصالة");
      return;
    }

    try {
      if (editingHall) {
        const response = await axiosInstance.put(
          `/api/Hall/Update/${editingHall.id}`,
          {
            name: hallForm.name,
            isCompleted: editingHall.isCompleted,
          },
        );

        if (response.status === 200) {
          await fetchAllData();
          toast.success("تم تحديث بيانات الصالة بنجاح");
          setShowHallModal(false);
          setEditingHall(null);
        } else {
          toast.error("فشل في تحديث بيانات الصالة");
        }
      } else {
        const response = await axiosInstance.post("/api/Hall/Add", {
          name: hallForm.name,
        });

        if (response.status === 201 || response.status === 200) {
          await fetchAllData();
          toast.success("تم إضافة الصالة بنجاح");
          setShowHallModal(false);
          setEditingHall(null);
        } else {
          toast.error("فشل في إضافة الصالة");
        }
      }
    } catch (error) {
      console.error("خطأ في حفظ الصالة:", error);
      if (error.response?.status === 201 || error.response?.status === 200) {
        await fetchAllData();
        toast.success("تم حفظ الصالة بنجاح");
        setShowHallModal(false);
        setEditingHall(null);
      } else {
        toast.error("حدث خطأ في حفظ الصالة");
      }
    }
  };

  const handleDeleteHall = async (hallId) => {
    const hallTables = tables.filter((table) => table.hallId === hallId);

    if (hallTables.length > 0) {
      toast.error("لا يمكن حذف صالة تحتوي على طاولات");
      return;
    }

    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذه الصالة بشكل نهائي",
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
          `/api/Hall/Delete/${hallId}`,
        );

        if (response.status === 200 || response.status === 204) {
          await fetchAllData();
          toast.success("تم حذف الصالة بنجاح");
        } else {
          toast.error("فشل في حذف الصالة");
        }
      } catch (error) {
        console.error("خطأ في حذف الصالة:", error);
        toast.error("حدث خطأ في حذف الصالة");
      }
    }
  };

  const getLastTableNumber = (hallId) => {
    const hallTables = tables.filter((table) => table.hallId === hallId);
    if (hallTables.length === 0) return 0;

    const numbers = hallTables.map((table) => {
      const match = table.name.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    });

    return Math.max(...numbers, 0);
  };

  const generateTableName = (hallId) => {
    const lastNumber = getLastTableNumber(hallId);
    const newNumber = lastNumber + 1;
    return `طاولة ${newNumber}`;
  };

  const handleAddTable = async () => {
    if (!selectedHall) {
      toast.error("يرجى اختيار صالة أولاً");
      return;
    }

    if (selectedHall.isCompleted) {
      toast.error("لا يمكن إضافة طاولة في صالة محجوزة بالكامل");
      return;
    }

    try {
      const tableName = generateTableName(selectedHall.id);

      const response = await axiosInstance.post("/api/Table/Add", {
        name: tableName,
        hallId: parseInt(selectedHall.id),
      });

      if (response.status === 201 || response.status === 200) {
        await fetchAllData();
        toast.success(`تم إضافة ${tableName} بنجاح`);
      } else {
        toast.error("فشل في إضافة الطاولة");
      }
    } catch (error) {
      console.error("خطأ في إضافة الطاولة:", error);
      if (error.response?.status === 201 || error.response?.status === 200) {
        await fetchAllData();
        toast.success("تم إضافة الطاولة بنجاح");
      } else {
        toast.error("حدث خطأ في إضافة الطاولة");
      }
    }
  };

  const handleEditTable = (table) => {
    if (selectedHall?.isCompleted) {
      toast.error("لا يمكن تعديل طاولة في صالة محجوزة بالكامل");
      return;
    }

    setEditingTable(table);
    setTableForm({
      name: table.name,
      hallId: table.hallId,
      status: table.status,
    });
    setShowTableModal(true);
    setFocusedField(null);
  };

  const handleTableFormChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "radio") {
      setTableForm((prev) => ({
        ...prev,
        [name]: parseInt(value),
      }));
    } else {
      setTableForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmitTable = async (e) => {
    e.preventDefault();

    if (!tableForm.name.trim()) {
      toast.error("يرجى إدخال اسم الطاولة");
      return;
    }

    if (!tableForm.hallId) {
      toast.error("يرجى اختيار الصالة");
      return;
    }

    try {
      const response = await axiosInstance.put(
        `/api/Table/Update/${editingTable.id}`,
        {
          name: tableForm.name,
          hallId: parseInt(tableForm.hallId),
          status: tableForm.status,
        },
      );

      if (response.status === 200) {
        await fetchAllData();
        toast.success("تم تحديث بيانات الطاولة بنجاح");
        setShowTableModal(false);
        setEditingTable(null);
      } else {
        toast.error("فشل في تحديث بيانات الطاولة");
      }
    } catch (error) {
      console.error("خطأ في تحديث الطاولة:", error);
      if (error.response?.status === 200) {
        await fetchAllData();
        toast.success("تم تحديث الطاولة بنجاح");
        setShowTableModal(false);
        setEditingTable(null);
      } else {
        toast.error("حدث خطأ في تحديث الطاولة");
      }
    }
  };

  const handleDeleteTable = async (tableId, tableName) => {
    if (selectedHall?.isCompleted) {
      toast.error("لا يمكن حذف طاولة في صالة محجوزة بالكامل");
      return;
    }

    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: `سيتم حذف الطاولة ${tableName} بشكل نهائي`,
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
          `/api/Table/Delete/${tableId}`,
        );

        if (response.status === 200 || response.status === 204) {
          await fetchAllData();
          toast.success(`تم حذف الطاولة ${tableName} بنجاح`);
        } else {
          toast.error("فشل في حذف الطاولة");
        }
      } catch (error) {
        console.error("خطأ في حذف الطاولة:", error);
        toast.error("حدث خطأ في حذف الطاولة");
      }
    }
  };

  const handleToggleTableStatus = async (table) => {
    if (selectedHall?.isCompleted) {
      toast.error("لا يمكن تعديل حالة طاولة في صالة محجوزة بالكامل");
      return;
    }

    const newStatus =
      table.status === TableStatus.OutOfService
        ? TableStatus.Available
        : TableStatus.OutOfService;
    const action =
      table.status === TableStatus.OutOfService ? "تفعيل" : "تعطيل";

    const result = await Swal.fire({
      title: `هل أنت متأكد من ${action} هذه الطاولة؟`,
      text:
        table.status === TableStatus.OutOfService
          ? "سيتم إعادة الطاولة للخدمة مرة أخرى"
          : "سيتم تعطيل هذه الطاولة",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor:
        table.status === TableStatus.OutOfService ? "#10b981" : "#f59e0b",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `نعم، ${action}`,
      cancelButtonText: "إلغاء",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.put(
          `/api/Table/Update/${table.id}`,
          {
            name: table.name,
            hallId: table.hallId,
            status: newStatus,
          },
        );

        if (response.status === 200) {
          await fetchAllData();
          toast.success(`تم ${action} الطاولة ${table.name} بنجاح`);
        } else {
          toast.error(`فشل في ${action} الطاولة`);
        }
      } catch (error) {
        console.error(`خطأ في ${action} الطاولة:`, error);
        toast.error(`حدث خطأ في ${action} الطاولة`);
      }
    }
  };

  const getTablesForHall = (hallId) => {
    return tables.filter((table) => table.hallId === hallId);
  };

  const getHallStats = (hallId) => {
    const hallTables = getTablesForHall(hallId);
    const total = hallTables.length;
    const available = hallTables.filter(
      (t) => t.status === TableStatus.Available,
    ).length;
    const occupied = hallTables.filter(
      (t) => t.status === TableStatus.Occupied,
    ).length;
    const reserved = hallTables.filter(
      (t) => t.status === TableStatus.Reserved,
    ).length;
    const outOfService = hallTables.filter(
      (t) => t.status === TableStatus.OutOfService,
    ).length;

    return { total, available, occupied, reserved, outOfService };
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
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
              <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center ml-3">
                <span className="text-white font-bold">
                  <FaChair />
                </span>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "#193F94" }}>
                نظام الكاشير - إدارة الصالات والطاولات
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                  الصالات
                </h3>
                <p className="text-sm text-gray-600">
                  إضافة وتعديل الصالات والطاولات
                </p>
              </div>
              <button
                onClick={handleAddHall}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center shadow-md"
                style={{ backgroundColor: "#193F94" }}
              >
                <FaPlus className="h-5 w-5 ml-2" />
                إضافة صالة
              </button>
            </div>

            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4">جاري تحميل الصالات...</p>
              </div>
            ) : halls.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-3">
                  <FaChair className="h-16 w-16 mx-auto opacity-50" />
                </div>
                <p className="text-gray-500">لا توجد صالات</p>
                <p className="text-sm text-gray-400 mt-1">
                  قم بإضافة صالة جديدة
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {halls.map((hall) => {
                  const stats = getHallStats(hall.id);
                  return (
                    <div
                      key={hall.id}
                      onClick={() => setSelectedHall(hall)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedHall?.id === hall.id
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      } ${hall.isCompleted ? "opacity-80" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center ml-3 bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-lg shadow-md">
                            {hall.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {hall.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {stats.total} طاولة • {stats.available} متاحة •{" "}
                              {stats.occupied} مشغولة • {stats.reserved} محجوزة
                              • {stats.outOfService} معطلة
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              hall.isCompleted
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : "bg-green-100 text-green-800 border border-green-200"
                            }`}
                          >
                            <span className="flex items-center">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ml-1 ${hall.isCompleted ? "bg-purple-500" : "bg-green-500"}`}
                              ></span>
                              {hall.isCompleted ? "محجوزة بالكامل" : "متاحة"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditHall(hall);
                          }}
                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-blue-200"
                        >
                          <FaEdit className="h-3 w-3 ml-1" />
                          تعديل
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHall(hall.id);
                          }}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-red-200"
                        >
                          <FaTrash className="h-3 w-3 ml-1" />
                          حذف
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold" style={{ color: "#193F94" }}>
                  الطاولات
                </h3>
                <p className="text-sm text-gray-600">
                  إدارة الطاولات داخل الصالات
                </p>
                {selectedHall && (
                  <div className="mt-2 flex items-center bg-gradient-to-l from-blue-50 to-transparent p-2 rounded-lg">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center ml-2 bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm font-bold shadow-md">
                      {selectedHall.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {selectedHall.name}
                    </span>
                    {selectedHall.isCompleted && (
                      <span className="mr-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs border border-purple-200">
                        محجوزة بالكامل
                      </span>
                    )}
                  </div>
                )}
              </div>
              {selectedHall && !selectedHall.isCompleted && (
                <button
                  onClick={handleAddTable}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center shadow-md"
                >
                  <FaPlus className="h-5 w-5 ml-2" />
                  إضافة طاولة
                </button>
              )}
            </div>

            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-t-4 border-green-600 border-solid rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4">جاري تحميل الطاولات...</p>
              </div>
            ) : (
              <>
                {selectedHall ? (
                  getTablesForHall(selectedHall.id).length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-3">
                        <FaTable className="h-16 w-16 mx-auto opacity-50" />
                      </div>
                      <p className="text-gray-500">لا توجد طاولات</p>
                      {!selectedHall.isCompleted && (
                        <p className="text-sm text-gray-400 mt-1">
                          قم بإضافة أول طاولة في {selectedHall.name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getTablesForHall(selectedHall.id).map((table) => (
                        <div
                          key={table.id}
                          className="p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center ml-3 bg-gradient-to-br from-purple-400 to-purple-600 text-white font-bold text-lg shadow-md">
                                {table.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">
                                  {table.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  تابعة لـ{" "}
                                  <span className="font-medium text-blue-600">
                                    {table.hallName}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <div
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getTableStatusColor(table.status)}`}
                              >
                                <span className="flex items-center">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ml-1 ${getTableStatusDot(table.status)}`}
                                  ></span>
                                  {getTableStatusText(table.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {!selectedHall.isCompleted && (
                            <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-3">
                              <button
                                onClick={() => handleEditTable(table)}
                                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-blue-200"
                              >
                                <FaEdit className="h-3 w-3 ml-1" />
                                تعديل
                              </button>
                              {table.status !== TableStatus.OutOfService && (
                                <button
                                  onClick={() => handleToggleTableStatus(table)}
                                  className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-amber-200"
                                >
                                  <FaCircle className="h-2 w-2 ml-1" />
                                  تعطيل
                                </button>
                              )}
                              {table.status === TableStatus.OutOfService && (
                                <button
                                  onClick={() => handleToggleTableStatus(table)}
                                  className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-green-200"
                                >
                                  <FaPlus className="h-3 w-3 ml-1" />
                                  تفعيل
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  handleDeleteTable(table.id, table.name)
                                }
                                className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-red-200"
                              >
                                <FaTrash className="h-3 w-3 ml-1" />
                                حذف
                              </button>
                            </div>
                          )}
                          {selectedHall.isCompleted && (
                            <div className="flex justify-end mt-3">
                              <span className="text-xs text-gray-500 italic px-3 py-1.5">
                                الصالة محجوزة بالكامل - لا يمكن التعديل
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-3">
                      <FaTable className="h-16 w-16 mx-auto opacity-50" />
                    </div>
                    <p className="text-gray-500">اختر صالة</p>
                    <p className="text-sm text-gray-400 mt-1">
                      اختر صالة من القائمة على اليمين لعرض طاولاتها
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showHallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#193F94" }}
                  >
                    {editingHall ? "تعديل صالة" : "إضافة صالة"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingHall
                      ? "قم بتعديل بيانات الصالة"
                      : "أدخل بيانات الصالة الجديدة"}
                  </p>
                </div>
                <button
                  onClick={() => setShowHallModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitHall}>
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={hallForm.name}
                      onChange={handleHallFormChange}
                      onFocus={() => handleFocus("hallName")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "hallName" || hallForm.name
                          ? "-top-2.5 text-xs text-blue-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
                      <span className="flex items-center">
                        <FaChair className="w-4 h-4 ml-1" />
                        اسم الصالة *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowHallModal(false)}
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
                      {editingHall ? (
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
                    {editingHall ? "حفظ التعديلات" : "إضافة صالة"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#10B981" }}
                  >
                    تعديل طاولة
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    قم بتعديل بيانات وحالة الطاولة
                  </p>
                </div>
                <button
                  onClick={() => setShowTableModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitTable}>
                <div className="mb-4">
                  <div className="relative">
                    <select
                      name="hallId"
                      value={tableForm.hallId}
                      onChange={handleTableFormChange}
                      onFocus={() => handleFocus("hallSelect")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm bg-white appearance-none"
                      required
                    >
                      <option value="">اختر الصالة</option>
                      {halls
                        .filter((h) => !h.isCompleted)
                        .map((hall) => (
                          <option key={hall.id} value={hall.id}>
                            {hall.name}
                          </option>
                        ))}
                    </select>
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "hallSelect" || tableForm.hallId
                          ? "-top-2.5 text-xs text-green-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
                      <span className="flex items-center">
                        <FaChair className="w-4 h-4 ml-1" />
                        الصالة *
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

                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={tableForm.name}
                      onChange={handleTableFormChange}
                      onFocus={() => handleFocus("tableName")}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm bg-white"
                      required
                      dir="rtl"
                    />
                    <label
                      className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                        focusedField === "tableName" || tableForm.name
                          ? "-top-2.5 text-xs text-green-500 font-medium"
                          : "top-3 text-gray-400 text-sm"
                      }`}
                    >
                      <span className="flex items-center">
                        <FaTable className="w-4 h-4 ml-1" />
                        اسم الطاولة *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2 mr-1">
                    حالة الطاولة:
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {/* متاحة */}
                    <label className="flex items-center cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-green-300 transition-all">
                      <input
                        type="radio"
                        name="status"
                        value={TableStatus.Available}
                        checked={tableForm.status === TableStatus.Available}
                        onChange={handleTableFormChange}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="mr-2 text-sm font-medium text-gray-700 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 ml-1"></span>
                        متاحة
                      </span>
                    </label>

                    {/* مشغولة */}
                    <label className="flex items-center cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-red-300 transition-all">
                      <input
                        type="radio"
                        name="status"
                        value={TableStatus.Occupied}
                        checked={tableForm.status === TableStatus.Occupied}
                        onChange={handleTableFormChange}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="mr-2 text-sm font-medium text-gray-700 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-red-500 ml-1"></span>
                        مشغولة
                      </span>
                    </label>

                    {/* محجوزة */}
                    <label className="flex items-center cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-yellow-300 transition-all">
                      <input
                        type="radio"
                        name="status"
                        value={TableStatus.Reserved}
                        checked={tableForm.status === TableStatus.Reserved}
                        onChange={handleTableFormChange}
                        className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                      />
                      <span className="mr-2 text-sm font-medium text-gray-700 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 ml-1"></span>
                        محجوزة
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowTableModal(false)}
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
                    style={{ backgroundColor: "#10B981" }}
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
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    حفظ التعديلات
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
