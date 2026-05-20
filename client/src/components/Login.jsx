import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/components/Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* 背景装饰 */}
      <div className="bg-decoration">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
        <div className="circle circle-4"></div>
      </div>

      <div className="login-container">
        {/* 左侧品牌区域 */}
        <div className="login-brand">
          <div className="brand-content">
            <div className="logo">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.2"/>
                <path d="M24 12L28 18H20L24 12Z" fill="white" stroke="white" strokeWidth="1.5"/>
                <path d="M24 36L20 30H28L24 36Z" fill="white" stroke="white" strokeWidth="1.5"/>
                <path d="M12 24L18 20V28L12 24Z" fill="white" stroke="white" strokeWidth="1.5"/>
                <path d="M36 24L30 20V28L36 24Z" fill="white" stroke="white" strokeWidth="1.5"/>
                <circle cx="24" cy="24" r="3" fill="white"/>
              </svg>
              <span className="logo-text">安全管理系统</span>
            </div>
            <h1>欢迎回来</h1>
            <p>请登录您的账号以继续访问</p>
            <div className="brand-features">
              <div className="feature">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>安全可靠的数据保护</span>
              </div>
              <div className="feature">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>实时监控与告警</span>
              </div>
              <div className="feature">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>智能分析与报告</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧登录表单 */}
        <div className="login-form-container">
          <div className="form-wrapper">
            <div className="form-header">
              <h2>账号登录</h2>
              <p>请输入您的账号信息</p>
            </div>

            {error && (
              <div className="error-message">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>用户名</label>
                <div className="input-icon">
                  <svg className="icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 17.5V15.8333C16.6667 14.9493 16.3155 14.1014 15.6904 13.4763C15.0653 12.8512 14.2174 12.5 13.3333 12.5H6.66667C5.78261 12.5 4.93476 12.8512 4.30964 13.4763C3.68452 14.1014 3.33333 14.9493 3.33333 15.8333V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M10 9.16667C11.841 9.16667 13.3333 7.67428 13.3333 5.83333C13.3333 3.99238 11.841 2.5 10 2.5C8.15905 2.5 6.66667 3.99238 6.66667 5.83333C6.66667 7.67428 8.15905 9.16667 10 9.16667Z" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="请输入用户名"
                  />
                </div>
              </div>

              <div className="input-group">
                <label>密码</label>
                <div className="input-icon">
                  <svg className="icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15.8333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V10.8333C17.5 9.91286 16.7538 9.16667 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M5.83333 9.16667V5.83333C5.83333 4.72826 6.27232 3.66847 7.05372 2.88707C7.83512 2.10566 8.89493 1.66667 10 1.66667C11.1051 1.66667 12.1649 2.10566 12.9463 2.88707C13.7277 3.66847 14.1667 4.72826 14.1667 5.83333V9.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M2.5 10C2.5 10 5 4.16667 10 4.16667C15 4.16667 17.5 10 17.5 10C17.5 10 15 15.8333 10 15.8333C5 15.8333 2.5 10 2.5 10Z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M17.5 2.5L2.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M2.5 10C2.5 10 5 4.16667 10 4.16667C15 4.16667 17.5 10 17.5 10C17.5 10 15 15.8333 10 15.8333C5 15.8333 2.5 10 2.5 10Z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>记住密码</span>
                </label>
                <a href="#" className="forgot-link">忘记密码？</a>
              </div>

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  '登 录'
                )}
              </button>
            </form>

            <div className="demo-tip">
              <div className="tip-title">演示账号</div>
              <div className="tip-content">
                <div className="tip-item">
                  <span className="tip-label">管理员：</span>
                  <span className="tip-value">admin / 123456</span>
                  <span className="tip-badge">全部权限</span>
                </div>
                <div className="tip-item">
                  <span className="tip-label">普通用户：</span>
                  <span className="tip-value">zhangsan / 123456</span>
                  <span className="tip-badge">仅查看</span>
                </div>
              </div>
            </div>

            <div className="form-footer">
              <p>© 2025 安全管理系统. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;