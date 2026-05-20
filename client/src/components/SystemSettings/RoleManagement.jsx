import { useState, useEffect } from 'react';
import { 
  getRoles, 
  createRole, 
  updateRole, 
  deleteRole, 
  getPermissions,
  assignPermissionToRole,
  removePermissionFromRole,
  getUsers
} from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import '../../styles/pages/RoleManagement.css';

function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [viewingRole, setViewingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission } = useAuth();
  const { canCreateRole, canEditRole, canDeleteRole, canAssignPermission } = usePermission();

  useEffect(() => {
    loadRoles();
    loadPermissions();
    loadUsers();
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

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleSave = async (roleData) => {
    try {
      if (editingRole) {
        await updateRole(editingRole.id, roleData);
        alert('角色更新成功');
      } else {
        await createRole(roleData);
        alert('角色创建成功');
      }
      await loadRoles();
      setModalVisible(false);
      setEditingRole(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`确定删除角色 "${name}" 吗？\n\n删除后：\n• 拥有该角色的用户将失去相关权限\n• 该角色的权限配置将被清除\n• 此操作不可恢复`)) {
      try {
        await deleteRole(id);
        alert('角色删除成功');
        await loadRoles();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // 批量分配权限
  const handleBatchAssignPermissions = async (roleId, permissionIds) => {
    if (permissionIds.length === 0) return;
    
    let successCount = 0;
    let failCount = 0;
    
    for (const permissionId of permissionIds) {
      try {
        await assignPermissionToRole(roleId, permissionId);
        successCount++;
      } catch (err) {
        failCount++;
        console.error(`分配权限 ${permissionId} 失败:`, err);
      }
    }
    
    if (successCount > 0) {
      alert(`成功分配 ${successCount} 个权限${failCount > 0 ? `，${failCount} 个失败` : ''}`);
    } else {
      alert('权限分配失败');
    }
    
    await loadRoles();
  };

  // 批量移除权限
  const handleBatchRemovePermissions = async (roleId, permissionIds, permissionNames) => {
    if (permissionIds.length === 0) return;
    
    if (window.confirm(`确定要移除 ${permissionIds.length} 个权限吗？`)) {
      let successCount = 0;
      let failCount = 0;
      
      for (const permissionId of permissionIds) {
        try {
          await removePermissionFromRole(roleId, permissionId);
          successCount++;
        } catch (err) {
          failCount++;
          console.error(`移除权限 ${permissionId} 失败:`, err);
        }
      }
      
      if (successCount > 0) {
        alert(`成功移除 ${successCount} 个权限${failCount > 0 ? `，${failCount} 个失败` : ''}`);
      } else {
        alert('权限移除失败');
      }
      
      await loadRoles();
    }
  };

  // 单个移除权限
  const handleRemovePermission = async (roleId, permissionId, permissionName) => {
    if (window.confirm(`确定移除权限 "${permissionName}" 吗？`)) {
      try {
        await removePermissionFromRole(roleId, permissionId);
        await loadRoles();
        alert('权限移除成功');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // 获取角色已拥有的权限详情
  const getRolePermissions = (role) => {
    return permissions.filter(p => role.permissions?.includes(p.id));
  };

  // 获取角色未拥有的权限
  const getAvailablePermissions = (role) => {
    return permissions.filter(p => !role.permissions?.includes(p.id));
  };

  // 获取拥有该角色的用户
  const getUsersWithRole = (roleId) => {
    return users.filter(user => user.roles?.includes(roleId));
  };

  // 获取资源中文名称
  const getResourceName = (resource) => {
    const resourceMap = {
      'user': '用户管理',
      'role': '角色管理',
      'permission': '权限管理',
      'leak': '漏扫处理',
      'assessment': '测评录入'
    };
    return resourceMap[resource] || resource;
  };

  // 过滤角色
  const getFilteredRoles = () => {
    if (!searchTerm) return roles;
    return roles.filter(role =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const filteredRoles = getFilteredRoles();

  return (
    <div className="management-container">
      <div className="header">
        <h1>角色管理</h1>
        <div className="header-actions">
          <div className="search-box-small">
            <input
              type="text"
              placeholder="搜索角色..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-small"
            />
          </div>
          {canCreateRole() && (
            <button className="btn-add" onClick={() => {
              setEditingRole(null);
              setModalVisible(true);
            }}>+ 新增角色</button>
          )}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="role-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-number">{roles.length}</div>
            <div className="stat-label">总角色数</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔐</div>
          <div className="stat-info">
            <div className="stat-number">{permissions.length}</div>
            <div className="stat-label">总权限数</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <div className="stat-number">{users.length}</div>
            <div className="stat-label">总用户数</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="roles-container">
          {filteredRoles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>暂无角色数据</p>
              {canCreateRole() && (
                <button className="btn-add-small" onClick={() => {
                  setEditingRole(null);
                  setModalVisible(true);
                }}>创建第一个角色</button>
              )}
            </div>
          ) : (
            filteredRoles.map(role => {
              const rolePermissions = getRolePermissions(role);
              const usersWithRole = getUsersWithRole(role.id);
              
              return (
                <div key={role.id} className="role-item">
                  <div className="role-item-header">
                    <div className="role-info">
                      <div className="role-name">
                        {role.name}
                        {role.is_builtin && <span className="builtin-badge">内置</span>}
                      </div>
                      <div className="role-description">{role.description || '暂无描述'}</div>
                    </div>
                    <div className="role-stats-info">
                      <span className="stat-badge">
                        🔐 {rolePermissions.length} 个权限
                      </span>
                      <span className="stat-badge">
                        👥 {usersWithRole.length} 个用户
                      </span>
                    </div>
                    <div className="role-actions">
                      <button 
                        className="btn-view" 
                        onClick={() => {
                          setViewingRole(role);
                          setDetailModalVisible(true);
                        }}
                        title="查看详情"
                      >
                        📋 详情
                      </button>
                      {canEditRole() && (
                        <button 
                          className="btn-edit" 
                          onClick={() => {
                            setEditingRole(role);
                            setModalVisible(true);
                          }}
                          title="编辑角色"
                        >
                          ✏️ 编辑
                        </button>
                      )}
                      {canAssignPermission() && (
                        <button 
                          className="btn-permission" 
                          onClick={() => {
                            setSelectedRole(role);
                            setPermissionModalVisible(true);
                          }}
                          title="分配权限"
                        >
                          🔑 权限
                        </button>
                      )}
                      {canDeleteRole() && !role.is_builtin && (
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDelete(role.id, role.name)}
                          title="删除角色"
                        >
                          🗑️ 删除
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="role-item-body">
                    <div className="permissions-preview">
                      <div className="preview-header">
                        <span>已分配权限 ({rolePermissions.length})</span>
                        {canAssignPermission() && (
                          <button 
                            className="add-permission-link"
                            onClick={() => {
                              setSelectedRole(role);
                              setPermissionModalVisible(true);
                            }}
                          >
                            + 添加权限
                          </button>
                        )}
                      </div>
                      <div className="preview-tags">
                        {rolePermissions.length === 0 ? (
                          <span className="empty-tags">暂无权限，点击上方按钮添加</span>
                        ) : (
                          rolePermissions.slice(0, 8).map(perm => (
                            <span key={perm.id} className="permission-tag">
                              <span className="perm-code">{perm.code}</span>
                              <span className="perm-name">{perm.name}</span>
                              {canAssignPermission() && (
                                <button 
                                  onClick={() => handleRemovePermission(role.id, perm.id, perm.name)}
                                  className="remove-permission"
                                  title="移除权限"
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          ))
                        )}
                        {rolePermissions.length > 8 && (
                          <span className="more-tag" 
                            onClick={() => {
                              setViewingRole(role);
                              setDetailModalVisible(true);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            +{rolePermissions.length - 8} 更多
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 角色表单弹窗 */}
      {modalVisible && (
        <RoleModal
          role={editingRole}
          onClose={() => {
            setModalVisible(false);
            setEditingRole(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* 权限分配弹窗 */}
      {permissionModalVisible && selectedRole && (
        <PermissionAssignModal
          role={selectedRole}
          availablePermissions={getAvailablePermissions(selectedRole)}
          permissions={permissions}
          onBatchAssign={handleBatchAssignPermissions}
          onClose={() => {
            setPermissionModalVisible(false);
            setSelectedRole(null);
          }}
        />
      )}

      {/* 角色详情弹窗 */}
      {detailModalVisible && viewingRole && (
        <RoleDetailModal
          role={viewingRole}
          permissions={getRolePermissions(viewingRole)}
          users={getUsersWithRole(viewingRole.id)}
          onClose={() => {
            setDetailModalVisible(false);
            setViewingRole(null);
          }}
          onEdit={() => {
            setDetailModalVisible(false);
            setEditingRole(viewingRole);
            setModalVisible(true);
          }}
          onAssignPermission={() => {
            setDetailModalVisible(false);
            setSelectedRole(viewingRole);
            setPermissionModalVisible(true);
          }}
          onBatchRemove={handleBatchRemovePermissions}
          onRemovePermission={handleRemovePermission}
          canEdit={canEditRole()}
          canAssign={canAssignPermission()}
          getResourceName={getResourceName}
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
              disabled={role?.is_builtin}
            />
            <small>角色名称应使用英文小写字母和下划线</small>
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="角色的详细描述，说明该角色的职责和权限范围"
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

// 权限分配组件（增强版 - 批量分配，只显示一次提示）
function PermissionAssignModal({ role, availablePermissions, permissions, onBatchAssign, onClose }) {
  const [selectedResource, setSelectedResource] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [assigning, setAssigning] = useState(false);

  const getGroupedAvailablePermissions = () => {
    let filtered = availablePermissions;
    
    if (selectedResource !== 'all') {
      filtered = filtered.filter(p => p.resource === selectedResource);
    }
    
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(p => 
        p.code.toLowerCase().includes(keyword) ||
        p.name.toLowerCase().includes(keyword)
      );
    }
    
    const grouped = {};
    filtered.forEach(perm => {
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = [];
      }
      grouped[perm.resource].push(perm);
    });
    return grouped;
  };

  const resources = [...new Set(availablePermissions.map(p => p.resource))];
  const groupedPermissions = getGroupedAvailablePermissions();

  const getResourceName = (resource) => {
    const map = {
      'user': '用户管理', 'role': '角色管理', 'permission': '权限管理',
      'leak': '漏扫处理', 'assessment': '测评录入'
    };
    return map[resource] || resource;
  };

  const handleBatchAssign = async () => {
    if (selectedPermissions.length === 0) {
      alert('请选择要分配的权限');
      return;
    }
    
    setAssigning(true);
    await onBatchAssign(role.id, selectedPermissions);
    setAssigning(false);
    setSelectedPermissions([]);
    onClose();
  };

  const toggleSelectPermission = (permissionId) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const selectAllInGroup = (perms) => {
    const allIds = perms.map(p => p.id);
    const allSelected = allIds.every(id => selectedPermissions.includes(id));
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...allIds])]);
    }
  };

  const selectAll = () => {
    const allIds = availablePermissions.map(p => p.id);
    const allSelected = allIds.every(id => selectedPermissions.includes(id));
    if (allSelected) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions([...allIds]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h2>为角色「{role.name}」分配权限</h2>
        
        {availablePermissions.length === 0 ? (
          <div className="no-permissions-message">
            <p>✅ 该角色已拥有所有可用权限</p>
            <button onClick={onClose}>关闭</button>
          </div>
        ) : (
          <>
            <div className="permission-toolbar">
              <div className="permission-filter">
                <label>资源筛选：</label>
                <select value={selectedResource} onChange={(e) => setSelectedResource(e.target.value)}>
                  <option value="all">所有资源</option>
                  {resources.map(r => (
                    <option key={r} value={r}>{getResourceName(r)}</option>
                  ))}
                </select>
              </div>
              <div className="permission-search">
                <input
                  type="text"
                  placeholder="搜索权限代码或名称..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="batch-actions">
                <button className="btn-select-all" onClick={selectAll}>
                  {selectedPermissions.length === availablePermissions.length ? '取消全选' : '全选'}
                </button>
                {selectedPermissions.length > 0 && (
                  <button 
                    className="btn-batch-assign" 
                    onClick={handleBatchAssign}
                    disabled={assigning}
                  >
                    {assigning ? '分配中...' : `批量分配 (${selectedPermissions.length})`}
                  </button>
                )}
              </div>
            </div>
            
            <div className="permission-list-modal">
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <div key={resource} className="permission-group-modal">
                  <div className="permission-group-title">
                    <label className="group-select-all">
                      <input
                        type="checkbox"
                        checked={perms.length > 0 && perms.every(p => selectedPermissions.includes(p.id))}
                        onChange={() => selectAllInGroup(perms)}
                      />
                      <span>{getResourceName(resource)}</span>
                      <span className="group-count">{perms.length}</span>
                    </label>
                  </div>
                  <div className="permission-items">
                    {perms.map(perm => (
                      <div key={perm.id} className="permission-item">
                        <input
                          type="checkbox"
                          className="permission-checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={() => toggleSelectPermission(perm.id)}
                        />
                        <div className="permission-item-code">{perm.code}</div>
                        <div className="permission-item-name">{perm.name}</div>
                        <div className="permission-item-desc">{perm.description || ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        <div className="modal-buttons">
          <button onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
}

// 角色详情弹窗（增强版 - 支持批量删除）
function RoleDetailModal({ 
  role, permissions, users, onClose, onEdit, onAssignPermission, 
  onBatchRemove, onRemovePermission, canEdit, canAssign, getResourceName 
}) {
  const [activeTab, setActiveTab] = useState('permissions');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedResource, setSelectedResource] = useState('all');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [batchMode, setBatchMode] = useState(false);
  const [removing, setRemoving] = useState(false);

  const getFilteredPermissions = () => {
    let filtered = permissions;
    
    if (selectedResource !== 'all') {
      filtered = filtered.filter(p => p.resource === selectedResource);
    }
    
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(p => 
        p.code.toLowerCase().includes(keyword) ||
        p.name.toLowerCase().includes(keyword)
      );
    }
    
    return filtered;
  };

  const getGroupedPermissions = () => {
    const filtered = getFilteredPermissions();
    const grouped = {};
    filtered.forEach(perm => {
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = [];
      }
      grouped[perm.resource].push(perm);
    });
    return grouped;
  };

  const resources = [...new Set(permissions.map(p => p.resource))];
  const groupedPermissions = getGroupedPermissions();

  const getActionName = (action) => {
    const map = {
      'view': '查看', 'create': '创建', 'edit': '编辑', 'delete': '删除',
      'manage': '管理', 'extract': '提取', 'export': '导出'
    };
    return map[action] || action;
  };

  const toggleSelectPermission = (permissionId) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleBatchRemove = async () => {
    if (selectedPermissions.length === 0) {
      alert('请选择要移除的权限');
      return;
    }
    
    const permissionNames = selectedPermissions.map(id => {
      const perm = permissions.find(p => p.id === id);
      return perm?.name || '';
    }).filter(Boolean);
    
    setRemoving(true);
    await onBatchRemove(role.id, selectedPermissions, permissionNames);
    setRemoving(false);
    setSelectedPermissions([]);
    setBatchMode(false);
  };

  const selectAllInGroup = (perms) => {
    const allIds = perms.map(p => p.id);
    const allSelected = allIds.every(id => selectedPermissions.includes(id));
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...allIds])]);
    }
  };

  const selectAll = () => {
    const allIds = getFilteredPermissions().map(p => p.id);
    const allSelected = allIds.every(id => selectedPermissions.includes(id));
    if (allSelected) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions([...allIds]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <div>
            <h2>{role.name}</h2>
            <p className="role-detail-desc">{role.description || '暂无描述'}</p>
            {role.is_builtin && <span className="builtin-badge">内置角色</span>}
          </div>
          <div className="detail-actions">
            {canEdit && (
              <button className="btn-edit" onClick={onEdit}>✏️ 编辑角色</button>
            )}
            {canAssign && (
              <button className="btn-permission" onClick={onAssignPermission}>🔑 分配权限</button>
            )}
          </div>
        </div>
        
        <div className="detail-tabs">
          <button 
            className={`detail-tab ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('permissions');
              setBatchMode(false);
              setSelectedPermissions([]);
            }}
          >
            🔐 权限列表 ({permissions.length})
          </button>
          <button 
            className={`detail-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 拥有该角色的用户 ({users.length})
          </button>
        </div>
        
        {activeTab === 'permissions' && (
          <div className="detail-permissions">
            <div className="permission-toolbar">
              <div className="permission-filter">
                <label>资源筛选：</label>
                <select value={selectedResource} onChange={(e) => setSelectedResource(e.target.value)}>
                  <option value="all">所有资源</option>
                  {resources.map(r => (
                    <option key={r} value={r}>{getResourceName(r)}</option>
                  ))}
                </select>
              </div>
              <div className="permission-search">
                <input
                  type="text"
                  placeholder="搜索权限..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="search-input-small"
                />
              </div>
              {canAssign && (
                <div className="batch-actions">
                  <button 
                    className={`btn-batch-mode ${batchMode ? 'active' : ''}`}
                    onClick={() => {
                      setBatchMode(!batchMode);
                      setSelectedPermissions([]);
                    }}
                  >
                    {batchMode ? '取消批量' : '批量管理'}
                  </button>
                  {batchMode && (
                    <>
                      <button className="btn-select-all" onClick={selectAll}>
                        全选
                      </button>
                      {selectedPermissions.length > 0 && (
                        <button 
                          className="btn-batch-remove" 
                          onClick={handleBatchRemove}
                          disabled={removing}
                        >
                          {removing ? '删除中...' : `删除 (${selectedPermissions.length})`}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {permissions.length === 0 ? (
              <div className="empty-permissions">
                <p>暂无权限，点击"分配权限"按钮添加</p>
              </div>
            ) : (
              Object.entries(groupedPermissions).map(([resource, perms]) => (
                <div key={resource} className="detail-permission-group">
                  <div className="detail-permission-group-title">
                    {batchMode && (
                      <input
                        type="checkbox"
                        className="group-checkbox"
                        checked={perms.length > 0 && perms.every(p => selectedPermissions.includes(p.id))}
                        onChange={() => selectAllInGroup(perms)}
                      />
                    )}
                    <span>{getResourceName(resource)}</span>
                    <span className="group-count">{perms.length}</span>
                  </div>
                  <div className="detail-permission-list">
                    {perms.map(perm => (
                      <div key={perm.id} className="detail-permission-item">
                        {batchMode && (
                          <input
                            type="checkbox"
                            className="permission-checkbox"
                            checked={selectedPermissions.includes(perm.id)}
                            onChange={() => toggleSelectPermission(perm.id)}
                          />
                        )}
                        <div className="detail-permission-code">{perm.code}</div>
                        <div className="detail-permission-name">{perm.name}</div>
                        <div className="detail-permission-action">
                          <span className={`action-tag action-${perm.action}`}>
                            {getActionName(perm.action)}
                          </span>
                        </div>
                        {!batchMode && canAssign && (
                          <button 
                            className="remove-permission-btn"
                            onClick={() => onRemovePermission(role.id, perm.id, perm.name)}
                            title="移除权限"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="detail-users">
            {users.length === 0 ? (
              <div className="empty-users">
                <p>暂无用户拥有此角色</p>
              </div>
            ) : (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>用户名</th>
                    <th>邮箱</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td><strong>{user.username}</strong></td>
                      <td>{user.email}</td>
                      <td>{user.is_active ? '✅ 激活' : '❌ 禁用'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        <div className="modal-buttons">
          <button onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
}

export default RoleManagement;