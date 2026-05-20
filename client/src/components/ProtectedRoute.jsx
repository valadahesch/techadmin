import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, requiredPermission, requiredPage }) {
  const { isAuthenticated, loading, hasPermission, hasPagePermission } = useAuth();

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 检查页面权限
  if (requiredPage && !hasPagePermission(requiredPage)) {
    return (
      <div className="error-page">
        <h2>403 - 无权限访问</h2>
        <p>您没有访问此页面的权限，请联系管理员。</p>
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