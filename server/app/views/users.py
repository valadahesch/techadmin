# -*- coding: utf-8 -*-

from flask import request, jsonify
from flask_jwt_extended import jwt_required
from app.models import db
from app.decorators import permission_required, api_permission_required


def init_user_routes(bp):
    """初始化用户管理相关路由"""
    
    @bp.route('/users', methods=['GET'])
    @api_permission_required()
    def get_users():
        """获取用户列表"""
        users = db.get_all_users()
        for user in users:
            user['permissions'] = db.get_user_permission_codes(user['id'])
            user['roles_detail'] = []
            for role_id in user['roles']:
                role = db.get_role_by_id(role_id)
                if role:
                    user['roles_detail'].append({
                        'id': role.id,
                        'name': role.name
                    })
        return jsonify(users), 200
    
    @bp.route('/users', methods=['POST'])
    @permission_required('button:user:create')
    def create_user():
        """创建用户"""
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([username, email, password]):
            return jsonify({'error': '用户名、邮箱和密码不能为空'}), 400
        
        user = db.create_user(username, email, password)
        if not user:
            return jsonify({'error': '用户名已存在'}), 409
        
        roles = data.get('roles', [])
        for role_id in roles:
            db.assign_role_to_user(user.id, role_id)
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email
        }), 201
    
    @bp.route('/users/<int:user_id>', methods=['PUT'])
    @permission_required('button:user:edit')
    def update_user(user_id):
        """更新用户"""
        data = request.get_json()
        user = db.update_user(user_id, data)
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        return jsonify({'message': '更新成功'}), 200
    
    @bp.route('/users/<int:user_id>', methods=['DELETE'])
    @permission_required('button:user:delete')
    def delete_user(user_id):
        """删除用户"""
        if not db.delete_user(user_id):
            return jsonify({'error': '用户不存在'}), 404
        return '', 204
    
    @bp.route('/users/<int:user_id>/roles', methods=['POST'])
    @permission_required('button:user:assign_role')
    def assign_role_to_user(user_id):
        """为用户分配角色"""
        data = request.get_json()
        role_id = data.get('role_id')
        
        if not role_id:
            return jsonify({'error': 'role_id 不能为空'}), 400
        
        if db.assign_role_to_user(user_id, role_id):
            return jsonify({'message': '角色分配成功'}), 200
        return jsonify({'error': '用户或角色不存在'}), 404
    
    @bp.route('/users/<int:user_id>/roles/<int:role_id>', methods=['DELETE'])
    @permission_required('button:user:assign_role')
    def remove_role_from_user(user_id, role_id):
        """移除用户的角色"""
        db.remove_role_from_user(user_id, role_id)
        return jsonify({'message': '角色移除成功'}), 200