# server/app/repositories/assessment_type_repo.py
# -*- coding: utf-8 -*-

import json
import uuid
from app.models.base import db
from app.models.assessment_type import AssessmentType
from app.models.user import User
from sqlalchemy import or_
from sqlalchemy.orm import aliased

class AssessmentTypeRepository:
    """测评类型数据访问层"""
    
    def __init__(self):
        self.model = AssessmentType
    
    def get_all(self, page=1, per_page=10, search=None, group=None, 
                sort_field='created_at', sort_order='desc'):
        """获取所有测评类型列表（分页）"""
        from sqlalchemy import desc, asc
        
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
        
        # 搜索（名称、描述、创建人、修改人、群组）
        if search:
            query = query.filter(
                or_(
                    self.model.name.like(f'%{search}%'),
                    self.model.description.like(f'%{search}%'),
                    creator_alias.username.like(f'%{search}%'),
                    updater_alias.username.like(f'%{search}%'),
                    self.model.group_list.like(f'%{search}%')
                )
            )
        
        # 按群组筛选
        if group:
            query = query.filter(self.model.group_list.like(f'%"{group}"%'))
        
        # 排序
        if sort_field == 'creator_name':
            sort_column = creator_alias.username
        elif sort_field == 'updater_name':
            sort_column = updater_alias.username
        else:
            sort_column = getattr(self.model, sort_field, self.model.created_at)
        
        if sort_order == 'asc':
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
        
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
    
    def get_by_id(self, type_id):
        """根据ID获取测评类型"""
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
        ).filter(self.model.id == type_id).first()
        
        if not result:
            return None
        
        item, creator_name, updater_name = result
        item_dict = item.to_dict()
        item_dict['creator_name'] = creator_name or ''
        item_dict['updater_name'] = updater_name or ''
        
        return item_dict
    
    def get_by_id_raw(self, type_id):
        """根据ID获取原始对象"""
        return self.model.query.get(type_id)
    
    def _generate_unique_id(self):
        """生成唯一的20位UUID"""
        while True:
            new_id = uuid.uuid4().hex[:20]
            existing = self.get_by_id_raw(new_id)
            if not existing:
                return new_id
    
    def create(self, data, current_user_id):
        """创建测评类型"""
        new_id = self._generate_unique_id()
        
        item = self.model(
            id=new_id,
            name=data.get('name'),
            description=data.get('description', ''),
            member_ids=json.dumps(data.get('member_ids', []), ensure_ascii=False),
            group_list=json.dumps(data.get('groups', []), ensure_ascii=False),
            created_by=current_user_id,
            updated_by=current_user_id
        )
        
        db.session.add(item)
        db.session.commit()
        
        return self.get_by_id(new_id)
    
    def update(self, type_id, data, current_user_id):
        """更新测评类型"""
        item = self.get_by_id_raw(type_id)
        if not item:
            return None
        
        if 'name' in data:
            item.name = data['name']
        if 'description' in data:
            item.description = data['description']
        if 'member_ids' in data:
            item.member_ids = json.dumps(data['member_ids'], ensure_ascii=False)
        if 'groups' in data:
            item.group_list = json.dumps(data['groups'], ensure_ascii=False)
        
        item.updated_by = current_user_id
        
        db.session.commit()
        
        return self.get_by_id(type_id)
    
    def delete(self, type_id):
        """删除测评类型"""
        item = self.get_by_id_raw(type_id)
        if not item:
            return False
        
        db.session.delete(item)
        db.session.commit()
        return True
    
    def get_all_groups(self):
        """获取所有群组（去重，不分页）"""
        results = db.session.query(self.model.group_list).all()
        groups_set = set()
        for result in results:
            if result[0]:
                try:
                    groups = json.loads(result[0])
                    for group in groups:
                        if group:
                            groups_set.add(group)
                except:
                    pass
        return sorted(list(groups_set))

# 创建单例
assessment_type_repo = AssessmentTypeRepository()