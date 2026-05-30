# server/app/repositories/device_usage_repo.py
# -*- coding: utf-8 -*-

from app.models.base import db
from app.models.device_usage import DeviceUsage
from app.models.user import User
from sqlalchemy import or_
from sqlalchemy.orm import aliased
import uuid

class DeviceUsageRepository:
    """设备用途数据访问层"""
    
    def __init__(self):
        self.model = DeviceUsage
    
    def get_all_no_pagination(self, search=None, category=None, is_mandatory=None):
        """获取所有设备用途列表（不分页，关联查询创建人和修改人名称）"""
        # 使用 aliased 创建别名
        creator_alias = aliased(User)
        updater_alias = aliased(User)
        
        # 构建查询
        query = db.session.query(
            self.model,
            creator_alias.username.label('creator_name'),
            updater_alias.username.label('updater_name')
        ).outerjoin(
            creator_alias, self.model.created_by == creator_alias.id
        ).outerjoin(
            updater_alias, self.model.updated_by == updater_alias.id
        )
        
        # 搜索（设备名称或类型或功能）
        if search:
            query = query.filter(
                or_(
                    self.model.device_name.like(f'%{search}%'),
                    self.model.device_type.like(f'%{search}%'),
                    self.model.function_cn.like(f'%{search}%'),
                    self.model.status.like(f'%{search}%')
                )
            )
        
        # 按设备类型筛选
        if category:
            query = query.filter(self.model.device_type == category)
        
        # 按是否必测筛选
        if is_mandatory:
            query = query.filter(self.model.is_mandatory == is_mandatory)
        
        # 按状态筛选（只显示启用的）
        query = query.filter(self.model.status == '启用')
        
        # 按序号排序
        query = query.order_by(self.model.serial_no)
        
        # 执行查询
        results = query.all()
        
        # 构建返回数据
        items = []
        for device, creator_name, updater_name in results:
            device_dict = {
                'id': device.id,
                'serial_no': device.serial_no,
                'device_type': device.device_type,
                'device_name': device.device_name,
                'function_cn': device.function_cn,
                'is_mandatory': device.is_mandatory,
                'status': device.status,
                'created_by': device.created_by,
                'updated_by': device.updated_by,
                'creator_name': creator_name or '',
                'updater_name': updater_name or '',
                'created_at': device.created_at.isoformat() if device.created_at else None,
                'updated_at': device.updated_at.isoformat() if device.updated_at else None
            }
            items.append(device_dict)
        
        return {
            'items': items,
            'total': len(items)
        }
    
    def get_by_id(self, device_id):
        """根据ID获取设备用途（关联查询创建人和修改人名称）"""
        creator_alias = aliased(User)
        updater_alias = aliased(User)
        
        result = db.session.query(
            self.model,
            creator_alias.username.label('creator_name'),
            updater_alias.username.label('updater_name')
        ).outerjoin(
            creator_alias, self.model.created_by == creator_alias.id
        ).outerjoin(
            updater_alias, self.model.updated_by == updater_alias.id
        ).filter(self.model.id == device_id).first()
        
        if not result:
            return None
        
        device, creator_name, updater_name = result
        device_dict = {
            'id': device.id,
            'serial_no': device.serial_no,
            'device_type': device.device_type,
            'device_name': device.device_name,
            'function_cn': device.function_cn,
            'is_mandatory': device.is_mandatory,
            'status': device.status,
            'created_by': device.created_by,
            'updated_by': device.updated_by,
            'creator_name': creator_name or '',
            'updater_name': updater_name or '',
            'created_at': device.created_at.isoformat() if device.created_at else None,
            'updated_at': device.updated_at.isoformat() if device.updated_at else None
        }
        
        return device_dict
    
    def get_by_id_raw(self, device_id):
        """根据ID获取设备用途（原始对象）"""
        return self.model.query.get(device_id)
    
    def get_by_serial_no(self, serial_no):
        """根据序号获取设备用途"""
        return self.model.query.filter_by(serial_no=serial_no).first()
    
    def _generate_unique_id(self):
        """生成唯一的20位UUID"""
        while True:
            new_id = uuid.uuid4().hex[:20]
            existing = self.get_by_id_raw(new_id)
            if not existing:
                return new_id
    
    def create(self, data, current_user_id):
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
            status=data.get('status', '启用'),
            created_by=current_user_id,
            updated_by=current_user_id
        )
        
        db.session.add(device)
        db.session.commit()
        
        # 返回带用户名的数据
        return self.get_by_id(new_id)
    
    def update(self, device_id, data, current_user_id):
        """更新设备用途"""
        device = self.get_by_id_raw(device_id)
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
        
        device.updated_by = current_user_id
        
        db.session.commit()
        
        # 返回带用户名的数据
        return self.get_by_id(device_id)
    
    def delete(self, device_id):
        """删除设备用途（软删除：修改状态为停用）"""
        device = self.get_by_id_raw(device_id)
        if not device:
            return False
        
        device.status = '停用'
        db.session.commit()
        return True
    
    def physical_delete(self, device_id):
        """物理删除设备用途"""
        device = self.get_by_id_raw(device_id)
        if not device:
            return False
        
        db.session.delete(device)
        db.session.commit()
        return True
    
    def batch_create(self, devices_data, current_user_id):
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
                status=data.get('status', '启用'),
                created_by=current_user_id,
                updated_by=current_user_id
            )
            devices.append(device)
        
        db.session.add_all(devices)
        db.session.commit()
        
        # 返回带用户名的数据
        result = []
        for device in devices:
            result.append(self.get_by_id(device.id))
        return result
    
    def get_device_types(self):
        """获取所有设备类型"""
        device_types = db.session.query(self.model.device_type).distinct().filter(
            self.model.status == '启用'
        ).all()
        return [d[0] for d in device_types if d[0]]

# 创建单例
device_usage_repo = DeviceUsageRepository()