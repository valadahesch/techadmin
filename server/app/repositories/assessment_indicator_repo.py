# server/app/repositories/assessment_indicator_repo.py
# -*- coding: utf-8 -*-

import json
import uuid
from app.models.base import db
from app.models.assessment_indicator import AssessmentIndicator
from app.models.user import User
from sqlalchemy import or_
from sqlalchemy.orm import aliased

class AssessmentIndicatorRepository:
    """测评指标数据访问层"""
    
    def __init__(self):
        self.model = AssessmentIndicator
    
    def get_all(self, search=None, indicator_type=None):
        """获取所有指标列表"""
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
        
        # 搜索
        if search:
            query = query.filter(
                or_(
                    self.model.name_cn.like(f'%{search}%'),
                    self.model.name_en.like(f'%{search}%')
                )
            )
        
        # 按类型筛选
        if indicator_type:
            query = query.filter(self.model.indicator_type == indicator_type)
        
        query = query.order_by(self.model.created_at.desc())
        results = query.all()
        
        items = []
        for indicator, creator_name, updater_name in results:
            indicator_dict = indicator.to_dict()
            indicator_dict['creator_name'] = creator_name or ''
            indicator_dict['updater_name'] = updater_name or ''
            items.append(indicator_dict)
        
        return {
            'items': items,
            'total': len(items)
        }
    
    def get_by_id(self, indicator_id):
        """根据ID获取指标"""
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
        ).filter(self.model.id == indicator_id).first()
        
        if not result:
            return None
        
        indicator, creator_name, updater_name = result
        indicator_dict = indicator.to_dict()
        indicator_dict['creator_name'] = creator_name or ''
        indicator_dict['updater_name'] = updater_name or ''
        
        return indicator_dict
    
    def get_by_id_raw(self, indicator_id):
        """根据ID获取指标原始对象"""
        return self.model.query.get(indicator_id)
    
    def _generate_unique_id(self):
        """生成唯一的20位UUID"""
        while True:
            new_id = uuid.uuid4().hex[:20]
            existing = self.get_by_id_raw(new_id)
            if not existing:
                return new_id
    
    def create(self, data, current_user_id):
        """创建指标"""
        new_id = self._generate_unique_id()
        
        # 处理指标数据
        indicator_data = None
        if data.get('indicator_data'):
            indicator_data = json.dumps(data['indicator_data'], ensure_ascii=False)
        
        indicator = self.model(
            id=new_id,
            indicator_type=data.get('indicator_type'),
            name_cn=data.get('name_cn'),
            name_en=data.get('name_en', ''),
            indicator_data=indicator_data,
            created_by=current_user_id,
            updated_by=current_user_id
        )
        
        db.session.add(indicator)
        db.session.commit()
        
        return self.get_by_id(new_id)
    
    def update(self, indicator_id, data, current_user_id):
        """更新指标"""
        indicator = self.get_by_id_raw(indicator_id)
        if not indicator:
            return None
        
        if 'indicator_type' in data:
            indicator.indicator_type = data['indicator_type']
        if 'name_cn' in data:
            indicator.name_cn = data['name_cn']
        if 'name_en' in data:
            indicator.name_en = data['name_en']
        if 'indicator_data' in data:
            indicator.indicator_data = json.dumps(data['indicator_data'], ensure_ascii=False) if data['indicator_data'] else None
        
        indicator.updated_by = current_user_id
        
        db.session.commit()
        
        return self.get_by_id(indicator_id)
    
    def delete(self, indicator_id):
        """删除指标"""
        indicator = self.get_by_id_raw(indicator_id)
        if not indicator:
            return False
        
        db.session.delete(indicator)
        db.session.commit()
        return True

    def get_by_name_cn(self, name_cn):
        """根据中文名称获取测评指标"""
        result = self.model.query.filter_by(name_cn=name_cn).first()
        if not result:
            return None
        return result.to_dict()

    # server/app/repositories/assessment_indicator_repo.py
    # 添加以下方法

    def get_by_name_en(self, name_en):
        """根据英文名称获取测评指标"""
        result = self.model.query.filter_by(name_en=name_en).first()
        if not result:
            return None
        return result.to_dict()

# 创建单例
assessment_indicator_repo = AssessmentIndicatorRepository()