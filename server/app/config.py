# -*- coding: utf-8 -*-

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """应用配置"""
    
    # MySQL 配置
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'Hillstone4Ever&')
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'techadmin')
    
    # JWT 配置
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production-2024')
    JWT_ACCESS_TOKEN_EXPIRES = 28800  # 8小时
    
    # 其他配置
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# 数据库连接池配置
DB_POOL_SIZE = 10
DB_POOL_RECYCLE = 3600