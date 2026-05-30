# server/app/models/project_asset.py
# -*- coding: utf-8 -*-

from app.models.base import db
from datetime import datetime
import uuid

class ProjectAsset(db.Model):
    """项目资产管理模型"""
    __tablename__ = 'project_asset'
    
    id = db.Column(db.String(20), primary_key=True, comment='20位UUID主键')
    project_id = db.Column(db.String(20), nullable=False, comment='项目ID')
    assessment_type_id = db.Column(db.String(20), nullable=True, comment='测评类型ID')
    serial_no = db.Column(db.Integer, nullable=False, comment='序号')
    device_name = db.Column(db.String(200), nullable=False, comment='设备名称')
    host_address = db.Column(db.String(100), nullable=True, comment='主机地址')
    hardware_model = db.Column(db.String(200), nullable=True, comment='硬件型号')
    software_version = db.Column(db.String(100), nullable=True, comment='软件版本')
    is_virtual = db.Column(db.String(10), default='否', comment='虚拟化设备')
    domain = db.Column(db.String(200), nullable=True, comment='域名')
    device_type = db.Column(db.String(50), nullable=True, comment='设备类型')
    importance = db.Column(db.String(20), default='中', comment='重要程度')
    quantity = db.Column(db.Integer, default=1, comment='数量')
    assessment_record = db.Column(db.Text, nullable=True, comment='测评记录（JSON）')
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
            'project_id': self.project_id,
            'assessment_type_id': self.assessment_type_id,
            'serial_no': self.serial_no,
            'device_name': self.device_name,
            'host_address': self.host_address or '',
            'hardware_model': self.hardware_model or '',
            'software_version': self.software_version or '',
            'is_virtual': self.is_virtual,
            'domain': self.domain or '',
            'device_type': self.device_type or '',
            'importance': self.importance,
            'quantity': self.quantity,
            'assessment_record': json.loads(self.assessment_record) if self.assessment_record else None,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }