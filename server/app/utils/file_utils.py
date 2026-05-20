# -*- coding: utf-8 -*-

import os
import zipfile
import tempfile


def extract_zip(zip_path, extract_to=None):
    """解压ZIP文件"""
    if extract_to is None:
        extract_to = tempfile.mkdtemp()
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    
    return extract_to


def safe_delete_file(filepath):
    """安全删除文件"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            return True
    except Exception as e:
        print(f"删除文件失败 {filepath}: {e}")
    return False


def get_file_size(filepath):
    """获取文件大小"""
    try:
        return os.path.getsize(filepath)
    except Exception:
        return 0