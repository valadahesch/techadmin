# -*- coding: utf-8 -*-

import pymysql
from pymysql.cursors import DictCursor
from contextlib import contextmanager
import threading
from app.config import Config

class DatabasePool:
    """数据库连接池管理"""
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self._config = {
            'host': Config.MYSQL_HOST,
            'port': Config.MYSQL_PORT,
            'user': Config.MYSQL_USER,
            'password': Config.MYSQL_PASSWORD,
            'database': Config.MYSQL_DATABASE,
            'charset': 'utf8mb4',
            'cursorclass': DictCursor,
            'autocommit': False
        }
    
    def get_connection(self):
        """获取数据库连接"""
        return pymysql.connect(**self._config)
    
    @contextmanager
    def get_cursor(self):
        """获取数据库游标（自动管理事务）"""
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            yield cursor
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
    
    @contextmanager
    def get_cursor_manual(self):
        """获取数据库游标（手动管理事务）"""
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            yield cursor, conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

# 全局数据库连接池实例
db_pool = DatabasePool()

def get_db():
    """获取数据库连接（兼容旧代码）"""
    return db_pool.get_connection()