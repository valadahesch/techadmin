# server/app/models/device_usage.py
# -*- coding: utf-8 -*-

from app.models.base import db
from datetime import datetime

class DeviceUsage(db.Model):
    """设备用途管理模型"""
    __tablename__ = 'device_usage'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    serial_no = db.Column(db.Integer, nullable=False, comment='序号')
    device_type = db.Column(db.String(100), nullable=False, comment='设备类型')
    device_name = db.Column(db.String(200), nullable=False, comment='设备名称')
    function_cn = db.Column(db.Text, nullable=False, comment='功能')
    is_mandatory = db.Column(db.String(20), nullable=False, default='是', comment='是否为必测设备')
    status = db.Column(db.String(20), default='启用', comment='状态')
    created_at = db.Column(db.DateTime, default=datetime.now, comment='创建时间')
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'serial_no': self.serial_no,
            'device_type': self.device_type,
            'device_name': self.device_name,
            'function_cn': self.function_cn,
            'is_mandatory': self.is_mandatory,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }