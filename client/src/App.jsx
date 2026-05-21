import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';  // 新增：导入Dashboard
import LeakScan from './components/LeakScan/LeakScan';
import UserManagement from './components/SystemSettings/UserManagement';
import RoleManagement from './components/SystemSettings/RoleManagement';
import PermissionManagement from './components/SystemSettings/PermissionManagement';
// import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            {/* 修改：默认进入Dashboard主页，而不是重定向到leak-scan */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* 漏扫处理 - 保持原路由不变 */}
            <Route path="/leak-scan" element={
              <ProtectedRoute>
                <LeakScan />
              </ProtectedRoute>
            } />
            
            <Route path="/system/users" element={
              <ProtectedRoute requiredPage="page:user:management">
                <UserManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/system/roles" element={
              <ProtectedRoute requiredPage="page:role:management">
                <RoleManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/system/permissions" element={
              <ProtectedRoute requiredPage="page:permission:management">
                <PermissionManagement />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;