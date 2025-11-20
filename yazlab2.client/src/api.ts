import axios from "axios";

// 1. Axios'un özel bir kopyasýný oluþturuyoruz
const api = axios.create();

// 2. Her istekten önce (Request Interceptor) araya gir
api.interceptors.request.use((config) => {
  // Tarayýcý hafýzasýndan GÜNCEL token'ý oku
  const token = localStorage.getItem("token");
  
  // Eðer token varsa, isteðin baþlýðýna (Header) ekle
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;