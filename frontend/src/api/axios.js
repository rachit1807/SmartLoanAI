import axios from "axios";
import { clearSession, getToken, migrateSession, portalForPath } from './session';

migrateSession();

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
});

API.interceptors.request.use((config) => {
    config.portal = config.portal || portalForPath(window.location.pathname);
    const token = getToken(config.portal);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

API.interceptors.response.use(response => response, error => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/users/login')) {
        const portal = error.config?.portal || 'applicant';
        // An old in-flight response must not sign out a newly logged-in account.
        if (error.config?.headers?.Authorization === `Bearer ${getToken(portal)}`) {
            clearSession(portal);
            if (portalForPath(window.location.pathname) === portal) {
                window.location.assign(portal === 'admin' ? '/admin-login' : '/');
            }
        }
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
