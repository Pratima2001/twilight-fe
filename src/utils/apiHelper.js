import axios from "axios";
import { getAuthFailureMessage } from "@/utils/authErrors";
import { redirectToLogin } from "@/utils/authSession";
import useAlertStore from "@/stores/useAlertStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

function handle503Error(message) {
  useAlertStore.getState().setAlert({
    severity: "warning",
    message: message || "The server is currently unavailable. Please try again later.",
  });
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const config = error.config;

    if ((status === 401 || status === 403) && !config?.skipAuthRedirect) {
      redirectToLogin(getAuthFailureMessage(error, status));
    } else if (status === 503) {
      handle503Error(error.response?.data?.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
