# -*- coding: utf-8 -*-

from flask import request, jsonify
from app.repositories.permission_repo import permission_repo
from app.repositories.api_permission_repo import api_permission_repo
from app.decorators import api_permission_required


def init_permission_routes(bp):
    """初始化权限管理相关路由"""
    
    # ========== 权限 CRUD ==========
    
    @bp.route('/permissions', methods=['GET'])
    @api_permission_required()
    def get_permissions():
        """获取权限列表"""
        permissions = permission_repo.get_all_permissions()
        return jsonify(permissions), 200
    
    @bp.route('/permissions/<int:permission_id>', methods=['GET'])
    @api_permission_required()
    def get_permission(permission_id):
        """获取单个权限详情"""
        perm = permission_repo.get_by_id(permission_id)
        if not perm:
            return jsonify({'error': '权限不存在'}), 404
        return jsonify(perm.to_dict()), 200
    
    @bp.route('/permissions', methods=['POST'])
    @api_permission_required()
    def create_permission():
        """创建权限"""
        data = request.get_json()
        
        code = data.get('code')
        name = data.get('name')
        resource = data.get('resource')
        action = data.get('action')
        description = data.get('description', '')
        
        if not all([code, name, resource, action]):
            return jsonify({'error': '权限代码、名称、资源和操作不能为空'}), 400
        
        # 检查权限代码是否已存在
        existing = permission_repo.get_by_code(code)
        if existing:
            return jsonify({'error': f'权限代码 {code} 已存在'}), 409
        
        permission = permission_repo.create(code, name, resource, action, description)
        if not permission:
            return jsonify({'error': '创建权限失败'}), 500
        
        return jsonify(permission.to_dict()), 201
    
    @bp.route('/permissions/<int:permission_id>', methods=['PUT'])
    @api_permission_required()
    def update_permission(permission_id):
        """更新权限"""
        data = request.get_json()
        
        permission = permission_repo.update(permission_id, data)
        if not permission:
            return jsonify({'error': '权限不存在或更新失败'}), 404
        
        return jsonify(permission.to_dict()), 200
    
    @bp.route('/permissions/<int:permission_id>', methods=['DELETE'])
    @api_permission_required()
    def delete_permission(permission_id):
        """删除权限"""
        if not permission_repo.delete(permission_id):
            return jsonify({'error': '权限不存在或删除失败'}), 404
        return '', 204
    
    # ========== API 权限映射管理 ==========
    
    @bp.route('/api-permission-mappings', methods=['GET'])
    @api_permission_required()
    def get_api_permission_mappings():
        """获取 API-权限映射列表"""
        mappings = api_permission_repo.get_all_mappings()
        return jsonify(mappings), 200
    
    @bp.route('/api-permission-mappings', methods=['POST'])
    @api_permission_required()
    def create_api_permission_mapping():
        """创建 API-权限映射"""
        data = request.get_json()
        
        method = data.get('method')
        api_path = data.get('api_path')
        permission_id = data.get('permission_id')
        
        if not all([method, api_path, permission_id]):
            return jsonify({'error': 'HTTP方法、API路径和权限ID不能为空'}), 400
        
        mapping = api_permission_repo.create_mapping(method, api_path, permission_id)
        if not mapping:
            return jsonify({'error': '创建映射失败'}), 500
        
        return jsonify(mapping), 201
    
    @bp.route('/api-permission-mappings/<int:mapping_id>', methods=['DELETE'])
    @api_permission_required()
    def delete_api_permission_mapping(mapping_id):
        """删除 API-权限映射"""
        if not api_permission_repo.delete_mapping(mapping_id):
            return jsonify({'error': '映射不存在或删除失败'}), 404
        return '', 204
    
    @bp.route('/api-permission-mappings/by-path', methods=['GET'])
    @api_permission_required()
    def get_api_permission_mappings_by_path():
        """根据 API 路径获取权限映射"""
        method = request.args.get('method')
        api_path = request.args.get('path')
        
        if not method or not api_path:
            return jsonify({'error': 'method 和 path 参数不能为空'}), 400
        
        mappings = api_permission_repo.get_mappings_by_api(method, api_path)
        return jsonify(mappings), 200
    
    # ========== 辅助接口 ==========
    
    @bp.route('/permissions/resources', methods=['GET'])
    @api_permission_required()
    def get_permission_resources():
        """获取权限资源类型列表"""
        resources = permission_repo.get_all_resources()
        return jsonify(resources), 200
    
    @bp.route('/permissions/actions', methods=['GET'])
    @api_permission_required()
    def get_permission_actions():
        """获取权限操作类型列表"""
        actions = permission_repo.get_all_actions()
        return jsonify(actions), 200