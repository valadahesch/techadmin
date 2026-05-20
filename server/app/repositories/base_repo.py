# -*- coding: utf-8 -*-

from typing import List, Optional, TypeVar, Generic, Type
from sqlalchemy import select, update, delete
from sqlalchemy.orm import Session
from app.models.base import db

T = TypeVar('T')


class BaseRepository(Generic[T]):
    """基础 Repository 类"""
    
    def __init__(self, model_class: Type[T]):
        self.model_class = model_class
    
    def get_by_id(self, id: int) -> Optional[T]:
        """根据 ID 获取"""
        with db.session() as session:
            return session.get(self.model_class, id)
    
    def get_all(self) -> List[T]:
        """获取所有"""
        with db.session() as session:
            stmt = select(self.model_class).order_by(self.model_class.id)
            return list(session.execute(stmt).scalars().all())
    
    def create(self, **kwargs) -> T:
        """创建"""
        with db.session() as session:
            instance = self.model_class(**kwargs)
            session.add(instance)
            session.commit()
            session.refresh(instance)
            return instance
    
    def update(self, id: int, **kwargs) -> Optional[T]:
        """更新"""
        with db.session() as session:
            stmt = update(self.model_class).where(self.model_class.id == id).values(**kwargs).returning(self.model_class)
            result = session.execute(stmt)
            session.commit()
            return result.scalar_one_or_none()
    
    def delete(self, id: int) -> bool:
        """删除"""
        with db.session() as session:
            stmt = delete(self.model_class).where(self.model_class.id == id)
            result = session.execute(stmt)
            session.commit()
            return result.rowcount > 0
    
    def exists(self, **filters) -> bool:
        """检查是否存在"""
        with db.session() as session:
            stmt = select(self.model_class).filter_by(**filters).limit(1)
            return session.execute(stmt).first() is not None