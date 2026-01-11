import axios from "axios";

const axiosInstance = axios.create({
  baseURL: 
  // "http://localhost:8080/api/nikutek",
  "https://nikutek-backend.onrender.com/api/nikutek",
});

export default axiosInstance;
