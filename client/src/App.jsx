import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import LeakScan from './components/LeakScan/LeakScan';
import ProjectManagement from './components/Assessment/ProjectManagement';
import RuleManagement from './components/Assessment/RuleManagement';
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
            {/* 默认重定向到漏扫处理 */}
            <Route path="/" element={<Navigate to="/leak-scan" replace />} />
            
            {/* 漏扫处理 */}
            <Route path="/leak-scan" element={
              <ProtectedRoute>
                <LeakScan />
              </ProtectedRoute>
            } />
            
            {/* 测评录入 - 项目管理 */}
            <Route path="/assessment/projects" element={
              <ProtectedRoute>
                <ProjectManagement />
              </ProtectedRoute>
            } />
            
            {/* 测评录入 - 规则管理 */}
            <Route path="/assessment/rules" element={
              <ProtectedRoute>
                <RuleManagement />
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