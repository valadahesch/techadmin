# -*- coding: utf-8 -*-

from datetime import datetime
import bcrypt
import re


class User:
    """用户模型"""
    def __init__(self, id, username, email, password_hash, is_active=True):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.is_active = is_active
        self.created_at = datetime.now()


class Role:
    """角色模型"""
    def __init__(self, id, name, description, is_builtin=False):
        self.id = id
        self.name = name
        self.description = description
        self.is_builtin = is_builtin  # 是否内置角色（不可删除）


class Permission:
    """权限模型 - 细粒度权限控制"""
    def __init__(self, id, name, code, type, resource, action, description=None):
        self.id = id
        self.name = name              # 权限名称（显示用）
        self.code = code              # 权限代码（如: user:create）
        self.type = type              # 权限类型: menu, page, button, api
        self.resource = resource      # 资源名称
        self.action = action          # 操作: view, create, edit, delete, *
        self.description = description


class AuthDB:
    """内存数据库操作类"""
    
    def __init__(self):
        self.users = []
        self.roles = []
        self.permissions = []
        self.user_roles = []          # 用户-角色关联
        self.role_permissions = []    # 角色-权限关联
        self._next_ids = {'user': 1, 'role': 1, 'permission': 1}
        
        # 初始化基础数据
        self._init_data()
    
    def _init_data(self):
        """初始化基础数据"""
        # 1. 创建权限（细粒度）
        permissions_data = [
            # 菜单权限
            (1, '漏扫处理菜单', 'menu:leak:scan', 'menu', 'leak_scan', 'view', '漏扫处理菜单'),
            (2, '测评录入菜单', 'menu:assessment', 'menu', 'assessment', 'view', '测评录入菜单'),
            (3, '系统设置菜单', 'menu:system:settings', 'menu', 'system_settings', 'view', '系统设置菜单'),
            
            # 页面权限
            (4, '用户管理页面', 'page:user:management', 'page', 'user', 'view', '用户管理页面'),
            (5, '角色管理页面', 'page:role:management', 'page', 'role', 'view', '角色管理页面'),
            (6, '权限管理页面', 'page:permission:management', 'page', 'permission', 'view', '权限管理页面'),
            (7, '项目管理页面', 'page:project:management', 'page', 'project', 'view', '项目管理页面'),
            (8, '规则管理页面', 'page:rule:management', 'page', 'rule', 'view', '规则管理页面'),
            
            # 用户管理按钮权限
            (9, '新增用户按钮', 'button:user:create', 'button', 'user', 'create', '新增用户按钮'),
            (10, '编辑用户按钮', 'button:user:edit', 'button', 'user', 'edit', '编辑用户按钮'),
            (11, '删除用户按钮', 'button:user:delete', 'button', 'user', 'delete', '删除用户按钮'),
            (12, '分配角色按钮', 'button:user:assign_role', 'button', 'user', 'assign_role', '分配角色按钮'),
            
            # 角色管理按钮权限
            (13, '新增角色按钮', 'button:role:create', 'button', 'role', 'create', '新增角色按钮'),
            (14, '编辑角色按钮', 'button:role:edit', 'button', 'role', 'edit', '编辑角色按钮'),
            (15, '删除角色按钮', 'button:role:delete', 'button', 'role', 'delete', '删除角色按钮'),
            (16, '分配权限按钮', 'button:role:assign_permission', 'button', 'role', 'assign_permission', '分配权限按钮'),
            
            # API接口权限
            (17, '用户列表API', 'api:GET:/api/users', 'api', '/api/users', 'GET', '获取用户列表'),
            (18, '创建用户API', 'api:POST:/api/users', 'api', '/api/users', 'POST', '创建用户'),
            (19, '更新用户API', 'api:PUT:/api/users/*', 'api', '/api/users/*', 'PUT', '更新用户'),
            (20, '删除用户API', 'api:DELETE:/api/users/*', 'api', '/api/users/*', 'DELETE', '删除用户'),
            (21, '分配角色API', 'api:POST:/api/users/*/roles', 'api', '/api/users/*/roles', 'POST', '分配角色'),
            (22, '角色列表API', 'api:GET:/api/roles', 'api', '/api/roles', 'GET', '获取角色列表'),
            (23, '创建角色API', 'api:POST:/api/roles', 'api', '/api/roles', 'POST', '创建角色'),
            (24, '更新角色API', 'api:PUT:/api/roles/*', 'api', '/api/roles/*', 'PUT', '更新角色'),
            (25, '删除角色API', 'api:DELETE:/api/roles/*', 'api', '/api/roles/*', 'DELETE', '删除角色'),
            (26, '权限列表API', 'api:GET:/api/permissions', 'api', '/api/permissions', 'GET', '获取权限列表'),
            (27, '分配权限API', 'api:POST:/api/roles/*/permissions', 'api', '/api/roles/*/permissions', 'POST', '分配权限'),
            (28, '漏扫提取API', 'api:POST:/api/leak-scan/extract', 'api', '/api/leak-scan/extract', 'POST', '漏扫提取'),
            (29, '项目管理API', 'api:GET:/api/projects', 'api', '/api/projects', 'GET', '项目管理'),
            (30, '规则管理API', 'api:GET:/api/rules', 'api', '/api/rules', 'GET', '规则管理'),
        ]
        
        for perm in permissions_data:
            self.permissions.append(Permission(*perm))
        self._next_ids['permission'] = 31
        
        # 2. 创建角色
        admin_role = Role(1, 'admin', '系统管理员，拥有所有权限', True)
        user_role = Role(2, 'user', '普通用户，只有查看权限', True)
        guest_role = Role(3, 'guest', '访客，最小权限', True)
        
        self.roles = [admin_role, user_role, guest_role]
        self._next_ids['role'] = 4
        
        # 3. 分配角色权限
        # admin: 所有权限
        for perm in self.permissions:
            self.role_permissions.append((1, perm.id))
        
        # user: 只有查看权限（页面和菜单）
        user_perms = [1, 2, 4, 5, 6, 7, 8, 17, 22, 26]
        for perm_id in user_perms:
            self.role_permissions.append((2, perm_id))
        
        # guest: 只能查看漏扫处理
        guest_perms = [1, 17]
        for perm_id in guest_perms:
            self.role_permissions.append((3, perm_id))
        
        # 4. 创建用户
        admin_password = bcrypt.hashpw('123456'.encode('utf-8'), bcrypt.gensalt())
        user_password = bcrypt.hashpw('123456'.encode('utf-8'), bcrypt.gensalt())
        
        admin = User(1, 'admin', 'admin@example.com', admin_password, True)
        normal_user = User(2, 'zhangsan', 'zhangsan@example.com', user_password, True)
        
        self.users = [admin, normal_user]
        self._next_ids['user'] = 3
        
        # 5. 分配用户角色
        self.user_roles.append((1, 1))  # admin -> admin
        self.user_roles.append((2, 2))  # zhangsan -> user
    
    # ========== 用户相关方法 ==========
    def get_user_by_username(self, username):
        return next((u for u in self.users if u.username == username), None)
    
    def get_user_by_id(self, user_id):
        return next((u for u in self.users if u.id == user_id), None)
    
    def get_all_users(self):
        users_data = []
        for user in self.users:
            user_roles = [r_id for u_id, r_id in self.user_roles if u_id == user.id]
            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_active': user.is_active,
                'roles': user_roles,
                'created_at': user.created_at.isoformat()
            })
        return users_data
    
    def create_user(self, username, email, password):
        if self.get_user_by_username(username):
            return None
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        user_id = self._next_ids['user']
        self._next_ids['user'] += 1
        user = User(user_id, username, email, password_hash)
        self.users.append(user)
        return user
    
    def update_user(self, user_id, data):
        user = self.get_user_by_id(user_id)
        if not user:
            return None
        if 'email' in data:
            user.email = data['email']
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'password' in data and data['password']:
            user.password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        return user
    
    def delete_user(self, user_id):
        user = self.get_user_by_id(user_id)
        if user:
            self.users.remove(user)
            self.user_roles = [(u_id, r_id) for u_id, r_id in self.user_roles if u_id != user_id]
            return True
        return False
    
    def assign_role_to_user(self, user_id, role_id):
        if not self.get_user_by_id(user_id) or not self.get_role_by_id(role_id):
            return False
        if (user_id, role_id) not in self.user_roles:
            self.user_roles.append((user_id, role_id))
        return True
    
    def remove_role_from_user(self, user_id, role_id):
        self.user_roles = [(u_id, r_id) for u_id, r_id in self.user_roles 
                          if not (u_id == user_id and r_id == role_id)]
        return True
    
    def get_user_roles(self, user_id):
        """获取用户的所有角色"""
        return [r_id for u_id, r_id in self.user_roles if u_id == user_id]
    
    # ========== 角色相关方法 ==========
    def get_role_by_id(self, role_id):
        return next((r for r in self.roles if r.id == role_id), None)
    
    def get_all_roles(self):
        roles_data = []
        for role in self.roles:
            role_perms = [p_id for r_id, p_id in self.role_permissions if r_id == role.id]
            roles_data.append({
                'id': role.id,
                'name': role.name,
                'description': role.description,
                'is_builtin': role.is_builtin,
                'permissions': role_perms
            })
        return roles_data
    
    def create_role(self, name, description):
        role_id = self._next_ids['role']
        self._next_ids['role'] += 1
        role = Role(role_id, name, description, False)
        self.roles.append(role)
        return role
    
    def update_role(self, role_id, data):
        role = self.get_role_by_id(role_id)
        if not role:
            return None
        if 'name' in data:
            role.name = data['name']
        if 'description' in data:
            role.description = data['description']
        return role
    
    def delete_role(self, role_id):
        role = self.get_role_by_id(role_id)
        if role and not role.is_builtin:  # 内置角色不可删除
            self.roles.remove(role)
            self.role_permissions = [(r_id, p_id) for r_id, p_id in self.role_permissions if r_id != role_id]
            self.user_roles = [(u_id, r_id) for u_id, r_id in self.user_roles if r_id != role_id]
            return True
        return False
    
    # ========== 权限相关方法 ==========
    def get_permission_by_id(self, permission_id):
        return next((p for p in self.permissions if p.id == permission_id), None)
    
    def get_permission_by_code(self, code):
        return next((p for p in self.permissions if p.code == code), None)
    
    def get_all_permissions(self):
        return [{
            'id': p.id, 
            'name': p.name, 
            'code': p.code,
            'type': p.type, 
            'resource': p.resource, 
            'action': p.action,
            'description': p.description
        } for p in self.permissions]
    
    def assign_permission_to_role(self, role_id, permission_id):
        if not self.get_role_by_id(role_id) or not self.get_permission_by_id(permission_id):
            return False
        if (role_id, permission_id) not in self.role_permissions:
            self.role_permissions.append((role_id, permission_id))
        return True
    
    def remove_permission_from_role(self, role_id, permission_id):
        self.role_permissions = [(r_id, p_id) for r_id, p_id in self.role_permissions 
                                 if not (r_id == role_id and p_id == permission_id)]
        return True
    
    def get_role_permissions(self, role_id):
        """获取角色的所有权限"""
        return [p_id for r_id, p_id in self.role_permissions if r_id == role_id]
        
    def get_user_permission_codes(self, user_id):
        """获取用户的所有权限代码（通过角色）- 返回列表"""
        user_roles = self.get_user_roles(user_id)
        permission_codes = set()
        
        for role_id in user_roles:
            role_perms = self.get_role_permissions(role_id)
            for perm_id in role_perms:
                perm = self.get_permission_by_id(perm_id)
                if perm:
                    permission_codes.add(perm.code)
        
        # 返回列表而不是 set，避免 JSON 序列化问题
        return list(permission_codes)
    
    def get_user_permissions_detail(self, user_id):
        """获取用户的所有权限详情"""
        user_roles = self.get_user_roles(user_id)
        permissions = []
        
        for role_id in user_roles:
            role_perms = self.get_role_permissions(role_id)
            for perm_id in role_perms:
                perm = self.get_permission_by_id(perm_id)
                if perm:
                    permissions.append({
                        'id': perm.id,
                        'code': perm.code,
                        'name': perm.name,
                        'type': perm.type,
                        'resource': perm.resource,
                        'action': perm.action
                    })
        
        # 去重
        unique_perms = {}
        for p in permissions:
            if p['code'] not in unique_perms:
                unique_perms[p['code']] = p
        
        return list(unique_perms.values())
    
    def has_permission(self, user_id, permission_code):
        """检查用户是否有指定权限"""
        permission_codes = self.get_user_permission_codes(user_id)
        return permission_code in permission_codes
    
    def has_api_permission(self, user_id, method, path):
        """检查用户是否有API访问权限"""
        permission_codes = self.get_user_permission_codes(user_id)
        
        # 管理员拥有所有权限
        if 'api:*' in permission_codes:
            return True
        
        # 构建API权限代码
        api_code = f"api:{method}:{path}"
        
        # 精确匹配
        if api_code in permission_codes:
            return True
        
        # 通配符匹配（如 /api/users/* 匹配 /api/users/1）
        for code in permission_codes:
            if code.startswith('api:') and '*' in code:
                pattern = code.replace('*', '([^/]+)')
                import re
                if re.match(pattern.replace('api:', ''), f"{method}:{path}"):
                    return True
        
        return False


# 全局数据库实例
db = AuthDB()