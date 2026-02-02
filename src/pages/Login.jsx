import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setFormData({
      username: "",
      password: "",
    });
  };

  const handleStartShift = () => {
    toast.success("تم بدء الوردية بنجاح!", {});
    navigate("/");
  };

  const isLoginDisabled = !formData.username || !formData.password;

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
            {!isLoggedIn ? (
              <>
                <div className="mb-8 text-center">
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "#193F94" }}
                  >
                    تسجيل الدخول
                  </h2>
                  <p className="text-gray-500 mt-1">
                    أدخل بيانات الدخول الخاصة بك
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label
                      htmlFor="username"
                      className="block text-gray-700 font-medium mb-2 text-right"
                    >
                      اسم المستخدم
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-right"
                      placeholder="أدخل اسم المستخدم"
                      required
                      dir="rtl"
                    />
                  </div>

                  <div className="mb-8">
                    <label
                      htmlFor="password"
                      className="block text-gray-700 font-medium mb-2 text-right"
                    >
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-right"
                      placeholder="أدخل كلمة المرور"
                      required
                      dir="rtl"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoginDisabled}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform ${
                      isLoginDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-[1.02] active:scale-[0.98]"
                    }`}
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
                    تسجيل الدخول
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: "#E8F4FC" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10"
                      style={{ color: "#193F94" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "#193F94" }}
                  >
                    مرحبا!
                  </h2>
                  <p className="text-gray-600 mt-1">تم تسجيل دخولك بنجاح</p>
                  <p className="mt-2 font-medium text-lg">
                    {formData.username}
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleStartShift}
                    className="w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
                    style={{ backgroundColor: "#20A4D4" }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#1DC7E0")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "#20A4D4")
                    }
                  >
                    بداية الوردية
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full py-3 px-4 rounded-lg font-medium border transition-all duration-300"
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
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            )}
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
