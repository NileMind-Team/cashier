import axios from "axios";
import apiConfig from "./apiConfig";

const axiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data &&
      typeof error.response.data === "string" &&
      error.response.data.includes("License expired")
    ) {
      localStorage.setItem("licenseExpired", "true");
      window.location.reload();
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
