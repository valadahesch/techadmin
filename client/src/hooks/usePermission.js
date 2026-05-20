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
    permissions 
  } = useAuth();

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
    isAdmin: () => hasPermission('role:admin') || permissions.all.includes('*'),
    
    // 用户管理权限
    canViewUsers: () => hasPagePermission('page:user:management'),
    canCreateUser: () => hasButtonPermission('button:user:create'),
    canEditUser: () => hasButtonPermission('button:user:edit'),
    canDeleteUser: () => hasButtonPermission('button:user:delete'),
    canAssignRole: () => hasButtonPermission('button:user:assign_role'),
    
    // 角色管理权限
    canViewRoles: () => hasPagePermission('page:role:management'),
    canCreateRole: () => hasButtonPermission('button:role:create'),
    canEditRole: () => hasButtonPermission('button:role:edit'),
    canDeleteRole: () => hasButtonPermission('button:role:delete'),
    canAssignPermission: () => hasButtonPermission('button:role:assign_permission'),
    
    // 漏扫处理权限
    canViewLeakScan: () => hasMenuPermission('menu:leak:scan'),
    canExtractLeakScan: () => hasButtonPermission('button:leak:extract'),
  };
};