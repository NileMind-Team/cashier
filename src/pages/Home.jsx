import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Home() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);

  const products = [
    {
      id: 1,
      name: "قهوة تركية",
      price: 15,
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 2,
      name: "شاي أخضر",
      price: 10,
      image:
        "https://images.unsplash.com/photo-1561047029-3000c68339ca?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 3,
      name: "عصير برتقال",
      price: 12,
      image:
        "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 4,
      name: "كابتشينو",
      price: 18,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 5,
      name: "إسبريسو",
      price: 12,
      image:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 6,
      name: "ساندويتش جبنة",
      price: 25,
      image:
        "https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 7,
      name: "ساندويتش دجاج",
      price: 30,
      image:
        "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 8,
      name: "ساندويتش لحم",
      price: 35,
      image:
        "https://images.unsplash.com/photo-1550317138-10000687a72b?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 9,
      name: "كرواسون",
      price: 8,
      image:
        "https://images.unsplash.com/photo-1550317138-10000687a72b?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 10,
      name: "دونات",
      price: 10,
      image:
        "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 11,
      name: "تشيز كيك",
      price: 20,
      image:
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 12,
      name: "كيك شوكولاتة",
      price: 22,
      image:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 13,
      name: "مياه معدنية",
      price: 5,
      image:
        "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 14,
      name: "مشروب غازي",
      price: 7,
      image:
        "https://images.unsplash.com/photo-1561758033-7e924f619b47?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 15,
      name: "عصير مانجو",
      price: 15,
      image:
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 16,
      name: "سلطة خضار",
      price: 22,
      image:
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 17,
      name: "بطاطس مقلية",
      price: 15,
      image:
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 18,
      name: "بيتزا صغيرة",
      price: 35,
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 19,
      name: "برجر لحم",
      price: 40,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 20,
      name: "سوشي",
      price: 45,
      image:
        "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 21,
      name: "آيس كريم",
      price: 12,
      image:
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 22,
      name: "قهوة مثلجة",
      price: 20,
      image:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 23,
      name: "شاي مثلج",
      price: 12,
      image:
        "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 24,
      name: "معكرونة",
      price: 28,
      image:
        "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 25,
      name: "ستيك لحم",
      price: 65,
      image:
        "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=150&h=150&fit=crop&crop=center",
    },
  ];

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    toast.success(`تم إضافة ${product.name} إلى الفاتورة`);
  };

  const removeFromCart = (id) => {
    const existingItem = cart.find((item) => item.id === id);

    if (existingItem.quantity > 1) {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        ),
      );
    } else {
      setCart(cart.filter((item) => item.id !== id));
    }
  };

  const deleteFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalTax = (subtotal * tax) / 100;
  const totalDiscount = (subtotal * discount) / 100;
  const total = subtotal + totalTax - totalDiscount;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("الفاتورة فارغة");
      return;
    }

    const receipt = {
      items: cart,
      subtotal,
      tax,
      discount,
      total,
      date: new Date().toLocaleString(),
    };

    console.log("Receipt:", receipt);
    toast.success("تم إتمام عملية البيع بنجاح!");

    setCart([]);
    setTax(0);
    setDiscount(0);
  };

  const handleLogout = () => {
    navigate("/");
  };

  const resetCart = () => {
    if (cart.length === 0) {
      toast.info("الفاتورة فارغة بالفعل");
      return;
    }

    setCart([]);
    setTax(0);
    setDiscount(0);
    toast.info("تم إعادة تعيين الفاتورة");
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col bg-gradient-to-l from-gray-50 to-gray-100 overflow-hidden"
    >
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
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="text-right">
                <p className="font-medium">
                  {new Date().toLocaleDateString("ar-EG")}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleTimeString("ar-EG")}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-medium border transition-all"
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
                خروج
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col h-[calc(100vh-80px)]">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-full overflow-hidden flex flex-col">
              <div className="mb-6">
                <h2 className="text-xl font-bold" style={{ color: "#193F94" }}>
                  المنتجات
                </h2>
                <p className="text-gray-500">
                  اختر المنتجات لإضافتها إلى الفاتورة
                </p>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-5 gap-2">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="bg-gray-50 hover:bg-blue-50 rounded-lg p-2 flex items-center transition-all duration-300 transform active:scale-[0.98] border border-gray-200 h-20"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden ml-2 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex-1 text-right">
                        <h3 className="font-medium text-gray-800 text-xs mb-1 leading-tight">
                          {product.name}
                        </h3>
                        <p
                          className="text-sm font-bold"
                          style={{ color: "#193F94" }}
                        >
                          {product.price} ج.م
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 h-full flex flex-col">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold" style={{ color: "#193F94" }}>
                  الفاتورة
                </h2>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {cart.length} منتج
                </span>
              </div>

              <div className="flex-1 overflow-y-auto mb-4 pr-2 min-h-0">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <div className="text-5xl mb-4">🛒</div>
                    <p className="text-lg">لا توجد منتجات في الفاتورة</p>
                    <p className="text-sm mt-2">قم بإضافة منتجات من القائمة</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-lg overflow-hidden ml-2 flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="max-w-[120px]">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <p className="text-xs text-gray-500">
                              {item.price} ج.م
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="flex items-center mr-3">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-sm"
                            >
                              -
                            </button>
                            <span className="mx-2 font-bold text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-sm"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-left min-w-[70px]">
                            <p className="font-bold text-sm">
                              {item.price * item.quantity} ج.م
                            </p>
                            <button
                              onClick={() => deleteFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 text-xs mt-1"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-2 mt-auto">
                <div className="flex justify-between">
                  <span className="text-sm">المجموع الفرعي:</span>
                  <span className="font-bold text-sm">
                    {subtotal.toFixed(2)} ج.م
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">الضريبة:</span>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(Number(e.target.value))}
                      className="w-14 text-right px-1 py-1 border rounded mr-2 text-sm"
                      min="0"
                      max="100"
                    />
                    <span className="font-bold text-sm">
                      {totalTax.toFixed(2)} ج.م
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">الخصم:</span>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-14 text-right px-1 py-1 border rounded mr-2 text-sm"
                      min="0"
                      max="100"
                    />
                    <span className="font-bold text-sm">
                      {totalDiscount.toFixed(2)} ج.م
                    </span>
                  </div>
                </div>

                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-bold">الإجمالي:</span>
                  <span
                    className="font-bold text-lg"
                    style={{ color: "#193F94" }}
                  >
                    {total.toFixed(2)} ج.م
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={resetCart}
                className="py-3 px-4 rounded-lg font-medium border transition-all text-sm"
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
                إعادة تعيين
              </button>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className={`py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform text-sm ${
                  cart.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-[1.02] active:scale-[0.98]"
                }`}
                style={{ backgroundColor: "#20A4D4" }}
                onMouseEnter={(e) => {
                  if (cart.length > 0) {
                    e.target.style.backgroundColor = "#1DC7E0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (cart.length > 0) {
                    e.target.style.backgroundColor = "#20A4D4";
                  }
                }}
              >
                إتمام البيع
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
