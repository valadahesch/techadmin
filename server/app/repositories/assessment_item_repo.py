# server/app/repositories/assessment_item_repo.py
# -*- coding: utf-8 -*-

import json
import uuid
from app.models.base import db
from app.models.assessment_item import AssessmentItem
from app.models.user import User
from sqlalchemy import or_
from sqlalchemy.orm import aliased

class AssessmentItemRepository:
    """测评项数据访问层"""
    
    def __init__(self):
        self.model = AssessmentItem
    
    def get_all(self, page=1, per_page=10, standard_type=None, assessment_level=None, search=None):
        """获取所有测评项列表（分页）"""
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
        )
        
        # 按标准类型筛选
        if standard_type:
            query = query.filter(self.model.standard_type == standard_type)
        
        # 按测评等级筛选（JSON数组包含）
        if assessment_level:
            query = query.filter(self.model.assessment_levels.like(f'%{assessment_level}%'))
        
        # 搜索（安全控制点、测评对象、检测项）
        if search:
            query = query.filter(
                or_(
                    self.model.security_control.like(f'%{search}%'),
                    self.model.assessment_object.like(f'%{search}%'),
                    self.model.detection_item.like(f'%{search}%')
                )
            )
        
        # 按创建时间倒序
        query = query.order_by(self.model.created_at.desc())
        
        # 分页
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        items = []
        for item, creator_name, updater_name in paginated.items:
            item_dict = item.to_dict()
            item_dict['creator_name'] = creator_name or ''
            item_dict['updater_name'] = updater_name or ''
            items.append(item_dict)
        
        return {
            'items': items,
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }
    
    def get_by_id(self, item_id):
        """根据ID获取测评项"""
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
        ).filter(self.model.id == item_id).first()
        
        if not result:
            return None
        
        item, creator_name, updater_name = result
        item_dict = item.to_dict()
        item_dict['creator_name'] = creator_name or ''
        item_dict['updater_name'] = updater_name or ''
        
        return item_dict
    
    def get_by_id_raw(self, item_id):
        """根据ID获取测评项原始对象"""
        return self.model.query.get(item_id)
    
    def _generate_unique_id(self):
        """生成唯一的20位UUID"""
        while True:
            new_id = uuid.uuid4().hex[:20]
            existing = self.get_by_id_raw(new_id)
            if not existing:
                return new_id
    
    def create(self, data, current_user_id):
        """创建测评项"""
        new_id = self._generate_unique_id()
        
        item = self.model(
            id=new_id,
            standard_type=data.get('standard_type'),
            security_control=data.get('security_control'),
            assessment_object=data.get('assessment_object'),
            detection_item=data.get('detection_item'),
            assessment_indicators=json.dumps(data.get('assessment_indicators', []), ensure_ascii=False),
            assessment_levels=json.dumps(data.get('assessment_levels', []), ensure_ascii=False),
            created_by=current_user_id,
            updated_by=current_user_id
        )
        
        db.session.add(item)
        db.session.commit()
        
        return self.get_by_id(new_id)
    
    def update(self, item_id, data, current_user_id):
        """更新测评项"""
        item = self.get_by_id_raw(item_id)
        if not item:
            return None
        
        if 'standard_type' in data:
            item.standard_type = data['standard_type']
        if 'security_control' in data:
            item.security_control = data['security_control']
        if 'assessment_object' in data:
            item.assessment_object = data['assessment_object']
        if 'detection_item' in data:
            item.detection_item = data['detection_item']
        if 'assessment_indicators' in data:
            item.assessment_indicators = json.dumps(data['assessment_indicators'], ensure_ascii=False)
        if 'assessment_levels' in data:
            item.assessment_levels = json.dumps(data['assessment_levels'], ensure_ascii=False)
        
        item.updated_by = current_user_id
        
        db.session.commit()
        
        return self.get_by_id(item_id)
    
    def delete(self, item_id):
        """删除测评项"""
        item = self.get_by_id_raw(item_id)
        if not item:
            return False
        
        db.session.delete(item)
        db.session.commit()
        return True
    
    def get_standard_types(self):
        """获取所有标准类型"""
        types = db.session.query(self.model.standard_type).distinct().all()
        return [t[0] for t in types if t[0]]

# 创建单例
assessment_item_repo = AssessmentItemRepository()