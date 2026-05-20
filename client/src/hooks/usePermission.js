import { useAuth } from '../contexts/AuthContext';

/**
 * 权限管理钩子
 * 用于在组件中检查各种权限
 */
export const usePermission = () => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    hasMenuPermission,
    hasPagePermission,
    hasButtonPermission,
    permissions,
    user
  } = useAuth();

  // 检查是否为管理员（admin 用户拥有所有权限）
  const isAdmin = () => {
    return user?.username === 'admin';
  };

  return {
    // 基础权限检查
    can: hasPermission,
    canAny: hasAnyPermission,
    canAll: hasAllPermissions,
    
    // 特定类型权限检查
    canViewMenu: hasMenuPermission,
    canViewPage: hasPagePermission,
    canClickButton: hasButtonPermission,
    
    // 获取所有权限
    permissions: permissions,
    
    // 快捷权限检查方法
    isAdmin: isAdmin,
    
    // 用户管理权限
    canViewUsers: () => isAdmin() || hasPermission('user:view'),
    canCreateUser: () => isAdmin() || hasPermission('user:create'),
    canEditUser: () => isAdmin() || hasPermission('user:edit'),
    canDeleteUser: () => isAdmin() || hasPermission('user:delete'),
    canAssignRole: () => isAdmin() || hasPermission('user:edit'),
    
    // 角色管理权限
    canViewRoles: () => isAdmin() || hasPermission('role:view'),
    canCreateRole: () => isAdmin() || hasPermission('role:manage'),
    canEditRole: () => isAdmin() || hasPermission('role:manage'),
    canDeleteRole: () => isAdmin() || hasPermission('role:manage'),
    canAssignPermission: () => isAdmin() || hasPermission('role:manage'),
    
    // 漏扫处理权限
    canViewLeakScan: () => isAdmin() || hasPermission('leak:view'),
    canExtractLeakScan: () => isAdmin() || hasPermission('leak:extract'),
    canExportLeakScan: () => isAdmin() || hasPermission('leak:export'),
    
    // 权限管理权限（用于权限管理页面）
    canManagePermissions: () => isAdmin() || hasPermission('permission:manage'),
  };
};