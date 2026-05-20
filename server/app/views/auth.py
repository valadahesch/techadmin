# -*- coding: utf-8 -*-

from flask import request, jsonify
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
        permissions = db.get_user_permissions(user.id)
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'permissions': permissions
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
        
        permissions = db.get_user_permissions(user_id)
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_active': user.is_active,
            'permissions': permissions
        }), 200