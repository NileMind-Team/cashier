import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/api/Auth/Login", {
        userName: formData.username,
        password: formData.password,
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const loginSlice = createSlice({
  name: "auth",
  initialState: {
    isLoading: false,
    isLogged: !!localStorage.getItem("token"),
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
    error: null,
  },

  reducers: {
    logout: (state) => {
      state.isLogged = false;
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;

        if (data?.token) {
          state.isLogged = true;
          state.token = data.token;

          state.user = {
            id: data.id || data.userId,
            username: data.userName || data.username,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            roles: data.roles || ["User"],
          };

          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(state.user));
        } else {
          state.error = {
            message: "بيانات الدخول غير صحيحة",
            description: "يرجى التحقق من اسم المستخدم وكلمة المرور",
          };
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        const errorData = action.payload;

        if (errorData?.errors?.[0]?.description === "Invalid email/password") {
          state.error = {
            message: "فشل تسجيل الدخول",
            description: "اسم المستخدم أو كلمة المرور غير صحيحة",
          };
        } else if (
          errorData?.title === "Unauthorized" ||
          errorData?.status === 401
        ) {
          state.error = {
            message: "غير مصرح",
            description: "يرجى التحقق من بيانات الدخول والمحاولة مرة أخرى",
          };
        } else if (errorData?.message) {
          state.error = {
            message: "حدث خطأ",
            description: errorData.message,
          };
        } else if (typeof errorData === "string") {
          state.error = {
            message: "حدث خطأ",
            description: errorData.includes("Network Error")
              ? "خطأ في الاتصال بالإنترنت"
              : errorData,
          };
        } else {
          state.error = {
            message: "حدث خطأ",
            description: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى",
          };
        }
      });
  },
});

export const { logout, clearError } = loginSlice.actions;
export default loginSlice.reducer;
