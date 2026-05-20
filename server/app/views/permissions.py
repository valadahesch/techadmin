# -*- coding: utf-8 -*-

from flask import jsonify
from app.models import db
from app.decorators import api_permission_required


def init_permission_routes(bp):
    """初始化权限管理相关路由"""
    
    @bp.route('/permissions', methods=['GET'])
    @api_permission_required()
    def get_permissions():
        """获取权限列表"""
        return jsonify(db.get_all_permissions()), 200
    
    @bp.route('/permissions/types', methods=['GET'])
    @api_permission_required()
    def get_permission_types():
        """获取权限类型列表"""
        permission_types = [
            {'value': 'menu', 'label': '菜单权限'},
            {'value': 'page', 'label': '页面权限'},
            {'value': 'button', 'label': '按钮权限'},
            {'value': 'api', 'label': 'API权限'}
        ]
        return jsonify(permission_types), 200