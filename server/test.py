# server/init_device_usage_data.py
# -*- coding: utf-8 -*-

"""
设备用途数据初始化脚本
根据Word文档中的设备用途清单生成
运行方式: python init_device_usage_data.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models.base import db
from app.models.device_usage import DeviceUsage

# 设备用途数据（根据Word文档整理）
devices_data = [
    # 网络设备
    {"serial_no": 1, "device_type": "网络设备", "device_name": "出口路由器", "function_cn": "网络通信", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 2, "device_type": "网络设备", "device_name": "核心交换机", "function_cn": "核心数据交换", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 3, "device_type": "网络设备", "device_name": "汇聚交换机", "function_cn": "汇聚数据交换", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 4, "device_type": "网络设备", "device_name": "接入交换机", "function_cn": "接入数据交换", "is_mandatory": "否", "status": "启用", "remark": "作为测评资产"},
    {"serial_no": 5, "device_type": "网络设备", "device_name": "非网管交换机", "function_cn": "接入数据交换", "is_mandatory": "否", "status": "启用", "remark": "作为测评资产"},
    {"serial_no": 6, "device_type": "网络设备", "device_name": "负载均衡", "function_cn": "网络链路负载", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 7, "device_type": "网络设备", "device_name": "无线控制器AC", "function_cn": "管理无线网络中的所有无线AP", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 8, "device_type": "网络设备", "device_name": "无线AP", "function_cn": "无线网络接入", "is_mandatory": "否", "status": "启用", "remark": "作为测评资产"},
    {"serial_no": 9, "device_type": "网络设备", "device_name": "无线路由器", "function_cn": "无线网络覆盖", "is_mandatory": "否", "status": "启用", "remark": "作为测评资产"},
    {"serial_no": 10, "device_type": "网络设备", "device_name": "站控层交换机", "function_cn": "电力行业专用通讯协议用于数据交换", "is_mandatory": "是", "status": "启用", "remark": ""},
    
    # 安全设备
    {"serial_no": 11, "device_type": "安全设备", "device_name": "防火墙", "function_cn": "访问控制，具备IPS、AV防病毒模块", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 12, "device_type": "安全设备", "device_name": "WAF", "function_cn": "WEB应用安全防护", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 13, "device_type": "安全设备", "device_name": "IPS", "function_cn": "入侵检测和防御", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 14, "device_type": "安全设备", "device_name": "防毒墙", "function_cn": "对网络传输中的恶意代码进行过滤", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 15, "device_type": "安全设备", "device_name": "上网行为管理", "function_cn": "对用户上网行为进行限制和检查", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 16, "device_type": "安全设备", "device_name": "网络准入控制系统", "function_cn": "对终端设备的网络接入进行管理控制", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 17, "device_type": "安全设备", "device_name": "日志审计设备", "function_cn": "日志采集、存储和分析", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 18, "device_type": "安全设备", "device_name": "堡垒机", "function_cn": "运维操作审计", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 19, "device_type": "安全设备", "device_name": "数据库审计系统", "function_cn": "对数据库的操作行为进行审计，对审计记录进行保护", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 20, "device_type": "安全设备", "device_name": "抗APT攻击系统", "function_cn": "对未知攻击行为进行检测和防御", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 21, "device_type": "安全设备", "device_name": "TDA深度威胁发现设备", "function_cn": "监测网络流量，侦测并响应未知攻击与未知威胁", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 22, "device_type": "安全设备", "device_name": "IDS", "function_cn": "入侵检测", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 23, "device_type": "安全设备", "device_name": "网管平台", "function_cn": "对设备运行情况进行监控管理", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 24, "device_type": "安全设备", "device_name": "VPN", "function_cn": "远程安全访问通道", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 25, "device_type": "安全设备", "device_name": "运维SVN（客户端）", "function_cn": "远程安全访问通道", "is_mandatory": "否", "status": "启用", "remark": "作为测评资产"},
    {"serial_no": 26, "device_type": "安全设备", "device_name": "杀毒软件", "function_cn": "主机安全管理平台", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 27, "device_type": "安全设备", "device_name": "网闸", "function_cn": "安全隔离、数据摆渡", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 28, "device_type": "安全设备", "device_name": "态势感知", "function_cn": "安全威胁监测和响应处置", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 29, "device_type": "安全设备", "device_name": "DDOS", "function_cn": "防御DDOS攻击", "is_mandatory": "是", "status": "启用", "remark": ""},
    
    # 电力专用-安全设备
    {"serial_no": 30, "device_type": "电力专用-安全设备", "device_name": "纵向加密装置", "function_cn": "电力数据加密传输到调度数据网", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 31, "device_type": "电力专用-安全设备", "device_name": "正向隔离装置", "function_cn": "正向隔离网闸", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 32, "device_type": "电力专用-安全设备", "device_name": "反向隔离装置", "function_cn": "反向隔离网闸", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 33, "device_type": "电力专用-安全设备", "device_name": "网络安全监测装置", "function_cn": "电力网络设备安全监测", "is_mandatory": "是", "status": "启用", "remark": ""},
    
    # 阿里云
    {"serial_no": 34, "device_type": "阿里云", "device_name": "云防火墙", "function_cn": "流量监控、安全访问控制、入侵检测和防御等", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 35, "device_type": "阿里云", "device_name": "云安全中心", "function_cn": "主机安全管控平台", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 36, "device_type": "阿里云", "device_name": "日志服务", "function_cn": "日志收集、分析、存储", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 37, "device_type": "阿里云", "device_name": "WEB应用云防火墙", "function_cn": "Web应用安全防护", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 38, "device_type": "阿里云", "device_name": "云堡垒机", "function_cn": "综合性运维管控平台，核心系统运维和安全审计", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 39, "device_type": "阿里云", "device_name": "数据库审计", "function_cn": "对数据库行为审计", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 40, "device_type": "阿里云", "device_name": "对象存储OSS", "function_cn": "日志实时采集、存储", "is_mandatory": "否", "status": "启用", "remark": "作为测评资产"},
    
    # 华为云
    {"serial_no": 41, "device_type": "华为云", "device_name": "云防火墙", "function_cn": "云上互联网边界和VPC边界的防护、实时入侵检测与防御", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 42, "device_type": "华为云", "device_name": "云WAF", "function_cn": "Web应用攻击防护", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 43, "device_type": "华为云", "device_name": "企业主机安全", "function_cn": "资产管理、漏洞管理、基线检查、入侵检测、安全运营", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 44, "device_type": "华为云", "device_name": "云堡垒机", "function_cn": "4A统一安全管控平台", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 45, "device_type": "华为云", "device_name": "云日志服务", "function_cn": "日志收集、分析、存储", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 46, "device_type": "华为云", "device_name": "对象存储", "function_cn": "日志实时采集、存储", "is_mandatory": "否", "status": "启用", "remark": "作为测评资产"},
    
    # 京东云
    {"serial_no": 47, "device_type": "京东云", "device_name": "云防火墙（宿迁没有）", "function_cn": "互联网安全边界、内网VPC边界流量管控与安全防护、入侵检测和防御", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 48, "device_type": "京东云", "device_name": "专有云NF1（宿迁地区WAF）", "function_cn": "DDoS防护、Web应用安全防护", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 49, "device_type": "京东云", "device_name": "主机安全（企业版）", "function_cn": "资产统一管理、系统风险检测、木马查杀、黑客入侵检测", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 50, "device_type": "京东云", "device_name": "Web应用防火墙（企业版）", "function_cn": "Web应用安全防护", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 51, "device_type": "京东云", "device_name": "堡垒机（企业版）", "function_cn": "综合性运维管控平台，核心系统运维和安全审计", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 52, "device_type": "京东云", "device_name": "安全运营中心（企业版）", "function_cn": "统一安全运营与管理平台", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 53, "device_type": "京东云", "device_name": "对象存储OSS", "function_cn": "日志实时采集、存储", "is_mandatory": "否", "status": "启用", "remark": "作为测评资产"},
    
    # 系统管理平台
    {"serial_no": 54, "device_type": "系统管理平台", "device_name": "管理控制台", "function_cn": "对系统资源、配置策略等进行管理控制、操作审计、云监控等", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 55, "device_type": "系统管理平台", "device_name": "备份一体机", "function_cn": "对分散在不同平台的设备提供数据备份", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 56, "device_type": "系统管理平台", "device_name": "服务器虚拟化平台", "function_cn": "对服务器资源进行统一分配、策略管理等", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 57, "device_type": "系统管理平台", "device_name": "服务器超融合平台", "function_cn": "对云安全防护产品、服务器资源进行统一分配、策略管理等", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 58, "device_type": "系统管理平台", "device_name": "统一监控平台", "function_cn": "对设备进行集中监测", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 59, "device_type": "系统管理平台", "device_name": "中间件", "function_cn": "对不同来源的数据和应用程序进行集成和整合", "is_mandatory": "是", "status": "启用", "remark": ""},
    {"serial_no": 60, "device_type": "系统管理平台", "device_name": "数据库", "function_cn": "对数据进行组织、存储与管理，实现数据的追加、删除、更新、查询等操作", "is_mandatory": "是", "status": "启用", "remark": ""},
]

def init_device_usage():
    """初始化设备用途数据"""
    app = create_app()
    with app.app_context():
        try:
            # 检查是否已有数据
            existing_count = DeviceUsage.query.count()
            if existing_count > 0:
                confirm = input(f"数据库中已有 {existing_count} 条设备用途数据，是否清空后重新导入？(y/n): ")
                if confirm.lower() != 'y':
                    print("取消导入")
                    return
                # 清空现有数据
                db.session.query(DeviceUsage).delete()
                db.session.commit()
                print(f"已清空 {existing_count} 条数据")
            
            # 批量导入
            devices = []
            for data in devices_data:
                device = DeviceUsage(
                    serial_no=data['serial_no'],
                    device_type=data['device_type'],
                    device_name=data['device_name'],
                    function_cn=data['function_cn'],
                    is_mandatory=data['is_mandatory'],
                    status=data['status'],
                    remark=data['remark']
                )
                devices.append(device)
            
            db.session.add_all(devices)
            db.session.commit()
            
            print(f"✅ 成功导入 {len(devices)} 条设备用途数据")
            print("\n数据统计:")
            
            # 按设备类型统计
            from sqlalchemy import func
            stats = db.session.query(
                DeviceUsage.device_type, 
                func.count(DeviceUsage.id)
            ).group_by(DeviceUsage.device_type).all()
            
            for device_type, count in stats:
                print(f"  - {device_type}: {count} 条")
            
            # 按必测状态统计
            mandatory_count = DeviceUsage.query.filter_by(is_mandatory='是').count()
            not_mandatory_count = DeviceUsage.query.filter_by(is_mandatory='否').count()
            print(f"\n  - 必测设备: {mandatory_count} 条")
            print(f"  - 非必测设备: {not_mandatory_count} 条")
            
        except Exception as e:
            print(f"❌ 导入失败: {e}")
            db.session.rollback()

def clear_device_usage():
    """清空设备用途数据"""
    app = create_app()
    with app.app_context():
        confirm = input("确定要清空所有设备用途数据吗？(y/n): ")
        if confirm.lower() == 'y':
            count = DeviceUsage.query.delete()
            db.session.commit()
            print(f"✅ 已清空 {count} 条数据")
        else:
            print("取消清空")

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='设备用途数据管理')
    parser.add_argument('action', nargs='?', default='init', 
                       choices=['init', 'clear'], 
                       help='操作类型: init(初始化数据), clear(清空数据)')
    args = parser.parse_args()
    
    if args.action == 'clear':
        clear_device_usage()
    else:
        init_device_usage()