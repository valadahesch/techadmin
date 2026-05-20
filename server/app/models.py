# -*- coding: utf-8 -*-

from datetime import datetime
import bcrypt
from app.database import db_pool
from app.config import Config


class User:
    """用户模型"""
    def __init__(self, id, username, email, password_hash, is_active=True, created_at=None):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.is_active = is_active
        self.created_at = created_at or datetime.now()


class Role:
    """角色模型"""
    def __init__(self, id, name, description, is_builtin=False, created_at=None):
        self.id = id
        self.name = name
        self.description = description
        self.is_builtin = is_builtin
        self.created_at = created_at or datetime.now()


class Permission:
    """权限模型"""
    def __init__(self, id, code, name, resource, action, description=None):
        self.id = id
        self.code = code
        self.name = name
        self.resource = resource
        self.action = action
        self.description = description


class AuthDB:
    """数据库操作类"""
    
    def __init__(self):
        pass
    
    # ==================== 用户相关方法 ====================
    def get_user_by_username(self, username):
        """根据用户名获取用户"""
        with db_pool.get_cursor() as cursor:
            cursor.execute(
                "SELECT id, username, email, password_hash, is_active, created_at FROM users WHERE username = %s",
                (username,)
            )
            row = cursor.fetchone()
            if row:
                return User(
                    id=row['id'],
                    username=row['username'],
                    email=row['email'],
                    password_hash=row['password_hash'],  # 这是字符串
                    is_active=bool(row['is_active']),
                    created_at=row['created_at']
                )
        return None
    
    def get_user_by_id(self, user_id):
        """根据用户ID获取用户"""
        with db_pool.get_cursor() as cursor:
            cursor.execute(
                "SELECT id, username, email, password_hash, is_active, created_at FROM users WHERE id = %s",
                (user_id,)
            )
            row = cursor.fetchone()
            if row:
                return User(
                    id=row['id'],
                    username=row['username'],
                    email=row['email'],
                    password_hash=row['password_hash'],
                    is_active=bool(row['is_active']),
                    created_at=row['created_at']
                )
        return None
    
    def get_all_users(self):
        """获取所有用户"""
        with db_pool.get_cursor() as cursor:
            cursor.execute("SELECT id, username, email, is_active, created_at FROM users ORDER BY id")
            rows = cursor.fetchall()
            
            users_data = []
            for row in rows:
                user_roles = self.get_user_roles(row['id'])
                users_data.append({
                    'id': row['id'],
                    'username': row['username'],
                    'email': row['email'],
                    'is_active': bool(row['is_active']),
                    'roles': user_roles,
                    'created_at': row['created_at'].isoformat() if row['created_at'] else None
                })
            return users_data
    
    def create_user(self, username, email, password):
        """创建用户"""
        if self.get_user_by_username(username):
            return None
        
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        with db_pool.get_cursor() as cursor:
            # 确保存储的是字符串
            cursor.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
                (username, email, password_hash.decode('utf-8'))  # 关键：decode 为字符串
            )
            user_id = cursor.lastrowid
            return self.get_user_by_id(user_id)

    def update_user(self, user_id, data):
        """更新用户"""
        updates = []
        params = []
        
        if 'email' in data:
            updates.append("email = %s")
            params.append(data['email'])
        if 'is_active' in data:
            updates.append("is_active = %s")
            params.append(1 if data['is_active'] else 0)
        if 'password' in data and data['password']:
            password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
            updates.append("password_hash = %s")
            params.append(password_hash.decode('utf-8'))  # 关键：decode 为字符串
        
        if not updates:
            return self.get_user_by_id(user_id)
        
        params.append(user_id)
        with db_pool.get_cursor() as cursor:
            cursor.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = %s", params)
            return self.get_user_by_id(user_id)
    
    def delete_user(self, user_id):
        """删除用户"""
        with db_pool.get_cursor() as cursor:
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            return cursor.rowcount > 0
    
    def assign_role_to_user(self, user_id, role_id):
        """为用户分配角色"""
        with db_pool.get_cursor() as cursor:
            try:
                cursor.execute(
                    "INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s)",
                    (user_id, role_id)
                )
                return True
            except:
                return False
    
    def remove_role_from_user(self, user_id, role_id):
        """移除用户的角色"""
        with db_pool.get_cursor() as cursor:
            cursor.execute(
                "DELETE FROM user_roles WHERE user_id = %s AND role_id = %s",
                (user_id, role_id)
            )
            return cursor.rowcount > 0
    
    def get_user_roles(self, user_id):
        """获取用户的所有角色ID"""
        with db_pool.get_cursor() as cursor:
            cursor.execute(
                "SELECT role_id FROM user_roles WHERE user_id = %s",
                (user_id,)
            )
            rows = cursor.fetchall()
            return [row['role_id'] for row in rows]
    
    def get_user_roles_detail(self, user_id):
        """获取用户的所有角色详情"""
        with db_pool.get_cursor() as cursor:
            cursor.execute("""
                SELECT r.id, r.name, r.description, r.is_builtin
                FROM roles r
                JOIN user_roles ur ON r.id = ur.role_id
                WHERE ur.user_id = %s
            """, (user_id,))
            rows = cursor.fetchall()
            return [{
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'is_builtin': bool(row['is_builtin'])
            } for row in rows]
    
    # ==================== 角色相关方法 ====================
    
    def get_role_by_id(self, role_id):
        """根据角色ID获取角色"""
        with db_pool.get_cursor() as cursor:
            cursor.execute(
                "SELECT id, name, description, is_builtin, created_at FROM roles WHERE id = %s",
                (role_id,)
            )
            row = cursor.fetchone()
            if row:
                return Role(
                    id=row['id'],
                    name=row['name'],
                    description=row['description'],
                    is_builtin=bool(row['is_builtin']),
                    created_at=row['created_at']
                )
        return None
    
    def get_role_by_name(self, name):
        """根据角色名称获取角色"""
        with db_pool.get_cursor() as cursor:
            cursor.execute(
                "SELECT id, name, description, is_builtin, created_at FROM roles WHERE name = %s",
                (name,)
            )
            row = cursor.fetchone()
            if row:
                return Role(
                    id=row['id'],
                    name=row['name'],
                    description=row['description'],
                    is_builtin=bool(row['is_builtin']),
                    created_at=row['created_at']
                )
        return None
    
    def get_all_roles(self):
        """获取所有角色"""
        with db_pool.get_cursor() as cursor:
            cursor.execute("SELECT id, name, description, is_builtin FROM roles ORDER BY id")
            rows = cursor.fetchall()
            
            roles_data = []
            for row in rows:
                role_perms = self.get_role_permissions(row['id'])
                roles_data.append({
                    'id': row['id'],
                    'name': row['name'],
                    'description': row['description'],
                    'is_builtin': bool(row['is_builtin']),
                    'permissions': role_perms
                })
            return roles_data
    
    def create_role(self, name, description):
        """创建角色"""
        if self.get_role_by_name(name):
            return None
        
        with db_pool.get_cursor() as cursor:
            cursor.execute(
                "INSERT INTO roles (name, description, is_builtin) VALUES (%s, %s, 0)",
                (name, description)
            )
            role_id = cursor.lastrowid
            return self.get_role_by_id(role_id)
    
    def update_role(self, role_id, data):
        """更新角色"""
        updates = []
        params = []
        
        if 'name' in data:
            updates.append("name = %s")
            params.append(data['name'])
        if 'description' in data:
            updates.append("description = %s")
            params.append(data['description'])
        
        if not updates:
            return self.get_role_by_id(role_id)
        
        params.append(role_id)
        with db_pool.get_cursor() as cursor:
            cursor.execute(f"UPDATE roles SET {', '.join(updates)} WHERE id = %s", params)
            return self.get_role_by_id(role_id)
    
    def delete_role(self, role_id):
        """删除角色"""
        role = self.get_role_by_id(role_id)
        if role and role.is_builtin:
            return False
        
        with db_pool.get_cursor() as cursor:
            cursor.execute("DELETE FROM roles WHERE id = %s", (role_id,))
            return cursor.rowcount > 0
    
    # ==================== 权限相关方法 ====================
    
    def get_permission_by_id(self, permission_id):
        """根据权限ID获取权限"""
        with db_pool.get_cursor() as cursor:
            cursor.execute(
                "SELECT id, code, name, resource, action, description FROM permissions WHERE id = %s",
                (permission_id,)
            )
            row = cursor.fetchone()
            if row:
                return Permission(
                    id=row['id'],
                    code=row['code'],
                    name=row['name'],
                    resource=row['resource'],
                    action=row['action'],
                    description=row['description']
                )
        return None
    
    def get_permission_by_code(self, code):
        """根据权限代码获取权限"""
        with db_pool.get_cursor() as cursor:
            cursor.execute(
                "SELECT id, code, name, resource, action, description FROM permissions WHERE code = %s",
                (code,)
            )
            row = cursor.fetchone()
            if row:
                return Permission(
                    id=row['id'],
                    code=row['code'],
                    name=row['name'],
                    resource=row['resource'],
                    action=row['action'],
                    description=row['description']
                )
        return None
    
    def get_all_permissions(self):
        """获取所有权限"""
        with db_pool.get_cursor() as cursor:
            cursor.execute("SELECT id, code, name, resource, action, description FROM permissions ORDER BY id")
            rows = cursor.fetchall()
            return [{
                'id': row['id'],
                'code': row['code'],
                'name': row['name'],
                'resource': row['resource'],
                'action': row['action'],
                'description': row['description']
            } for row in rows]
    
    def assign_permission_to_role(self, role_id, permission_id):
        """为角色分配权限"""
        with db_pool.get_cursor() as cursor:
            try:
                cursor.execute(
                    "INSERT INTO role_permissions (role_id, permission_id) VALUES (%s, %s)",
                    (role_id, permission_id)
                )
                return True
            except:
                return False
    
    def remove_permission_from_role(self, role_id, permission_id):
        """移除角色的权限"""
        with db_pool.get_cursor() as cursor:
            cursor.execute(
                "DELETE FROM role_permissions WHERE role_id = %s AND permission_id = %s",
                (role_id, permission_id)
            )
            return cursor.rowcount > 0
    
    def get_role_permissions(self, role_id):
        """获取角色的所有权限ID"""
        with db_pool.get_cursor() as cursor:
            cursor.execute(
                "SELECT permission_id FROM role_permissions WHERE role_id = %s",
                (role_id,)
            )
            rows = cursor.fetchall()
            return [row['permission_id'] for row in rows]
    
    def get_role_permissions_detail(self, role_id):
        """获取角色的所有权限详情"""
        with db_pool.get_cursor() as cursor:
            cursor.execute("""
                SELECT p.id, p.code, p.name, p.resource, p.action, p.description
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = %s
            """, (role_id,))
            rows = cursor.fetchall()
            return [{
                'id': row['id'],
                'code': row['code'],
                'name': row['name'],
                'resource': row['resource'],
                'action': row['action'],
                'description': row['description']
            } for row in rows]
    
    # ==================== 用户权限相关方法 ====================
    
    def get_user_permission_codes(self, user_id):
        """获取用户的所有权限代码"""
        with db_pool.get_cursor() as cursor:
            cursor.execute("""
                SELECT DISTINCT p.code
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN user_roles ur ON rp.role_id = ur.role_id
                WHERE ur.user_id = %s
            """, (user_id,))
            rows = cursor.fetchall()
            return [row['code'] for row in rows]
    
    def get_user_permissions_detail(self, user_id):
        """获取用户的所有权限详情"""
        with db_pool.get_cursor() as cursor:
            cursor.execute("""
                SELECT DISTINCT p.id, p.code, p.name, p.resource, p.action, p.description
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN user_roles ur ON rp.role_id = ur.role_id
                WHERE ur.user_id = %s
                ORDER BY p.id
            """, (user_id,))
            rows = cursor.fetchall()
            return [{
                'id': row['id'],
                'code': row['code'],
                'name': row['name'],
                'resource': row['resource'],
                'action': row['action'],
                'description': row['description']
            } for row in rows]
    
    def has_permission(self, user_id, permission_code):
        """检查用户是否有指定权限"""
        with db_pool.get_cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) as cnt
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN user_roles ur ON rp.role_id = ur.role_id
                WHERE ur.user_id = %s AND p.code = %s
            """, (user_id, permission_code))
            row = cursor.fetchone()
            return row['cnt'] > 0
    
    def has_any_permission(self, user_id, permission_codes):
        """检查用户是否有任一权限"""
        if not permission_codes:
            return True
        
        placeholders = ','.join(['%s'] * len(permission_codes))
        with db_pool.get_cursor() as cursor:
            cursor.execute(f"""
                SELECT COUNT(*) as cnt
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN user_roles ur ON rp.role_id = ur.role_id
                WHERE ur.user_id = %s AND p.code IN ({placeholders})
                LIMIT 1
            """, (user_id, *permission_codes))
            row = cursor.fetchone()
            return row['cnt'] > 0
    
    def has_all_permissions(self, user_id, permission_codes):
        """检查用户是否有所有权限"""
        if not permission_codes:
            return True
        
        placeholders = ','.join(['%s'] * len(permission_codes))
        with db_pool.get_cursor() as cursor:
            cursor.execute(f"""
                SELECT COUNT(DISTINCT p.code) as cnt
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN user_roles ur ON rp.role_id = ur.role_id
                WHERE ur.user_id = %s AND p.code IN ({placeholders})
            """, (user_id, *permission_codes))
            row = cursor.fetchone()
            return row['cnt'] == len(permission_codes)
    
    # ==================== 操作日志相关方法 ====================
    
    def add_operation_log(self, user_id, username, operation, target_type, target_id, details, ip_address):
        """添加操作日志"""
        with db_pool.get_cursor() as cursor:
            cursor.execute("""
                INSERT INTO operation_logs (user_id, username, operation, target_type, target_id, details, ip_address)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (user_id, username, operation, target_type, target_id, details, ip_address))
            return cursor.lastrowid
    
    def get_operation_logs(self, limit=100, offset=0, user_id=None, operation=None):
        """获取操作日志"""
        conditions = []
        params = []
        
        if user_id:
            conditions.append("user_id = %s")
            params.append(user_id)
        if operation:
            conditions.append("operation = %s")
            params.append(operation)
        
        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        params.extend([limit, offset])
        
        with db_pool.get_cursor() as cursor:
            cursor.execute(f"""
                SELECT id, user_id, username, operation, target_type, target_id, details, ip_address, created_at
                FROM operation_logs
                {where_clause}
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """, params)
            rows = cursor.fetchall()
            return [{
                'id': row['id'],
                'user_id': row['user_id'],
                'username': row['username'],
                'operation': row['operation'],
                'target_type': row['target_type'],
                'target_id': row['target_id'],
                'details': row['details'],
                'ip_address': row['ip_address'],
                'created_at': row['created_at'].isoformat() if row['created_at'] else None
            } for row in rows]


# 全局数据库实例
db = AuthDB()