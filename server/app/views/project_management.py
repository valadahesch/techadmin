# server/app/views/project_management.py
# -*- coding: utf-8 -*-

from flask import request, jsonify, g
from app.repositories.project_management_repo import project_management_repo
from app.decorators import api_permission_required

def init_project_management_routes(bp):
    """初始化项目管理相关路由"""
    
    @bp.route('/projects', methods=['GET'])
    @api_permission_required()
    def get_projects():
        """获取项目列表（分页）"""
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        sort_field = request.args.get('sort_field', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        current_user_id = getattr(g, 'current_user_id', None)
        # 获取用户信息判断是否为管理员（这里简化处理，实际应从token或数据库获取）
        is_admin = False
        
        result = project_management_repo.get_all(
            page=page,
            per_page=per_page,
            search=search if search else None,
            status=status if status else None,
            sort_field=sort_field,
            sort_order=sort_order,
            current_user_id=current_user_id,
            is_admin=is_admin
        )
        
        return jsonify(result), 200
    
    @bp.route('/projects/<project_id>', methods=['GET'])
    @api_permission_required()
    def get_project(project_id):
        """获取单个项目详情"""
        project = project_management_repo.get_by_id(project_id)
        if not project:
            return jsonify({'error': '项目不存在'}), 404
        return jsonify(project), 200
    
    @bp.route('/projects', methods=['POST'])
    @api_permission_required()
    def create_project():
        """创建项目"""
        data = request.get_json()
        
        required_fields = ['project_no', 'company_name', 'contact_person', 'contact_phone']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} 不能为空'}), 400
        
        current_user_id = getattr(g, 'current_user_id', None)
        
        project = project_management_repo.create(data, current_user_id)
        if not project:
            return jsonify({'error': '项目编号已存在'}), 409
        
        return jsonify(project), 201
    
    @bp.route('/projects/<project_id>', methods=['PUT'])
    @api_permission_required()
    def update_project(project_id):
        """更新项目"""
        data = request.get_json()
        current_user_id = getattr(g, 'current_user_id', None)
        
        project = project_management_repo.update(project_id, data, current_user_id)
        if not project:
            return jsonify({'error': '项目不存在或项目编号已存在'}), 404
        
        return jsonify(project), 200
    
    @bp.route('/projects/<project_id>', methods=['DELETE'])
    @api_permission_required()
    def delete_project(project_id):
        """删除项目"""
        if not project_management_repo.delete(project_id):
            return jsonify({'error': '项目不存在'}), 404
        return '', 204

