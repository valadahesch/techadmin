# -*- coding: utf-8 -*-

from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db


def permission_required(permission_name):
    """权限检查装饰器"""
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user_id_str = get_jwt_identity()
            current_user_id = int(current_user_id_str)
            user = db.get_user_by_id(current_user_id)
            
            if not user or not user.is_active:
                return jsonify({'error': '用户不存在或已被禁用'}), 403
            
            user_perms = db.get_user_permissions(current_user_id)
            if permission_name not in user_perms:
                return jsonify({'error': f'缺少权限: {permission_name}'}), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator