# -*- coding: utf-8 -*-

from flask import request, jsonify
from app.repositories.role_repo import role_repo
from app.decorators import api_permission_required


def init_role_routes(bp):
    """初始化角色管理相关路由"""
    
    @bp.route('/roles', methods=['GET'])
    @api_permission_required()
    def get_roles():
        """获取角色列表"""
        roles = role_repo.get_all_roles_with_permissions()
        return jsonify(roles), 200
    
    @bp.route('/roles/<int:role_id>', methods=['GET'])
    @api_permission_required()
    def get_role(role_id):
        """获取单个角色详情"""
        role = role_repo.get_role_with_permissions(role_id)
        if not role:
            return jsonify({'error': '角色不存在'}), 404
        
        return jsonify({
            'id': role.id,
            'name': role.name,
            'description': role.description,
            'is_builtin': role.is_builtin,
            'permissions': [p.id for p in role.permissions],
            'permissions_detail': [p.to_dict() for p in role.permissions]
        }), 200
    
    @bp.route('/roles', methods=['POST'])
    @api_permission_required()
    def create_role():
        """创建角色"""
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        
        if not name:
            return jsonify({'error': '角色名称不能为空'}), 400
        
        role = role_repo.create_role(name, description)
        if not role:
            return jsonify({'error': '角色名称已存在'}), 409
        
        return jsonify({
            'id': role.id,
            'name': role.name,
            'description': role.description
        }), 201
    
    @bp.route('/roles/<int:role_id>', methods=['PUT'])
    @api_permission_required()
    def update_role(role_id):
        """更新角色"""
        data = request.get_json()
        role = role_repo.update_role(role_id, data)
        if not role:
            return jsonify({'error': '角色不存在'}), 404
        return jsonify({'message': '更新成功'}), 200
    
    @bp.route('/roles/<int:role_id>', methods=['DELETE'])
    @api_permission_required()
    def delete_role(role_id):
        """删除角色"""
        if not role_repo.delete_role(role_id):
            return jsonify({'error': '角色不存在或为内置角色'}), 404
        return '', 204
    
    @bp.route('/roles/<int:role_id>/permissions', methods=['POST'])
    @api_permission_required()
    def assign_permission_to_role(role_id):
        """为角色分配权限"""
        data = request.get_json()
        permission_id = data.get('permission_id')
        
        if not permission_id:
            return jsonify({'error': 'permission_id 不能为空'}), 400
        
        if role_repo.assign_permission(role_id, permission_id):
            return jsonify({'message': '权限分配成功'}), 200
        return jsonify({'error': '角色或权限不存在'}), 404
    
    @bp.route('/roles/<int:role_id>/permissions/<int:permission_id>', methods=['DELETE'])
    @api_permission_required()
    def remove_permission_from_role(role_id, permission_id):
        """移除角色的权限"""
        role_repo.remove_permission(role_id, permission_id)
        return jsonify({'message': '权限移除成功'}), 200