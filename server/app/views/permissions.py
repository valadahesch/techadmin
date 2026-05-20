# -*- coding: utf-8 -*-

from flask import jsonify
from app.models import db
from app.decorators import permission_required


def init_permission_routes(bp):
    """初始化权限管理相关路由"""
    
    @bp.route('/permissions', methods=['GET'])
    @permission_required('permission:read')
    def get_permissions():
        """获取权限列表"""
        return jsonify(db.get_all_permissions()), 200