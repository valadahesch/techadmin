# server/app/repositories/project_asset_repo.py
# -*- coding: utf-8 -*-

import uuid
import json
from app.models.base import db
from app.models.project_asset import ProjectAsset
from app.models.user import User
from app.models.assessment_type import AssessmentType
from sqlalchemy.orm import aliased

class ProjectAssetRepository:
    """项目资产数据访问层"""
    
    def __init__(self):
        self.model = ProjectAsset
    
    def get_by_project_id(self, project_id, current_user_id=None, is_admin=False):
        """根据项目ID获取资产列表"""
        creator_alias = aliased(User)
        updater_alias = aliased(User)
        
        query = db.session.query(
            self.model,
            creator_alias.username.label('creator_name'),
            updater_alias.username.label('updater_name')
        ).outerjoin(
            creator_alias, self.model.created_by == creator_alias.id
        ).outerjoin(
            updater_alias, self.model.updated_by == updater_alias.id
        ).filter(self.model.project_id == project_id)
        
        # 非管理员只能查看自己创建的项目资产
        if not is_admin and current_user_id:
            query = query.filter(self.model.created_by == current_user_id)
        
        # 按序号排序
        query = query.order_by(self.model.serial_no)
        
        results = query.all()
        
        items = []
        for asset, creator_name, updater_name in results:
            asset_dict = asset.to_dict()
            asset_dict['creator_name'] = creator_name or ''
            asset_dict['updater_name'] = updater_name or ''
            items.append(asset_dict)
        
        return items
    
    def get_by_id(self, asset_id):
        """根据ID获取资产"""
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
        ).filter(self.model.id == asset_id).first()
        
        if not result:
            return None
        
        asset, creator_name, updater_name = result
        asset_dict = asset.to_dict()
        asset_dict['creator_name'] = creator_name or ''
        asset_dict['updater_name'] = updater_name or ''
        
        return asset_dict
    
    def get_by_id_raw(self, asset_id):
        """根据ID获取原始对象"""
        return self.model.query.get(asset_id)
    
    def _generate_unique_id(self):
        """生成唯一的20位UUID"""
        while True:
            new_id = uuid.uuid4().hex[:20]
            existing = self.get_by_id_raw(new_id)
            if not existing:
                return new_id
    
    def create(self, data, current_user_id):
        """创建资产"""
        new_id = self._generate_unique_id()
        
        asset = self.model(
            id=new_id,
            project_id=data.get('project_id'),
            assessment_type_id=data.get('assessment_type_id'),
            serial_no=data.get('serial_no'),
            device_name=data.get('device_name'),
            host_address=data.get('host_address', ''),
            hardware_model=data.get('hardware_model', ''),
            software_version=data.get('software_version', ''),
            is_virtual=data.get('is_virtual', '否'),
            domain=data.get('domain', ''),
            device_type=data.get('device_type', ''),
            importance=data.get('importance', '中'),
            quantity=data.get('quantity', 1),
            assessment_record=json.dumps(data.get('assessment_record'), ensure_ascii=False) if data.get('assessment_record') else None,
            created_by=current_user_id,
            updated_by=current_user_id
        )
        
        db.session.add(asset)
        db.session.commit()
        
        return self.get_by_id(new_id)
    
    def update(self, asset_id, data, current_user_id):
        """更新资产"""
        asset = self.get_by_id_raw(asset_id)
        if not asset:
            return None
        
        if 'assessment_type_id' in data:
            asset.assessment_type_id = data['assessment_type_id']
        if 'serial_no' in data:
            asset.serial_no = data['serial_no']
        if 'device_name' in data:
            asset.device_name = data['device_name']
        if 'host_address' in data:
            asset.host_address = data['host_address']
        if 'hardware_model' in data:
            asset.hardware_model = data['hardware_model']
        if 'software_version' in data:
            asset.software_version = data['software_version']
        if 'is_virtual' in data:
            asset.is_virtual = data['is_virtual']
        if 'domain' in data:
            asset.domain = data['domain']
        if 'device_type' in data:
            asset.device_type = data['device_type']
        if 'importance' in data:
            asset.importance = data['importance']
        if 'quantity' in data:
            asset.quantity = data['quantity']
        if 'assessment_record' in data:
            asset.assessment_record = json.dumps(data['assessment_record'], ensure_ascii=False) if data['assessment_record'] else None
        
        asset.updated_by = current_user_id
        
        db.session.commit()
        
        return self.get_by_id(asset_id)
    
    def delete(self, asset_id):
        """删除资产"""
        asset = self.get_by_id_raw(asset_id)
        if not asset:
            return False
        
        db.session.delete(asset)
        db.session.commit()
        return True
    
    def get_max_serial_no(self, project_id):
        """获取项目中最大的序号"""
        result = db.session.query(db.func.max(self.model.serial_no)).filter(
            self.model.project_id == project_id
        ).scalar()
        return result or 0

# 创建单例
project_asset_repo = ProjectAssetRepository()