import { useState, useEffect } from 'react';
import { 
  getRoles, 
  createRole, 
  updateRole, 
  deleteRole, 
  getPermissions,
  assignPermissionToRole,
  removePermissionFromRole
} from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages/RoleManagement.css';

function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const { hasPermission } = useAuth();

  const canWrite = hasPermission('role:write');
  const canDelete = hasPermission('role:delete');

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const data = await getPermissions();
      setPermissions(data);
    } catch (err) {
      console.error('Failed to load permissions:', err);
    }
  };

  const handleSave = async (roleData) => {
    try {
      if (editingRole) {
        await updateRole(editingRole.id, roleData);
      } else {
        await createRole(roleData);
      }
      await loadRoles();
      setModalVisible(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定删除该角色吗？删除后，拥有该角色的用户将失去相关权限。')) {
      try {
        await deleteRole(id);
        await loadRoles();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleAssignPermission = async (roleId, permissionId) => {
    try {
      await assignPermissionToRole(roleId, permissionId);
      await loadRoles();
      alert('权限分配成功');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemovePermission = async (roleId, permissionId) => {
    try {
      await removePermissionFromRole(roleId, permissionId);
      await loadRoles();
      alert('权限移除成功');
    } catch (err) {
      alert(err.message);
    }
  };

  // 获取角色已拥有的权限对象
  const getRolePermissions = (role) => {
    return permissions.filter(p => role.permissions.includes(p.id));
  };

  // 获取角色未拥有的权限
  const getAvailablePermissions = (role) => {
    return permissions.filter(p => !role.permissions.includes(p.id));
  };

  return (
    <div className="management-container">
      <div className="header">
        <h1>角色管理</h1>
        {canWrite && (
          <button className="btn-add" onClick={() => {
            setEditingRole(null);
            setModalVisible(true);
          }}>+ 新增角色</button>
        )}
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="roles-grid">
          {roles.map(role => (
            <div key={role.id} className="role-card">
              <div className="role-card-header">
                <div>
                  <h3>{role.name}</h3>
                  <p className="role-description">{role.description || '无描述'}</p>
                </div>
                <div className="role-actions">
                  {canWrite && (
                    <button 
                      className="btn-edit" 
                      onClick={() => {
                        setEditingRole(role);
                        setModalVisible(true);
                      }}
                    >
                      编辑
                    </button>
                  )}
                  {canDelete && role.name !== 'admin' && role.name !== 'user' && role.name !== 'guest' && (
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(role.id)}
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
              
              <div className="role-card-body">
                <div className="permissions-section">
                  <div className="permissions-header">
                    <strong>拥有的权限：</strong>
                    {canWrite && (
                      <button 
                        className="add-permission-btn"
                        onClick={() => {
                          setSelectedRole(role);
                          setPermissionModalVisible(true);
                        }}
                      >
                        + 添加权限
                      </button>
                    )}
                  </div>
                  <div className="permissions-list">
                    {getRolePermissions(role).length === 0 ? (
                      <span className="no-permissions">暂无权限</span>
                    ) : (
                      getRolePermissions(role).map(perm => (
                        <span key={perm.id} className="permission-tag">
                          {perm.name}
                          {canWrite && (
                            <button 
                              onClick={() => handleRemovePermission(role.id, perm.id)}
                              className="remove-permission"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 角色表单弹窗 */}
      {modalVisible && (
        <RoleModal
          role={editingRole}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
        />
      )}

      {/* 权限分配弹窗 */}
      {permissionModalVisible && selectedRole && (
        <PermissionAssignModal
          role={selectedRole}
          availablePermissions={getAvailablePermissions(selectedRole)}
          onAssign={handleAssignPermission}
          onClose={() => setPermissionModalVisible(false)}
        />
      )}
    </div>
  );
}

// 角色表单组件
function RoleModal({ role, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || ''
      });
    }
  }, [role]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('角色名称不能为空');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{role ? '编辑角色' : '新增角色'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>角色名称 *</label>
            <input
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="例如：editor, viewer"
            />
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="角色的详细描述"
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

// 权限分配组件
function PermissionAssignModal({ role, availablePermissions, onAssign, onClose }) {
  const [selectedPermission, setSelectedPermission] = useState('');

  const handleAssign = () => {
    if (selectedPermission) {
      onAssign(role.id, parseInt(selectedPermission));
      onClose();
    }
  };

  if (availablePermissions.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>为 {role.name} 分配权限</h2>
          <p className="no-permissions-message">该角色已拥有所有权限</p>
          <div className="modal-buttons">
            <button onClick={onClose}>关闭</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>为 {role.name} 分配权限</h2>
        <div className="form-group">
          <label>选择权限</label>
          <select value={selectedPermission} onChange={(e) => setSelectedPermission(e.target.value)}>
            <option value="">请选择权限</option>
            {availablePermissions.map(perm => (
              <option key={perm.id} value={perm.id}>
                {perm.name} ({perm.resource}:{perm.action})
              </option>
            ))}
          </select>
        </div>
        <div className="modal-buttons">
          <button onClick={onClose}>取消</button>
          <button onClick={handleAssign} disabled={!selectedPermission}>分配</button>
        </div>
      </div>
    </div>
  );
}

export default RoleManagement;