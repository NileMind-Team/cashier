import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  FaChair,
  FaTable,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCircle,
  FaUsers,
} from "react-icons/fa";

export default function HallsManagement() {
  const navigate = useNavigate();
  const [halls, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState(null);
  const [showHallModal, setShowHallModal] = useState(false);
  const [editingHall, setEditingHall] = useState(null);

  // داتا فيك للصالات والطاولات
  const [hallForm, setHallForm] = useState({
    name: "",
    tableCount: 4,
    isActive: true,
  });

  // تحميل الداتا من localStorage أو استخدام الداتا الافتراضية
  useEffect(() => {
    const savedHalls = localStorage.getItem("halls");
    if (savedHalls) {
      setHalls(JSON.parse(savedHalls));
      if (JSON.parse(savedHalls).length > 0) {
        setSelectedHall(JSON.parse(savedHalls)[0]);
      }
    } else {
      // داتا فيك افتراضية
      const initialHalls = [
        {
          id: 1,
          name: "الصالة الرئيسية",
          isActive: true,
          tables: [
            { id: 101, number: "ط1", isActive: true },
            { id: 102, number: "ط2", isActive: true },
            { id: 103, number: "ط3", isActive: true },
            { id: 104, number: "ط4", isActive: true },
            { id: 105, number: "ط5", isActive: true },
            { id: 106, number: "ط6", isActive: true },
            { id: 107, number: "ط7", isActive: true },
            { id: 108, number: "ط8", isActive: true },
          ],
        },
        {
          id: 2,
          name: "الصالة الخارجية",
          isActive: true,
          tables: [
            { id: 201, number: "ط9", isActive: true },
            { id: 202, number: "ط10", isActive: true },
            { id: 203, number: "ط11", isActive: true },
            { id: 204, number: "ط12", isActive: true },
            { id: 205, number: "ط13", isActive: true },
          ],
        },
        {
          id: 3,
          name: "صالة VIP",
          isActive: true,
          tables: [
            { id: 301, number: "ط14", isActive: true },
            { id: 302, number: "ط15", isActive: true },
            { id: 303, number: "ط16", isActive: true },
            { id: 304, number: "ط17", isActive: true },
            { id: 305, number: "ط18", isActive: true },
          ],
        },
        {
          id: 4,
          name: "صالة الأفراد",
          isActive: false,
          tables: [
            { id: 401, number: "ط19", isActive: false },
            { id: 402, number: "ط20", isActive: false },
          ],
        },
      ];
      setHalls(initialHalls);
      setSelectedHall(initialHalls[0]);
      localStorage.setItem("halls", JSON.stringify(initialHalls));
    }
  }, []);

  // حفظ التغييرات في localStorage
  const saveHallsToStorage = (updatedHalls) => {
    setHalls(updatedHalls);
    localStorage.setItem("halls", JSON.stringify(updatedHalls));
  };

  // ================ إدارة الصالات ================

  const handleAddHall = () => {
    setEditingHall(null);
    setHallForm({
      name: "",
      tableCount: 4,
      isActive: true,
    });
    setShowHallModal(true);
  };

  const handleEditHall = (hall) => {
    setEditingHall(hall);
    setHallForm({
      name: hall.name,
      tableCount: hall.tables.length,
      isActive: hall.isActive,
    });
    setShowHallModal(true);
  };

  const handleHallFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHallForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // إنشاء أرقام الطاولات بناءً على العدد
  const generateTableNumbers = (count, startFrom = 1) => {
    const tables = [];
    for (let i = 0; i < count; i++) {
      const tableNumber = startFrom + i;
      tables.push({
        id: Date.now() + i + Math.floor(Math.random() * 1000),
        number: `ط${tableNumber}`,
        isActive: true,
      });
    }
    return tables;
  };

  // الحصول على آخر رقم طاولة في الصالة
  const getLastTableNumber = (tables) => {
    if (tables.length === 0) return 0;

    const numbers = tables.map((t) => {
      const num = t.number.replace(/[^0-9]/g, "");
      return parseInt(num) || 0;
    });

    return Math.max(...numbers);
  };

  const handleSubmitHall = (e) => {
    e.preventDefault();

    if (!hallForm.name.trim()) {
      toast.error("يرجى إدخال اسم الصالة");
      return;
    }

    if (!editingHall && (hallForm.tableCount < 1 || hallForm.tableCount > 50)) {
      toast.error("عدد الطاولات يجب أن يكون بين 1 و 50");
      return;
    }

    if (editingHall) {
      // تعديل صالة موجودة
      const updatedHalls = halls.map((hall) =>
        hall.id === editingHall.id
          ? {
              ...hall,
              name: hallForm.name,
              isActive: hallForm.isActive,
            }
          : hall,
      );
      saveHallsToStorage(updatedHalls);
      if (selectedHall?.id === editingHall.id) {
        setSelectedHall({
          ...editingHall,
          name: hallForm.name,
          isActive: hallForm.isActive,
        });
      }
      toast.success("تم تحديث بيانات الصالة بنجاح");
    } else {
      // إضافة صالة جديدة مع إنشاء الطاولات
      const newHallId = Math.max(...halls.map((h) => h.id), 0) + 1;
      const newTables = generateTableNumbers(parseInt(hallForm.tableCount));

      const newHall = {
        id: newHallId,
        name: hallForm.name,
        isActive: hallForm.isActive,
        tables: newTables,
      };

      const updatedHalls = [...halls, newHall];
      saveHallsToStorage(updatedHalls);
      setSelectedHall(newHall);
      toast.success(`تم إضافة الصالة بنجاح مع ${hallForm.tableCount} طاولة`);
    }

    setShowHallModal(false);
    setEditingHall(null);
  };

  const handleDeleteHall = async (hallId) => {
    const hall = halls.find((h) => h.id === hallId);

    if (hall.tables.length > 0) {
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
      const updatedHalls = halls.filter((h) => h.id !== hallId);
      saveHallsToStorage(updatedHalls);
      if (selectedHall?.id === hallId) {
        setSelectedHall(updatedHalls.length > 0 ? updatedHalls[0] : null);
      }
      toast.success("تم حذف الصالة بنجاح");
    }
  };

  const handleToggleHallStatus = async (hallId) => {
    const hall = halls.find((h) => h.id === hallId);
    const action = hall.isActive ? "تعطيل" : "تفعيل";

    const result = await Swal.fire({
      title: `هل أنت متأكد من ${action} هذه الصالة؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: hall.isActive ? "#f59e0b" : "#10b981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `نعم، ${action}`,
      cancelButtonText: "إلغاء",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const updatedHalls = halls.map((h) =>
        h.id === hallId
          ? {
              ...h,
              isActive: !h.isActive,
              tables: h.tables.map((t) => ({
                ...t,
                isActive: !h.isActive ? true : t.isActive,
              })),
            }
          : h,
      );
      saveHallsToStorage(updatedHalls);
      if (selectedHall?.id === hallId) {
        setSelectedHall({
          ...selectedHall,
          isActive: !selectedHall.isActive,
          tables: selectedHall.tables.map((t) => ({
            ...t,
            isActive: !selectedHall.isActive ? true : t.isActive,
          })),
        });
      }
      toast.success(`تم ${action} الصالة بنجاح`);
    }
  };

  // ================ إدارة الطاولات ================

  // إضافة طاولة جديدة
  const handleAddTable = async () => {
    if (!selectedHall) {
      toast.error("يرجى اختيار صالة أولاً");
      return;
    }

    if (!selectedHall.isActive) {
      toast.error("لا يمكن إضافة طاولة في صالة معطلة");
      return;
    }

    const lastNumber = getLastTableNumber(selectedHall.tables);
    const newTableNumber = lastNumber + 1;

    const newTable = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      number: `ط${newTableNumber}`,
      isActive: true,
    };

    const updatedHalls = halls.map((hall) => {
      if (hall.id === selectedHall.id) {
        return {
          ...hall,
          tables: [...hall.tables, newTable],
        };
      }
      return hall;
    });

    saveHallsToStorage(updatedHalls);
    setSelectedHall({
      ...selectedHall,
      tables: [...selectedHall.tables, newTable],
    });

    toast.success(`تم إضافة الطاولة ${newTable.number} بنجاح`);
  };

  // حذف طاولة
  const handleDeleteTable = async (tableId) => {
    const table = selectedHall.tables.find((t) => t.id === tableId);

    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: `سيتم حذف الطاولة ${table.number} بشكل نهائي`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const updatedHalls = halls.map((hall) => {
        if (hall.id === selectedHall.id) {
          return {
            ...hall,
            tables: hall.tables.filter((t) => t.id !== tableId),
          };
        }
        return hall;
      });

      saveHallsToStorage(updatedHalls);
      setSelectedHall({
        ...selectedHall,
        tables: selectedHall.tables.filter((t) => t.id !== tableId),
      });

      toast.success(`تم حذف الطاولة ${table.number} بنجاح`);
    }
  };

  // تفعيل/تعطيل طاولة
  const handleToggleTableStatus = async (tableId) => {
    const table = selectedHall.tables.find((t) => t.id === tableId);
    const action = table.isActive ? "تعطيل" : "تفعيل";

    const result = await Swal.fire({
      title: `هل أنت متأكد من ${action} هذه الطاولة؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: table.isActive ? "#f59e0b" : "#10b981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `نعم، ${action}`,
      cancelButtonText: "إلغاء",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const updatedHalls = halls.map((hall) => {
        if (hall.id === selectedHall.id) {
          return {
            ...hall,
            tables: hall.tables.map((t) =>
              t.id === tableId ? { ...t, isActive: !t.isActive } : t,
            ),
          };
        }
        return hall;
      });

      saveHallsToStorage(updatedHalls);
      setSelectedHall({
        ...selectedHall,
        tables: selectedHall.tables.map((t) =>
          t.id === tableId ? { ...t, isActive: !t.isActive } : t,
        ),
      });
      toast.success(`تم ${action} الطاولة ${table.number} بنجاح`);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-l from-gray-50 to-gray-100"
    >
      {/* Navbar مبسط للصفحة */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                <FaChair className="text-white text-xl" />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة الصالات - العمود الأيمن */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3
                    className="text-lg font-bold"
                    style={{ color: "#193F94" }}
                  >
                    الصالات
                  </h3>
                  <p className="text-sm text-gray-600">
                    {halls.filter((h) => h.isActive).length} صالة نشطة
                  </p>
                </div>
                <button
                  onClick={handleAddHall}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors flex items-center"
                  style={{ backgroundColor: "#193F94" }}
                >
                  <FaPlus className="h-4 w-4 ml-2" />
                  إضافة صالة
                </button>
              </div>

              {halls.length === 0 ? (
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
                  {halls.map((hall) => (
                    <div
                      key={hall.id}
                      onClick={() => setSelectedHall(hall)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedHall?.id === hall.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      } ${!hall.isActive ? "opacity-70" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center ml-3 bg-blue-100 text-blue-700">
                            <FaUsers className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 flex items-center">
                              {hall.name}
                              {!hall.isActive && (
                                <span className="mr-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                                  معطلة
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <FaTable className="h-3 w-3 ml-1" />
                              {hall.tables.length} طاولة •{" "}
                              {hall.tables.filter((t) => t.isActive).length}{" "}
                              نشطة
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedHall?.id === hall.id && (
                        <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-3 pt-3 border-t border-gray-200">
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
                              handleToggleHallStatus(hall.id);
                            }}
                            className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center border ${
                              hall.isActive
                                ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                                : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            }`}
                          >
                            {hall.isActive ? (
                              <>
                                <FaCircle className="h-2 w-2 ml-1" />
                                تعطيل
                              </>
                            ) : (
                              <>
                                <FaPlus className="h-3 w-3 ml-1" />
                                تفعيل
                              </>
                            )}
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
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* عرض الطاولات - العمود الأوسط والأيمن */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-5">
              {selectedHall ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center ml-2 bg-blue-100 text-blue-700">
                          <FaChair className="h-4 w-4" />
                        </div>
                        <h3
                          className="text-lg font-bold"
                          style={{ color: "#193F94" }}
                        >
                          {selectedHall.name}
                        </h3>
                        {!selectedHall.isActive && (
                          <span className="mr-3 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            معطلة
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span className="ml-3 flex items-center">
                          <FaTable className="ml-1" />
                          إجمالي الطاولات: {selectedHall.tables.length}
                        </span>
                        <span className="ml-3 flex items-center">
                          <FaCircle className="ml-1 text-green-500 h-2 w-2" />
                          نشطة:{" "}
                          {selectedHall.tables.filter((t) => t.isActive).length}
                        </span>
                        <span className="ml-3 flex items-center">
                          <FaCircle className="ml-1 text-gray-400 h-2 w-2" />
                          معطلة:{" "}
                          {
                            selectedHall.tables.filter((t) => !t.isActive)
                              .length
                          }
                        </span>
                      </div>
                    </div>

                    {selectedHall.isActive && (
                      <button
                        onClick={handleAddTable}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors flex items-center"
                      >
                        <FaPlus className="h-4 w-4 ml-2" />
                        إضافة طاولة
                      </button>
                    )}
                  </div>

                  {selectedHall.tables.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-3">
                        <FaChair className="h-16 w-16 mx-auto opacity-50" />
                      </div>
                      <p className="text-gray-500">
                        لا توجد طاولات في هذه الصالة
                      </p>
                      {selectedHall.isActive && (
                        <button
                          onClick={handleAddTable}
                          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors flex items-center mx-auto"
                        >
                          <FaPlus className="h-4 w-4 ml-2" />
                          إضافة أول طاولة
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedHall.tables.map((table) => (
                        <div
                          key={table.id}
                          className={`relative bg-gray-50 rounded-xl border-2 p-4 transition-all ${
                            !table.isActive
                              ? "border-gray-300 opacity-60 bg-gray-100"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="absolute top-2 left-2">
                            <div
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center ${
                                table.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              <FaCircle
                                className={`h-1.5 w-1.5 ml-1 ${
                                  table.isActive
                                    ? "text-green-500"
                                    : "text-gray-500"
                                }`}
                              />
                              {table.isActive ? "نشطة" : "معطلة"}
                            </div>
                          </div>

                          <div className="flex flex-col items-center mt-4">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-blue-50 border-2 border-blue-300">
                              <span className="text-xl font-bold text-blue-700">
                                {table.number}
                              </span>
                            </div>
                            <span className="font-bold text-gray-800">
                              {table.number}
                            </span>
                          </div>

                          <div className="flex justify-center space-x-2 rtl:space-x-reverse mt-4 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => handleToggleTableStatus(table.id)}
                              className={`text-xs p-1.5 rounded-lg transition-colors ${
                                table.isActive
                                  ? "bg-amber-50 hover:bg-amber-100 text-amber-700"
                                  : "bg-green-50 hover:bg-green-100 text-green-700"
                              }`}
                              title={table.isActive ? "تعطيل" : "تفعيل"}
                            >
                              {table.isActive ? (
                                <FaCircle className="h-3 w-3" />
                              ) : (
                                <FaPlus className="h-3 w-3" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteTable(table.id)}
                              className="text-xs bg-red-50 hover:bg-red-100 text-red-700 p-1.5 rounded-lg transition-colors"
                              title="حذف"
                            >
                              <FaTrash className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <FaChair className="h-20 w-20 mx-auto opacity-30" />
                  </div>
                  <p className="text-gray-500 text-lg">
                    اختر صالة لعرض الطاولات
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    قم باختيار صالة من القائمة على اليمين
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* مودال إضافة/تعديل صالة */}
      {showHallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold" style={{ color: "#193F94" }}>
                  {editingHall ? "تعديل صالة" : "إضافة صالة جديدة"}
                </h3>
                <button
                  onClick={() => setShowHallModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitHall}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الصالة *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={hallForm.name}
                      onChange={handleHallFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="مثال: الصالة الرئيسية"
                      required
                    />
                  </div>

                  {!editingHall && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        عدد الطاولات *
                      </label>
                      <input
                        type="number"
                        name="tableCount"
                        value={hallForm.tableCount}
                        onChange={handleHallFormChange}
                        min="1"
                        max="50"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        الحد الأقصى 50 طاولة
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={hallForm.isActive}
                        onChange={handleHallFormChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="mr-2 text-sm font-medium text-gray-700">
                        الصالة نشطة (ستظهر في نظام الكاشير)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowHallModal(false)}
                    className="flex-1 py-3 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-lg font-bold text-white transition-colors"
                    style={{ backgroundColor: "#193F94" }}
                  >
                    {editingHall ? "حفظ التعديلات" : "إضافة صالة"}
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
