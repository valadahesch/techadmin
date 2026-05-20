# -*- coding: utf-8 -*-

from typing import List, Optional, Dict, Any
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload
from app.models.base import db
import bcrypt


class UserRepository:
    """用户 Repository"""
    
    def __init__(self):
        # 延迟导入避免循环依赖
        self.User = None
        self.Role = None
        self.Permission = None
    
    def _init_models(self):
        """初始化模型引用"""
        if self.User is None:
            from app.models.user import User
            from app.models.role import Role
            from app.models.permission import Permission
            self.User = User
            self.Role = Role
            self.Permission = Permission
    
    def get_by_id(self, id: int):
        """根据 ID 获取"""
        self._init_models()
        with db.session() as session:
            return session.get(self.User, id)
    
    def get_by_username(self, username: str):
        """根据用户名获取用户"""
        self._init_models()
        with db.session() as session:
            stmt = select(self.User).where(self.User.username == username)
            return session.execute(stmt).scalar_one_or_none()
    
    def get_by_email(self, email: str):
        """根据邮箱获取用户"""
        self._init_models()
        with db.session() as session:
            stmt = select(self.User).where(self.User.email == email)
            return session.execute(stmt).scalar_one_or_none()
    
    def get_all_users_with_roles(self) -> List[Dict[str, Any]]:
        """获取所有用户及其角色"""
        self._init_models()
        with db.session() as session:
            stmt = select(self.User).options(joinedload(self.User.roles)).order_by(self.User.id)
            users = session.execute(stmt).unique().scalars().all()
            
            result = []
            for user in users:
                result.append({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_active': user.is_active,
                    'roles': [role.id for role in user.roles],
                    'roles_detail': [{'id': role.id, 'name': role.name} for role in user.roles],
                    'created_at': user.created_at.isoformat() if user.created_at else None
                })
            return result
    
    def create_user(self, username: str, email: str, password: str):
        """创建用户"""
        self._init_models()
        if self.get_by_username(username):
            return None
        
        import bcrypt
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        with db.session() as session:
            user = self.User(username=username, email=email, password_hash=password_hash)
            session.add(user)
            session.commit()
            session.refresh(user)
            return user
    
    def update_user(self, user_id: int, data: Dict[str, Any]):
        """更新用户"""
        self._init_models()
        import bcrypt
        
        user = self.get_by_id(user_id)
        if not user:
            return None
        
        with db.session() as session:
            if 'email' in data:
                user.email = data['email']
            if 'is_active' in data:
                user.is_active = data['is_active']
            if 'password' in data and data['password']:
                user.password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            session.commit()
            session.refresh(user)
            return user
    
    def delete_user(self, user_id: int) -> bool:
        """删除用户（禁止删除 admin）"""
        self._init_models()
        if user_id == 1:
            return False
        
        with db.session() as session:
            user = session.get(self.User, user_id)
            if user:
                session.delete(user)
                session.commit()
                return True
        return False
    
    def assign_role(self, user_id: int, role_id: int) -> bool:
        """为用户分配角色"""
        self._init_models()
        with db.session() as session:
            user = session.get(self.User, user_id)
            role = session.get(self.Role, role_id)
            if not user or not role:
                return False
            if role not in user.roles:
                user.roles.append(role)
                session.commit()
            return True
    
    def remove_role(self, user_id: int, role_id: int) -> bool:
        """移除用户的角色"""
        self._init_models()
        with db.session() as session:
            user = session.get(self.User, user_id)
            role = session.get(self.Role, role_id)
            if not user or not role:
                return False
            if role in user.roles:
                user.roles.remove(role)
                session.commit()
            return True
    
    def get_user_roles(self, user_id: int) -> List[int]:
        """获取用户的角色ID列表"""
        self._init_models()
        with db.session() as session:
            user = session.get(self.User, user_id)
            if not user:
                return []
            return [role.id for role in user.roles]
    
    def get_user_permission_codes(self, user_id: int) -> List[str]:
        """获取用户的权限代码列表"""
        self._init_models()
        with db.session() as session:
            # 修复：使用正确的 JOIN 顺序，避免重复引用
            stmt = select(self.Permission.code).distinct().select_from(
                self.User
            ).join(
                self.User.roles
            ).join(
                self.Role.permissions
            ).where(self.User.id == user_id)
            result = session.execute(stmt).scalars().all()
            return list(result)
    
    def get_user_permissions_detail(self, user_id: int) -> List[Dict[str, Any]]:
        """获取用户的权限详情"""
        self._init_models()
        with db.session() as session:
            # 修复：使用正确的 JOIN 顺序，避免重复引用
            stmt = select(self.Permission).distinct().select_from(
                self.User
            ).join(
                self.User.roles
            ).join(
                self.Role.permissions
            ).where(self.User.id == user_id).order_by(self.Permission.id)
            permissions = session.execute(stmt).scalars().all()
            return [{'id': p.id, 'code': p.code, 'name': p.name, 'resource': p.resource, 'action': p.action, 'description': p.description} for p in permissions]
    
    def has_permission(self, user_id: int, permission_code: str) -> bool:
        """检查用户是否有指定权限"""
        self._init_models()
        with db.session() as session:
            stmt = select(self.Permission).select_from(
                self.User
            ).join(
                self.User.roles
            ).join(
                self.Role.permissions
            ).where(
                and_(self.User.id == user_id, self.Permission.code == permission_code)
            ).limit(1)
            return session.execute(stmt).first() is not None
    
    def has_any_permission(self, user_id: int, permission_codes: List[str]) -> bool:
        """检查用户是否有任一权限"""
        if not permission_codes:
            return True
        self._init_models()
        with db.session() as session:
            stmt = select(self.Permission).select_from(
                self.User
            ).join(
                self.User.roles
            ).join(
                self.Role.permissions
            ).where(
                and_(self.User.id == user_id, self.Permission.code.in_(permission_codes))
            ).limit(1)
            return session.execute(stmt).first() is not None
    
    def check_password(self, user, password: str) -> bool:
        """验证密码"""
        import bcrypt
        return bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8'))


# 全局实例
user_repo = UserRepository()