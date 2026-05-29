# server/app/views/assessment_type.py
# -*- coding: utf-8 -*-

from flask import request, jsonify, g
from app.repositories.assessment_type_repo import assessment_type_repo
from app.repositories.assessment_item_repo import assessment_item_repo
from app.decorators import api_permission_required
import json

def init_assessment_type_routes(bp):
    """初始化测评类型管理相关路由"""
    
    @bp.route('/assessment-types', methods=['GET'])
    @api_permission_required()
    def get_assessment_types():
        """获取测评类型列表（分页）"""
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        group = request.args.get('group', '')
        sort_field = request.args.get('sort_field', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        result = assessment_type_repo.get_all(
            page=page,
            per_page=per_page,
            search=search if search else None,
            group=group if group else None,
            sort_field=sort_field,
            sort_order=sort_order
        )
        
        return jsonify(result), 200
    
    @bp.route('/assessment-types/<type_id>', methods=['GET'])
    @api_permission_required()
    def get_assessment_type(type_id):
        """获取单个测评类型详情"""
        item = assessment_type_repo.get_by_id(type_id)
        if not item:
            return jsonify({'error': '测评类型不存在'}), 404
        return jsonify(item), 200
    
    @bp.route('/assessment-types', methods=['POST'])
    @api_permission_required()
    def create_assessment_type():
        """创建测评类型"""
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': '名称不能为空'}), 400
        
        current_user_id = getattr(g, 'current_user_id', None)
        
        item = assessment_type_repo.create(data, current_user_id)
        if not item:
            return jsonify({'error': '创建失败'}), 500
        
        return jsonify(item), 201
    
    @bp.route('/assessment-types/<type_id>', methods=['PUT'])
    @api_permission_required()
    def update_assessment_type(type_id):
        """更新测评类型"""
        data = request.get_json()
        current_user_id = getattr(g, 'current_user_id', None)
        
        item = assessment_type_repo.update(type_id, data, current_user_id)
        if not item:
            return jsonify({'error': '测评类型不存在'}), 404
        
        return jsonify(item), 200
    
    @bp.route('/assessment-types/<type_id>', methods=['DELETE'])
    @api_permission_required()
    def delete_assessment_type(type_id):
        """删除测评类型"""
        if not assessment_type_repo.delete(type_id):
            return jsonify({'error': '测评类型不存在'}), 404
        return '', 204
    
    @bp.route('/assessment-types/groups', methods=['GET'])
    @api_permission_required()
    def get_groups():
        """获取所有群组列表"""
        groups = assessment_type_repo.get_all_groups()
        return jsonify(groups), 200
    
    @bp.route('/assessment-items/list-simple', methods=['GET'])
    @api_permission_required()
    def get_assessment_items_simple():
        """获取测评项简要列表（用于下拉选择）"""
        result = assessment_item_repo.get_all(page=1, per_page=1000)
        items = []
        for item in result.get('items', []):
            items.append({
                'id': item['id'],
                'security_control': item['security_control'],
                'standard_type': item['standard_type'],
                'assessment_object': item['assessment_object'],
                'detection_item': item['detection_item'],
                'assessment_indicators': item['assessment_indicators'],
                'assessment_levels': item['assessment_levels']
            })
        return jsonify({'items': items}), 200