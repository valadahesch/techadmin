# -*- coding: utf-8 -*-

from flask import Flask
from datetime import timedelta

from app.extensions import jwt, init_cors, init_before_request, register_error_handlers
from app.views import register_blueprints
from app.config import Config


def create_app(config=None):
    """应用工厂函数"""
    app = Flask(__name__)
    
    # 配置
    app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES)
    app.config['DEBUG'] = Config.DEBUG
    
    # 初始化扩展
    init_cors(app)
    jwt.init_app(app)
    
    # 初始化请求前置钩子
    init_before_request(app)
    
    # 注册错误处理器
    register_error_handlers(app)
    
    # 注册蓝图
    register_blueprints(app)
    
    return app