# -*- coding: utf-8 -*-

"""
API权限映射配置
将API接口映射到所需的权限
"""

# API权限映射表
# 格式: 'METHOD:/api/path': ['permission1', 'permission2']
API_PERMISSION_MAP = {
    # ========== 认证相关 ==========
    'POST:/api/auth/login': [],  # 登录不需要权限
    'GET:/api/auth/current-user': ['user:view'],
    'GET:/api/auth/user-permissions': ['user:view'],
    
    # ========== 用户管理 ==========
    'GET:/api/users': ['user:view'],
    'GET:/api/users/*': ['user:view'],
    'POST:/api/users': ['user:create'],
    'PUT:/api/users/*': ['user:edit'],
    'DELETE:/api/users/*': ['user:delete'],
    'POST:/api/users/*/roles': ['user:edit'],
    'DELETE:/api/users/*/roles/*': ['user:edit'],
    
    # ========== 角色管理 ==========
    'GET:/api/roles': ['role:view'],
    'GET:/api/roles/*': ['role:view'],
    'POST:/api/roles': ['role:manage'],
    'PUT:/api/roles/*': ['role:manage'],
    'DELETE:/api/roles/*': ['role:manage'],
    'POST:/api/roles/*/permissions': ['role:manage'],
    'DELETE:/api/roles/*/permissions/*': ['role:manage'],
    
    # ========== 权限管理 ==========
    'GET:/api/permissions': ['permission:view'],
    'GET:/api/permissions/*': ['permission:view'],
    'GET:/api/permissions/resources': ['permission:view'],
    
    # ========== 漏扫处理 ==========
    'GET:/api/leak-scan/history': ['leak:view'],
    'POST:/api/leak-scan/extract': ['leak:extract'],
    'POST:/api/leak-scan/link-to-project': ['leak:export'],
    
    # ========== 测评录入 ==========
    'GET:/api/projects': ['assessment:view'],
    'GET:/api/projects/*': ['assessment:view'],
    'POST:/api/projects': ['assessment:manage'],
    'PUT:/api/projects/*': ['assessment:manage'],
    'DELETE:/api/projects/*': ['assessment:manage'],
    'GET:/api/rules': ['assessment:view'],
    'GET:/api/rules/*': ['assessment:view'],
    'POST:/api/rules': ['assessment:manage'],
    'PUT:/api/rules/*': ['assessment:manage'],
    'DELETE:/api/rules/*': ['assessment:manage'],
}


def get_required_permissions(method, path):
    """
    获取API接口所需的权限列表
    
    Args:
        method: HTTP方法 (GET, POST, PUT, DELETE)
        path: 请求路径
    
    Returns:
        list: 所需的权限列表
    """
    # 精确匹配
    exact_key = f"{method}:{path}"
    if exact_key in API_PERMISSION_MAP:
        return API_PERMISSION_MAP[exact_key]
    
    # 通配符匹配
    for key, permissions in API_PERMISSION_MAP.items():
        if '*' in key:
            # 提取匹配模式
            key_method, key_path = key.split(':', 1)
            if key_method != method:
                continue
            
            # 将通配符转换为正则表达式
            import re
            pattern = key_path.replace('*', '[^/]+')
            if re.match(f"^{pattern}$", path):
                return permissions
    
    # 默认需要认证（但不需要特定权限）
    return ['authenticated']