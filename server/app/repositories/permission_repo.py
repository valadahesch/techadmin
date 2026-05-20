# -*- coding: utf-8 -*-

from typing import List, Optional, Dict, Any
from sqlalchemy import select
from app.models.base import db


class PermissionRepository:
    """权限 Repository"""
    
    def __init__(self):
        self.Permission = None
    
    def _init_models(self):
        """初始化模型引用"""
        if self.Permission is None:
            from app.models.permission import Permission
            self.Permission = Permission
    
    def get_by_id(self, id: int):
        """根据 ID 获取"""
        self._init_models()
        with db.session() as session:
            return session.get(self.Permission, id)
    
    def get_by_code(self, code: str):
        """根据代码获取权限"""
        self._init_models()
        with db.session() as session:
            stmt = select(self.Permission).where(self.Permission.code == code)
            return session.execute(stmt).scalar_one_or_none()
    
    def get_all(self):
        """获取所有权限"""
        self._init_models()
        with db.session() as session:
            stmt = select(self.Permission).order_by(self.Permission.id)
            return list(session.execute(stmt).scalars().all())
    
    def get_all_permissions(self) -> List[Dict[str, Any]]:
        """获取所有权限（字典格式）"""
        permissions = self.get_all()
        return [{'id': p.id, 'code': p.code, 'name': p.name, 'resource': p.resource, 'action': p.action, 'description': p.description} for p in permissions]


# 全局实例
permission_repo = PermissionRepository()