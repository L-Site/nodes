import axios from 'axios';

// 创建一个axios实例
const api = axios.create({
  // baseURL: 'http://192.168.3.135:3000/api', // 你的后端API基础URL
  baseURL: 'http://8.149.138.84:3000/api',//公网ip
  timeout: 5000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器
api.interceptors.request.use(
  config => {
    // 从 localStorage 中获取 token
    const token = localStorage.getItem('token');
    
    // 如果 token 存在，就添加到请求头的 Authorization 字段中
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器，处理401（未授权）错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 如果收到401，清除token并跳转到登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;