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
    
    @bp.route('/permissions/<int:permission_id>', methods=['GET'])
    @api_permission_required()
    def get_permission(permission_id):
        """获取单个权限详情"""
        perm = db.get_permission_by_id(permission_id)
        if not perm:
            return jsonify({'error': '权限不存在'}), 404
        
        return jsonify({
            'id': perm.id,
            'code': perm.code,
            'name': perm.name,
            'resource': perm.resource,
            'action': perm.action,
            'description': perm.description
        }), 200
    
    @bp.route('/permissions/resources', methods=['GET'])
    @api_permission_required()
    def get_permission_resources():
        """获取权限资源类型列表"""
        resources = list(set([p.resource for p in db.permissions]))
        return jsonify(resources), 200