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