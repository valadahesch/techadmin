# -*- coding: utf-8 -*-

from flask import g, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, get_jwt_identity, verify_jwt_in_request


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
        if request.method == 'OPTIONS':
            return
        
        public_paths = ['/api/auth/login']
        if request.path in public_paths:
            return
        
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
            if user_id:
                user_id_int = int(user_id)
                # 延迟导入避免循环
                from app.repositories.user_repo import user_repo
                user = user_repo.get_by_id(user_id_int)
                if user and user.is_active:
                    g.current_user = {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email
                    }
                    g.user_permissions = user_repo.get_user_permission_codes(user_id_int)
                    g.user_roles = user_repo.get_user_roles(user_id_int)
        except Exception as e:
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