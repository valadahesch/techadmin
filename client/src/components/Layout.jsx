import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Layout() {
  const { user, logout, hasMenuPermission, hasPagePermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [expandedMenus, setExpandedMenus] = useState({
    systemSettings: false,
    dengbaoAssessment: false,
    projectManagement: false  // 新增：项目管理子菜单状态
  });
  
  // 侧边栏收缩状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // 移动端侧边栏状态
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = (menu) => {
    if (sidebarCollapsed) return;
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // 切换侧边栏收缩
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    if (!sidebarCollapsed) {
      setExpandedMenus({
        systemSettings: false,
        dengbaoAssessment: false,
        projectManagement: false
      });
    }
  };

  // 移动端打开侧边栏
  const openMobileSidebar = () => {
    setMobileSidebarOpen(true);
  };

  // 移动端关闭侧边栏
  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
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
      {/* 移动端菜单按钮 */}
      <button 
        className="mobile-menu-btn" 
        onClick={openMobileSidebar}
      >
        ☰
      </button>

      {/* 移动端遮罩层 */}
      {mobileSidebarOpen && (
        <div className="mobile-overlay" onClick={closeMobileSidebar}></div>
      )}
      
      <nav className={`sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
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
          {/* 首页 */}
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

          {/* 等保测评 */}
          <li className="nav-item">
            <div 
              className={`nav-header ${isSubMenuActive([
                '/dengbao/device-usage',
                '/dengbao/assessment-types',
                '/dengbao/indicators',
                '/dengbao/assessment-items',
                '/dengbao/rules',
                '/dengbao/projects',
                '/dengbao/project-management',
                '/dengbao/project-assets',
                '/dengbao/project-leak-scan'
              ]) ? 'active-parent' : ''}`}
              onClick={() => toggleMenu('dengbaoAssessment')}
            >
              <span className="nav-icon">📊</span>
              {!sidebarCollapsed && (
                <>
                  <span className="nav-text">等保测评</span>
                  <span className={`arrow ${expandedMenus.dengbaoAssessment ? 'expanded' : ''}`}>▼</span>
                </>
              )}
            </div>
            {!sidebarCollapsed && expandedMenus.dengbaoAssessment && (
              <ul className="sub-menu">
                <li>
                  <Link to="/dengbao/device-usage" className={`sub-nav-link ${isActive('/dengbao/device-usage') ? 'active' : ''}`} onClick={closeMobileSidebar}>
                    📱 设备用途管理
                  </Link>
                </li>
                <li>
                  <Link to="/dengbao/indicators" className={`sub-nav-link ${isActive('/dengbao/indicators') ? 'active' : ''}`} onClick={closeMobileSidebar}>
                    📈 测评指标管理
                  </Link>
                </li>
                <li>
                  <Link to="/dengbao/assessment-items" className={`sub-nav-link ${isActive('/dengbao/assessment-items') ? 'active' : ''}`} onClick={closeMobileSidebar}>
                    📝 测评项管理
                  </Link>
                </li>
                <li>
                  <Link to="/dengbao/assessment-types" className={`sub-nav-link ${isActive('/dengbao/assessment-types') ? 'active' : ''}`} onClick={closeMobileSidebar}>
                    🏷️ 测评类型管理
                  </Link>
                </li>
                {/* 测评项目管理 - 带三级子菜单 */}
                <li className="sub-nav-item">
                  <div 
                    className={`sub-nav-header ${isSubMenuActive([
                      '/dengbao/project-management',
                      '/dengbao/project-assets',
                      '/dengbao/project-leak-scan'
                    ]) ? 'active-parent' : ''}`}
                    onClick={() => toggleMenu('projectManagement')}
                  >
                    <span className="sub-nav-icon">🗂️</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="sub-nav-text">测评项目管理</span>
                        <span className={`arrow ${expandedMenus.projectManagement ? 'expanded' : ''}`}>▼</span>
                      </>
                    )}
                  </div>
                  {expandedMenus.projectManagement && (
                    <ul className="sub-menu-level3">
                      <li>
                        <Link to="/dengbao/project-management" className={`sub-nav-link-level3 ${isActive('/dengbao/project-management') ? 'active' : ''}`} onClick={closeMobileSidebar}>
                          📋 项目管理
                        </Link>
                      </li>
                      <li>
                        <Link to="/dengbao/project-assets" className={`sub-nav-link-level3 ${isActive('/dengbao/project-assets') ? 'active' : ''}`} onClick={closeMobileSidebar}>
                          💻 项目资产
                        </Link>
                      </li>
                      <li>
                        <Link to="/dengbao/project-leak-scan" className={`sub-nav-link-level3 ${isActive('/dengbao/project-leak-scan') ? 'active' : ''}`} onClick={closeMobileSidebar}>
                          🔎 漏扫管理
                        </Link>
                      </li>
                    </ul>
                  )}
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
                    <Link to="/system/users" className={`sub-nav-link ${isActive('/system/users') ? 'active' : ''}`} onClick={closeMobileSidebar}>
                      👥 用户管理
                    </Link>
                  </li>
                  <li>
                    <Link to="/system/roles" className={`sub-nav-link ${isActive('/system/roles') ? 'active' : ''}`} onClick={closeMobileSidebar}>
                      🔐 角色管理
                    </Link>
                  </li>
                  <li>
                    <Link to="/system/permissions" className={`sub-nav-link ${isActive('/system/permissions') ? 'active' : ''}`} onClick={closeMobileSidebar}>
                      🔑 权限管理
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>
      
      <main className="main-content" onClick={closeMobileSidebar}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;