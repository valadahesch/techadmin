import { useState, useEffect } from 'react';
import { getPermissions } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages/PermissionManagement.css';

function PermissionManagement() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState('all');
  const { hasPermission } = useAuth();

  const canWrite = hasPermission('permission:write');

  useEffect(() => {
    loadPermissions();
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

  // 获取所有唯一的资源类型
  const resources = ['all', ...new Set(permissions.map(p => p.resource))];

  // 过滤权限
  const filteredPermissions = permissions.filter(perm => {
    const matchesSearch = perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         perm.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         perm.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesResource = resourceFilter === 'all' || perm.resource === resourceFilter;
    return matchesSearch && matchesResource;
  });

  // 按资源分组
  const groupedPermissions = filteredPermissions.reduce((groups, permission) => {
    const resource = permission.resource;
    if (!groups[resource]) {
      groups[resource] = [];
    }
    groups[resource].push(permission);
    return groups;
  }, {});

  // 获取操作的中文名称
  const getActionName = (action) => {
    const actionMap = {
      'read': '查看',
      'write': '创建/编辑',
      'delete': '删除'
    };
    return actionMap[action] || action;
  };

  // 获取资源的中文名称
  const getResourceName = (resource) => {
    const resourceMap = {
      'user': '用户管理',
      'role': '角色管理',
      'permission': '权限管理'
    };
    return resourceMap[resource] || resource;
  };

  return (
    <div className="management-container">
      <div className="header">
        <h1>权限管理</h1>
        {!canWrite && (
          <div className="readonly-badge">只读模式</div>
        )}
      </div>

      {/* 搜索和过滤栏 */}
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索权限名称、资源或操作..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)}>
            {resources.map(resource => (
              <option key={resource} value={resource}>
                {resource === 'all' ? '所有资源' : getResourceName(resource)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <>
          {/* 统计信息 */}
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
              <span className="stat-value">{resources.length - 1}</span>
            </div>
          </div>

          {/* 权限列表 - 分组显示 */}
          {Object.keys(groupedPermissions).length === 0 ? (
            <div className="empty-state">
              <p>没有找到匹配的权限</p>
            </div>
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
                          <div className="permission-name">{permission.name}</div>
                          <div className="permission-badge">
                            <span className={`action-badge action-${permission.action}`}>
                              {getActionName(permission.action)}
                            </span>
                          </div>
                        </div>
                        <div className="permission-card-body">
                          <div className="permission-detail">
                            <span className="detail-label">资源：</span>
                            <span className="detail-value">{getResourceName(permission.resource)}</span>
                          </div>
                          <div className="permission-detail">
                            <span className="detail-label">操作：</span>
                            <span className="detail-value">{permission.action}</span>
                          </div>
                          <div className="permission-detail">
                            <span className="detail-label">ID：</span>
                            <span className="detail-value">{permission.id}</span>
                          </div>
                        </div>
                        <div className="permission-card-footer">
                          <div className="permission-description">
                            {getPermissionDescription(permission)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 权限说明 */}
          <div className="permission-info-card">
            <h3>📖 权限说明</h3>
            <div className="info-content">
              <div className="info-section">
                <strong>权限命名规则：</strong>
                <p>格式：<code>资源:操作</code>（例如：<code>user:read</code> 表示用户管理的查看权限）</p>
              </div>
              <div className="info-section">
                <strong>操作类型：</strong>
                <ul>
                  <li><code>read</code> - 查看/读取数据</li>
                  <li><code>write</code> - 创建/编辑数据</li>
                  <li><code>delete</code> - 删除数据</li>
                </ul>
              </div>
              <div className="info-section">
                <strong>权限分配：</strong>
                <p>在"角色管理"页面，可以为角色分配相应的权限。用户通过所属角色获得权限。</p>
              </div>
              <div className="info-section">
                <strong>内置角色：</strong>
                <ul>
                  <li><strong>admin</strong> - 拥有所有权限</li>
                  <li><strong>user</strong> - 拥有所有资源的查看权限</li>
                  <li><strong>guest</strong> - 只有用户管理的查看权限</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 获取权限描述
function getPermissionDescription(permission) {
  const resource = permission.resource;
  const action = permission.action;
  
  const descriptions = {
    'user:read': '允许查看用户列表和用户详细信息',
    'user:write': '允许创建、编辑用户信息，以及分配/移除用户角色',
    'user:delete': '允许删除用户账号',
    'role:read': '允许查看角色列表和角色详细信息',
    'role:write': '允许创建、编辑角色，以及为角色分配/移除权限',
    'role:delete': '允许删除角色',
    'permission:read': '允许查看权限列表和权限详细信息'
  };
  
  return descriptions[`${permission.resource}:${permission.action}`] || 
         `${getResourceName(resource)}的${getActionName(action)}权限`;
}

export default PermissionManagement;