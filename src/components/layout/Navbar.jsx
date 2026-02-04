import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Navbar({ isShiftOpen, onShiftClose, shiftSummary }) {
  const navigate = useNavigate();

  const handleCloseShift = () => {
    Swal.fire({
      title: "هل أنت متأكد من إغلاق الوردية؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#193F94",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، إغلاق الوردية",
      cancelButtonText: "البقاء في الوردية",
      reverseButtons: true,
      customClass: {
        confirmButton: "px-4 py-2",
        cancelButton: "px-4 py-2",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (onShiftClose) {
          onShiftClose();
        }

        Swal.fire({
          title: "تم إغلاق الوردية بنجاح!",
          html: `
            <div dir="rtl" class="text-right">
              <div class="mb-3">
                <h4 class="font-bold text-lg mb-2" style="color: #193F94">تفاصيل الوردية المغلقة</h4>
              </div>
              
              <div class="space-y-2">
                <div class="flex justify-between items-center border-b pb-1">
                  <span class="text-gray-700">عدد الفواتير:</span>
                  <span class="font-bold">${shiftSummary?.totalBills || 0}</span>
                </div>
                
                <div class="flex justify-between items-center border-b pb-1">
                  <span class="text-gray-700">الفواتير المكتملة:</span>
                  <span class="font-bold text-green-600">${shiftSummary?.completedBills || 0}</span>
                </div>
                
                <div class="flex justify-between items-center border-b pb-1">
                  <span class="text-gray-700">الفواتير المعلقة:</span>
                  <span class="font-bold text-amber-600">${shiftSummary?.pendingBills || 0}</span>
                </div>
                
                <div class="flex justify-between items-center border-b pb-1">
                  <span class="text-gray-700">إجمالي المبيعات:</span>
                  <span class="font-bold" style="color: #193F94">${shiftSummary?.totalSales?.toFixed(2) || "0.00"} ج.م</span>
                </div>
                
                <div class="flex justify-between items-center border-b pb-1">
                  <span class="text-gray-700">إجمالي الضرائب:</span>
                  <span class="font-bold">${shiftSummary?.totalTax?.toFixed(2) || "0.00"} ج.م</span>
                </div>
                
                <div class="flex justify-between items-center border-b pb-1">
                  <span class="text-gray-700">إجمالي الخصومات:</span>
                  <span class="font-bold text-red-600">${shiftSummary?.totalDiscount?.toFixed(2) || "0.00"} ج.م</span>
                </div>
                
                <div class="flex justify-between items-center border-b pb-1 pt-2">
                  <span class="text-gray-700 font-bold">صافي الإيرادات:</span>
                  <span class="font-bold text-lg" style="color: #10B981">${shiftSummary?.netRevenue?.toFixed(2) || "0.00"} ج.م</span>
                </div>
              </div>
              
              <div class="mt-4 pt-3 border-t border-gray-200">
                <p class="text-sm text-gray-500">
                  وقت بداية الوردية: ${shiftSummary?.startTime || "غير محدد"}
                </p>
                <p class="text-sm text-gray-500">
                  وقت نهاية الوردية: ${new Date().toLocaleTimeString("ar-EG")}
                </p>
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonColor: "#193F94",
          confirmButtonText: "موافق",
          showConfirmButton: true,
          showCancelButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/login");
          }
        });
      }
    });
  };

  return (
    <div className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
              <span className="text-white font-bold">$</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#193F94" }}>
              نظام الكاشير
            </h1>
            {isShiftOpen && (
              <span className="mr-3 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium border border-green-200">
                الوردية مفتوحة
              </span>
            )}
          </div>

          <div className="flex items-center">
            {isShiftOpen && (
              <button
                onClick={handleCloseShift}
                className="px-4 py-2 rounded-lg font-medium border transition-all flex items-center"
                style={{ borderColor: "#F59E0B", color: "#F59E0B" }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#F59E0B";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#F59E0B";
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                    clipRule="evenodd"
                  />
                </svg>
                إغلاق الوردية
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
