import axios from "axios";

const API = axios.create({
  baseURL: "https://dsrprantotradersbackend.onrender.com/api", // ensure this matches your backend
});
 
// const API = axios.create({
//   baseURL: "http://localhost:5000/api", // ensure this matches your backend
// }); 

// const API = axios.create({
//   baseURL: "http://localhost:5000/api", // ensure this matches your backend
// });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config; 
});

export default API;
