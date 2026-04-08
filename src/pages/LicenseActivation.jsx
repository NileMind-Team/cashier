import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { FaSpinner, FaKey } from "react-icons/fa";
import { Shield, ShieldCheck, X } from "lucide-react";

export default function LicenseActivation({ onActivationSuccess }) {
  const [serialKey, setSerialKey] = useState("");
  const [activationMessage, setActivationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleActivation = async () => {
    if (!serialKey.trim()) {
      setActivationMessage("Please enter serial key");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        "/api/license/activate",
        JSON.stringify(serialKey),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const text = response.data;

      if (response.status === 200 || response.status === 201) {
        setActivationMessage(
          typeof text === "string" ? text : JSON.stringify(text),
        );
        setIsSuccess(true);
        setTimeout(() => {
          localStorage.removeItem("licenseExpired");
          if (onActivationSuccess) {
            onActivationSuccess();
          }
        }, 1000);
      } else {
        setActivationMessage(
          typeof text === "string" ? text : "Activation failed",
        );
        setIsSuccess(false);
      }
    } catch (err) {
      console.error("Activation error:", err);

      if (err.response && err.response.data) {
        const errorMessage =
          typeof err.response.data === "string"
            ? err.response.data
            : err.response.data.message ||
              err.response.data.title ||
              "Activation failed";
        setActivationMessage(errorMessage);
      } else {
        setActivationMessage("Activation failed");
      }
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
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
              <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center ml-3">
                <Shield className="text-white text-lg" />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "#193F94" }}>
                نظام الكاشير - تفعيل الترخيص
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Professional Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center ml-3">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">تفعيل الترخيص</h2>
              </div>
              <p className="text-blue-100 text-sm text-center mt-2">
                يرجى إدخال مفتاح الترخيص لتفعيل النظام
              </p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={serialKey}
                    onChange={(e) => setSerialKey(e.target.value)}
                    placeholder="أدخل مفتاح الترخيص"
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-right"
                    dir="rtl"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaKey className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleActivation}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: "#193F94" }}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <FaSpinner className="w-5 h-5 ml-2 animate-spin" />
                    جاري التفعيل...
                  </div>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5 ml-2" />
                    تفعيل الترخيص
                  </>
                )}
              </button>

              {activationMessage && (
                <div
                  className={`mt-4 p-3 rounded-xl text-sm text-center font-medium ${
                    isSuccess
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {isSuccess ? (
                      <ShieldCheck className="h-4 w-4 ml-2" />
                    ) : (
                      <X className="h-4 w-4 ml-2" />
                    )}
                    {activationMessage}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
