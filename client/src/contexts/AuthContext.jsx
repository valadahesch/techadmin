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
  const [permissions, setPermissions] = useState({
    all: [],
    menus: [],
    pages: [],
    buttons: [],
    apis: [],
    details: []
  });

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
        if (userData.permissions) {
          setPermissions(userData.permissions);
        }
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
    setPermissions(data.user.permissions || {
      all: [],
      menus: [],
      pages: [],
      buttons: [],
      apis: [],
      details: []
    });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    setPermissions({
      all: [],
      menus: [],
      pages: [],
      buttons: [],
      apis: [],
      details: []
    });
  };

  // 检查是否有指定权限
  const hasPermission = (permissionCode) => {
    return permissions.all.includes(permissionCode);
  };

  // 检查是否有任一权限
  const hasAnyPermission = (permissionCodes) => {
    return permissionCodes.some(code => permissions.all.includes(code));
  };

  // 检查是否有所有权限
  const hasAllPermissions = (permissionCodes) => {
    return permissionCodes.every(code => permissions.all.includes(code));
  };

  // 检查是否有菜单权限
  const hasMenuPermission = (menuCode) => {
    return permissions.menus.includes(menuCode);
  };

  // 检查是否有页面权限
  const hasPagePermission = (pageCode) => {
    return permissions.pages.includes(pageCode);
  };

  // 检查是否有按钮权限
  const hasButtonPermission = (buttonCode) => {
    return permissions.buttons.includes(buttonCode);
  };

  const value = {
    user,
    permissions,
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