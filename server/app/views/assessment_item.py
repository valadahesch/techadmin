# server/app/views/assessment_item.py
# -*- coding: utf-8 -*-

from flask import request, jsonify, g
from app.repositories.assessment_item_repo import assessment_item_repo
from app.repositories.assessment_indicator_repo import assessment_indicator_repo
from app.decorators import api_permission_required

def init_assessment_item_routes(bp):
    """初始化测评项管理相关路由"""
    
    @bp.route('/assessment-items/<item_id>/rules', methods=['GET'])
    @api_permission_required()
    def get_item_rules(item_id):
        """获取测评项的规则数据"""
        item = assessment_item_repo.get_by_id(item_id)
        if not item:
            return jsonify({'error': '测评项不存在'}), 404
        
        # 获取规则数据，如果没有则返回空数组
        rules_data = item.get('rules_data', [])
        
        # 获取测评项基本信息用于展示
        item_info = {
            'id': item.get('id'),
            'standard_type': item.get('standard_type'),
            'security_control': item.get('security_control'),
            'assessment_object': item.get('assessment_object'),
            'detection_item': item.get('detection_item'),
            'assessment_indicators': item.get('assessment_indicators', [])
        }
        
        return jsonify({
            'rules_data': rules_data,
            'item_info': item_info
        }), 200
    
    @bp.route('/assessment-items/<item_id>/rules', methods=['POST'])
    @api_permission_required()
    def update_item_rules(item_id):
        """更新测评项的规则数据"""
        data = request.get_json()
        current_user_id = getattr(g, 'current_user_id', None)
        
        if current_user_id is None:
            return jsonify({'error': '无法获取当前用户信息'}), 401
        
        rules_data = data.get('rules_data', [])
        
        # 通过Repository更新规则数据
        updated_item = assessment_item_repo.update_rules_data(item_id, rules_data, current_user_id)
        
        if not updated_item:
            return jsonify({'error': '测评项不存在'}), 404
        
        return jsonify({'success': True, 'message': '规则保存成功'}), 200
    
    @bp.route('/assessment-items/<item_id>', methods=['GET'])
    @api_permission_required()
    def get_assessment_item(item_id):
        """获取单个测评项详情"""
        item = assessment_item_repo.get_by_id(item_id)
        if not item:
            return jsonify({'error': '测评项不存在'}), 404
        
        return jsonify(item), 200
    
    @bp.route('/assessment-items', methods=['POST'])
    @api_permission_required()
    def create_assessment_item():
        """创建测评项"""
        data = request.get_json()
        
        required_fields = ['standard_type', 'security_control', 'assessment_object', 'detection_item']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} 不能为空'}), 400
        
        current_user_id = getattr(g, 'current_user_id', None)
        
        item = assessment_item_repo.create(data, current_user_id)
        if not item:
            return jsonify({'error': '创建失败'}), 500
        
        return jsonify(item), 201
    
    @bp.route('/assessment-items/<item_id>', methods=['PUT'])
    @api_permission_required()
    def update_assessment_item(item_id):
        """更新测评项"""
        data = request.get_json()
        current_user_id = getattr(g, 'current_user_id', None)
        
        item = assessment_item_repo.update(item_id, data, current_user_id)
        if not item:
            return jsonify({'error': '测评项不存在'}), 404
        
        return jsonify(item), 200
    
    @bp.route('/assessment-items/<item_id>', methods=['DELETE'])
    @api_permission_required()
    def delete_assessment_item(item_id):
        """删除测评项"""
        if not assessment_item_repo.delete(item_id):
            return jsonify({'error': '测评项不存在'}), 404
        return '', 204
    
    @bp.route('/assessment-indicators/list', methods=['GET'])
    @api_permission_required()
    def get_assessment_indicators_list():
        """获取测评指标列表（用于下拉选择）"""
        indicators = assessment_indicator_repo.get_all()
        return jsonify({
            'items': [{'id': i['id'], 'name_cn': i['name_cn'], 'name_en': i['name_en']} for i in indicators['items']]
        }), 200

    @bp.route('/assessment-items/filters', methods=['GET'])
    @api_permission_required()
    def get_assessment_item_filters():
        """获取测评项筛选选项（标准类型、测评等级、安全控制点）"""
        from app.repositories.assessment_item_repo import assessment_item_repo
        
        standard_types = assessment_item_repo.get_all_standard_types()
        assessment_levels = assessment_item_repo.get_all_assessment_levels()
        security_controls = assessment_item_repo.get_all_security_controls()
        
        return jsonify({
            'standard_types': standard_types,
            'assessment_levels': assessment_levels,
            'security_controls': security_controls
        }), 200

    @bp.route('/assessment-items', methods=['GET'])
    @api_permission_required()
    def get_assessment_items():
        """获取测评项列表（分页）"""
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        standard_type = request.args.get('standard_type', '')
        assessment_level = request.args.get('assessment_level', '')
        security_control = request.args.get('security_control', '')
        search = request.args.get('search', '')
        sort_field = request.args.get('sort_field', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        result = assessment_item_repo.get_all(
            page=page,
            per_page=per_page,
            standard_type=standard_type if standard_type else None,
            assessment_level=assessment_level if assessment_level else None,
            security_control=security_control if security_control else None,
            search=search if search else None,
            sort_field=sort_field,
            sort_order=sort_order
        )
        
        return jsonify(result), 200