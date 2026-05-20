# -*- coding: utf-8 -*-

from functools import wraps
from flask import jsonify, request, g
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app.models import db
from app.permission_map import get_required_permissions


def permission_required(permission_code):
    """
    权限检查装饰器（直接指定权限）
    使用方式: @permission_required('user:create')
    """
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user_id_str = get_jwt_identity()
            current_user_id = int(current_user_id_str)
            
            user = db.get_user_by_id(current_user_id)
            if not user or not user.is_active:
                return jsonify({
                    'error': '用户不存在或已被禁用',
                    'code': 'USER_DISABLED'
                }), 403
            
            if not db.has_permission(current_user_id, permission_code):
                return jsonify({
                    'error': f'缺少权限: {permission_code}',
                    'code': 'PERMISSION_DENIED',
                    'required_permission': permission_code
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def api_permission_required():
    """
    API权限检查装饰器（自动根据配置映射权限）
    使用方式: @api_permission_required()
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # 获取请求信息
            method = request.method
            path = request.path
            
            # 获取所需权限
            required_permissions = get_required_permissions(method, path)
            
            # 如果没有权限要求，直接执行
            if not required_permissions:
                return fn(*args, **kwargs)
            
            # 验证JWT
            try:
                verify_jwt_in_request()
                user_id_str = get_jwt_identity()
                user_id = int(user_id_str)
            except Exception as e:
                return jsonify({
                    'error': '未登录或登录已过期',
                    'code': 'UNAUTHORIZED'
                }), 401
            
            user = db.get_user_by_id(user_id)
            if not user or not user.is_active:
                return jsonify({
                    'error': '用户不存在或已被禁用',
                    'code': 'USER_DISABLED'
                }), 403
            
            # 检查权限
            if required_permissions == ['authenticated']:
                # 只需要认证，不需要特定权限
                return fn(*args, **kwargs)
            
            # 检查是否拥有任一所需权限
            if not db.has_any_permission(user_id, required_permissions):
                return jsonify({
                    'error': f'权限不足，需要以下权限之一: {required_permissions}',
                    'code': 'PERMISSION_DENIED',
                    'required_permissions': required_permissions
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def menu_permission_required(menu_code):
    """
    菜单权限检查装饰器
    使用方式: @menu_permission_required('menu:leak:scan')
    """
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user_id_str = get_jwt_identity()
            current_user_id = int(current_user_id_str)
            
            # 菜单权限映射
            menu_permission_map = {
                'menu:leak:scan': ['leak:view'],
                'menu:assessment': ['assessment:view'],
                'menu:system:settings': ['user:view', 'role:view', 'permission:view'],
            }
            
            required_perms = menu_permission_map.get(menu_code, [])
            if not required_perms:
                return fn(*args, **kwargs)
            
            if not db.has_any_permission(current_user_id, required_perms):
                return jsonify({
                    'error': '没有访问此菜单的权限',
                    'code': 'MENU_PERMISSION_DENIED'
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator