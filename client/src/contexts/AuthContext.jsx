import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [menuPermissions, setMenuPermissions] = useState([]);
  const [pagePermissions, setPagePermissions] = useState([]);
  const [buttonPermissions, setButtonPermissions] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // 正确读取权限结构
        const perms = userData.permissions || { all: [], menus: [], pages: [], buttons: [] };
        setPermissions(perms.all || []);
        setMenuPermissions(perms.menus || []);
        setPagePermissions(perms.pages || []);
        setButtonPermissions(perms.buttons || []);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '登录失败');
    }
    
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    
    // 正确读取权限结构
    const perms = data.user.permissions || { all: [], menus: [], pages: [], buttons: [] };
    setPermissions(perms.all || []);
    setMenuPermissions(perms.menus || []);
    setPagePermissions(perms.pages || []);
    setButtonPermissions(perms.buttons || []);
    
    return data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    setPermissions([]);
    setMenuPermissions([]);
    setPagePermissions([]);
    setButtonPermissions([]);
  };

  // 检查是否有指定权限
  const hasPermission = (permissionCode) => {
    return permissions.includes(permissionCode);
  };

  // 检查是否有任一权限
  const hasAnyPermission = (permissionCodes) => {
    return permissionCodes.some(code => permissions.includes(code));
  };

  // 检查是否有所有权限
  const hasAllPermissions = (permissionCodes) => {
    return permissionCodes.every(code => permissions.includes(code));
  };

  // 检查菜单权限（使用专门的菜单权限列表）
  const hasMenuPermission = (menuCode) => {
    // 如果是admin用户，默认拥有所有菜单权限
    if (user?.username === 'admin') return true;
    return menuPermissions.includes(menuCode);
  };

  // 检查页面权限
  const hasPagePermission = (pageCode) => {
    // 如果是admin用户，默认拥有所有页面权限
    if (user?.username === 'admin') return true;
    // 如果没有专门的页面权限，检查对应的资源权限
    if (pageCode === 'page:user:management' && hasPermission('user:view')) return true;
    if (pageCode === 'page:role:management' && hasPermission('role:view')) return true;
    if (pageCode === 'page:permission:management' && hasPermission('permission:view')) return true;
    if (pageCode === 'page:leak:scan' && hasPermission('leak:view')) return true;
    return pagePermissions.includes(pageCode);
  };

  // 检查按钮权限
  const hasButtonPermission = (buttonCode) => {
    // 如果是admin用户，默认拥有所有按钮权限
    if (user?.username === 'admin') return true;
    
    // 按钮到权限的映射
    const buttonToPermissionMap = {
      'button:user:create': 'user:create',
      'button:user:edit': 'user:edit',
      'button:user:delete': 'user:delete',
      'button:user:assign_role': 'user:edit',
      'button:role:create': 'role:manage',
      'button:role:edit': 'role:manage',
      'button:role:delete': 'role:manage',
      'button:role:assign_permission': 'role:manage',
      'button:leak:extract': 'leak:extract',
      'button:leak:export': 'leak:export',
      'button:assessment:create': 'assessment:manage',
      'button:assessment:edit': 'assessment:manage',
      'button:assessment:delete': 'assessment:manage',
    };
    
    const requiredPerm = buttonToPermissionMap[buttonCode];
    if (requiredPerm) {
      return hasPermission(requiredPerm);
    }
    
    return buttonPermissions.includes(buttonCode);
  };

  const value = {
    user,
    permissions,
    menuPermissions,
    pagePermissions,
    buttonPermissions,
    loading,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasMenuPermission,
    hasPagePermission,
    hasButtonPermission,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};