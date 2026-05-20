# -*- coding: utf-8 -*-

from flask import Flask
from datetime import timedelta

from app.extensions import jwt, init_cors, init_before_request, register_error_handlers
from app.views import register_blueprints
from app.config import Config
from app.models.base import db


def create_app(config=None):
    """应用工厂函数"""
    app = Flask(__name__)
    
    # 配置
    app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES)
    app.config['DEBUG'] = Config.DEBUG
    
    # SQLAlchemy 配置
    app.config['SQLALCHEMY_DATABASE_URI'] = Config.SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = Config.SQLALCHEMY_TRACK_MODIFICATIONS
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = Config.SQLALCHEMY_ENGINE_OPTIONS
    
    # 初始化扩展
    db.init_app(app)
    init_cors(app)
    jwt.init_app(app)
    
    # 初始化请求前置钩子（延迟导入避免循环）
    from app.extensions import init_before_request, register_error_handlers
    init_before_request(app)
    register_error_handlers(app)
    
    # 注册蓝图
    register_blueprints(app)
    
    # 创建数据库表
    with app.app_context():
        db.create_all()
    
    return app