# server/app/views/device_usage.py
# -*- coding: utf-8 -*-

from flask import request, jsonify
from app.repositories.device_usage_repo import device_usage_repo
from app.decorators import api_permission_required

def init_device_usage_routes(bp):
    """初始化设备用途管理相关路由"""
    
    @bp.route('/device-usage', methods=['GET'])
    @api_permission_required()
    def get_device_usage_list():
        """获取设备用途列表"""
        search = request.args.get('search', '')
        category = request.args.get('category', '')
        is_mandatory = request.args.get('is_mandatory', '')
        
        result = device_usage_repo.get_all_no_pagination(
            search=search if search else None,
            category=category if category else None,
            is_mandatory=is_mandatory if is_mandatory else None
        )
        
        return jsonify(result), 200
    
    @bp.route('/device-usage/<device_id>', methods=['GET'])
    @api_permission_required()
    def get_device_usage(device_id):
        """获取单个设备用途详情"""
        device = device_usage_repo.get_by_id(device_id)
        if not device:
            return jsonify({'error': '设备信息不存在'}), 404
        
        return jsonify(device.to_dict()), 200
    
    @bp.route('/device-usage', methods=['POST'])
    @api_permission_required()
    def create_device_usage():
        """创建设备用途（ID由后端自动生成）"""
        data = request.get_json()
        
        # 验证必填字段
        required_fields = ['serial_no', 'device_type', 'device_name', 'function_cn']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} 不能为空'}), 400
        
        device = device_usage_repo.create(data)
        if not device:
            return jsonify({'error': '序号已存在'}), 409
        
        return jsonify(device.to_dict()), 201
    
    @bp.route('/device-usage/<device_id>', methods=['PUT'])
    @api_permission_required()
    def update_device_usage(device_id):
        """更新设备用途"""
        data = request.get_json()
        device = device_usage_repo.update(device_id, data)
        
        if not device:
            existing = device_usage_repo.get_by_id(device_id)
            if not existing:
                return jsonify({'error': '设备信息不存在'}), 404
            return jsonify({'error': '序号已存在'}), 409
        
        return jsonify(device.to_dict()), 200
    
    @bp.route('/device-usage/<device_id>', methods=['DELETE'])
    @api_permission_required()
    def delete_device_usage(device_id):
        """删除设备用途（软删除）"""
        if not device_usage_repo.delete(device_id):
            return jsonify({'error': '设备信息不存在'}), 404
        return '', 204
    
    @bp.route('/device-usage/batch', methods=['POST'])
    @api_permission_required()
    def batch_create_device_usage():
        """批量创建设备用途"""
        data = request.get_json()
        devices_data = data.get('devices', [])
        
        if not devices_data:
            return jsonify({'error': '设备列表不能为空'}), 400
        
        devices = device_usage_repo.batch_create(devices_data)
        return jsonify([d.to_dict() for d in devices]), 201
    
    @bp.route('/device-usage/device-types', methods=['GET'])
    @api_permission_required()
    def get_device_types():
        """获取设备类型列表"""
        device_types = device_usage_repo.get_device_types()
        return jsonify(device_types), 200