import axios from 'axios';

// Configurar URL base do axios
axios.defaults.baseURL = '';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Interceptor para adicionar token de autenticação
axios.interceptors.request.use(function (config) {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

// Interceptor para tratar erros de resposta
axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
