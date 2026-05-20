# -*- coding: utf-8 -*-

from flask import jsonify
from app.repositories.permission_repo import permission_repo
from app.decorators import api_permission_required


def init_permission_routes(bp):
    """初始化权限管理相关路由"""
    
    @bp.route('/permissions', methods=['GET'])
    @api_permission_required()
    def get_permissions():
        """获取权限列表"""
        permissions = permission_repo.get_all_permissions()
        return jsonify(permissions), 200
    
    @bp.route('/permissions/<int:permission_id>', methods=['GET'])
    @api_permission_required()
    def get_permission(permission_id):
        """获取单个权限详情"""
        perm = permission_repo.get_by_id(permission_id)
        if not perm:
            return jsonify({'error': '权限不存在'}), 404
        
        return jsonify(perm.to_dict()), 200
    
    @bp.route('/permissions/resources', methods=['GET'])
    @api_permission_required()
    def get_permission_resources():
        """获取权限资源类型列表"""
        permissions = permission_repo.get_all()
        resources = list(set([p.resource for p in permissions]))
        return jsonify(resources), 200