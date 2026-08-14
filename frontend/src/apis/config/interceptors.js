import api from "./api";
import { toast } from "react-toastify";
import axios from "axios";
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            originalRequest && 
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/login") &&
            !originalRequest.url.includes("/auth/refresh")
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if(!refreshToken){
                  throw new Error("Refresh Token Not Found !");
                }
                const response = await axios.post(
                "http://localhost:9090/auth/refresh",
                //"https://bulb-delivery-sanitizer.ngrok-free.dev/",
                null,{
                  headers:{
                    Authorization: `Bearer ${refreshToken}`,
                  },
                }   
                );
                const accessToken = response.data.accessToken;
                localStorage.setItem("accessToken",accessToken);

                originalRequest.headers.Authorization =
                    `Bearer ${accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                toast.error(
                    "Session expired. Please log in again."
                );

                window.location.href = "/auth/login";

                return Promise.reject(refreshError);
            }
        }

        const message =
            error.response?.data?.message ||
            "Something went wrong.";

        toast.error(message);

        return Promise.reject(error);
    }
);

export default api;
