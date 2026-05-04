import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, logout, clearError } from "../redux/slices/loginSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../api/axiosInstance";
import { User, Lock, LogIn, LogOut, Play, Wallet } from "lucide-react";
import { FaSpinner } from "react-icons/fa";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isOpeningShift, setIsOpeningShift] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isOpeningWithoutShift, setIsOpeningWithoutShift] = useState(false);
  const [isCheckingShift, setIsCheckingShift] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isLogged, user, error } = useSelector(
    (state) => state.auth,
  );

  const isAdmin = user?.roles?.includes("Admin") || false;

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error.description || error.message || "حدث خطأ");
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    const checkShiftStatus = async () => {
      if (isLogged && user) {
        setIsCheckingShift(true);
        try {
          const response = await axiosInstance.post("/api/Shifts/GetDetails");

          if (response.status === 200 && response.data) {
            const shiftData = response.data;
            const isShiftOpen = shiftData.endTime === "0001-01-01T00:00:00";

            if (isShiftOpen) {
              navigate("/");
            }
          }
        } catch (error) {
          console.error("Failed to check shift status:", error);
        } finally {
          setIsCheckingShift(false);
        }
      }
    };

    checkShiftStatus();
  }, [isLogged, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      dispatch(clearError());
    }
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      try {
        const result = await dispatch(loginUser(formData)).unwrap();

        if (result?.token) {
          toast.success("تم تسجيل الدخول بنجاح!");
        }
      } catch (error) {
        console.error("Login failed:", error);
      }
    } else {
      toast.warning("يرجى ملء جميع الحقول");
    }
  };

  const handleLoginWithoutShift = async () => {
    if (isLogged && user) {
      try {
        const response = await axiosInstance.post("/api/Shifts/GetDetails");
        if (response.status === 200 && response.data) {
          const isShiftOpen = response.data.endTime === "0001-01-01T00:00:00";

          if (isShiftOpen) {
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Failed to check shift status:", error);
      }
      return;
    }

    if (formData.username && formData.password) {
      setIsOpeningWithoutShift(true);
      try {
        const result = await dispatch(loginUser(formData)).unwrap();

        if (result?.token) {
          toast.success("تم تسجيل الدخول بنجاح!");
          try {
            const shiftResponse = await axiosInstance.post(
              "/api/Shifts/GetDetails",
            );
            if (shiftResponse.status === 200 && shiftResponse.data) {
              const isShiftOpen =
                shiftResponse.data.endTime === "0001-01-01T00:00:00";

              if (isShiftOpen) {
                navigate("/");
              }
            }
          } catch (shiftError) {
            console.error("Failed to check shift after login:", shiftError);
          }
        }
      } catch (error) {
        console.error("Login failed:", error);
      } finally {
        setIsOpeningWithoutShift(false);
      }
    } else {
      toast.warning("يرجى ملء جميع الحقول أولاً");
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      dispatch(logout());
      toast.info("تم تسجيل الخروج بنجاح");

      setFormData({
        username: "",
        password: "",
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleStartShift = async () => {
    setIsOpeningShift(true);

    try {
      const response = await axiosInstance.post("/api/Shifts/Open");

      if (response.status === 200 || response.status === 201) {
        toast.success("تم بدء الوردية بنجاح!");
        console.log("Shift opened successfully:", response.data);
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to open shift:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "حدث خطأ أثناء بدء الوردية";
      toast.error(`فشل بدء الوردية: ${errorMessage}`);
    } finally {
      setIsOpeningShift(false);
    }
  };

  const isLoginDisabled = !formData.username || !formData.password || isLoading;

  if (isCheckingShift) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-gradient-to-l from-gray-50 to-gray-100 p-4"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <FaSpinner
            className="animate-spin h-8 w-8 mx-auto mb-4"
            style={{ color: "#193F94" }}
          />
        </div>
      </div>
    );
  }

  if (isLogged && user) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-gradient-to-l from-gray-50 to-gray-100 p-4"
      >
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div
              className="h-2 w-full"
              style={{
                background:
                  "linear-gradient(to left, #193F94, #20A4D4, #1DC7E0)",
              }}
            ></div>

            <div className="p-8">
              <div className="text-center">
                <div className="mb-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: "#E8F4FC" }}
                  >
                    <User className="h-10 w-10" style={{ color: "#193F94" }} />
                  </div>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "#193F94" }}
                  >
                    مرحبا!
                  </h2>
                  <p className="text-gray-600 mt-1">تم تسجيل دخولك بنجاح</p>
                  <p className="mt-2 font-medium text-lg">
                    {user.firstName || user.username}
                  </p>
                  {isAdmin && (
                    <p className="text-xs text-blue-600 mt-1">(مدير النظام)</p>
                  )}
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleStartShift}
                    disabled={isOpeningShift}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform ${
                      isOpeningShift
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-[1.02] active:scale-[0.98]"
                    } shadow-md flex items-center justify-center`}
                    style={{ backgroundColor: "#20A4D4" }}
                    onMouseEnter={(e) => {
                      if (!isOpeningShift) {
                        e.target.style.backgroundColor = "#1DC7E0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isOpeningShift) {
                        e.target.style.backgroundColor = "#20A4D4";
                      }
                    }}
                  >
                    {isOpeningShift ? (
                      <>
                        <FaSpinner className="animate-spin ml-2 h-5 w-5 text-white" />
                        جاري بدء الوردية...
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 ml-2" />
                        بداية الوردية
                      </>
                    )}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={handleLoginWithoutShift}
                      disabled={isOpeningWithoutShift}
                      className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform ${
                        isOpeningWithoutShift
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:scale-[1.02] active:scale-[0.98]"
                      } shadow-md flex items-center justify-center`}
                      style={{ backgroundColor: "#10B981" }}
                      onMouseEnter={(e) => {
                        if (!isOpeningWithoutShift) {
                          e.target.style.backgroundColor = "#059669";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isOpeningWithoutShift) {
                          e.target.style.backgroundColor = "#10B981";
                        }
                      }}
                    >
                      {isOpeningWithoutShift ? (
                        <>
                          <FaSpinner className="animate-spin ml-2 h-5 w-5 text-white" />
                          جاري الدخول...
                        </>
                      ) : (
                        <>
                          <Wallet className="h-5 w-5 ml-2" />
                          فتح الكاشير بدون بداية وردية
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`w-full py-3 px-4 rounded-lg font-medium border transition-all duration-300 transform ${
                      isLoggingOut
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-[1.02] active:scale-[0.98]"
                    } flex items-center justify-center`}
                    style={{ borderColor: "#193F94", color: "#193F94" }}
                    onMouseEnter={(e) => {
                      if (!isLoggingOut) {
                        e.target.style.backgroundColor = "#193F94";
                        e.target.style.color = "white";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoggingOut) {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "#193F94";
                      }
                    }}
                  >
                    {isLoggingOut ? (
                      <>
                        <FaSpinner className="animate-spin ml-2 h-5 w-5" />
                        جاري تسجيل الخروج...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-5 w-5 ml-2" />
                        تسجيل الخروج
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-2 rtl:space-x-reverse">
            <div
              className="w-8 h-4 rounded shadow-sm"
              style={{ backgroundColor: "#193F94" }}
            ></div>
            <div
              className="w-8 h-4 rounded shadow-sm"
              style={{ backgroundColor: "#20A4D4" }}
            ></div>
            <div
              className="w-8 h-4 rounded shadow-sm"
              style={{ backgroundColor: "#1DC7E0" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-gradient-to-l from-gray-50 to-gray-100 p-4"
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div
            className="h-2 w-full"
            style={{
              background: "linear-gradient(to left, #193F94, #20A4D4, #1DC7E0)",
            }}
          ></div>

          <div className="p-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold" style={{ color: "#193F94" }}>
                تسجيل الدخول
              </h2>
              <p className="text-gray-500 mt-1">أدخل بيانات الدخول الخاصة بك</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={() => handleFocus("username")}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white text-right"
                    required
                    dir="rtl"
                    disabled={isLoading}
                    autoComplete="username"
                  />
                  <label
                    htmlFor="username"
                    className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                      focusedField === "username" || formData.username
                        ? "-top-2.5 text-xs text-blue-500 font-medium"
                        : "top-3 text-gray-400 text-sm"
                    }`}
                  >
                    <span className="flex items-center">
                      <User className="w-4 h-4 ml-1" />
                      اسم المستخدم *
                    </span>
                  </label>
                </div>
              </div>

              <div className="mb-8">
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus("password")}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white text-right"
                    required
                    dir="rtl"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <label
                    htmlFor="password"
                    className={`absolute right-3 px-2 transition-all pointer-events-none bg-white ${
                      focusedField === "password" || formData.password
                        ? "-top-2.5 text-xs text-blue-500 font-medium"
                        : "top-3 text-gray-400 text-sm"
                    }`}
                  >
                    <span className="flex items-center">
                      <Lock className="w-4 h-4 ml-1" />
                      كلمة المرور *
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoginDisabled}
                className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-300 transform ${
                  isLoginDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-[1.02] active:scale-[0.98]"
                } shadow-md flex items-center justify-center`}
                style={{ backgroundColor: "#193F94" }}
                onMouseEnter={(e) => {
                  if (!isLoginDisabled) {
                    e.target.style.backgroundColor = "#20A4D4";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoginDisabled) {
                    e.target.style.backgroundColor = "#193F94";
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin ml-2 h-5 w-5 text-white" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 ml-2" />
                    تسجيل الدخول
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="flex justify-center mt-8 space-x-2 rtl:space-x-reverse">
          <div
            className="w-8 h-4 rounded shadow-sm"
            style={{ backgroundColor: "#193F94" }}
          ></div>
          <div
            className="w-8 h-4 rounded shadow-sm"
            style={{ backgroundColor: "#20A4D4" }}
          ></div>
          <div
            className="w-8 h-4 rounded shadow-sm"
            style={{ backgroundColor: "#1DC7E0" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
