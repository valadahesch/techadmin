# -*- coding: utf-8 -*-

from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import db


# 角色-权限关联表
role_permissions_table = Table(
    'role_permissions',
    db.Model.metadata,
    Column('role_id', Integer, ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id', ondelete='CASCADE'), primary_key=True),
    Column('created_at', DateTime, default=datetime.now)
)


class Role(db.Model):
    """角色模型"""
    __tablename__ = 'roles'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_builtin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # 关系
    users: Mapped[List['User']] = relationship(
        'User',
        secondary='user_roles',
        back_populates='roles',
        viewonly=True
    )
    permissions: Mapped[List['Permission']] = relationship(
        'Permission',
        secondary=role_permissions_table,
        back_populates='roles'
    )
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'is_builtin': self.is_builtin,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f"<Role(id={self.id}, name={self.name})>"