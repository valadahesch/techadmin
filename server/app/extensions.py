# -*- coding: utf-8 -*-

from flask_cors import CORS
from flask_jwt_extended import JWTManager

# 初始化扩展
cors = CORS()
jwt = JWTManager()

# CORS 配置
def init_cors(app):
    cors.init_app(app, 
                  resources={r"/api/*": {
                      "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
                      "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                      "allow_headers": ["Content-Type", "Authorization", "Accept"],
                      "expose_headers": ["Content-Type", "Authorization"],
                      "supports_credentials": True,
                      "max_age": 3600
                  }})