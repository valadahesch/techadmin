# -*- coding: utf-8 -*-

from typing import List, Dict, Any, Optional
from sqlalchemy import select, and_
from app.models.base import db
from app.models.api_permission_mapping import ApiPermissionMapping


class ApiPermissionRepository:
    """API-权限映射 Repository"""
    
    def __init__(self):
        self.model = ApiPermissionMapping
    
    def get_all_mappings(self) -> List[Dict[str, Any]]:
        """获取所有映射"""
        with db.session() as session:
            stmt = select(self.model).order_by(self.model.id)
            mappings = session.execute(stmt).scalars().all()
            return [m.to_dict() for m in mappings]
    
    def get_by_id(self, mapping_id: int) -> Optional[ApiPermissionMapping]:
        """根据 ID 获取映射"""
        with db.session() as session:
            return session.get(self.model, mapping_id)
    
    def get_mappings_by_api(self, method: str, api_path: str) -> List[Dict[str, Any]]:
        """根据 API 获取映射（支持通配符）"""
        with db.session() as session:
            stmt = select(self.model).where(self.model.method == method)
            all_mappings = session.execute(stmt).scalars().all()
            
            result = []
            for mapping in all_mappings:
                if self._match_path(api_path, mapping.api_path):
                    result.append(mapping.to_dict())
            return result
    
    def get_mappings_by_permission(self, permission_id: int) -> List[Dict[str, Any]]:
        """根据权限 ID 获取映射"""
        with db.session() as session:
            stmt = select(self.model).where(self.model.permission_id == permission_id)
            mappings = session.execute(stmt).scalars().all()
            return [m.to_dict() for m in mappings]
    
    def create_mapping(self, method: str, api_path: str, permission_id: int) -> Optional[Dict[str, Any]]:
        """创建映射"""
        with db.session() as session:
            mapping = self.model(
                method=method.upper(),
                api_path=api_path,
                permission_id=permission_id
            )
            session.add(mapping)
            session.commit()
            session.refresh(mapping)
            return mapping.to_dict()
    
    def delete_mapping(self, mapping_id: int) -> bool:
        """删除映射"""
        with db.session() as session:
            mapping = session.get(self.model, mapping_id)
            if mapping:
                session.delete(mapping)
                session.commit()
                return True
        return False
    
    def get_mappings_grouped(self) -> Dict[str, List[Dict[str, Any]]]:
        """按 HTTP 方法分组获取映射"""
        mappings = self.get_all_mappings()
        grouped = {}
        for m in mappings:
            if m['method'] not in grouped:
                grouped[m['method']] = []
            grouped[m['method']].append(m)
        return grouped
    
    def _match_path(self, request_path: str, pattern_path: str) -> bool:
        """检查请求路径是否匹配模式（支持通配符 *）"""
        if '*' in pattern_path:
            import re
            pattern = pattern_path.replace('*', '[^/]+')
            return re.match(f"^{pattern}$", request_path) is not None
        return request_path == pattern_path


# 全局实例
api_permission_repo = ApiPermissionRepository()