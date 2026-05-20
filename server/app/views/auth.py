# -*- coding: utf-8 -*-

from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.repositories.user_repo import user_repo
from app.decorators import api_permission_required


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
        
        user = user_repo.get_by_username(username)
        if not user or not user.is_active:
            return jsonify({'error': '用户名或密码错误'}), 401
        
        if not user_repo.check_password(user, password):
            return jsonify({'error': '用户名或密码错误'}), 401
        
        access_token = create_access_token(identity=str(user.id))
        
        # 获取用户权限
        permission_codes = user_repo.get_user_permission_codes(user.id)
        permissions_detail = user_repo.get_user_permissions_detail(user.id)
        user_roles = user_repo.get_user_roles(user.id)
        
        # 获取角色详情
        roles_detail = []
        for role_id in user_roles:
            from app.repositories.role_repo import role_repo
            role = role_repo.get_by_id(role_id)
            if role:
                roles_detail.append({
                    'id': role.id,
                    'name': role.name,
                    'description': role.description
                })
        
        # 分类权限
        menu_permissions = []
        page_permissions = []
        button_permissions = []
        
        for perm in permissions_detail:
            code = perm['code']
            if code.startswith('menu:'):
                menu_permissions.append(code)
            elif code.startswith('page:'):
                page_permissions.append(code)
            elif code.startswith('button:'):
                button_permissions.append(code)
        
        if not menu_permissions:
            for code in permission_codes:
                if code.startswith('leak:'):
                    menu_permissions.append('menu:leak:scan')
                elif code.startswith('assessment:'):
                    menu_permissions.append('menu:assessment')
                elif code.startswith('user:') or code.startswith('role:') or code.startswith('permission:'):
                    menu_permissions.append('menu:system:settings')
        
        if not page_permissions:
            for code in permission_codes:
                if code == 'user:view':
                    page_permissions.append('page:user:management')
                elif code == 'role:view':
                    page_permissions.append('page:role:management')
                elif code == 'permission:view':
                    page_permissions.append('page:permission:management')
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'roles': roles_detail,
                'permissions': {
                    'all': permission_codes,
                    'menus': list(set(menu_permissions)),
                    'pages': list(set(page_permissions)),
                    'buttons': list(set(button_permissions)),
                    'details': permissions_detail
                }
            }
        }), 200
    
    @bp.route('/auth/current-user', methods=['GET'])
    @api_permission_required()
    def get_current_user():
        """获取当前登录用户信息"""
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        user = user_repo.get_by_id(user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        permission_codes = user_repo.get_user_permission_codes(user_id)
        permissions_detail = user_repo.get_user_permissions_detail(user_id)
        user_roles = user_repo.get_user_roles(user_id)
        
        roles_detail = []
        for role_id in user_roles:
            from app.repositories.role_repo import role_repo
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
            'permissions': permission_codes,
            'permissions_detail': permissions_detail
        }), 200
    
    @bp.route('/auth/user-permissions', methods=['GET'])
    @api_permission_required()
    def get_user_permissions():
        """获取当前用户的权限列表"""
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        
        permissions = user_repo.get_user_permissions_detail(user_id)
        
        return jsonify({
            'permissions': permissions
        }), 200