// src/lib/axios.js
import axios from "axios";
export const axiosInstance = axios.create({
  baseURL: `http://${window.location.hostname}:5001/api`,


  withCredentials: true,
});
