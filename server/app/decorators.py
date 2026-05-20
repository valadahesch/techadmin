# -*- coding: utf-8 -*-

from functools import wraps
from flask import jsonify, request, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db


def permission_required(permission_code):
    """
    权限检查装饰器（基于权限代码）
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
            
            # 检查权限
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
    API权限检查装饰器（自动匹配请求方法和路径）
    使用方式: @api_permission_required()
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
            
            # 获取请求信息
            method = request.method
            path = request.path
            
            # 检查API权限
            if not db.has_api_permission(current_user_id, method, path):
                return jsonify({
                    'error': f'没有访问 {method} {path} 的权限',
                    'code': 'API_PERMISSION_DENIED',
                    'method': method,
                    'path': path
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def menu_permission_required(menu_code):
    """
    菜单权限检查装饰器
    使用方式: @menu_permission_required('menu:system:settings')
    """
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user_id_str = get_jwt_identity()
            current_user_id = int(current_user_id_str)
            
            if not db.has_permission(current_user_id, menu_code):
                return jsonify({
                    'error': '没有访问此菜单的权限',
                    'code': 'MENU_PERMISSION_DENIED'
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def button_permission_required(button_code):
    """
    按钮权限检查装饰器
    使用方式: @button_permission_required('button:user:create')
    """
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user_id_str = get_jwt_identity()
            current_user_id = int(current_user_id_str)
            
            if not db.has_permission(current_user_id, button_code):
                return jsonify({
                    'error': '没有执行此操作的权限',
                    'code': 'BUTTON_PERMISSION_DENIED',
                    'required_button': button_code
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator