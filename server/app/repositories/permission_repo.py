# -*- coding: utf-8 -*-

from typing import List, Optional, Dict, Any
from sqlalchemy import select
from app.models.base import db
from app.models.permission import Permission


class PermissionRepository:
    """权限 Repository"""
    
    def __init__(self):
        self.Permission = Permission
    
    def get_by_id(self, id: int) -> Optional[Permission]:
        """根据 ID 获取"""
        with db.session() as session:
            return session.get(self.Permission, id)
    
    def get_by_code(self, code: str) -> Optional[Permission]:
        """根据代码获取权限"""
        with db.session() as session:
            stmt = select(self.Permission).where(self.Permission.code == code)
            return session.execute(stmt).scalar_one_or_none()
    
    def get_all(self) -> List[Permission]:
        """获取所有权限"""
        with db.session() as session:
            stmt = select(self.Permission).order_by(self.Permission.id)
            return list(session.execute(stmt).scalars().all())
    
    def get_all_permissions(self) -> List[Dict[str, Any]]:
        """获取所有权限（字典格式）"""
        permissions = self.get_all()
        return [p.to_dict() for p in permissions]
    
    def create(self, code: str, name: str, resource: str, action: str, description: str = None) -> Optional[Permission]:
        """创建权限"""
        if self.get_by_code(code):
            return None
        
        with db.session() as session:
            permission = self.Permission(
                code=code,
                name=name,
                resource=resource,
                action=action,
                description=description
            )
            session.add(permission)
            session.commit()
            session.refresh(permission)
            return permission
    
    def update(self, permission_id: int, data: Dict[str, Any]) -> Optional[Permission]:
        """更新权限"""
        permission = self.get_by_id(permission_id)
        if not permission:
            return None
        
        with db.session() as session:
            if 'name' in data:
                permission.name = data['name']
            if 'description' in data:
                permission.description = data['description']
            if 'resource' in data:
                permission.resource = data['resource']
            if 'action' in data:
                permission.action = data['action']
            # code 不允许修改
            
            session.commit()
            session.refresh(permission)
            return permission
    
    def delete(self, permission_id: int) -> bool:
        """删除权限"""
        # 禁止删除正在被使用的权限
        with db.session() as session:
            permission = session.get(self.Permission, permission_id)
            if not permission:
                return False
            
            # 检查是否被角色使用
            if permission.roles:
                return False
            
            session.delete(permission)
            session.commit()
            return True
    
    def get_all_resources(self) -> List[str]:
        """获取所有资源类型"""
        with db.session() as session:
            stmt = select(self.Permission.resource).distinct()
            results = session.execute(stmt).scalars().all()
            return list(results)
    
    def get_all_actions(self) -> List[str]:
        """获取所有操作类型"""
        with db.session() as session:
            stmt = select(self.Permission.action).distinct()
            results = session.execute(stmt).scalars().all()
            return list(results)


# 全局实例
permission_repo = PermissionRepository()