# server/app/views/project_asset.py
# -*- coding: utf-8 -*-

from flask import request, jsonify, g
from app.repositories.project_asset_repo import project_asset_repo
from app.repositories.assessment_type_repo import assessment_type_repo
from app.decorators import api_permission_required

def init_project_asset_routes(bp):
    """初始化项目资产管理相关路由"""
    
    @bp.route('/project-assets/<project_id>', methods=['GET'])
    @api_permission_required()
    def get_project_assets(project_id):
        """获取项目资产列表"""
        current_user_id = getattr(g, 'current_user_id', None)
        is_admin = False
        
        assets = project_asset_repo.get_by_project_id(
            project_id=project_id,
            current_user_id=current_user_id,
            is_admin=is_admin
        )
        
        return jsonify({'items': assets}), 200
    
    @bp.route('/project-assets', methods=['POST'])
    @api_permission_required()
    def create_project_asset():
        """创建项目资产"""
        data = request.get_json()
        
        required_fields = ['project_id', 'serial_no', 'device_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} 不能为空'}), 400
        
        current_user_id = getattr(g, 'current_user_id', None)
        
        asset = project_asset_repo.create(data, current_user_id)
        if not asset:
            return jsonify({'error': '创建失败'}), 500
        
        return jsonify(asset), 201
    
    @bp.route('/project-assets/<asset_id>', methods=['PUT'])
    @api_permission_required()
    def update_project_asset(asset_id):
        """更新项目资产"""
        data = request.get_json()
        current_user_id = getattr(g, 'current_user_id', None)
        
        asset = project_asset_repo.update(asset_id, data, current_user_id)
        if not asset:
            return jsonify({'error': '资产不存在'}), 404
        
        return jsonify(asset), 200
    
    @bp.route('/project-assets/<asset_id>', methods=['DELETE'])
    @api_permission_required()
    def delete_project_asset(asset_id):
        """删除项目资产"""
        if not project_asset_repo.delete(asset_id):
            return jsonify({'error': '资产不存在'}), 404
        return '', 204
    
    @bp.route('/project-assets/max-serial/<project_id>', methods=['GET'])
    @api_permission_required()
    def get_max_serial_no(project_id):
        """获取项目中最大的序号"""
        max_serial = project_asset_repo.get_max_serial_no(project_id)
        return jsonify({'max_serial': max_serial}), 200
    
    @bp.route('/assessment-types/simple', methods=['GET'])
    @api_permission_required()
    def get_assessment_types_simple():
        """获取测评类型列表（用于下拉选择）"""
        result = assessment_type_repo.get_all(page=1, per_page=1000)
        items = [{'id': item['id'], 'name': item['name']} for item in result.get('items', [])]
        return jsonify({'items': items}), 200