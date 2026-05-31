import axiosInstance from "../api/axiosInstance";

const printInvoice = async (invoiceData) => {
  try {
    const response = await axiosInstance.post(
      "http://localhost:5000/print",
      invoiceData,
    );

    return {
      success: true,
      message: "تم إرسال الفاتورة للطباعة",
      data: response.data,
    };
  } catch (error) {
    console.error("Print error:", error);

    return {
      success: false,
      message: error.message || "فشلت الطباعة",
    };
  }
};

export { printInvoice };
