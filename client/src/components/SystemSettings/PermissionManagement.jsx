import { useState, useEffect } from 'react';
import { getPermissions } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages/PermissionManagement.css';

function PermissionManagement() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const data = await getPermissions();
      console.log('Permissions data:', data); // 调试用
      setPermissions(data);
    } catch (err) {
      console.error('Failed to load permissions:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 获取所有唯一的资源类型
  const getResources = () => {
    const resources = new Set();
    permissions.forEach(p => {
      if (p.resource) {
        resources.add(p.resource);
      } else if (p.code) {
        // 如果没有 resource 字段，从 code 中提取
        const resource = p.code.split(':')[0];
        resources.add(resource);
      }
    });
    return ['all', ...Array.from(resources)];
  };

  // 过滤权限
  const getFilteredPermissions = () => {
    return permissions.filter(perm => {
      const searchValue = searchTerm.toLowerCase();
      const matchesSearch = 
        (perm.code || '').toLowerCase().includes(searchValue) ||
        (perm.name || '').toLowerCase().includes(searchValue) ||
        (perm.resource || '').toLowerCase().includes(searchValue) ||
        (perm.action || '').toLowerCase().includes(searchValue);
      
      let matchesResource = resourceFilter === 'all';
      if (!matchesResource) {
        const permResource = perm.resource || (perm.code ? perm.code.split(':')[0] : '');
        matchesResource = permResource === resourceFilter;
      }
      
      return matchesSearch && matchesResource;
    });
  };

  // 按资源分组
  const getGroupedPermissions = () => {
    const filtered = getFilteredPermissions();
    const grouped = {};
    
    filtered.forEach(permission => {
      const resource = permission.resource || (permission.code ? permission.code.split(':')[0] : 'other');
      if (!grouped[resource]) {
        grouped[resource] = [];
      }
      grouped[resource].push(permission);
    });
    
    return grouped;
  };

  // 获取资源的中文名称
  const getResourceName = (resource) => {
    const resourceMap = {
      'user': '用户管理',
      'role': '角色管理',
      'permission': '权限管理',
      'leak': '漏扫处理',
      'assessment': '测评录入',
      'other': '其他权限'
    };
    return resourceMap[resource] || resource;
  };

  // 获取操作的中文名称
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
    return actionMap[action] || action || '未知';
  };

  const resources = getResources();
  const groupedPermissions = getGroupedPermissions();
  const filteredPermissions = getFilteredPermissions();

  // 获取权限描述
  const getPermissionDescription = (permission) => {
    const code = permission.code || '';
    const resource = permission.resource || code.split(':')[0];
    const action = permission.action || code.split(':')[1];
    
    const descriptions = {
      'user:view': '允许查看用户列表和用户详细信息',
      'user:create': '允许创建新用户',
      'user:edit': '允许编辑用户信息',
      'user:delete': '允许删除用户',
      'role:view': '允许查看角色列表和角色详细信息',
      'role:manage': '允许创建、编辑、删除角色，以及分配权限',
      'permission:view': '允许查看权限列表',
      'leak:view': '允许查看漏扫页面',
      'leak:extract': '允许提取漏扫数据',
      'leak:export': '允许导出漏扫数据',
      'assessment:view': '允许查看测评页面',
      'assessment:manage': '允许管理测评项目和规则'
    };
    
    return descriptions[code] || `${getResourceName(resource)}的${getActionName(action)}权限`;
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="management-container">
      <div className="header">
        <h1>权限管理</h1>
        {user?.username !== 'admin' && (
          <div className="readonly-badge">只读模式</div>
        )}
      </div>

      {/* 搜索和过滤栏 */}
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
            {resources.map(resource => (
              <option key={resource} value={resource}>
                {resource === 'all' ? '所有资源' : getResourceName(resource)}
              </option>
            ))}
          </select>
        </div>
      </div>

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
                      <div className="permission-name">{permission.code || permission.name}</div>
                      <div className="permission-badge">
                        <span className={`action-badge action-${permission.action || 'view'}`}>
                          {getActionName(permission.action)}
                        </span>
                      </div>
                    </div>
                    <div className="permission-card-body">
                      <div className="permission-detail">
                        <span className="detail-label">名称：</span>
                        <span className="detail-value">{permission.name || '-'}</span>
                      </div>
                      <div className="permission-detail">
                        <span className="detail-label">资源：</span>
                        <span className="detail-value">{getResourceName(permission.resource || (permission.code ? permission.code.split(':')[0] : 'other'))}</span>
                      </div>
                      <div className="permission-detail">
                        <span className="detail-label">操作：</span>
                        <span className="detail-value">{permission.action || (permission.code ? permission.code.split(':')[1] : '-')}</span>
                      </div>
                      <div className="permission-detail">
                        <span className="detail-label">ID：</span>
                        <span className="detail-value">{permission.id}</span>
                      </div>
                    </div>
                    <div className="permission-card-footer">
                      <div className="permission-description">
                        {permission.description || getPermissionDescription(permission)}
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
            <p>格式：<code>资源:操作</code>（例如：<code>user:view</code> 表示用户管理的查看权限）</p>
          </div>
          <div className="info-section">
            <strong>操作类型：</strong>
            <ul>
              <li><code>view</code> - 查看/读取数据</li>
              <li><code>create</code> - 创建数据</li>
              <li><code>edit</code> - 编辑数据</li>
              <li><code>delete</code> - 删除数据</li>
              <li><code>manage</code> - 管理（包含创建、编辑、删除）</li>
              <li><code>extract</code> - 提取数据</li>
              <li><code>export</code> - 导出数据</li>
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
              <li><strong>user</strong> - 拥有查看权限（user:view, role:view, permission:view, leak:view, assessment:view）</li>
              <li><strong>guest</strong> - 只有漏扫查看权限（leak:view）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PermissionManagement;