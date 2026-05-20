// src/config/permissionMap.js

/**
 * 前端权限映射配置
 * 将页面、菜单、按钮映射到所需的权限
 */

// 菜单权限映射
export const MENU_PERMISSION_MAP = {
  'menu:leak:scan': ['leak:view'],
  'menu:assessment': ['assessment:view'],
  'menu:system:settings': ['user:view', 'role:view', 'permission:view'],
};

// 页面权限映射
export const PAGE_PERMISSION_MAP = {
  '/leak-scan': ['leak:view'],
  '/assessment/projects': ['assessment:view'],
  '/assessment/rules': ['assessment:view'],
  '/system/users': ['user:view'],
  '/system/roles': ['role:view'],
  '/system/permissions': ['permission:view'],
};

// 按钮权限映射
export const BUTTON_PERMISSION_MAP = {
  // 用户管理按钮
  'button:user:create': ['user:create'],
  'button:user:edit': ['user:edit'],
  'button:user:delete': ['user:delete'],
  'button:user:assign_role': ['user:edit'],
  
  // 角色管理按钮
  'button:role:create': ['role:manage'],
  'button:role:edit': ['role:manage'],
  'button:role:delete': ['role:manage'],
  'button:role:assign_permission': ['role:manage'],
  
  // 漏扫处理按钮
  'button:leak:extract': ['leak:extract'],
  'button:leak:export': ['leak:export'],
  
  // 测评录入按钮
  'button:assessment:create': ['assessment:manage'],
  'button:assessment:edit': ['assessment:manage'],
  'button:assessment:delete': ['assessment:manage'],
};

/**
 * 检查是否有权限访问菜单
 */
export const canAccessMenu = (userPermissions, menuCode) => {
  const requiredPerms = MENU_PERMISSION_MAP[menuCode];
  if (!requiredPerms) return true;
  return requiredPerms.some(perm => userPermissions.includes(perm));
};

/**
 * 检查是否有权限访问页面
 */
export const canAccessPage = (userPermissions, path) => {
  const requiredPerms = PAGE_PERMISSION_MAP[path];
  if (!requiredPerms) return true;
  return requiredPerms.some(perm => userPermissions.includes(perm));
};

/**
 * 检查是否有权限使用按钮
 */
export const canUseButton = (userPermissions, buttonCode) => {
  const requiredPerms = BUTTON_PERMISSION_MAP[buttonCode];
  if (!requiredPerms) return true;
  return requiredPerms.some(perm => userPermissions.includes(perm));
};