import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser, assignRoleToUser, removeRoleFromUser, getRoles } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { hasPermission } = useAuth();

  const canWrite = hasPermission('user:write');
  const canDelete = hasPermission('user:delete');

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  const handleSave = async (userData) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await createUser(userData);
      }
      await loadUsers();
      setModalVisible(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定删除该用户吗？')) {
      try {
        await deleteUser(id);
        await loadUsers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleAssignRole = async (userId, roleId) => {
    try {
      await assignRoleToUser(userId, roleId);
      await loadUsers();
      alert('角色分配成功');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveRole = async (userId, roleId) => {
    try {
      await removeRoleFromUser(userId, roleId);
      await loadUsers();
      alert('角色移除成功');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="management-container">
      <div className="header">
        <h1>用户管理</h1>
        {canWrite && (
          <button className="btn-add" onClick={() => {
            setEditingUser(null);
            setModalVisible(true);
          }}>+ 新增用户</button>
        )}
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>状态</th>
              <th>角色</th>
              <th>权限</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.is_active ? '✅ 激活' : '❌ 禁用'}</td>
                <td>
                  {user.roles.map(roleId => {
                    const role = roles.find(r => r.id === roleId);
                    return role ? (
                      <span key={roleId} className="role-tag">
                        {role.name}
                        {canWrite && (
                          <button onClick={() => handleRemoveRole(user.id, roleId)} className="remove-role">×</button>
                        )}
                      </span>
                    ) : null;
                  })}
                  {canWrite && (
                    <button onClick={() => {
                      setSelectedUser(user);
                      setRoleModalVisible(true);
                    }} className="add-role-btn">+ 添加角色</button>
                  )}
                </td>
                <td>
                  <div className="user-permissions">
                    {user.permissions?.slice(0, 3).join(', ')}
                    {user.permissions?.length > 3 && '...'}
                  </div>
                </td>
                <td>
                  {canWrite && (
                    <button className="btn-edit" onClick={() => {
                      setEditingUser(user);
                      setModalVisible(true);
                    }}>编辑</button>
                  )}
                  {canDelete && (
                    <button className="btn-delete" onClick={() => handleDelete(user.id)}>删除</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 用户表单弹窗 */}
      {modalVisible && (
        <UserModal
          user={editingUser}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
        />
      )}

      {/* 角色分配弹窗 */}
      {roleModalVisible && selectedUser && (
        <RoleAssignModal
          user={selectedUser}
          roles={roles}
          onAssign={handleAssignRole}
          onClose={() => setRoleModalVisible(false)}
        />
      )}
    </div>
  );
}

// 用户表单组件
function UserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    roles: []
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        roles: user.roles || []
      });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const saveData = { ...formData };
    if (!user && !saveData.password) {
      alert('密码不能为空');
      return;
    }
    if (!user) {
      delete saveData.roles;
    }
    onSave(saveData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{user ? '编辑用户' : '新增用户'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名 *</label>
            <input
              name="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={!!user}
            />
          </div>
          <div className="form-group">
            <label>邮箱 *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>{user ? '新密码（留空则不修改）' : '密码 *'}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!user}
            />
          </div>
          <div className="modal-buttons">
            <button type="button" onClick={onClose}>取消</button>
            <button type="submit">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 角色分配组件
function RoleAssignModal({ user, roles, onAssign, onClose }) {
  const [selectedRole, setSelectedRole] = useState('');

  const handleAssign = () => {
    if (selectedRole) {
      onAssign(user.id, parseInt(selectedRole));
      onClose();
    }
  };

  const availableRoles = roles.filter(role => !user.roles.includes(role.id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>为 {user.username} 分配角色</h2>
        <div className="form-group">
          <label>选择角色</label>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="">请选择</option>
            {availableRoles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>
        <div className="modal-buttons">
          <button onClick={onClose}>取消</button>
          <button onClick={handleAssign} disabled={!selectedRole}>分配</button>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;