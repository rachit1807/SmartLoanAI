import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

API.interceptors.response.use(response => response, error => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/users/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.assign('/');
    }
    return Promise.reject(error);
});

export async function downloadDocument(id, filename) {
    const response = await API.get(`/documents/${id}/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default API;
