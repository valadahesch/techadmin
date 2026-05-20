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
        self.is_builtin = is_builtin


class Permission:
    """权限模型 - 基于资源操作"""
    def __init__(self, id, code, name, resource, action, description=None):
        self.id = id
        self.code = code          # 权限代码，如: user:view, user:create
        self.name = name          # 权限名称（显示用）
        self.resource = resource  # 资源类型: user, role, permission, leak, assessment
        self.action = action      # 操作: view, create, edit, delete, manage, extract
        self.description = description


class AuthDB:
    """内存数据库操作类"""
    
    def __init__(self):
        self.users = []
        self.roles = []
        self.permissions = []
        self.user_roles = []
        self.role_permissions = []
        self._next_ids = {'user': 1, 'role': 1, 'permission': 1}
        
        self._init_data()
    
    def _init_data(self):
        """初始化基础数据"""
        # 1. 创建权限（基于资源操作）
        permissions_data = [
            # 用户管理权限
            (1, 'user:view', '查看用户', 'user', 'view', '查看用户列表和详情'),
            (2, 'user:create', '创建用户', 'user', 'create', '创建新用户'),
            (3, 'user:edit', '编辑用户', 'user', 'edit', '编辑用户信息'),
            (4, 'user:delete', '删除用户', 'user', 'delete', '删除用户'),
            
            # 角色管理权限
            (5, 'role:view', '查看角色', 'role', 'view', '查看角色列表'),
            (6, 'role:manage', '管理角色', 'role', 'manage', '创建/编辑/删除角色，分配权限'),
            
            # 权限管理权限
            (7, 'permission:view', '查看权限', 'permission', 'view', '查看权限列表'),
            
            # 漏扫处理权限
            (8, 'leak:view', '查看漏扫', 'leak', 'view', '查看漏扫页面'),
            (9, 'leak:extract', '漏扫提取', 'leak', 'extract', '提取漏扫数据'),
            (10, 'leak:export', '漏扫导出', 'leak', 'export', '导出漏扫数据'),
            
            # 测评录入权限
            (11, 'assessment:view', '查看测评', 'assessment', 'view', '查看测评页面'),
            (12, 'assessment:manage', '管理测评', 'assessment', 'manage', '管理测评项目和规则'),
        ]
        
        for perm in permissions_data:
            self.permissions.append(Permission(*perm))
        self._next_ids['permission'] = 13
        
        # 2. 创建角色
        admin_role = Role(1, 'admin', '系统管理员，拥有所有权限', True)
        user_role = Role(2, 'user', '普通用户，查看权限', True)
        guest_role = Role(3, 'guest', '访客，最小权限', True)
        
        self.roles = [admin_role, user_role, guest_role]
        self._next_ids['role'] = 4
        
        # 3. 分配角色权限
        # admin: 所有权限
        for perm in self.permissions:
            self.role_permissions.append((1, perm.id))
        
        # user: 查看权限
        user_perms = [1, 5, 7, 8, 11]  # user:view, role:view, permission:view, leak:view, assessment:view
        for perm_id in user_perms:
            self.role_permissions.append((2, perm_id))
        
        # guest: 只能查看漏扫
        guest_perms = [8]  # leak:view
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
            user_roles = self.get_user_roles(user.id)
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
        """获取用户的所有角色ID"""
        return [r_id for u_id, r_id in self.user_roles if u_id == user_id]
    
    # ========== 角色相关方法 ==========
    def get_role_by_id(self, role_id):
        return next((r for r in self.roles if r.id == role_id), None)
    
    def get_all_roles(self):
        roles_data = []
        for role in self.roles:
            role_perms = self.get_role_permissions(role.id)
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
        if role and not role.is_builtin:
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
            'code': p.code,
            'name': p.name,
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
        """获取角色的所有权限ID"""
        return [p_id for r_id, p_id in self.role_permissions if r_id == role_id]
    
    def get_user_permission_codes(self, user_id):
        """获取用户的所有权限代码"""
        user_roles = self.get_user_roles(user_id)
        permission_codes = set()
        
        for role_id in user_roles:
            role_perms = self.get_role_permissions(role_id)
            for perm_id in role_perms:
                perm = self.get_permission_by_id(perm_id)
                if perm:
                    permission_codes.add(perm.code)
        
        return list(permission_codes)
    
    def get_user_permissions_detail(self, user_id):
        """获取用户的所有权限详情"""
        user_roles = self.get_user_roles(user_id)
        permissions = []
        seen = set()
        
        for role_id in user_roles:
            role_perms = self.get_role_permissions(role_id)
            for perm_id in role_perms:
                if perm_id not in seen:
                    perm = self.get_permission_by_id(perm_id)
                    if perm:
                        # 根据 resource 推断 type
                        perm_type = 'unknown'
                        if perm.resource.startswith('menu:'):
                            perm_type = 'menu'
                        elif perm.resource.startswith('page:'):
                            perm_type = 'page'
                        elif perm.resource.startswith('button:'):
                            perm_type = 'button'
                        elif perm.resource.startswith('api:'):
                            perm_type = 'api'
                        else:
                            perm_type = perm.resource
                        
                        permissions.append({
                            'id': perm.id,
                            'code': perm.code,
                            'name': perm.name,
                            'resource': perm.resource,
                            'action': perm.action,
                            'type': perm_type  # 添加 type 字段
                        })
                        seen.add(perm_id)
        
        return permissions
    
    def has_permission(self, user_id, permission_code):
        """检查用户是否有指定权限"""
        permission_codes = self.get_user_permission_codes(user_id)
        return permission_code in permission_codes
    
    def has_any_permission(self, user_id, permission_codes):
        """检查用户是否有任一权限"""
        user_perms = self.get_user_permission_codes(user_id)
        return any(p in user_perms for p in permission_codes)
    
    def has_all_permissions(self, user_id, permission_codes):
        """检查用户是否有所有权限"""
        user_perms = self.get_user_permission_codes(user_id)
        return all(p in user_perms for p in permission_codes)


# 全局数据库实例
db = AuthDB()