# -*- coding: utf-8 -*-

from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from app.models.base import db


class RoleRepository:
    """角色 Repository"""
    
    def __init__(self):
        self.Role = None
        self.Permission = None
    
    def _init_models(self):
        """初始化模型引用"""
        if self.Role is None:
            from app.models.role import Role
            from app.models.permission import Permission
            self.Role = Role
            self.Permission = Permission
    
    def get_by_id(self, id: int):
        """根据 ID 获取"""
        self._init_models()
        with db.session() as session:
            return session.get(self.Role, id)
    
    def get_by_name(self, name: str):
        """根据名称获取角色"""
        self._init_models()
        with db.session() as session:
            stmt = select(self.Role).where(self.Role.name == name)
            return session.execute(stmt).scalar_one_or_none()
    
    def get_all_roles_with_permissions(self) -> List[Dict[str, Any]]:
        """获取所有角色及其权限"""
        self._init_models()
        with db.session() as session:
            stmt = select(self.Role).options(joinedload(self.Role.permissions)).order_by(self.Role.id)
            roles = session.execute(stmt).unique().scalars().all()
            
            result = []
            for role in roles:
                result.append({
                    'id': role.id,
                    'name': role.name,
                    'description': role.description,
                    'is_builtin': role.is_builtin,
                    'permissions': [p.id for p in role.permissions],
                    'permissions_detail': [{'id': p.id, 'code': p.code, 'name': p.name, 'resource': p.resource, 'action': p.action} for p in role.permissions],
                    'created_at': role.created_at.isoformat() if role.created_at else None
                })
            return result
    
    def create_role(self, name: str, description: str):
        """创建角色"""
        self._init_models()
        if self.get_by_name(name):
            return None
        
        with db.session() as session:
            role = self.Role(name=name, description=description, is_builtin=False)
            session.add(role)
            session.commit()
            session.refresh(role)
            return role
    
    def update_role(self, role_id: int, data: Dict[str, Any]):
        """更新角色"""
        self._init_models()
        role = self.get_by_id(role_id)
        if not role:
            return None
        
        with db.session() as session:
            if 'name' in data:
                role.name = data['name']
            if 'description' in data:
                role.description = data['description']
            session.commit()
            session.refresh(role)
            return role
    
    def delete_role(self, role_id: int) -> bool:
        """删除角色（禁止删除内置角色）"""
        self._init_models()
        role = self.get_by_id(role_id)
        if role and role.is_builtin:
            return False
        
        with db.session() as session:
            role = session.get(self.Role, role_id)
            if role:
                session.delete(role)
                session.commit()
                return True
        return False
    
    def assign_permission(self, role_id: int, permission_id: int) -> bool:
        """为角色分配权限"""
        self._init_models()
        with db.session() as session:
            role = session.get(self.Role, role_id)
            permission = session.get(self.Permission, permission_id)
            if not role or not permission:
                return False
            if permission not in role.permissions:
                role.permissions.append(permission)
                session.commit()
            return True
    
    def remove_permission(self, role_id: int, permission_id: int) -> bool:
        """移除角色的权限"""
        self._init_models()
        with db.session() as session:
            role = session.get(self.Role, role_id)
            permission = session.get(self.Permission, permission_id)
            if not role or not permission:
                return False
            if permission in role.permissions:
                role.permissions.remove(permission)
                session.commit()
            return True
    
    def get_role_permissions(self, role_id: int) -> List[int]:
        """获取角色的权限ID列表"""
        self._init_models()
        role = self.get_by_id(role_id)
        if not role:
            return []
        return [p.id for p in role.permissions]


# 全局实例
role_repo = RoleRepository()