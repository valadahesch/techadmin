# -*- coding: utf-8 -*-

from datetime import datetime
import bcrypt


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
    def __init__(self, id, name, description):
        self.id = id
        self.name = name
        self.description = description


class Permission:
    """权限模型"""
    def __init__(self, id, name, resource, action):
        self.id = id
        self.name = name
        self.resource = resource
        self.action = action


class AuthDB:
    """内存数据库操作类"""
    
    def __init__(self):
        self.users = []
        self.roles = []
        self.permissions = []
        self.user_roles = []  # 用户-角色关联
        self.role_permissions = []  # 角色-权限关联
        self._next_ids = {'user': 1, 'role': 1, 'permission': 1}
        
        # 初始化基础数据
        self._init_data()
    
    def _init_data(self):
        """初始化基础数据"""
        # 1. 创建权限
        permissions_data = [
            (1, 'user:read', 'user', 'read'),
            (2, 'user:write', 'user', 'write'),
            (3, 'user:delete', 'user', 'delete'),
            (4, 'role:read', 'role', 'read'),
            (5, 'role:write', 'role', 'write'),
            (6, 'role:delete', 'role', 'delete'),
            (7, 'permission:read', 'permission', 'read'),
        ]
        for perm in permissions_data:
            self.permissions.append(Permission(*perm))
        self._next_ids['permission'] = 8
        
        # 2. 创建角色
        admin_role = Role(1, 'admin', '系统管理员，拥有所有权限')
        user_role = Role(2, 'user', '普通用户，只有查看权限')
        guest_role = Role(3, 'guest', '访客，最小权限')
        
        self.roles = [admin_role, user_role, guest_role]
        self._next_ids['role'] = 4
        
        # 3. 分配角色权限
        for perm in self.permissions:
            self.role_permissions.append((1, perm.id))  # admin: 所有权限
        
        read_perms = [1, 4, 7]  # user:read, role:read, permission:read
        for perm_id in read_perms:
            self.role_permissions.append((2, perm_id))  # user: 读取权限
        
        self.role_permissions.append((3, 1))  # guest: user:read
        
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
                'permissions': role_perms
            })
        return roles_data
    
    def create_role(self, name, description):
        role_id = self._next_ids['role']
        self._next_ids['role'] += 1
        role = Role(role_id, name, description)
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
        if role:
            self.roles.remove(role)
            self.role_permissions = [(r_id, p_id) for r_id, p_id in self.role_permissions if r_id != role_id]
            self.user_roles = [(u_id, r_id) for u_id, r_id in self.user_roles if r_id != role_id]
            return True
        return False
    
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
    
    # ========== 权限相关方法 ==========
    def get_permission_by_id(self, permission_id):
        return next((p for p in self.permissions if p.id == permission_id), None)
    
    def get_all_permissions(self):
        return [{'id': p.id, 'name': p.name, 'resource': p.resource, 'action': p.action} 
                for p in self.permissions]
    
    def get_user_permissions(self, user_id):
        user_roles = [r_id for u_id, r_id in self.user_roles if u_id == user_id]
        permissions = set()
        for role_id in user_roles:
            role_perms = [p_id for r_id, p_id in self.role_permissions if r_id == role_id]
            for perm_id in role_perms:
                perm = self.get_permission_by_id(perm_id)
                if perm:
                    permissions.add(perm.name)
        return list(permissions)


# 全局数据库实例
db = AuthDB()