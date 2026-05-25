# server/app/models/assessment_item.py
# -*- coding: utf-8 -*-

from app.models.base import db
from datetime import datetime
import uuid

class AssessmentItem(db.Model):
    """测评项管理模型"""
    __tablename__ = 'assessment_item'
    
    id = db.Column(db.String(20), primary_key=True, comment='20位UUID主键')
    standard_type = db.Column(db.String(100), nullable=False, comment='标准类型')
    security_control = db.Column(db.String(200), nullable=False, comment='安全控制点')
    assessment_object = db.Column(db.String(200), nullable=False, comment='测评对象')
    detection_item = db.Column(db.Text, nullable=False, comment='检测项')
    assessment_indicators = db.Column(db.Text, nullable=True, comment='测评指标（JSON数组）')
    assessment_levels = db.Column(db.Text, nullable=True, comment='测评等级（JSON数组）')
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
            'standard_type': self.standard_type,
            'security_control': self.security_control,
            'assessment_object': self.assessment_object,
            'detection_item': self.detection_item,
            'assessment_indicators': json.loads(self.assessment_indicators) if self.assessment_indicators else [],
            'assessment_levels': json.loads(self.assessment_levels) if self.assessment_levels else [],
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }