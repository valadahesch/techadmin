import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器：自动添加 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：处理 token 过期
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const handleError = (error) => {
  const message = error.response?.data?.error || error.message || '请求失败';
  console.error('[API Error]', message);
  throw new Error(message);
};

// ========== 认证相关 ==========
export const login = (username, password) => 
  apiClient.post('/auth/login', { username, password })
    .then(res => res.data)
    .catch(handleError);

export const getCurrentUser = () => 
  apiClient.get('/auth/current-user')
    .then(res => res.data)
    .catch(handleError);

// ========== 用户管理 ==========
export const getUsers = () => 
  apiClient.get('/users').then(res => res.data).catch(handleError);

export const createUser = (user) => 
  apiClient.post('/users', user).then(res => res.data).catch(handleError);

export const updateUser = (id, user) => 
  apiClient.put(`/users/${id}`, user).then(res => res.data).catch(handleError);

export const deleteUser = (id) => 
  apiClient.delete(`/users/${id}`).catch(handleError);

export const assignRoleToUser = (userId, roleId) => 
  apiClient.post(`/users/${userId}/roles`, { role_id: roleId })
    .then(res => res.data).catch(handleError);

export const removeRoleFromUser = (userId, roleId) => 
  apiClient.delete(`/users/${userId}/roles/${roleId}`)
    .then(res => res.data).catch(handleError);

// ========== 角色管理 ==========
export const getRoles = () => 
  apiClient.get('/roles').then(res => res.data).catch(handleError);

export const createRole = (role) => 
  apiClient.post('/roles', role).then(res => res.data).catch(handleError);

export const updateRole = (id, role) => 
  apiClient.put(`/roles/${id}`, role).then(res => res.data).catch(handleError);

export const deleteRole = (id) => 
  apiClient.delete(`/roles/${id}`).catch(handleError);

export const assignPermissionToRole = (roleId, permissionId) => 
  apiClient.post(`/roles/${roleId}/permissions`, { permission_id: permissionId })
    .then(res => res.data).catch(handleError);

export const removePermissionFromRole = (roleId, permissionId) => 
  apiClient.delete(`/roles/${roleId}/permissions/${permissionId}`)
    .then(res => res.data).catch(handleError);

// ========== 权限管理 ==========
export const getPermissions = () => 
  apiClient.get('/permissions').then(res => res.data).catch(handleError);