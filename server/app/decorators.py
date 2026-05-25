# -*- coding: utf-8 -*-

from functools import wraps
from flask import jsonify, request, g
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app.repositories.user_repo import user_repo
from app.permission_map import get_required_permissions


def permission_required(permission_code):
    """权限检查装饰器（直接指定权限）"""
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user_id_str = get_jwt_identity()
            current_user_id = int(current_user_id_str)
            
            # 将当前用户ID存入g对象，供后续使用
            g.current_user_id = current_user_id
            
            user = user_repo.get_by_id(current_user_id)
            if not user or not user.is_active:
                return jsonify({
                    'error': '用户不存在或已被禁用',
                    'code': 'USER_DISABLED'
                }), 403
            
            if not user_repo.has_permission(current_user_id, permission_code):
                return jsonify({
                    'error': f'缺少权限: {permission_code}',
                    'code': 'PERMISSION_DENIED',
                    'required_permission': permission_code
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def api_permission_required():
    """API权限检查装饰器"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            method = request.method
            path = request.path
            
            required_permissions = get_required_permissions(method, path)
            
            if not required_permissions:
                return fn(*args, **kwargs)
            
            try:
                verify_jwt_in_request()
                user_id_str = get_jwt_identity()
                user_id = int(user_id_str)
                
                # 将当前用户ID存入g对象，供后续使用
                g.current_user_id = user_id
                
            except Exception as e:
                return jsonify({
                    'error': '未登录或登录已过期',
                    'code': 'UNAUTHORIZED'
                }), 401
            
            user = user_repo.get_by_id(user_id)
            if not user or not user.is_active:
                return jsonify({
                    'error': '用户不存在或已被禁用',
                    'code': 'USER_DISABLED'
                }), 403
            
            if required_permissions == ['authenticated']:
                return fn(*args, **kwargs)
            
            if not user_repo.has_any_permission(user_id, required_permissions):
                return jsonify({
                    'error': f'权限不足，需要以下权限之一: {required_permissions}',
                    'code': 'PERMISSION_DENIED',
                    'required_permissions': required_permissions
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def get_current_user_id():
    """获取当前登录用户ID的工具函数"""
    return getattr(g, 'current_user_id', None)