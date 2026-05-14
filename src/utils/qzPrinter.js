// import axiosInstance from "../api/axiosInstance";

// // eslint-disable-next-line no-unused-vars
// let isQZConnected = false;
// let organizationData = null;

// const fetchOrganizationData = async () => {
//   if (organizationData) return organizationData;

//   try {
//     const response = await axiosInstance.get("/api/Organization/Get");
//     if (response.status === 200 && response.data) {
//       organizationData = response.data;
//       return organizationData;
//     }
//   } catch (error) {
//     console.error("Failed to fetch organization data:", error);
//   }
//   return null;
// };

// const setupQZSecurity = () => {
//   window.qz.security.setCertificatePromise((resolve) => resolve(null));
//   window.qz.security.setSignaturePromise(() => (resolve) => resolve());
// };

// const connectQZ = async () => {
//   if (!window.qz) throw new Error("QZ Tray not loaded");

//   setupQZSecurity();

//   if (!window.qz.websocket.isActive()) {
//     await window.qz.websocket.connect();
//     isQZConnected = true;
//   }
// };

// const getConfig = async () => {
//   const printers = await window.qz.printers.find();

//   const preferredPrinter = "XP-80C (copy 2)";

//   const printer = printers.includes(preferredPrinter)
//     ? preferredPrinter
//     : printers[0];

//   return window.qz.configs.create(printer);
// };

// const loadImageAsBase64 = (url) => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = "Anonymous";

//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       canvas.width = img.width;
//       canvas.height = img.height;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(img, 0, 0);

//       const base64 = canvas.toDataURL("image/png");
//       resolve(base64);
//     };

//     img.onerror = (error) => {
//       console.error("فشل تحميل اللوجو:", error);
//       reject(error);
//     };

//     img.src = url;
//   });
// };

// const drawLogo = (ctx, logoBase64, startY, maxWidth, maxHeight) => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();

//     img.onload = () => {
//       let width = img.width;
//       let height = img.height;

//       const scale = Math.min(maxWidth / width, maxHeight / height, 1);
//       width = width * scale;
//       height = height * scale;

//       const x = (300 - width) / 2;

//       ctx.drawImage(img, x, startY, width, height);
//       resolve(startY + height + 10);
//     };

//     img.onerror = () => {
//       reject(new Error("فشل رسم اللوجو"));
//     };

//     img.src = logoBase64;
//   });
// };

// // 🟢 line
// const drawLine = (ctx, y) => {
//   ctx.beginPath();
//   ctx.moveTo(10, y);
//   ctx.lineTo(290, y);
//   ctx.stroke();
// };

// // 🟢 wrap text
// const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
//   const words = text.split(" ");
//   let line = "";

//   for (let n = 0; n < words.length; n++) {
//     const testLine = line + words[n] + " ";
//     const metrics = ctx.measureText(testLine);

//     if (metrics.width > maxWidth && n > 0) {
//       ctx.fillText(line, x, y);
//       line = words[n] + " ";
//       y += lineHeight;
//     } else {
//       line = testLine;
//     }
//   }

//   ctx.fillText(line, x, y);
//   return y + lineHeight;
// };

// const buildInvoiceCanvas = async (invoiceData) => {
//   await fetchOrganizationData();

//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d");

//   const scale = 3;

//   canvas.width = 300 * scale;

//   let y = 10;

//   const lineHeight = 24;

//   canvas.height = 1800 * scale;

//   ctx.scale(scale, scale);
//   ctx.imageSmoothingEnabled = false;
//   ctx.textBaseline = "top";

//   ctx.fillStyle = "#fff";
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   ctx.fillStyle = "#000";
//   ctx.direction = "rtl";

//   // 🟢 عرض اللوجو (إذا وجد)
//   if (organizationData?.logoUrl) {
//     try {
//       const logoUrl = `https://cashier.runasp.net/${organizationData.logoUrl}`;
//       const logoBase64 = await loadImageAsBase64(logoUrl);
//       y = await drawLogo(ctx, logoBase64, y, 80, 80);
//       y += 5;
//     } catch (error) {
//       console.error("فشل تحميل اللوجو:", error);
//     }
//   }

//   // 🟢 عرض اسم المؤسسة
//   ctx.textAlign = "center";
//   ctx.font = "bold 22px Arial";
//   ctx.fillText(organizationData?.name || "مطعم و كافيه", 150, y);

//   y += 32;

//   // 🟢 عرض الرقم الضريبي (إذا وجد) - خط أكبر
//   if (organizationData?.taxNumber) {
//     ctx.font = "bold 14px Arial";
//     ctx.fillText(`الرقم الضريبي: ${organizationData.taxNumber}`, 150, y);
//     y += 22;
//   }

//   // 🟢 عرض السجل التجاري (إذا وجد) - خط أكبر
//   if (organizationData?.commercialRegister) {
//     ctx.font = "bold 14px Arial";
//     ctx.fillText(
//       `السجل التجاري: ${organizationData.commercialRegister}`,
//       150,
//       y,
//     );
//     y += 22;
//   }

//   // 🟢 عرض عنوان المؤسسة (اختياري) - خط أكبر مع wrap text
//   if (organizationData?.address) {
//     ctx.font = "bold 13px Arial";
//     y = wrapText(ctx, organizationData.address, 150, y, 280, 20);
//     y += 5;
//   }

//   // 🟢 عرض هاتف المؤسسة (اختياري)
//   if (organizationData?.phone) {
//     ctx.font = "bold 13px Arial";
//     ctx.fillText(`هاتف: ${organizationData.phone}`, 150, y);
//     y += 22;
//   }

//   y += 10;
//   drawLine(ctx, y);
//   y += 20;

//   // 🟢 رقم الفاتورة والتاريخ
//   ctx.textAlign = "right";
//   ctx.font = "bold 14px Arial";

//   ctx.fillText(`رقم الفاتورة: ${invoiceData.invoiceNumber}`, 290, y);
//   y += 24;

//   ctx.fillText(
//     `التاريخ: ${new Date(invoiceData.invoiceDate || Date.now()).toLocaleString("ar-EG")}`,
//     290,
//     y,
//   );

//   y += 24;

//   // 🟢 نوع الفاتورة (تحت التاريخ مباشرة)
//   if (invoiceData.billType) {
//     let billTypeText = "";
//     switch (invoiceData.billType) {
//       case "takeaway":
//         billTypeText = "سفري";
//         break;
//       case "dinein":
//         billTypeText = "طاولة";
//         break;
//       case "delivery":
//         billTypeText = "دليفري";
//         break;
//       default:
//         billTypeText = invoiceData.billType;
//     }
//     ctx.fillText(`نوع الفاتورة: ${billTypeText}`, 290, y);
//     y += 24;
//   }

//   y += 10;
//   drawLine(ctx, y);
//   y += 20;

//   // 🟢 رقم الطاولة
//   if (invoiceData.tableName) {
//     ctx.font = "bold 14px Arial";
//     ctx.fillText(`الطاولة: ${invoiceData.tableName}`, 290, y);
//     y += 24;
//   }

//   if (invoiceData.deliveryCompanyName) {
//     ctx.font = "bold 14px Arial";
//     ctx.fillText(`شركة التوصيل: ${invoiceData.deliveryCompanyName}`, 290, y);
//     y += 24;
//   }

//   const hasCustomerInfo =
//     invoiceData.customerName ||
//     invoiceData.customerPhone ||
//     invoiceData.customerAddress;

//   if (hasCustomerInfo) {
//     ctx.font = "bold 14px Arial";

//     if (invoiceData.customerName) {
//       ctx.fillText(`العميل: ${invoiceData.customerName}`, 290, y);
//       y += 24;
//     }

//     if (invoiceData.customerPhone) {
//       ctx.fillText(`رقم الهاتف: ${invoiceData.customerPhone}`, 290, y);
//       y += 24;
//     }

//     if (invoiceData.customerAddress) {
//       y = wrapText(
//         ctx,
//         `العنوان: ${invoiceData.customerAddress}`,
//         290,
//         y,
//         280,
//         lineHeight,
//       );
//     }

//     y += 10;
//     drawLine(ctx, y);
//     y += 20;
//   }

//   // جدول المنتجات
//   ctx.font = "bold 14px Arial";

//   ctx.fillText("الصنف", 280, y);
//   ctx.fillText("الكمية", 180, y);
//   ctx.fillText("السعر", 120, y);
//   ctx.fillText("الإجمالي", 50, y);

//   y += 22;

//   drawLine(ctx, y);
//   y += 20;

//   ctx.font = "bold 14px Arial";

//   // عرض المنتجات مع ملاحظاتها
//   invoiceData.items?.forEach((item) => {
//     const total = item.price * item.quantity;

//     const rowY = y;

//     let name = item.name;
//     if (name.length > 18) name = name.substring(0, 18) + "...";

//     ctx.fillText(name, 280, rowY);
//     ctx.fillText(item.quantity.toString(), 180, rowY);
//     ctx.fillText(item.price.toFixed(2), 120, rowY);
//     ctx.fillText(total.toFixed(2), 50, rowY);

//     y += 22;

//     // عرض الإضافات إن وجدت
//     if (item.selectedOptions && item.selectedOptions.length > 0) {
//       ctx.font = "10px Arial";
//       const optionsText = item.selectedOptions
//         .map((opt) => opt.name)
//         .join(", ");
//       y = wrapText(ctx, `   إضافات: ${optionsText}`, 270, y, 260, 16);
//       ctx.font = "bold 14px Arial";
//     }

//     // 🟢 عرض ملاحظة المنتج (بشكل واضح تحت المنتج)
//     if (item.note && item.note.trim()) {
//       ctx.font = "11px Arial";
//       ctx.fillStyle = "#0000FF";
//       y = wrapText(ctx, `   ملاحظة: ${item.note}`, 270, y, 260, 16);
//       ctx.fillStyle = "#000";
//       ctx.font = "bold 14px Arial";
//     }
//   });

//   y += 10;
//   drawLine(ctx, y);
//   y += 15;

//   if (invoiceData.generalNote && invoiceData.generalNote.trim()) {
//     ctx.font = "bold 14px Arial";
//     ctx.fillStyle = "#FF6600";
//     ctx.textAlign = "right";
//     y = wrapText(
//       ctx,
//       `ملاحظة الفاتورة: ${invoiceData.generalNote}`,
//       290,
//       y,
//       280,
//       18,
//     );
//     ctx.fillStyle = "#000";
//     ctx.font = "bold 14px Arial";
//     y += 10;
//     drawLine(ctx, y);
//     y += 15;
//   }

//   // 🟢 TOTALS (الإجماليات)
//   ctx.font = "bold 14px Arial";
//   ctx.textAlign = "right";

//   const rightX = 290;

//   ctx.fillText(
//     `الإجمالي قبل الضريبة: ${invoiceData.subtotal?.toFixed(2) || "0"} ج.م`,
//     rightX,
//     y,
//   );
//   y += 24;

//   if (invoiceData.discount && invoiceData.discount > 0) {
//     ctx.fillStyle = "#FF0000";
//     const discountText = invoiceData.discountPercent
//       ? `الخصم: ${invoiceData.discountPercent}% (${invoiceData.discount?.toFixed(2) || "0"} ج.م)`
//       : `الخصم: ${invoiceData.discount?.toFixed(2) || "0"} ج.م`;
//     ctx.fillText(discountText, rightX, y);
//     ctx.fillStyle = "#000";
//     y += 24;
//   }

//   ctx.fillText(`الضريبة: ${invoiceData.tax?.toFixed(2) || "0"} ج.م`, rightX, y);
//   y += 24;

//   if (invoiceData.deliveryFee && invoiceData.deliveryFee > 0) {
//     ctx.fillText(
//       `رسوم التوصيل: ${invoiceData.deliveryFee?.toFixed(2) || "0"} ج.م`,
//       rightX,
//       y,
//     );
//     y += 24;
//   }

//   ctx.font = "bold 18px Arial";
//   ctx.fillStyle = "#193F94";
//   const totalAmount =
//     (invoiceData.subtotal || 0) +
//     (invoiceData.tax || 0) -
//     (invoiceData.discount || 0) +
//     (invoiceData.deliveryFee || 0);
//   ctx.fillText(`الإجمالي النهائي: ${totalAmount.toFixed(2)} ج.م`, rightX, y);
//   ctx.fillStyle = "#000";

//   y += 32;

//   if (invoiceData.payments && invoiceData.payments.length > 0) {
//     ctx.font = "bold 15px Arial";
//     ctx.fillText("طرق الدفع:", rightX, y);
//     y += 24;

//     ctx.font = "bold 14px Arial";
//     invoiceData.payments?.forEach((p) => {
//       ctx.fillText(`${p.methodName}: ${p.amount.toFixed(2)} ج.م`, rightX, y);
//       y += 22;
//     });
//     y += 5;
//   }

//   if (invoiceData.paidAmount && invoiceData.paidAmount > 0) {
//     ctx.font = "bold 14px Arial";
//     ctx.fillText(
//       `المدفوع: ${invoiceData.paidAmount?.toFixed(2) || "0"} ج.م`,
//       rightX,
//       y,
//     );
//     y += 24;
//   }

//   if (invoiceData.remainingAmount && invoiceData.remainingAmount > 0) {
//     ctx.fillStyle = "#FF6600";
//     ctx.fillText(
//       `المتبقي: ${invoiceData.remainingAmount?.toFixed(2) || "0"} ج.م`,
//       rightX,
//       y,
//     );
//     ctx.fillStyle = "#000";
//     y += 24;
//   }

//   if (invoiceData.isReturned) {
//     ctx.fillStyle = "#FF0000";
//     ctx.font = "bold 18px Arial";
//     ctx.fillText("فاتورة مرتجعة", rightX, y);
//     ctx.fillStyle = "#000";
//     y += 32;
//   } else if (invoiceData.isPartialPaid) {
//     ctx.fillStyle = "#FF6600";
//     ctx.font = "bold 18px Arial";
//     ctx.fillText("فاتورة آجلة", rightX, y);
//     ctx.fillStyle = "#000";
//     y += 32;
//   }

//   y += 20;
//   drawLine(ctx, y);
//   y += 18;

//   const finalCanvas = document.createElement("canvas");
//   const finalCtx = finalCanvas.getContext("2d");

//   finalCanvas.width = canvas.width;
//   finalCanvas.height = (y + 50) * scale;

//   finalCtx.drawImage(canvas, 0, 0);

//   return finalCanvas;
// };

// const canvasToImage = (canvas) => {
//   return canvas.toDataURL("image/png");
// };

// const printInvoiceImage = async (invoiceData) => {
//   const config = await getConfig();

//   const canvas = await buildInvoiceCanvas(invoiceData);
//   const image = canvasToImage(canvas);

//   await window.qz.print(config, [
//     {
//       type: "image",
//       format: "base64",
//       data: image.replace(/^data:image\/png;base64,/, ""),
//       options: {
//         density: 300,
//       },
//     },
//   ]);
// };

// const printInvoice = async (invoiceData) => {
//   try {
//     await connectQZ();
//     await printInvoiceImage(invoiceData);

//     return {
//       success: true,
//       message: "تمت الطباعة بنجاح",
//     };
//   } catch (error) {
//     console.error("Print error:", error);

//     return {
//       success: false,
//       message: error.message || "فشلت الطباعة",
//     };
//   }
// };

// export { connectQZ, getConfig, printInvoice, fetchOrganizationData };
