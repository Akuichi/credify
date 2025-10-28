import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Check if there's a stored token and add it to default headers
const storedToken = localStorage.getItem('auth_token');
if (storedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

// Add request interceptor to handle XSRF-TOKEN
api.interceptors.request.use(function (config) {
  let token = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  
  if (token) {
    // Make sure to decode the token properly
    token = decodeURIComponent(token);
    config.headers['X-XSRF-TOKEN'] = token;
  }
  
  return config;
}, function (error) {
  return Promise.reject(error);
});

export default api
