# -*- coding: utf-8 -*-

from flask import request, jsonify, g
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
from app.models import db


def init_auth_routes(bp):
    """初始化认证相关路由"""
    
    @bp.route('/auth/login', methods=['POST'])
    def login():
        """用户登录"""
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': '用户名和密码不能为空'}), 400
        
        user = db.get_user_by_username(username)
        if not user or not user.is_active:
            return jsonify({'error': '用户名或密码错误'}), 401
        
        if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash):
            return jsonify({'error': '用户名或密码错误'}), 401
        
        access_token = create_access_token(identity=str(user.id))
        
        # 获取用户权限详情
        permissions = db.get_user_permissions_detail(user.id)
        # 修复：将 set 转换为 list
        permission_codes = list(db.get_user_permission_codes(user.id))
        user_roles = db.get_user_roles(user.id)
        
        # 获取角色详情
        roles_detail = []
        for role_id in user_roles:
            role = db.get_role_by_id(role_id)
            if role:
                roles_detail.append({
                    'id': role.id,
                    'name': role.name,
                    'description': role.description
                })
        
        # 分类权限
        menu_permissions = [p for p in permissions if p['type'] == 'menu']
        page_permissions = [p for p in permissions if p['type'] == 'page']
        button_permissions = [p for p in permissions if p['type'] == 'button']
        api_permissions = [p for p in permissions if p['type'] == 'api']
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'roles': roles_detail,
                'permissions': {
                    'all': permission_codes,
                    'menus': [p['code'] for p in menu_permissions],
                    'pages': [p['code'] for p in page_permissions],
                    'buttons': [p['code'] for p in button_permissions],
                    'apis': [p['code'] for p in api_permissions],
                    'details': permissions
                }
            }
        }), 200
    
    @bp.route('/auth/current-user', methods=['GET'])
    @jwt_required()
    def get_current_user():
        """获取当前登录用户信息"""
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        user = db.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        # 获取用户权限详情
        permissions = db.get_user_permissions_detail(user_id)
        # 修复：将 set 转换为 list
        permission_codes = list(db.get_user_permission_codes(user_id))
        user_roles = db.get_user_roles(user_id)
        
        # 获取角色详情
        roles_detail = []
        for role_id in user_roles:
            role = db.get_role_by_id(role_id)
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
            'permissions': permission_codes,
            'permissions_detail': permissions
        }), 200
    
    @bp.route('/auth/user-permissions', methods=['GET'])
    @jwt_required()
    def get_user_permissions():
        """获取当前用户的权限列表（用于前端控制）"""
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        
        permissions = db.get_user_permissions_detail(user_id)
        
        return jsonify({
            'permissions': permissions
        }), 200