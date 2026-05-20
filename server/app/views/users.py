# -*- coding: utf-8 -*-

from flask import request, jsonify
from app.repositories.user_repo import user_repo
from app.decorators import api_permission_required


def init_user_routes(bp):
    """初始化用户管理相关路由"""
    
    @bp.route('/users', methods=['GET'])
    @api_permission_required()
    def get_users():
        """获取用户列表"""
        users = user_repo.get_all_users_with_roles()
        return jsonify(users), 200
    
    @bp.route('/users/<int:user_id>', methods=['GET'])
    @api_permission_required()
    def get_user(user_id):
        """获取单个用户详情"""
        user = user_repo.get_by_id(user_id)
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        user_roles = user_repo.get_user_roles(user_id)
        permissions = user_repo.get_user_permission_codes(user_id)
        
        from app.repositories.role_repo import role_repo
        roles_detail = []
        for role_id in user_roles:
            role = role_repo.get_by_id(role_id)
            if role:
                roles_detail.append({
                    'id': role.id,
                    'name': role.name,
                    'description': role.description
                })
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_active': user.is_active,
            'roles': roles_detail,
            'permissions': permissions,
            'created_at': user.created_at.isoformat() if user.created_at else None
        }), 200
    
    @bp.route('/users', methods=['POST'])
    @api_permission_required()
    def create_user():
        """创建用户"""
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([username, email, password]):
            return jsonify({'error': '用户名、邮箱和密码不能为空'}), 400
        
        user = user_repo.create_user(username, email, password)
        if not user:
            return jsonify({'error': '用户名已存在'}), 409
        
        roles = data.get('roles', [])
        for role_id in roles:
            user_repo.assign_role(user.id, role_id)
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email
        }), 201
    
    @bp.route('/users/<int:user_id>', methods=['PUT'])
    @api_permission_required()
    def update_user(user_id):
        """更新用户"""
        data = request.get_json()
        user = user_repo.update_user(user_id, data)
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        return jsonify({'message': '更新成功'}), 200
    
    @bp.route('/users/<int:user_id>', methods=['DELETE'])
    @api_permission_required()
    def delete_user(user_id):
        """删除用户"""
        if not user_repo.delete_user(user_id):
            return jsonify({'error': '用户不存在或不能删除管理员'}), 404
        return '', 204
    
    @bp.route('/users/<int:user_id>/roles', methods=['POST'])
    @api_permission_required()
    def assign_role_to_user(user_id):
        """为用户分配角色"""
        data = request.get_json()
        role_id = data.get('role_id')
        
        if not role_id:
            return jsonify({'error': 'role_id 不能为空'}), 400
        
        if user_repo.assign_role(user_id, role_id):
            return jsonify({'message': '角色分配成功'}), 200
        return jsonify({'error': '用户或角色不存在'}), 404
    
    @bp.route('/users/<int:user_id>/roles/<int:role_id>', methods=['DELETE'])
    @api_permission_required()
    def remove_role_from_user(user_id, role_id):
        """移除用户的角色"""
        user_repo.remove_role(user_id, role_id)
        return jsonify({'message': '角色移除成功'}), 200