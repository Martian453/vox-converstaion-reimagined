// src/lib/axios.js
import axios from "axios";
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : `http://${window.location.hostname}:5001/api`,


  withCredentials: true,
});
