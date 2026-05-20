import { useState, useEffect } from 'react';
import { 
  getPermissions, 
  createPermission, 
  updatePermission, 
  deletePermission,
  getApiPermissionMappings,
  createApiPermissionMapping,
  deleteApiPermissionMapping
} from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import '../../styles/pages/PermissionManagement.css'

function PermissionManagement() {
  const [permissions, setPermissions] = useState([]);
  const [apiMappings, setApiMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('permissions'); // 'permissions' or 'mappings'
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [mappingModalVisible, setMappingModalVisible] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [newMapping, setNewMapping] = useState({ method: 'GET', api_path: '', permission_id: '' });
  const { user } = useAuth();
  const { canCreateRole, canEditRole, canDeleteRole } = usePermission();

  // 权限相关状态
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [resources, setResources] = useState([]);

  useEffect(() => {
    loadPermissions();
    loadApiMappings();
    loadResources();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const data = await getPermissions();
      setPermissions(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadApiMappings = async () => {
    try {
      const data = await getApiPermissionMappings();
      setApiMappings(data);
    } catch (err) {
      console.error('Failed to load API mappings:', err);
    }
  };

  const loadResources = async () => {
    try {
      // 从现有权限中提取资源类型
      const perms = await getPermissions();
      const uniqueResources = [...new Set(perms.map(p => p.resource))];
      setResources(uniqueResources);
    } catch (err) {
      console.error('Failed to load resources:', err);
    }
  };

  // 权限 CRUD
  const handleSavePermission = async (permissionData) => {
    try {
      if (editingPermission) {
        await updatePermission(editingPermission.id, permissionData);
        alert('权限更新成功');
      } else {
        await createPermission(permissionData);
        alert('权限创建成功');
      }
      await loadPermissions();
      setModalVisible(false);
      setEditingPermission(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePermission = async (id, code) => {
    if (window.confirm(`确定删除权限 "${code}" 吗？删除后，所有角色将失去该权限。`)) {
      try {
        await deletePermission(id);
        alert('权限删除成功');
        await loadPermissions();
        await loadApiMappings();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // API 映射 CRUD
  const handleAddMapping = async () => {
    if (!newMapping.api_path || !newMapping.permission_id) {
      alert('请填写 API 路径和选择权限');
      return;
    }
    try {
      await createApiPermissionMapping({
        method: newMapping.method,
        api_path: newMapping.api_path,
        permission_id: parseInt(newMapping.permission_id)
      });
      alert('映射添加成功');
      setMappingModalVisible(false);
      setNewMapping({ method: 'GET', api_path: '', permission_id: '' });
      await loadApiMappings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteMapping = async (id) => {
    if (window.confirm('确定删除此映射吗？')) {
      try {
        await deleteApiPermissionMapping(id);
        alert('映射删除成功');
        await loadApiMappings();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // 过滤权限
  const getFilteredPermissions = () => {
    return permissions.filter(perm => {
      const searchValue = searchTerm.toLowerCase();
      const matchesSearch = 
        perm.code.toLowerCase().includes(searchValue) ||
        perm.name.toLowerCase().includes(searchValue) ||
        perm.resource.toLowerCase().includes(searchValue);
      
      const matchesResource = resourceFilter === 'all' || perm.resource === resourceFilter;
      
      return matchesSearch && matchesResource;
    });
  };

  // 按资源分组
  const getGroupedPermissions = () => {
    const filtered = getFilteredPermissions();
    const grouped = {};
    filtered.forEach(permission => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push(permission);
    });
    return grouped;
  };

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

  const getActionName = (action) => {
    const actionMap = {
      'view': '查看',
      'create': '创建',
      'edit': '编辑',
      'delete': '删除',
      'manage': '管理',
      'extract': '提取',
      'export': '导出'
    };
    return actionMap[action] || action;
  };

  const filteredPermissions = getFilteredPermissions();
  const groupedPermissions = getGroupedPermissions();

  // 按方法分组映射
  const getGroupedMappings = () => {
    const grouped = {};
    apiMappings.forEach(m => {
      if (!grouped[m.method]) {
        grouped[m.method] = [];
      }
      grouped[m.method].push(m);
    });
    return grouped;
  };

  const groupedMappings = getGroupedMappings();

  return (
    <div className="management-container">
      <div className="header">
        <h1>权限管理</h1>
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('permissions')}
          >
            权限列表
          </button>
          <button 
            className={`tab-btn ${activeTab === 'mappings' ? 'active' : ''}`}
            onClick={() => setActiveTab('mappings')}
          >
            API 映射配置
          </button>
        </div>
        {activeTab === 'permissions' && canCreateRole() && (
          <button className="btn-add" onClick={() => {
            setEditingPermission(null);
            setModalVisible(true);
          }}>+ 新增权限</button>
        )}
        {activeTab === 'mappings' && canCreateRole() && (
          <button className="btn-add" onClick={() => setMappingModalVisible(true)}>+ 添加映射</button>
        )}
      </div>

      {activeTab === 'permissions' ? (
        // 权限列表视图
        <>
          <div className="filters-bar">
            <div className="search-box">
              <input
                type="text"
                placeholder="搜索权限代码、名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-box">
              <select value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)}>
                <option value="all">所有资源</option>
                {resources.map(r => (
                  <option key={r} value={r}>{getResourceName(r)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-label">总权限数：</span>
              <span className="stat-value">{permissions.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">当前显示：</span>
              <span className="stat-value">{filteredPermissions.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">资源类型：</span>
              <span className="stat-value">{resources.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="loading">加载中...</div>
          ) : Object.keys(groupedPermissions).length === 0 ? (
            <div className="empty-state">没有找到匹配的权限</div>
          ) : (
            <div className="permissions-groups">
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <div key={resource} className="permission-group">
                  <div className="group-header">
                    <h2>{getResourceName(resource)}</h2>
                    <span className="group-count">{perms.length} 个权限</span>
                  </div>
                  <div className="permission-cards">
                    {perms.map(permission => (
                      <div key={permission.id} className="permission-card">
                        <div className="permission-card-header">
                          <div className="permission-name">{permission.code}</div>
                          <div className="permission-badge">
                            <span className={`action-badge action-${permission.action}`}>
                              {getActionName(permission.action)}
                            </span>
                          </div>
                        </div>
                        <div className="permission-card-body">
                          <div className="permission-detail">
                            <span className="detail-label">名称：</span>
                            <span className="detail-value">{permission.name}</span>
                          </div>
                          <div className="permission-detail">
                            <span className="detail-label">资源：</span>
                            <span className="detail-value">{getResourceName(permission.resource)}</span>
                          </div>
                          <div className="permission-detail">
                            <span className="detail-label">操作：</span>
                            <span className="detail-value">{permission.action}</span>
                          </div>
                        </div>
                        <div className="permission-card-footer">
                          <div className="permission-description">
                            {permission.description || `${getResourceName(permission.resource)}的${getActionName(permission.action)}权限`}
                          </div>
                          <div className="permission-card-actions">
                            {canEditRole() && (
                              <button className="btn-edit" onClick={() => {
                                setEditingPermission(permission);
                                setModalVisible(true);
                              }}>编辑</button>
                            )}
                            {canDeleteRole() && (
                              <button className="btn-delete" onClick={() => handleDeletePermission(permission.id, permission.code)}>删除</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // API 映射视图
        <div className="api-mappings-view">
          <div className="mappings-description">
            <p>配置 API 接口与权限的映射关系。当用户访问 API 时，系统会检查用户是否拥有对应的权限。</p>
            <p>支持通配符 <code>*</code>，例如：<code>/api/users/*</code> 匹配 <code>/api/users/1</code></p>
          </div>
          
          {Object.entries(groupedMappings).length === 0 ? (
            <div className="empty-state">暂无 API 映射配置</div>
          ) : (
            Object.entries(groupedMappings).map(([method, mappings]) => (
              <div key={method} className="mapping-group">
                <div className="mapping-group-header">
                  <h3>{method}</h3>
                  <span className="group-count">{mappings.length} 个映射</span>
                </div>
                <table className="mapping-table">
                  <thead>
                    <tr>
                      <th>API 路径</th>
                      <th>权限代码</th>
                      <th>权限名称</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.map(mapping => (
                      <tr key={mapping.id}>
                        <td><code>{mapping.api_path}</code></td>
                        <td><code>{mapping.permission_code}</code></td>
                        <td>{mapping.permission_name}</td>
                        <td>
                          {canDeleteRole() && (
                            <button className="btn-delete" onClick={() => handleDeleteMapping(mapping.id)}>删除</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}

      {/* 权限编辑/新增弹窗 */}
      {modalVisible && (
        <PermissionModal
          permission={editingPermission}
          resources={resources}
          onClose={() => {
            setModalVisible(false);
            setEditingPermission(null);
          }}
          onSave={handleSavePermission}
          getResourceName={getResourceName}
        />
      )}

      {/* API 映射添加弹窗 */}
      {mappingModalVisible && (
        <ApiMappingModal
          permissions={permissions}
          mapping={newMapping}
          onMappingChange={setNewMapping}
          onClose={() => {
            setMappingModalVisible(false);
            setNewMapping({ method: 'GET', api_path: '', permission_id: '' });
          }}
          onSave={handleAddMapping}
        />
      )}
    </div>
  );
}

// 权限表单组件
function PermissionModal({ permission, resources, onClose, onSave, getResourceName }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    resource: '',
    action: 'view',
    description: ''
  });

  const actions = [
    { value: 'view', label: '查看 (view)' },
    { value: 'create', label: '创建 (create)' },
    { value: 'edit', label: '编辑 (edit)' },
    { value: 'delete', label: '删除 (delete)' },
    { value: 'manage', label: '管理 (manage)' },
    { value: 'extract', label: '提取 (extract)' },
    { value: 'export', label: '导出 (export)' }
  ];

  useEffect(() => {
    if (permission) {
      setFormData({
        code: permission.code,
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        description: permission.description || ''
      });
    }
  }, [permission]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.resource || !formData.action) {
      alert('请填写所有必填字段');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h2>{permission ? '编辑权限' : '新增权限'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>权限代码 *</label>
            <input
              name="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              placeholder="例如: user:view"
              disabled={!!permission}
            />
            <small>格式：资源:操作，如 user:view</small>
          </div>
          <div className="form-group">
            <label>权限名称 *</label>
            <input
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="例如: 查看用户"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>资源类型 *</label>
              <select
                value={formData.resource}
                onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                required
              >
                <option value="">请选择</option>
                {resources.map(r => (
                  <option key={r} value={r}>{getResourceName(r)} ({r})</option>
                ))}
                <option value="custom">自定义</option>
              </select>
              {formData.resource === 'custom' && (
                <input
                  type="text"
                  placeholder="输入自定义资源名称"
                  value={formData.resource === 'custom' ? '' : formData.resource}
                  onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                />
              )}
            </div>
            <div className="form-group">
              <label>操作类型 *</label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                required
              >
                {actions.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="权限的详细说明"
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

// API 映射添加弹窗
function ApiMappingModal({ permissions, mapping, onMappingChange, onClose, onSave }) {
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>添加 API-权限映射</h2>
        <div className="form-group">
          <label>HTTP 方法</label>
          <select 
            value={mapping.method} 
            onChange={(e) => onMappingChange({ ...mapping, method: e.target.value })}
          >
            {methods.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>API 路径</label>
          <input
            type="text"
            value={mapping.api_path}
            onChange={(e) => onMappingChange({ ...mapping, api_path: e.target.value })}
            placeholder="例如: /api/users 或 /api/users/*"
          />
          <small>支持通配符 * 匹配任意路径段</small>
        </div>
        <div className="form-group">
          <label>关联权限</label>
          <select 
            value={mapping.permission_id} 
            onChange={(e) => onMappingChange({ ...mapping, permission_id: e.target.value })}
          >
            <option value="">请选择权限</option>
            {permissions.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
            ))}
          </select>
        </div>
        <div className="modal-buttons">
          <button onClick={onClose}>取消</button>
          <button onClick={onSave}>添加</button>
        </div>
      </div>
    </div>
  );
}

export default PermissionManagement;