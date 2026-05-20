# -*- coding: utf-8 -*-

from app.repositories.user_repo import user_repo, UserRepository
from app.repositories.role_repo import role_repo, RoleRepository
from app.repositories.permission_repo import permission_repo, PermissionRepository

__all__ = ['user_repo', 'role_repo', 'permission_repo', 'UserRepository', 'RoleRepository', 'PermissionRepository']