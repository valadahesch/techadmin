# -*- coding: utf-8 -*-

from flask import Blueprint
from app.views import auth, users, roles, permissions, leak_scan, device_usage


def register_blueprints(app):
    """注册所有蓝图"""
    
    # 创建主蓝图
    api_bp = Blueprint('api', __name__, url_prefix='/api')
    
    # 注册子模块
    auth.init_auth_routes(api_bp)
    users.init_user_routes(api_bp)
    roles.init_role_routes(api_bp)
    permissions.init_permission_routes(api_bp)
    leak_scan.init_leak_scan_routes(api_bp)
    device_usage.init_device_usage_routes(api_bp)
    
    # 如果有测评模块，取消下面的注释
    # from app.views import assessment
    # assessment.init_assessment_routes(api_bp)
    
    # 注册到应用
    app.register_blueprint(api_bp)