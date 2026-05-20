# -*- coding: utf-8 -*-

from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
from app.models import db
from app.decorators import api_permission_required


def init_auth_routes(bp):
    """初始化认证相关路由"""
    
    @bp.route('/auth/login', methods=['POST'])
    def login():
        """用户登录 - 公开接口，不需要权限检查"""
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
        permission_codes = db.get_user_permission_codes(user.id)
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
        
        # 修复：使用 resource 而不是 type 来分类权限
        # 菜单权限：resource 以 'menu:' 开头
        menu_permissions = [p for p in permissions if p['resource'].startswith('menu:')]
        # 页面权限：resource 以 'page:' 开头  
        page_permissions = [p for p in permissions if p['resource'].startswith('page:')]
        # 按钮权限：resource 以 'button:' 开头
        button_permissions = [p for p in permissions if p['resource'].startswith('button:')]
        # API权限：resource 以 'api:' 开头
        api_permissions = [p for p in permissions if p['resource'].startswith('api:')]
        
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
    @api_permission_required()
    def get_current_user():
        """获取当前登录用户信息"""
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        user = db.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        permissions = db.get_user_permissions_detail(user_id)
        permission_codes = db.get_user_permission_codes(user_id)
        user_roles = db.get_user_roles(user_id)
        
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
    @api_permission_required()
    def get_user_permissions():
        """获取当前用户的权限列表（用于前端控制）"""
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        
        permissions = db.get_user_permissions_detail(user_id)
        
        return jsonify({
            'permissions': permissions
        }), 200