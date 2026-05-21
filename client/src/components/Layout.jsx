import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Layout() {
  const { user, logout, hasMenuPermission, hasPagePermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [expandedMenus, setExpandedMenus] = useState({
    systemSettings: false,
    assessment: false
  });
  
  // 新增：侧边栏收缩状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = (menu) => {
    if (sidebarCollapsed) return; // 收缩时禁止展开子菜单
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // 新增：切换侧边栏收缩
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    // 收缩时自动收起所有子菜单
    if (!sidebarCollapsed) {
      setExpandedMenus({
        systemSettings: false,
        assessment: false
      });
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isSubMenuActive = (paths) => {
    return paths.some(path => location.pathname === path);
  };

  // 检查是否应该显示系统设置菜单
  const shouldShowSystemSettings = () => {
    return hasPagePermission('page:user:management') || 
           hasPagePermission('page:role:management') || 
           hasPagePermission('page:permission:management');
  };

  return (
    <div className={`layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <nav className="sidebar">
        <div className="sidebar-header">
          {!sidebarCollapsed && <h2>安全管理系统</h2>}
          {sidebarCollapsed && <div className="logo-mini">🔒</div>}
          <button onClick={toggleSidebar} className="collapse-btn">
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <div className="user-info-mini">
          {!sidebarCollapsed ? (
            <div className="user-info">
              <span className="username">{user?.username}</span>
              <button onClick={handleLogout} className="logout-btn">退出</button>
            </div>
          ) : (
            <div className="user-info-collapsed">
              <span className="user-icon">👤</span>
              <button onClick={handleLogout} className="logout-icon" title="退出">🚪</button>
            </div>
          )}
        </div>
        
        <ul className="nav-menu">
          {/* 新增：首页 */}
          <li className="nav-item">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              <span className="nav-icon">🏠</span>
              {!sidebarCollapsed && <span className="nav-text">首页</span>}
            </Link>
          </li>

          {/* 漏扫处理 */}
          <li className="nav-item">
            <Link to="/leak-scan" className={`nav-link ${isActive('/leak-scan') ? 'active' : ''}`}>
              <span className="nav-icon">🔍</span>
              {!sidebarCollapsed && <span className="nav-text">漏扫处理</span>}
            </Link>
          </li>

          {/* 测评录入 */}
          <li className="nav-item">
            <div 
              className={`nav-header ${isSubMenuActive(['/assessment/projects', '/assessment/rules']) ? 'active-parent' : ''}`}
              onClick={() => toggleMenu('assessment')}
            >
              <span className="nav-icon">📝</span>
              {!sidebarCollapsed && (
                <>
                  <span className="nav-text">测评录入</span>
                  <span className={`arrow ${expandedMenus.assessment ? 'expanded' : ''}`}>▼</span>
                </>
              )}
            </div>
            {!sidebarCollapsed && expandedMenus.assessment && (
              <ul className="sub-menu">
                <li>
                  <Link to="/assessment/projects" className={`sub-nav-link ${isActive('/assessment/projects') ? 'active' : ''}`}>
                    📋 项目管理
                  </Link>
                </li>
                <li>
                  <Link to="/assessment/rules" className={`sub-nav-link ${isActive('/assessment/rules') ? 'active' : ''}`}>
                    ⚙️ 规则管理
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* 系统设置 - 条件显示 */}
          {shouldShowSystemSettings() && (
            <li className="nav-item">
              <div 
                className={`nav-header ${isSubMenuActive(['/system/users', '/system/roles', '/system/permissions']) ? 'active-parent' : ''}`}
                onClick={() => toggleMenu('systemSettings')}
              >
                <span className="nav-icon">⚙️</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="nav-text">系统设置</span>
                    <span className={`arrow ${expandedMenus.systemSettings ? 'expanded' : ''}`}>▼</span>
                  </>
                )}
              </div>
              {!sidebarCollapsed && expandedMenus.systemSettings && (
                <ul className="sub-menu">
                  <li>
                    <Link to="/system/users" className={`sub-nav-link ${isActive('/system/users') ? 'active' : ''}`}>
                      👥 用户管理
                    </Link>
                  </li>
                  <li>
                    <Link to="/system/roles" className={`sub-nav-link ${isActive('/system/roles') ? 'active' : ''}`}>
                      🔐 角色管理
                    </Link>
                  </li>
                  <li>
                    <Link to="/system/permissions" className={`sub-nav-link ${isActive('/system/permissions') ? 'active' : ''}`}>
                      🔑 权限管理
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;