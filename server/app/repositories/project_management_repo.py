# server/app/repositories/project_management_repo.py
# -*- coding: utf-8 -*-

import uuid
from app.models.base import db
from app.models.project_management import ProjectManagement
from app.models.project_asset import ProjectAsset
from app.models.user import User
from sqlalchemy import or_, desc, asc
from sqlalchemy.orm import aliased

class ProjectManagementRepository:
    """项目管理数据访问层"""
    
    def __init__(self):
        self.model = ProjectManagement
    
    def get_all(self, page=1, per_page=10, search=None, status=None,
                sort_field='created_at', sort_order='desc', current_user_id=None, is_admin=False):
        """获取项目列表（分页）"""
        creator_alias = aliased(User)
        updater_alias = aliased(User)
        
        query = db.session.query(
            self.model,
            creator_alias.username.label('creator_name'),
            updater_alias.username.label('updater_name'),
            db.func.count(ProjectAsset.id).label('asset_count')
        ).outerjoin(
            creator_alias, self.model.created_by == creator_alias.id
        ).outerjoin(
            updater_alias, self.model.updated_by == updater_alias.id
        ).outerjoin(
            ProjectAsset, self.model.id == ProjectAsset.project_id
        ).group_by(self.model.id)
        
        # 非管理员只能查看自己的项目
        if not is_admin and current_user_id:
            query = query.filter(self.model.created_by == current_user_id)
        
        # 搜索
        if search:
            query = query.filter(
                or_(
                    self.model.project_no.like(f'%{search}%'),
                    self.model.company_name.like(f'%{search}%'),
                    self.model.contact_person.like(f'%{search}%'),
                    self.model.remark.like(f'%{search}%')
                )
            )
        
        # 按状态筛选
        if status:
            query = query.filter(self.model.status == status)
        
        # 排序
        if sort_field == 'creator_name':
            sort_column = creator_alias.username
        elif sort_field == 'updater_name':
            sort_column = updater_alias.username
        elif sort_field == 'asset_count':
            sort_column = db.func.count(ProjectAsset.id)
        else:
            sort_column = getattr(self.model, sort_field, self.model.created_at)
        
        if sort_order == 'asc':
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
        
        # 分页
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        items = []
        for project, creator_name, updater_name, asset_count in paginated.items:
            item_dict = project.to_dict()
            item_dict['creator_name'] = creator_name or ''
            item_dict['updater_name'] = updater_name or ''
            item_dict['asset_count'] = asset_count or 0
            items.append(item_dict)
        
        return {
            'items': items,
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }
    
    def get_by_id(self, project_id):
        """根据ID获取项目"""
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
        ).filter(self.model.id == project_id).first()
        
        if not result:
            return None
        
        project, creator_name, updater_name = result
        item_dict = project.to_dict()
        item_dict['creator_name'] = creator_name or ''
        item_dict['updater_name'] = updater_name or ''
        
        return item_dict
    
    def get_by_id_raw(self, project_id):
        """根据ID获取原始对象"""
        return self.model.query.get(project_id)
    
    def get_by_project_no(self, project_no):
        """根据项目编号获取项目"""
        return self.model.query.filter_by(project_no=project_no).first()
    
    def _generate_unique_id(self):
        """生成唯一的20位UUID"""
        while True:
            new_id = uuid.uuid4().hex[:20]
            existing = self.get_by_id_raw(new_id)
            if not existing:
                return new_id
    
    def create(self, data, current_user_id):
        """创建项目"""
        new_id = self._generate_unique_id()
        
        # 检查项目编号是否重复
        existing = self.get_by_project_no(data.get('project_no'))
        if existing:
            return None
        
        project = self.model(
            id=new_id,
            project_no=data.get('project_no'),
            company_name=data.get('company_name'),
            contact_person=data.get('contact_person'),
            contact_phone=data.get('contact_phone'),
            status=data.get('status', '进行中'),
            remark=data.get('remark', ''),
            created_by=current_user_id,
            updated_by=current_user_id
        )
        
        db.session.add(project)
        db.session.commit()
        
        return self.get_by_id(new_id)
    
    def update(self, project_id, data, current_user_id):
        """更新项目"""
        project = self.get_by_id_raw(project_id)
        if not project:
            return None
        
        # 如果更新项目编号，检查是否冲突
        if 'project_no' in data and data['project_no'] != project.project_no:
            existing = self.get_by_project_no(data['project_no'])
            if existing:
                return None
        
        if 'project_no' in data:
            project.project_no = data['project_no']
        if 'company_name' in data:
            project.company_name = data['company_name']
        if 'contact_person' in data:
            project.contact_person = data['contact_person']
        if 'contact_phone' in data:
            project.contact_phone = data['contact_phone']
        if 'status' in data:
            project.status = data['status']
        if 'remark' in data:
            project.remark = data['remark']
        
        project.updated_by = current_user_id
        
        db.session.commit()
        
        return self.get_by_id(project_id)
    
    def delete(self, project_id):
        """删除项目"""
        project = self.get_by_id_raw(project_id)
        if not project:
            return False
        
        db.session.delete(project)
        db.session.commit()
        return True

# 创建单例
project_management_repo = ProjectManagementRepository()