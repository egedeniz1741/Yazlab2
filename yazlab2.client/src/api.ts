import axios from "axios";

// 1. Axios'un özel bir kopyasını oluşturuyoruz
const api = axios.create();

// 2. Her istekten önce (Request Interceptor) araya gir
api.interceptors.request.use((config) => {
  // Tarayıcı hafızasından GÜNCEL token'ı oku
  const token = localStorage.getItem("token");
  
  // Eğer token varsa, isteğin başlığına (Header) ekle
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;