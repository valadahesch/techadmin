# server/app/models/device_usage.py
# -*- coding: utf-8 -*-

from app.models.base import db
from datetime import datetime
import uuid

class DeviceUsage(db.Model):
    """设备用途管理模型"""
    __tablename__ = 'device_usage'
    
    id = db.Column(db.String(20), primary_key=True, comment='20位UUID主键')
    serial_no = db.Column(db.Integer, nullable=False, comment='序号')
    device_type = db.Column(db.String(100), nullable=False, comment='设备类型')
    device_name = db.Column(db.String(200), nullable=False, comment='设备名称')
    function_cn = db.Column(db.Text, nullable=False, comment='功能')
    is_mandatory = db.Column(db.String(20), nullable=False, default='是', comment='是否为必测设备')
    status = db.Column(db.String(20), default='启用', comment='状态')
    created_at = db.Column(db.DateTime, default=datetime.now, comment='创建时间')
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')
    
    @staticmethod
    def generate_uuid20():
        """生成20位UUID（基于UUID4并确保20位长度）"""
        # 生成标准UUID（36位），去掉连字符后取前20位
        full_uuid = uuid.uuid4().hex  # 32位十六进制字符串
        uuid20 = full_uuid[:20]  # 取前20位
        return uuid20
    
    def generate_unique_uuid20(self, repo):
        """生成唯一的20位UUID，确保不重复（实例方法）"""
        while True:
            new_uuid = self.generate_uuid20()
            # 检查数据库中是否已存在
            existing = repo.get_by_id(new_uuid)
            if not existing:
                return new_uuid
    
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