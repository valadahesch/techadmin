import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, requiredPermission, requiredPage }) {
  const { isAuthenticated, loading, hasPermission, hasPagePermission, user } = useAuth();

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // admin 用户默认拥有所有权限
  if (user?.username === 'admin') {
    return children;
  }

  // 检查页面权限
  if (requiredPage && !hasPagePermission(requiredPage)) {
    return (
      <div className="error-page">
        <h2>403 - 权限不足</h2>
        <p>您没有访问此页面的权限：{requiredPage}</p>
      </div>
    );
  }

  // 检查权限
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="error-page">
        <h2>403 - 权限不足</h2>
        <p>您缺少必要的权限：{requiredPermission}</p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;