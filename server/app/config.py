# -*- coding: utf-8 -*-

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """应用配置"""
    
    # MySQL 配置
    MYSQL_HOST = os.getenv('MYSQL_HOST', '47.120.50.154')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3333))
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'Hillstone4Ever&.')
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'techadmin')
    
    # SQLAlchemy 配置
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True
    }
    
    # JWT 配置
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production-2024')
    JWT_ACCESS_TOKEN_EXPIRES = 28800  # 8小时
    
    # 其他配置
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'