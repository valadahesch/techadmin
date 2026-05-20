# -*- coding: utf-8 -*-

from flask import request, jsonify
from app.models import db
from app.decorators import permission_required, api_permission_required


def init_role_routes(bp):
    """初始化角色管理相关路由"""
    
    @bp.route('/roles', methods=['GET'])
    @api_permission_required()
    def get_roles():
        """获取角色列表"""
        return jsonify(db.get_all_roles()), 200
    
    @bp.route('/roles', methods=['POST'])
    @permission_required('button:role:create')
    def create_role():
        """创建角色"""
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        
        if not name:
            return jsonify({'error': '角色名称不能为空'}), 400
        
        role = db.create_role(name, description)
        return jsonify({
            'id': role.id,
            'name': role.name,
            'description': role.description
        }), 201
    
    @bp.route('/roles/<int:role_id>', methods=['PUT'])
    @permission_required('button:role:edit')
    def update_role(role_id):
        """更新角色"""
        data = request.get_json()
        role = db.update_role(role_id, data)
        if not role:
            return jsonify({'error': '角色不存在'}), 404
        return jsonify({'message': '更新成功'}), 200
    
    @bp.route('/roles/<int:role_id>', methods=['DELETE'])
    @permission_required('button:role:delete')
    def delete_role(role_id):
        """删除角色"""
        if not db.delete_role(role_id):
            return jsonify({'error': '角色不存在或为内置角色'}), 404
        return '', 204
    
    @bp.route('/roles/<int:role_id>/permissions', methods=['POST'])
    @permission_required('button:role:assign_permission')
    def assign_permission_to_role(role_id):
        """为角色分配权限"""
        data = request.get_json()
        permission_id = data.get('permission_id')
        
        if not permission_id:
            return jsonify({'error': 'permission_id 不能为空'}), 400
        
        if db.assign_permission_to_role(role_id, permission_id):
            return jsonify({'message': '权限分配成功'}), 200
        return jsonify({'error': '角色或权限不存在'}), 404
    
    @bp.route('/roles/<int:role_id>/permissions/<int:permission_id>', methods=['DELETE'])
    @permission_required('button:role:assign_permission')
    def remove_permission_from_role(role_id, permission_id):
        """移除角色的权限"""
        db.remove_permission_from_role(role_id, permission_id)
        return jsonify({'message': '权限移除成功'}), 200