# -*- coding: utf-8 -*-

from flask import g, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, get_jwt_identity, verify_jwt_in_request
from functools import wraps

from app.models import db

# 初始化扩展
cors = CORS()
jwt = JWTManager()


def init_cors(app):
    """初始化CORS配置"""
    cors.init_app(app, 
                  resources={r"/api/*": {
                      "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
                      "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                      "allow_headers": ["Content-Type", "Authorization", "Accept"],
                      "expose_headers": ["Content-Type", "Authorization"],
                      "supports_credentials": True,
                      "max_age": 3600
                  }})


def init_before_request(app):
    """初始化请求前置钩子"""
    
    @app.before_request
    def before_request():
        """在每个请求之前执行，加载用户权限信息到g对象"""
        # 处理OPTIONS预检请求
        if request.method == 'OPTIONS':
            return
        
        # 公开路径不需要权限检查
        public_paths = ['/api/auth/login', '/api/auth/register']
        if request.path in public_paths:
            return
        
        # 尝试验证JWT token
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
            if user_id:
                user_id_int = int(user_id)
                user = db.get_user_by_id(user_id_int)
                if user and user.is_active:
                    # 将用户信息和权限存储到g对象中，供后续使用
                    g.current_user = {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email
                    }
                    g.user_permissions = db.get_user_permission_codes(user_id_int)
                    g.user_roles = db.get_user_roles(user_id_int)
        except Exception as e:
            # token无效，但允许继续（由具体接口决定是否需要认证）
            pass


def register_error_handlers(app):
    """注册错误处理器"""
    
    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({
            'error': '权限不足，无法访问',
            'code': 'FORBIDDEN'
        }), 403
    
    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({
            'error': '未登录或登录已过期',
            'code': 'UNAUTHORIZED'
        }), 401
    
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            'error': '接口不存在',
            'code': 'NOT_FOUND'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({
            'error': '服务器内部错误',
            'code': 'INTERNAL_ERROR'
        }), 500