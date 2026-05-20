# -*- coding: utf-8 -*-

import os
import time
import zipfile
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

# 上传文件配置
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'zip'}

# 确保上传目录存在
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def allowed_file(filename):
    """检查文件扩展名是否允许"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def init_leak_scan_routes(bp):
    """初始化漏扫处理相关路由"""
    
    @bp.route('/leak-scan/extract', methods=['POST'])
    @jwt_required()
    def extract_leak_scan():
        """处理漏扫文件提取"""
        try:
            # 获取当前用户
            current_user_id_str = get_jwt_identity()
            current_user_id = int(current_user_id_str)
            
            # 获取表单数据
            scanner_type = request.form.get('scanner_type')
            access_point = request.form.get('access_point')
            filter_non_asset = request.form.get('filter_non_asset')
            network_stats = request.form.get('network_stats')
            terminal_stats = request.form.get('terminal_stats')
            server_stats = request.form.get('server_stats')
            web_stats = request.form.get('web_stats')
            
            # 获取上传的文件
            if 'scan_file' not in request.files:
                return jsonify({'error': '没有上传文件'}), 400
            
            file = request.files['scan_file']
            
            if file.filename == '':
                return jsonify({'error': '文件名为空'}), 400
            
            if not allowed_file(file.filename):
                return jsonify({'error': '只支持 ZIP 格式的文件'}), 400
            
            # 保存文件
            filename = secure_filename(file.filename)
            timestamp = int(time.time())
            safe_filename = f"{timestamp}_{filename}"
            filepath = os.path.join(UPLOAD_FOLDER, safe_filename)
            file.save(filepath)
            
            # TODO: 在这里实现你的 ZIP 文件解析逻辑
            # 根据 scanner_type 解析不同的漏扫报告格式
            
            # 示例返回数据（请替换为实际解析结果）
            if access_point == 'access_point_2':
                access_points = ['A接入点', 'B接入点']
            else:
                access_points = ['A接入点', 'B接入点', 'C接入点', 'D接入点']
            
            results = []
            for i, ap in enumerate(access_points, 1):
                results.append({
                    'access_point': ap,
                    'hostname': f'设备_{i}',
                    'ip': f'192.168.1.{i}',
                    'system_version': '示例系统版本',
                    'vulnerability_level': '高危' if i % 2 == 0 else '中危',
                    'vulnerability_name': f'示例漏洞名称_{i}',
                    'suggestion': '请根据实际情况修复'
                })
            
            # 删除临时文件
            try:
                os.remove(filepath)
            except Exception as e:
                print(f"删除临时文件失败: {e}")
            
            return jsonify({
                'success': True,
                'results': results,
                'message': f'成功提取 {len(results)} 条记录'
            }), 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500
    
    @bp.route('/leak-scan/link-to-project', methods=['POST'])
    @jwt_required()
    def link_leak_scan_to_project():
        """将漏扫结果关联到项目"""
        try:
            data = request.get_json()
            results = data.get('results', [])
            scan_params = data.get('scan_params', {})
            
            # 获取当前用户
            current_user_id_str = get_jwt_identity()
            current_user_id = int(current_user_id_str)
            
            # TODO: 在这里实现保存到数据库的逻辑
            
            return jsonify({
                'success': True,
                'message': f'成功关联 {len(results)} 条记录到项目'
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500