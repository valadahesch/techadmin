# -*- coding: utf-8 -*-

from typing import List, Optional
from sqlalchemy import String, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import db


class Permission(db.Model):
    """权限模型"""
    __tablename__ = 'permissions'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    resource: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # 兼容旧数据
    
    # 关系
    roles: Mapped[List['Role']] = relationship(
        'Role',
        secondary='role_permissions',
        back_populates='permissions',
        viewonly=True
    )
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'resource': self.resource,
            'action': self.action,
            'description': self.description
        }
    
    def __repr__(self):
        return f"<Permission(id={self.id}, code={self.code})>"