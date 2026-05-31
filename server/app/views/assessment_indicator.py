# server/app/views/assessment_indicator.py
# -*- coding: utf-8 -*-

from flask import request, jsonify, g
from app.repositories.assessment_indicator_repo import assessment_indicator_repo
from app.decorators import api_permission_required

def init_assessment_indicator_routes(bp):
    """初始化测评指标管理相关路由"""
    
    @bp.route('/assessment-indicators', methods=['GET'])
    @api_permission_required()
    def get_assessment_indicators():
        """获取指标列表"""
        search = request.args.get('search', '')
        indicator_type = request.args.get('indicator_type', '')
        
        result = assessment_indicator_repo.get_all(
            search=search if search else None,
            indicator_type=indicator_type if indicator_type else None
        )
        
        return jsonify(result), 200
    
    @bp.route('/assessment-indicators/<indicator_id>', methods=['GET'])
    @api_permission_required()
    def get_assessment_indicator(indicator_id):
        """获取单个指标详情"""
        indicator = assessment_indicator_repo.get_by_id(indicator_id)
        if not indicator:
            return jsonify({'error': '指标不存在'}), 404
        
        return jsonify(indicator), 200
    
    @bp.route('/assessment-indicators', methods=['POST'])
    @api_permission_required()
    def create_assessment_indicator():
        """创建指标"""
        data = request.get_json()
        
        required_fields = ['indicator_type', 'name_cn']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} 不能为空'}), 400
        
        current_user_id = getattr(g, 'current_user_id', None)
        
        indicator = assessment_indicator_repo.create(data, current_user_id)
        if not indicator:
            return jsonify({'error': '创建失败'}), 500
        
        return jsonify(indicator), 201
    
    @bp.route('/assessment-indicators/<indicator_id>', methods=['PUT'])
    @api_permission_required()
    def update_assessment_indicator(indicator_id):
        """更新指标"""
        data = request.get_json()
        current_user_id = getattr(g, 'current_user_id', None)
        
        indicator = assessment_indicator_repo.update(indicator_id, data, current_user_id)
        if not indicator:
            return jsonify({'error': '指标不存在'}), 404
        
        return jsonify(indicator), 200
    
    @bp.route('/assessment-indicators/<indicator_id>', methods=['DELETE'])
    @api_permission_required()
    def delete_assessment_indicator(indicator_id):
        """删除指标"""
        if not assessment_indicator_repo.delete(indicator_id):
            return jsonify({'error': '指标不存在'}), 404
        return '', 204

    # server/app/views/assessment_indicator.py
    # 修改 get_indicators_by_assessment_type 接口

    @bp.route('/assessment-indicators/by-type/<type_id>', methods=['GET'])
    @api_permission_required()
    def get_indicators_by_assessment_type(type_id):
        """根据测评类型ID获取所有关联的测评指标"""
        from app.repositories.assessment_type_repo import assessment_type_repo
        from app.repositories.assessment_item_repo import assessment_item_repo
        from app.repositories.assessment_indicator_repo import assessment_indicator_repo
        import json
        
        # 获取测评类型
        assessment_type = assessment_type_repo.get_by_id(type_id)
        if not assessment_type:
            return jsonify({'error': '测评类型不存在'}), 404
        
        # 获取关联的测评项ID列表
        member_ids = assessment_type.get('member_ids', [])
        
        # 收集所有测评指标（去重）
        indicators_map = {}
        
        for member_id in member_ids:
            item = assessment_item_repo.get_by_id(member_id)
            if item:
                indicators = item.get('assessment_indicators', [])
                # 处理不同的数据格式
                if isinstance(indicators, dict):
                    # 如果是字典格式 {name_en: name_cn}
                    for name_en, name_cn in indicators.items():
                        if name_en and name_en not in indicators_map:
                            # 查询测评指标详情
                            indicator_detail = assessment_indicator_repo.get_by_name_en(name_en)
                            if indicator_detail:
                                indicators_map[name_en] = {
                                    'name_en': name_en,
                                    'name_cn': indicator_detail.get('name_cn', name_cn),
                                    'type': indicator_detail.get('indicator_type', 'string'),
                                    'options': json.loads(indicator_detail.get('indicator_data')) if indicator_detail.get('indicator_data') else {}
                                }
                            else:
                                indicators_map[name_en] = {
                                    'name_en': name_en,
                                    'name_cn': name_cn,
                                    'type': 'string',
                                    'options': {}
                                }
                elif isinstance(indicators, list):
                    # 如果是数组格式
                    for indicator_name in indicators:
                        if indicator_name and indicator_name not in indicators_map:
                            indicator_detail = assessment_indicator_repo.get_by_name_cn(indicator_name)
                            if indicator_detail:
                                indicators_map[indicator_name] = {
                                    'name_en': indicator_detail.get('name_en', indicator_name),
                                    'name_cn': indicator_detail.get('name_cn', indicator_name),
                                    'type': indicator_detail.get('indicator_type', 'string'),
                                    'options': json.loads(indicator_detail.get('indicator_data')) if indicator_detail.get('indicator_data') else {}
                                }
                            else:
                                indicators_map[indicator_name] = {
                                    'name_en': indicator_name,
                                    'name_cn': indicator_name,
                                    'type': 'string',
                                    'options': {}
                                }
        
        return jsonify({
            'indicators': list(indicators_map.values())
        }), 200