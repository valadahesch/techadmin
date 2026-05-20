# -*- coding: utf-8 -*-

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta

from app.extensions import jwt, cors
from app.views import register_blueprints


def create_app(config=None):
    """应用工厂函数"""
    app = Flask(__name__)
    
    # 配置
    app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production-2024'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8)
    
    # 初始化扩展
    cors.init_app(app)
    jwt.init_app(app)
    
    # 注册蓝图
    register_blueprints(app)
    
    return app