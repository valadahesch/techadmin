# -*- coding: utf-8 -*-

from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import db


class ApiPermissionMapping(db.Model):
    """API-权限映射模型"""
    __tablename__ = 'api_permission_mappings'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    method: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    api_path: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    permission_id: Mapped[int] = mapped_column(Integer, ForeignKey('permissions.id', ondelete='CASCADE'), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    
    # 关系
    permission: Mapped['Permission'] = relationship('Permission', backref='api_mappings')
    
    # 联合索引
    __table_args__ = (
        Index('idx_method_api_path', 'method', 'api_path'),
    )
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'method': self.method,
            'api_path': self.api_path,
            'permission_id': self.permission_id,
            'permission_code': self.permission.code if self.permission else None,
            'permission_name': self.permission.name if self.permission else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f"<ApiPermissionMapping(id={self.id}, {self.method}:{self.api_path} -> permission_id={self.permission_id})>"