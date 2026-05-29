# server/app/models/assessment_type.py
# -*- coding: utf-8 -*-

from app.models.base import db
from datetime import datetime
import uuid

class AssessmentType(db.Model):
    """测评类型管理模型"""
    __tablename__ = 'assessment_type'
    
    id = db.Column(db.String(20), primary_key=True, comment='20位UUID主键')
    name = db.Column(db.String(200), nullable=False, comment='名称')
    description = db.Column(db.Text, nullable=True, comment='描述')
    member_ids = db.Column(db.Text, nullable=True, comment='测评项成员ID列表（JSON数组）')
    group_list = db.Column(db.Text, nullable=True, comment='群组列表（JSON数组）')  # 改为 group_list
    created_by = db.Column(db.Integer, nullable=True, comment='创建人ID')
    updated_by = db.Column(db.Integer, nullable=True, comment='修改人ID')
    created_at = db.Column(db.DateTime, default=datetime.now, comment='创建时间')
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')
    
    @staticmethod
    def generate_uuid20():
        """生成20位UUID"""
        return uuid.uuid4().hex[:20]
    
    def to_dict(self):
        """转换为字典"""
        import json
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description or '',
            'member_ids': json.loads(self.member_ids) if self.member_ids else [],
            'groups': json.loads(self.group_list) if self.group_list else [],  # 前端仍用 groups
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }