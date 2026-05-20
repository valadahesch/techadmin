# -*- coding: utf-8 -*-

from typing import List, Optional, Dict, Any
from sqlalchemy import select, and_, desc
from app.models.base import db
from app.models.log import OperationLog
from app.repositories.base_repo import BaseRepository


class LogRepository(BaseRepository[OperationLog]):
    """操作日志 Repository"""
    
    def __init__(self):
        super().__init__(OperationLog)
    
    def add_log(self, user_id: Optional[int], username: Optional[str], operation: str,
                target_type: Optional[str] = None, target_id: Optional[int] = None,
                details: Optional[str] = None, ip_address: Optional[str] = None) -> OperationLog:
        """添加操作日志"""
        return self.create(
            user_id=user_id,
            username=username,
            operation=operation,
            target_type=target_type,
            target_id=target_id,
            details=details,
            ip_address=ip_address
        )
    
    def get_logs(self, limit: int = 100, offset: int = 0,
                 user_id: Optional[int] = None, operation: Optional[str] = None) -> List[Dict[str, Any]]:
        """获取操作日志"""
        with db.session() as session:
            stmt = select(OperationLog)
            
            if user_id:
                stmt = stmt.where(OperationLog.user_id == user_id)
            if operation:
                stmt = stmt.where(OperationLog.operation == operation)
            
            stmt = stmt.order_by(desc(OperationLog.created_at)).limit(limit).offset(offset)
            logs = session.execute(stmt).scalars().all()
            return [log.to_dict() for log in logs]


# 全局实例
log_repo = LogRepository()