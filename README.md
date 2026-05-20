# API权限映射配置
API_PERMISSION_MAP = {
    # 用户管理
    'GET:/api/users': ['user:view'],
    'POST:/api/users': ['user:create'],
    'PUT:/api/users/*': ['user:edit'],
    'DELETE:/api/users/*': ['user:delete'],
    'POST:/api/users/*/roles': ['user:edit'],
    'DELETE:/api/users/*/roles/*': ['user:edit'],
    
    # 角色管理
    'GET:/api/roles': ['role:view'],
    'POST:/api/roles': ['role:manage'],
    'PUT:/api/roles/*': ['role:manage'],
    'DELETE:/api/roles/*': ['role:manage'],
    'POST:/api/roles/*/permissions': ['role:manage'],
    
    # 权限管理
    'GET:/api/permissions': ['permission:view'],
    
    # 漏扫处理
    'GET:/api/leak-scan/*': ['leak:view'],
    'POST:/api/leak-scan/extract': ['leak:extract'],
    
    # 测评录入
    'GET:/api/projects': ['assessment:view'],
    'POST:/api/projects': ['assessment:manage'],
    'GET:/api/rules': ['assessment:view'],
    'POST:/api/rules': ['assessment:manage'],
}

# 前端权限映射配置
const PAGE_PERMISSION_MAP = {
    // 菜单权限
    'menu:leak:scan': ['leak:view'],
    'menu:assessment': ['assessment:view'],
    'menu:system:settings': ['user:view', 'role:view', 'permission:view'],
    
    // 页面权限
    '/leak-scan': ['leak:view'],
    '/assessment/projects': ['assessment:view'],
    '/assessment/rules': ['assessment:view'],
    '/system/users': ['user:view'],
    '/system/roles': ['role:view'],
    '/system/permissions': ['permission:view'],
    
    // 按钮权限
    'button:user:create': ['user:create'],
    'button:user:edit': ['user:edit'],
    'button:user:delete': ['user:delete'],
    'button:user:assign_role': ['user:edit'],
    'button:role:create': ['role:manage'],
    'button:role:edit': ['role:manage'],
    'button:role:delete': ['role:manage'],
    'button:role:assign_permission': ['role:manage'],
    'button:leak:extract': ['leak:extract'],
}