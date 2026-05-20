import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Layout() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 菜单展开状态
  const [expandedMenus, setExpandedMenus] = useState({
    systemSettings: false,
    assessment: false
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // 检查当前路由是否激活
  const isActive = (path) => {
    return location.pathname === path;
  };

  // 检查子菜单是否有激活的路由
  const isSubMenuActive = (paths) => {
    return paths.some(path => location.pathname === path);
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>安全管理系统</h2>
          <div className="user-info">
            <span className="username">{user?.username}</span>
            <button onClick={handleLogout} className="logout-btn">退出</button>
          </div>
        </div>
        
        <ul className="nav-menu">
          {/* 漏扫处理 - 一级菜单 */}
          <li className="nav-item">
            <Link to="/leak-scan" className={`nav-link ${isActive('/leak-scan') ? 'active' : ''}`}>
              🔍 漏扫处理
            </Link>
          </li>

          {/* 测评录入 - 带子菜单 */}
          <li className="nav-item">
            <div 
              className={`nav-header ${isSubMenuActive(['/assessment/projects', '/assessment/rules']) ? 'active-parent' : ''}`}
              onClick={() => toggleMenu('assessment')}
            >
              <span>📝 测评录入</span>
              <span className={`arrow ${expandedMenus.assessment ? 'expanded' : ''}`}>▼</span>
            </div>
            {expandedMenus.assessment && (
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

          {/* 系统设置 - 带子菜单 */}
          {(hasPermission('user:read') || hasPermission('role:read') || hasPermission('permission:read')) && (
            <li className="nav-item">
              <div 
                className={`nav-header ${isSubMenuActive(['/system/users', '/system/roles', '/system/permissions']) ? 'active-parent' : ''}`}
                onClick={() => toggleMenu('systemSettings')}
              >
                <span>⚙️ 系统设置</span>
                <span className={`arrow ${expandedMenus.systemSettings ? 'expanded' : ''}`}>▼</span>
              </div>
              {expandedMenus.systemSettings && (
                <ul className="sub-menu">
                  {hasPermission('user:read') && (
                    <li>
                      <Link to="/system/users" className={`sub-nav-link ${isActive('/system/users') ? 'active' : ''}`}>
                        👥 用户管理
                      </Link>
                    </li>
                  )}
                  {hasPermission('role:read') && (
                    <li>
                      <Link to="/system/roles" className={`sub-nav-link ${isActive('/system/roles') ? 'active' : ''}`}>
                        🔐 角色管理
                      </Link>
                    </li>
                  )}
                  {hasPermission('permission:read') && (
                    <li>
                      <Link to="/system/permissions" className={`sub-nav-link ${isActive('/system/permissions') ? 'active' : ''}`}>
                        🔑 权限管理
                      </Link>
                    </li>
                  )}
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