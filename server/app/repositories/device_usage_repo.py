# server/app/repositories/device_usage_repo.py
# -*- coding: utf-8 -*-

from app.models.base import db
from app.models.device_usage import DeviceUsage
from sqlalchemy import or_

class DeviceUsageRepository:
    """设备用途数据访问层"""
    
    def __init__(self):
        self.model = DeviceUsage
    
    def get_all_no_pagination(self, search=None, category=None, is_mandatory=None):
        """获取所有设备用途列表（不分页）"""
        query = self.model.query
        
        # 搜索（设备名称或类型或功能）
        if search:
            query = query.filter(
                or_(
                    self.model.device_name.like(f'%{search}%'),
                    self.model.device_type.like(f'%{search}%'),
                    self.model.function_cn.like(f'%{search}%')
                )
            )
        
        # 按设备类型筛选
        if category:
            query = query.filter(self.model.device_type == category)
        
        # 按是否必测筛选
        if is_mandatory:
            query = query.filter(self.model.is_mandatory == is_mandatory)
        
        # 按状态筛选（默认只显示启用的）
        query = query.filter(self.model.status == '启用')
        
        # 按序号排序
        query = query.order_by(self.model.serial_no)
        
        items = query.all()
        
        return {
            'items': [item.to_dict() for item in items],
            'total': len(items)
        }
    
    def get_by_id(self, device_id):
        """根据ID获取设备用途"""
        return self.model.query.get(device_id)
    
    def get_by_serial_no(self, serial_no):
        """根据序号获取设备用途"""
        return self.model.query.filter_by(serial_no=serial_no).first()
    
    def _generate_unique_id(self):
        """生成唯一的20位UUID"""
        while True:
            # 创建临时实例来调用方法
            temp_device = self.model()
            new_id = temp_device.generate_uuid20()
            # 检查数据库中是否已存在
            existing = self.get_by_id(new_id)
            if not existing:
                return new_id
    
    def create(self, data):
        """创建设备用途（ID由后端自动生成）"""
        # 检查序号是否已存在
        existing = self.get_by_serial_no(data.get('serial_no'))
        if existing:
            return None
        
        # 生成唯一的20位UUID
        new_id = self._generate_unique_id()
        
        device = self.model(
            id=new_id,
            serial_no=data.get('serial_no'),
            device_type=data.get('device_type'),
            device_name=data.get('device_name'),
            function_cn=data.get('function_cn'),
            is_mandatory=data.get('is_mandatory', '是'),
            status=data.get('status', '启用')
        )
        
        db.session.add(device)
        db.session.commit()
        return device
    
    def update(self, device_id, data):
        """更新设备用途"""
        device = self.get_by_id(device_id)
        if not device:
            return None
        
        # 如果更新序号，检查是否冲突
        if 'serial_no' in data and data['serial_no'] != device.serial_no:
            existing = self.get_by_serial_no(data['serial_no'])
            if existing:
                return None
        
        # 更新字段
        if 'device_type' in data:
            device.device_type = data['device_type']
        if 'device_name' in data:
            device.device_name = data['device_name']
        if 'function_cn' in data:
            device.function_cn = data['function_cn']
        if 'is_mandatory' in data:
            device.is_mandatory = data['is_mandatory']
        if 'status' in data:
            device.status = data['status']
        
        db.session.commit()
        return device
    
    def delete(self, device_id):
        """删除设备用途（软删除：修改状态为停用）"""
        device = self.get_by_id(device_id)
        if not device:
            return False
        
        device.status = '停用'
        db.session.commit()
        return True
    
    def physical_delete(self, device_id):
        """物理删除设备用途"""
        device = self.get_by_id(device_id)
        if not device:
            return False
        
        db.session.delete(device)
        db.session.commit()
        return True
    
    def batch_create(self, devices_data):
        """批量创建设备用途"""
        devices = []
        for data in devices_data:
            # 生成唯一的20位UUID
            new_id = self._generate_unique_id()
            
            device = self.model(
                id=new_id,
                serial_no=data.get('serial_no'),
                device_type=data.get('device_type'),
                device_name=data.get('device_name'),
                function_cn=data.get('function_cn'),
                is_mandatory=data.get('is_mandatory', '是'),
                status=data.get('status', '启用')
            )
            devices.append(device)
        
        db.session.add_all(devices)
        db.session.commit()
        return devices
    
    def get_device_types(self):
        """获取所有设备类型"""
        device_types = db.session.query(self.model.device_type).distinct().filter(
            self.model.status == '启用'
        ).all()
        return [d[0] for d in device_types if d[0]]

# 创建单例
device_usage_repo = DeviceUsageRepository()