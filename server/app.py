from flask import Flask, request, jsonify, Blueprint, g
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, 
    get_jwt_identity, get_jwt
)
from datetime import timedelta, datetime
from functools import wraps
import bcrypt

# ========== 数据模型（内存数据库）==========
class User:
    def __init__(self, id, username, email, password_hash, is_active=True):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.is_active = is_active
        self.roles = []  # 角色ID列表
        self.created_at = datetime.now()

class Role:
    def __init__(self, id, name, description):
        self.id = id
        self.name = name
        self.description = description
        self.permissions = []  # 权限ID列表

class Permission:
    def __init__(self, id, name, resource, action):
        self.id = id
        self.name = name  # 如：user:read, user:write
        self.resource = resource  # 资源：user, role, permission
        self.action = action  # 操作：read, write, delete

# ========== 内存数据库实例 ==========
class AuthDB:
    def __init__(self):
        self.users = []
        self.roles = []
        self.permissions = []
        self.user_roles = []  # 用户-角色关联
        self.role_permissions = []  # 角色-权限关联
        self._next_ids = {'user': 1, 'role': 1, 'permission': 1}
        
        # 初始化基础数据
        self._init_data()
    
    def _init_data(self):
        # 1. 创建权限
        permissions_data = [
            (1, 'user:read', 'user', 'read'),
            (2, 'user:write', 'user', 'write'),
            (3, 'user:delete', 'user', 'delete'),
            (4, 'role:read', 'role', 'read'),
            (5, 'role:write', 'role', 'write'),
            (6, 'role:delete', 'role', 'delete'),
            (7, 'permission:read', 'permission', 'read'),
        ]
        for perm in permissions_data:
            self.permissions.append(Permission(*perm))
        self._next_ids['permission'] = 8
        
        # 2. 创建角色
        admin_role = Role(1, 'admin', '系统管理员，拥有所有权限')
        user_role = Role(2, 'user', '普通用户，只有查看权限')
        guest_role = Role(3, 'guest', '访客，最小权限')
        
        self.roles = [admin_role, user_role, guest_role]
        self._next_ids['role'] = 4
        
        # 3. 分配角色权限
        # admin: 所有权限
        for perm in self.permissions:
            self.role_permissions.append((1, perm.id))
        
        # user: 只有读取权限
        read_perms = [1, 4, 7]  # user:read, role:read, permission:read
        for perm_id in read_perms:
            self.role_permissions.append((2, perm_id))
        
        # guest: 只能查看自己的信息
        self.role_permissions.append((3, 1))  # user:read
        
        # 4. 创建用户（密码都是 '123456'）
        admin_password = bcrypt.hashpw('123456'.encode('utf-8'), bcrypt.gensalt())
        user_password = bcrypt.hashpw('123456'.encode('utf-8'), bcrypt.gensalt())
        
        admin = User(1, 'admin', 'admin@example.com', admin_password, True)
        normal_user = User(2, 'zhangsan', 'zhangsan@example.com', user_password, True)
        
        self.users = [admin, normal_user]
        self._next_ids['user'] = 3
        
        # 5. 分配用户角色
        self.user_roles.append((1, 1))  # admin 拥有 admin 角色
        self.user_roles.append((2, 2))  # zhangsan 拥有 user 角色
    
    # 用户相关方法
    def get_user_by_username(self, username):
        return next((u for u in self.users if u.username == username), None)
    
    def get_user_by_id(self, user_id):
        return next((u for u in self.users if u.id == user_id), None)
    
    def get_all_users(self):
        users_data = []
        for user in self.users:
            user_roles = [r_id for u_id, r_id in self.user_roles if u_id == user.id]
            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_active': user.is_active,
                'roles': user_roles,
                'created_at': user.created_at.isoformat()
            })
        return users_data
    
    def create_user(self, username, email, password):
        if self.get_user_by_username(username):
            return None
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        user_id = self._next_ids['user']
        self._next_ids['user'] += 1
        user = User(user_id, username, email, password_hash)
        self.users.append(user)
        return user
    
    def update_user(self, user_id, data):
        user = self.get_user_by_id(user_id)
        if not user:
            return None
        if 'email' in data:
            user.email = data['email']
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'password' in data:
            user.password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        return user
    
    def delete_user(self, user_id):
        user = self.get_user_by_id(user_id)
        if user:
            self.users.remove(user)
            # 删除关联
            self.user_roles = [(u_id, r_id) for u_id, r_id in self.user_roles if u_id != user_id]
            return True
        return False
    
    def assign_role_to_user(self, user_id, role_id):
        if not self.get_user_by_id(user_id) or not self.get_role_by_id(role_id):
            return False
        if (user_id, role_id) not in self.user_roles:
            self.user_roles.append((user_id, role_id))
        return True
    
    def remove_role_from_user(self, user_id, role_id):
        self.user_roles = [(u_id, r_id) for u_id, r_id in self.user_roles 
                          if not (u_id == user_id and r_id == role_id)]
        return True
    
    # 角色相关方法
    def get_role_by_id(self, role_id):
        return next((r for r in self.roles if r.id == role_id), None)
    
    def get_all_roles(self):
        roles_data = []
        for role in self.roles:
            role_perms = [p_id for r_id, p_id in self.role_permissions if r_id == role.id]
            roles_data.append({
                'id': role.id,
                'name': role.name,
                'description': role.description,
                'permissions': role_perms
            })
        return roles_data
    
    def create_role(self, name, description):
        role_id = self._next_ids['role']
        self._next_ids['role'] += 1
        role = Role(role_id, name, description)
        self.roles.append(role)
        return role
    
    def update_role(self, role_id, data):
        role = self.get_role_by_id(role_id)
        if not role:
            return None
        if 'name' in data:
            role.name = data['name']
        if 'description' in data:
            role.description = data['description']
        return role
    
    def delete_role(self, role_id):
        role = self.get_role_by_id(role_id)
        if role:
            self.roles.remove(role)
            # 删除关联
            self.role_permissions = [(r_id, p_id) for r_id, p_id in self.role_permissions if r_id != role_id]
            self.user_roles = [(u_id, r_id) for u_id, r_id in self.user_roles if r_id != role_id]
            return True
        return False
    
    def assign_permission_to_role(self, role_id, permission_id):
        if not self.get_role_by_id(role_id) or not self.get_permission_by_id(permission_id):
            return False
        if (role_id, permission_id) not in self.role_permissions:
            self.role_permissions.append((role_id, permission_id))
        return True
    
    def remove_permission_from_role(self, role_id, permission_id):
        self.role_permissions = [(r_id, p_id) for r_id, p_id in self.role_permissions 
                                 if not (r_id == role_id and p_id == permission_id)]
        return True
    
    # 权限相关方法
    def get_permission_by_id(self, permission_id):
        return next((p for p in self.permissions if p.id == permission_id), None)
    
    def get_all_permissions(self):
        return [{'id': p.id, 'name': p.name, 'resource': p.resource, 'action': p.action} 
                for p in self.permissions]
    
    def get_user_permissions(self, user_id):
        """获取用户的所有权限（通过角色）"""
        # 获取用户的所有角色
        user_roles = [r_id for u_id, r_id in self.user_roles if u_id == user_id]
        # 获取这些角色的所有权限
        permissions = set()
        for role_id in user_roles:
            role_perms = [p_id for r_id, p_id in self.role_permissions if r_id == role_id]
            for perm_id in role_perms:
                perm = self.get_permission_by_id(perm_id)
                if perm:
                    permissions.add(perm.name)
        return list(permissions)

# ========== 权限装饰器 ==========
def permission_required(permission_name):
    """权限检查装饰器"""
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user_id_str = get_jwt_identity()
            current_user_id = int(current_user_id_str)  # 转换为整数
            user = db.get_user_by_id(current_user_id)
            if not user or not user.is_active:
                return jsonify({'error': '用户不存在或已被禁用'}), 403
            
            user_perms = db.get_user_permissions(current_user_id)
            if permission_name not in user_perms:
                return jsonify({'error': f'缺少权限: {permission_name}'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

# ========== 初始化数据库 ==========
db = AuthDB()

# ========== Flask 应用初始化 ==========
app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production-2024'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8)

CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
jwt = JWTManager(app)

# ========== API 蓝图 ==========
api_bp = Blueprint('api', __name__, url_prefix='/api')

# ---------- 认证相关 ----------
@api_bp.route('/auth/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': '用户名和密码不能为空'}), 400
    
    user = db.get_user_by_username(username)
    if not user or not user.is_active:
        return jsonify({'error': '用户名或密码错误'}), 401
    
    if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash):
        return jsonify({'error': '用户名或密码错误'}), 401
    
    # 修改：将 user.id 转换为字符串
    access_token = create_access_token(identity=str(user.id))
    
    # 获取用户权限
    permissions = db.get_user_permissions(user.id)
    
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'permissions': permissions
        }
    }), 200

@api_bp.route('/auth/current-user', methods=['GET'])
@jwt_required()
def get_current_user():
    """获取当前登录用户信息"""
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)  # 转换为整数
    user = db.get_user_by_id(user_id)
    
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    permissions = db.get_user_permissions(user_id)
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_active': user.is_active,
        'permissions': permissions
    }), 200


# ---------- 用户管理 ----------
@api_bp.route('/users', methods=['GET'])
@permission_required('user:read')
def get_users():
    """获取用户列表"""
    users = db.get_all_users()
    # 为每个用户添加权限信息
    for user in users:
        user['permissions'] = db.get_user_permissions(user['id'])
    return jsonify(users), 200

@api_bp.route('/users', methods=['POST'])
@permission_required('user:write')
def create_user():
    """创建用户"""
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not all([username, email, password]):
        return jsonify({'error': '用户名、邮箱和密码不能为空'}), 400
    
    user = db.create_user(username, email, password)
    if not user:
        return jsonify({'error': '用户名已存在'}), 409
    
    # 如果指定了角色，分配角色
    roles = data.get('roles', [])
    for role_id in roles:
        db.assign_role_to_user(user.id, role_id)
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email
    }), 201

@api_bp.route('/users/<int:user_id>', methods=['PUT'])
@permission_required('user:write')
def update_user(user_id):
    """更新用户"""
    data = request.get_json()
    user = db.update_user(user_id, data)
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    return jsonify({'message': '更新成功'}), 200

@api_bp.route('/users/<int:user_id>', methods=['DELETE'])
@permission_required('user:delete')
def delete_user(user_id):
    """删除用户"""
    if not db.delete_user(user_id):
        return jsonify({'error': '用户不存在'}), 404
    return '', 204

@api_bp.route('/users/<int:user_id>/roles', methods=['POST'])
@permission_required('user:write')
def assign_role_to_user(user_id):
    """为用户分配角色"""
    data = request.get_json()
    role_id = data.get('role_id')
    
    if not role_id:
        return jsonify({'error': 'role_id 不能为空'}), 400
    
    if db.assign_role_to_user(user_id, role_id):
        return jsonify({'message': '角色分配成功'}), 200
    return jsonify({'error': '用户或角色不存在'}), 404

@api_bp.route('/users/<int:user_id>/roles/<int:role_id>', methods=['DELETE'])
@permission_required('user:write')
def remove_role_from_user(user_id, role_id):
    """移除用户的角色"""
    db.remove_role_from_user(user_id, role_id)
    return jsonify({'message': '角色移除成功'}), 200

# ---------- 角色管理 ----------
@api_bp.route('/roles', methods=['GET'])
@permission_required('role:read')
def get_roles():
    """获取角色列表"""
    return jsonify(db.get_all_roles()), 200

@api_bp.route('/roles', methods=['POST'])
@permission_required('role:write')
def create_role():
    """创建角色"""
    data = request.get_json()
    name = data.get('name')
    description = data.get('description', '')
    
    if not name:
        return jsonify({'error': '角色名称不能为空'}), 400
    
    role = db.create_role(name, description)
    return jsonify({
        'id': role.id,
        'name': role.name,
        'description': role.description
    }), 201

@api_bp.route('/roles/<int:role_id>', methods=['PUT'])
@permission_required('role:write')
def update_role(role_id):
    """更新角色"""
    data = request.get_json()
    role = db.update_role(role_id, data)
    if not role:
        return jsonify({'error': '角色不存在'}), 404
    return jsonify({'message': '更新成功'}), 200

@api_bp.route('/roles/<int:role_id>', methods=['DELETE'])
@permission_required('role:delete')
def delete_role(role_id):
    """删除角色"""
    if not db.delete_role(role_id):
        return jsonify({'error': '角色不存在'}), 404
    return '', 204

@api_bp.route('/roles/<int:role_id>/permissions', methods=['POST'])
@permission_required('role:write')
def assign_permission_to_role(role_id):
    """为角色分配权限"""
    data = request.get_json()
    permission_id = data.get('permission_id')
    
    if not permission_id:
        return jsonify({'error': 'permission_id 不能为空'}), 400
    
    if db.assign_permission_to_role(role_id, permission_id):
        return jsonify({'message': '权限分配成功'}), 200
    return jsonify({'error': '角色或权限不存在'}), 404

@api_bp.route('/roles/<int:role_id>/permissions/<int:permission_id>', methods=['DELETE'])
@permission_required('role:write')
def remove_permission_from_role(role_id, permission_id):
    """移除角色的权限"""
    db.remove_permission_from_role(role_id, permission_id)
    return jsonify({'message': '权限移除成功'}), 200

# ---------- 权限管理 ----------
@api_bp.route('/permissions', methods=['GET'])
@permission_required('permission:read')
def get_permissions():
    """获取权限列表"""
    return jsonify(db.get_all_permissions()), 200


@api_bp.route('/leak-scan/extract', methods=['POST'])
@jwt_required()
def extract_leak_scan():
    return jsonify({
            'success': True,
            'message': f'成功关联 1 条记录到项目'
        }), 200

# 注册蓝图
app.register_blueprint(api_bp)

if __name__ == '__main__':
    app.run(debug=True, port=5000)