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

    
    @bp.route('/assessment-types/<type_id>/details', methods=['GET'])
    @api_permission_required()
    def get_assessment_type_details(type_id):
        """获取测评类型详情，包含关联的测评项和测评指标"""
        from app.repositories.assessment_item_repo import assessment_item_repo
        from app.repositories.assessment_indicator_repo import assessment_indicator_repo
        import json
        
        # 获取测评类型
        assessment_type = assessment_type_repo.get_by_id(type_id)
        if not assessment_type:
            return jsonify({'error': '测评类型不存在'}), 404
        
        # 获取关联的测评项ID列表
        member_ids = assessment_type.get('member_ids', [])
        
        # 获取测评项详情
        items = []
        all_indicators = []
        indicator_set = set()
        
        for member_id in member_ids:
            item = assessment_item_repo.get_by_id(member_id)
            if item:
                # 获取测评项中的测评指标
                indicators = item.get('assessment_indicators', [])
                if isinstance(indicators, dict):
                    indicators = list(indicators.values())
                elif isinstance(indicators, list):
                    indicators = indicators
                
                for indicator_name in indicators:
                    if indicator_name and indicator_name not in indicator_set:
                        indicator_set.add(indicator_name)
                        # 查询测评指标详情
                        indicator_detail = None
                        for ind in all_indicators_temp:
                            if ind.get('name_cn') == indicator_name:
                                indicator_detail = ind
                                break
                        
                        if not indicator_detail:
                            # 从数据库查询指标详情
                            # 这里需要根据名称查询，实际应该根据ID查询，这里简化处理
                            pass
                        
                        all_indicators.append({
                            'name': indicator_name,
                            'value': '',
                            'type': 'string',
                            'options': []
                        })
                
                items.append({
                    'id': item.get('id'),
                    'security_control': item.get('security_control'),
                    'standard_type': item.get('standard_type'),
                    'assessment_object': item.get('assessment_object'),
                    'detection_item': item.get('detection_item'),
                    'indicators': indicators
                })
        
        return jsonify({
            'type_info': {
                'id': assessment_type.get('id'),
                'name': assessment_type.get('name'),
                'description': assessment_type.get('description')
            },
            'items': items,
            'indicators': all_indicators
        }), 200