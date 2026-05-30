# server/app/models/project_management.py
# -*- coding: utf-8 -*-

from app.models.base import db
from datetime import datetime
import uuid

class ProjectManagement(db.Model):
    """项目管理模型"""
    __tablename__ = 'project_management'
    
    id = db.Column(db.String(20), primary_key=True, comment='20位UUID主键')
    project_no = db.Column(db.String(50), nullable=False, unique=True, comment='项目编号')
    company_name = db.Column(db.String(200), nullable=False, comment='单位名称')
    contact_person = db.Column(db.String(100), nullable=False, comment='联系人')
    contact_phone = db.Column(db.String(20), nullable=False, comment='联系方式')
    status = db.Column(db.String(20), default='进行中', comment='状态')
    remark = db.Column(db.Text, nullable=True, comment='备注')
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
        return {
            'id': self.id,
            'project_no': self.project_no,
            'company_name': self.company_name,
            'contact_person': self.contact_person,
            'contact_phone': self.contact_phone,
            'status': self.status,
            'remark': self.remark or '',
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }